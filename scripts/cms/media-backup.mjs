// Operator tool only; never imported by the application. No remote writes.
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = "uftnykormtwlzolwbhfb";
const objectPath = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/;
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const fail = () => { throw Error("Media backup validation failed"); };
async function inventory(client) {
  const objects = [];
  async function list(prefix = "") {
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await client.storage.from("cms-media").list(prefix, {
        limit: 100, offset, sortBy: { column: "name", order: "asc" },
      });
      if (error || !data) fail();
      for (const item of data) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (!item.id) {
          if (prefix || !/^[0-9a-f-]{36}$/.test(item.name)) fail();
          await list(path);
        } else {
          if (!objectPath.test(path)) fail();
          objects.push({ path, id: item.id, updated_at: item.updated_at,
            bytes: Number(item.metadata?.size) });
        }
      }
      if (data.length < 100) break;
    }
  }
  await list();
  const metadata = [];
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await client.from("cms_media").select("*")
      .order("id").range(offset, offset + 199);
    if (error || !data) fail();
    metadata.push(...data);
    if (data.length < 200) break;
  }
  objects.sort((a, b) => a.path.localeCompare(b.path));
  if (metadata.some((m) => !objects.some((o) => o.path === m.path))) fail();
  return { objects, metadata };
}

export async function backupMedia(client, destination, source = project, maxBytes = 67108864) {
  // Parent must already exist; never reuse/overwrite an old backup directory.
  await mkdir(destination, { mode: 0o700 });
  const before = await inventory(client);
  const total = before.objects.reduce((sum, item) => sum + item.bytes, 0);
  if (!Number.isSafeInteger(total) || total > maxBytes || !Number.isSafeInteger(maxBytes) || maxBytes < 0) fail();
  const files = [];
  for (const item of before.objects) {
    if (!Number.isSafeInteger(item.bytes) || item.bytes < 1 || item.bytes > 5242880) fail();
    const { data, error } = await client.storage.from("cms-media").download(item.path);
    if (error || !data) fail();
    const bytes = Buffer.from(await data.arrayBuffer());
    if (bytes.length !== item.bytes) fail();
    await mkdir(join(destination, dirname(item.path)), { mode: 0o700, recursive: true });
    await writeFile(join(destination, item.path), bytes, { mode: 0o600, flag: "wx" });
    files.push({ path: item.path, bytes: bytes.length, sha256: digest(bytes) });
  }
  if (JSON.stringify(before) !== JSON.stringify(await inventory(client))) fail();
  // Written last: no completed manifest means the backup is incomplete.
  await writeFile(join(destination, "manifest.json"), JSON.stringify({
    format: 1, source, bucket: "cms-media", created_at: new Date().toISOString(),
    files, metadata: before.metadata,
  }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  return verifyMedia(destination);
}

export async function verifyMedia(destination) {
  const root = await realpath(destination);
  const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
  if (manifest.format !== 1 || manifest.bucket !== "cms-media" || !Array.isArray(manifest.files)) fail();
  const seen = new Set();
  for (const file of manifest.files) {
    if (!objectPath.test(file.path) || seen.has(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256)) fail();
    seen.add(file.path);
    const path = await realpath(join(root, file.path));
    if (relative(root, path).startsWith("..") || isAbsolute(relative(root, path))) fail();
    const bytes = await readFile(path);
    if (bytes.length !== file.bytes || digest(bytes) !== file.sha256) fail();
  }
  return manifest;
}

async function main() {
  const verify = process.argv[2] === "--verify";
  const arg = process.argv[verify ? 3 : 2];
  if (!arg || (!verify && !process.env.SUPABASE_SERVICE_ROLE_KEY)) fail();
  const target = resolve(arg);
  const repo = await realpath(fileURLToPath(new URL("../../", import.meta.url)));
  const parent = await realpath(dirname(target));
  const rel = relative(repo, join(parent, target.split(/[\\/]/).at(-1)));
  if (!verify && !rel.startsWith("..") && !isAbsolute(rel)) fail();
  if (verify) await verifyMedia(target);
  else {
    const client = createClient(`https://${project}.supabase.co`, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) }) },
    });
    await backupMedia(client, target, project, Number(process.env.CMS_MEDIA_BACKUP_MAX_BYTES || 67108864));
  }
  console.log("Media archive integrity verified. No paths, content, credentials or account details logged.");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error("Media backup stopped. Check private operator configuration, destination and inventory stability. No remote data changed; incomplete directories have no valid completion guarantee.");
    process.exitCode = 1;
  });
}
