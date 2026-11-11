import { readFileSync, writeFileSync } from "node:fs";
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
  for (let i = 0; i < 50; i++) {
    const list = await (await fetch(`${mailpit}/api/v1/messages`)).json();
    if (i === 0)
      console.log("Mailpit collection metadata:", {
        fields: Object.keys(list),
        count: list.messages?.length ?? -1,
      });
    const item = list.messages?.find((m) =>
      m.To?.some((t) => t.Address === email),
    );
    if (item) {
      message = await (
        await fetch(`${mailpit}/api/v1/message/${item.ID}`)
      ).json();
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(message, "Mailpit did not receive OTP");
  stage = "extract-otp";
  console.log("Mailpit message metadata:", {
    fields: Object.keys(message),
    textLength: message.Text?.length ?? 0,
    htmlLength: message.HTML?.length ?? 0,
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
  assert.equal(
    (
      await db
        .from("cms_media")
        .update({ visibility: "public" })
        .eq("id", mediaId)
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
