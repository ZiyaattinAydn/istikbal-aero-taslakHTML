import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { imageSize } from "image-size";
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
const status = JSON.parse(
  readFileSync(
    process.env.CMS_LOCAL_STATUS || "/tmp/istikbal-local-status.json",
    "utf8",
  ),
);
const url = status.API_URL || status.api_url || status.apiUrl;
const anon = status.ANON_KEY || status.PUBLISHABLE_KEY || status.anon_key;
const secret =
  status.SERVICE_ROLE_KEY || status.SECRET_KEY || status.service_role_key;
const email = "cms-admin@example.com";
const client = (key) =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const admin = client(secret),
  db = client(anon);
const checks = [];
let stage = "configuration";
console.log("Local status field names:", Object.keys(status).join(","));
function totp(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of base32.replace(/=+$/, "").toUpperCase())
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = createHmac("sha1", key).update(counter).digest(),
    offset = h[19] & 15;
  return ((h.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
}
async function main() {
  assert.ok(url && anon && secret, "Local stack credentials missing");
  assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):/);
  stage = "create-admin";
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({ email, email_confirm: true });
  if (createError) {
    console.log("Admin creation failure:", {
      status: createError.status,
      code: createError.code,
    });
    throw Error("admin_create_failed");
  }
  assert.ok(created.user);
  checks.push("Invited passwordless admin created");
  console.log("Invited account metadata:", {
    emailConfirmed: !!created.user.email_confirmed_at,
  });
  const blocked = await db.auth.signUp({
    email: "outsider@example.test",
    password: "not-a-real-credential",
  });
  assert.ok(blocked.error);
  checks.push("Open signup blocked");
  const unknown = await db.auth.signInWithOtp({
    email: "outsider@example.test",
    options: { shouldCreateUser: false },
  });
  assert.ok(unknown.error || !unknown.data.user);
  const listed = await admin.auth.admin.listUsers();
  assert.equal(listed.error, null);
  assert.equal(listed.data.users.length, 1);
  checks.push("Unknown OTP cannot provision account");
  stage = "send-otp";
  const sent = await db.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (sent.error) {
    console.log("OTP send failure:", {
      status: sent.error.status,
      code: sent.error.code,
    });
    throw Error("otp_send_failed");
  }
  stage = "read-mailpit";
  const mailpit = status.MAILPIT_URL || "http://127.0.0.1:54324";
  let message;
  const seenKinds = new Set();
  for (let i = 0; i < 150 && !message; i++) {
    const response = await fetch(`${mailpit}/api/v1/messages`);
    assert.ok(response.ok, "Mailpit collection unavailable");
    const list = await response.json();
    for (const item of (list.messages || []).filter((m) =>
      m.To?.some((t) => t.Address === email),
    )) {
      const subject = item.Subject || "";
      seenKinds.add(
        subject.includes("İstikbal")
          ? "custom_auth"
          : /password/i.test(subject)
            ? "password_notice"
            : /magic|sign.in|login/i.test(subject)
              ? "default_login"
              : "other",
      );
      if (!subject.includes("İstikbal")) continue;
      const candidate = await (
        await fetch(`${mailpit}/api/v1/message/${item.ID}`)
      ).json();
      if (
        [candidate.Text, candidate.HTML]
          .filter(Boolean)
          .join("\n")
          .match(/\b\d{6}\b/)
      ) {
        message = candidate;
        break;
      }
    }
    if (!message) await new Promise((r) => setTimeout(r, 200));
  }
  console.log("Mailpit observed message classes:", [...seenKinds]);
  assert.ok(message, "Mailpit did not receive OTP");
  stage = "extract-otp";
  console.log("Mailpit message metadata:", {
    fields: Object.keys(message),
    textLength: message.Text?.length ?? 0,
    htmlLength: message.HTML?.length ?? 0,
    customSubject: (message.Subject || "").includes("İstikbal"),
    placeholderUnexpanded: (message.HTML || "").includes("{{ .Token }}"),
  });
  const match = [message.Text, message.HTML]
    .filter(Boolean)
    .join("\n")
    .match(/\b\d{6}\b/);
  assert.ok(match, "Mailpit email contains no six digit OTP");
  stage = "verify-otp";
  const wrong = await db.auth.verifyOtp({
    email,
    token: match[0] === "000000" ? "000001" : "000000",
    type: "email",
  });
  assert.ok(wrong.error);
  checks.push("Incorrect email OTP rejected");
  const verified = await db.auth.verifyOtp({
    email,
    token: match[0],
    type: "email",
  });
  assert.equal(verified.error, null);
  checks.push("Email OTP delivered to local Mailpit and verified");
  const replay = await client(anon).auth.verifyOtp({
    email,
    token: match[0],
    type: "email",
  });
  assert.ok(replay.error);
  checks.push("Consumed email OTP cannot be replayed");
  const role = await db.from("cms_roles").select("role").single();
  assert.equal(role.data?.role, "publisher");
  const body = {
    title: "Local test",
    summary: "Mailpit",
    paragraphs: ["Local isolated test"],
    date: null,
    source: null,
    stage: null,
  };
  const low = await db.rpc("cms_mutate", {
    doc: null,
    expected: 0,
    operation: "create",
    payload: body,
    content_kind: "news",
    content_slug: "local-auth-test",
  });
  assert.ok(low.error);
  checks.push("AAL1 cannot write CMS content");
  const enrollment = await db.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Local test",
  });
  assert.equal(enrollment.error, null);
  const challenged = await db.auth.mfa.challengeAndVerify({
    factorId: enrollment.data.id,
    code: totp(enrollment.data.totp.secret),
  });
  assert.equal(challenged.error, null);
  checks.push("Real TOTP challenge upgrades to AAL2");
  const saved = await db.rpc("cms_mutate", {
    doc: null,
    expected: 0,
    operation: "create",
    payload: body,
    content_kind: "news",
    content_slug: "local-auth-test",
  });
  assert.equal(saved.error, null);
  const id = saved.data;
  const anonRead = await client(anon).from("cms_documents").select("id");
  assert.ok(anonRead.error || anonRead.data?.length === 0);
  checks.push("Anonymous API cannot read drafts");
  for (const operation of ["approve", "publish"]) {
    const result = await db.rpc("cms_mutate", {
      doc: id,
      expected: 1,
      operation,
      payload: {},
    });
    assert.equal(result.error, null);
  }
  const published = await client(anon)
    .from("cms_published")
    .select("document_id")
    .eq("document_id", id);
  assert.equal(published.data?.length, 1);
  checks.push("Approved publication available through anonymous API");
  const privateStorage = await client(anon).storage.from("cms-media").list();
  assert.ok(privateStorage.error || privateStorage.data?.length === 0);
  checks.push("Anonymous Storage access reveals no private files");
  const mediaId = crypto.randomUUID(),
    mediaPath = `${created.user.id}/${mediaId}.webp`,
    bytes = readFileSync("public/assets/hero-flight.webp"),
    size = imageSize(bytes);
  const upload = await db.storage
    .from("cms-media")
    .upload(mediaPath, bytes, { contentType: "image/webp", upsert: false });
  assert.equal(upload.error, null);
  const meta = await db.from("cms_media").insert({
    id: mediaId,
    path: mediaPath,
    mime: "image/webp",
    bytes: bytes.length,
    width: size.width,
    height: size.height,
    alt: "Local test image",
    rights_approved: true,
    created_by: created.user.id,
  });
  assert.equal(meta.error, null);
  assert.ok(
    (await client(anon).storage.from("cms-media").download(mediaPath)).error,
  );
  checks.push("Private uploaded object cannot be downloaded anonymously");
  stage = "private-media-backup-restore";
  const { backupMedia, verifyMedia, digest } = await import("./media-backup.mjs");
  const backupRoot = mkdtempSync(join(tmpdir(), "istikbal-media-drill-"));
  const restorePath = `${created.user.id}/${crypto.randomUUID()}.webp`;
  try {
    const archive = join(backupRoot, "archive");
    await backupMedia(admin, archive, "disposable-local-fixture");
    const manifest = await verifyMedia(archive);
    assert.equal(manifest.files.length, 1);
    assert.equal(manifest.metadata.length, 1);
    const restored = readFileSync(join(archive, mediaPath));
    assert.equal(digest(restored), digest(bytes));
    assert.equal((await admin.storage.from("cms-media").upload(restorePath, restored, {
      contentType: "image/webp", upsert: false,
    })).error, null);
    const download = await admin.storage.from("cms-media").download(restorePath);
    assert.equal(download.error, null);
    assert.equal(digest(Buffer.from(await download.data.arrayBuffer())), digest(bytes));
    assert.ok((await client(anon).storage.from("cms-media").download(restorePath)).error);
    checks.push("Private media archive restores identical bytes without anonymous exposure");
  } finally {
    const removed = await admin.storage.from("cms-media").remove([restorePath]);
    assert.equal(removed.error, null);
    rmSync(backupRoot, { recursive: true, force: true });
  }
  assert.equal(
    (
      await db.rpc("cms_manage_media", {
        media_id: mediaId,
        expected: 1,
        operation: "allow",
        payload: {},
      })
    ).error,
    null,
  );
  assert.equal(
    (await client(anon).storage.from("cms-media").download(mediaPath)).error,
    null,
  );
  checks.push("Publisher-approved image becomes readable");
  const {
    data: { session },
  } = await db.auth.getSession();
  const stale = createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });
  await db.auth.signOut();
  checks.push("Sign out completes");
  assert.ok(
    (
      await stale.rpc("cms_mutate", {
        doc: id,
        expected: 1,
        operation: "save",
        payload: body,
      })
    ).error,
  );
  checks.push("Revoked session cannot reuse an existing JWT for writes");
  if (process.env.CMS_TEST_UI === "true") {
    stage = "authenticated-browser";
    const { runUiChecks } = await import("./ui-auth.mjs");
    await runUiChecks({ status, admin, totp });
  }
  const result = {
    status: "passed",
    checks,
    emailDelivery: "Local Mailpit only; Resend/domain delivery NOT tested",
    project: "Disposable local Supabase CLI stack; no hosted keys",
  };
  writeFileSync(
    "docs/cms/evidence/local-auth.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    `PASS: ${checks.length} local Auth/Mailpit/MFA/API checks. No OTP, keys or tokens logged.`,
  );
}
main().catch((error) => {
  const safeMessages = [
    "Mailpit did not receive OTP",
    "Mailpit email contains no six digit OTP",
  ];
  console.error("Local failure class:", {
    name: error?.name,
    code: error?.code || error?.cause?.code,
    assertion: safeMessages.includes(error?.message)
      ? error.message
      : undefined,
  });
  console.error(
    "FAIL: local Auth check stage " +
      stage +
      " after: " +
      (checks.at(-1) || "startup") +
      ". Sensitive values omitted.",
  );
  process.exitCode = 1;
});
