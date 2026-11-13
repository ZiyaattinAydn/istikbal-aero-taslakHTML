/** Hosted, read-only backup helper. No database mutations or restore actions. */
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

export const PROJECT_REF = "uftnykormtwlzolwbhfb";
const DIRECT_HOST = `db.${PROJECT_REF}.supabase.co`;

export function validateTarget(input) {
  const host = String(input.host || "").trim().toLowerCase();
  const port = Number(input.port ?? 5432);
  const user = String(input.user || "").trim();
  const database = String(input.database || "postgres").trim();
  const direct = host === DIRECT_HOST;
  const pooler = /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(host);
  if (!direct && !pooler)
    throw Error("Only this project direct host or official Supabase session-pooler is allowed.");
  if (port !== 5432)
    throw Error("Use the session port 5432, not transaction-pooler port 6543.");
  const expectedUser = direct ? "postgres" : `postgres.${PROJECT_REF}`;
  if (user !== expectedUser)
    throw Error(`Wrong database user for this project. Expected ${expectedUser}.`);
  if (database !== "postgres") throw Error("Only database postgres is allowed.");
  return { host, port, user, database };
}

export function inspectArchiveList(content) {
  const checks = {
    cmsDocuments: /\bTABLE DATA\s+public\s+cms_documents\s+/,
    cmsVersions: /\bTABLE DATA\s+public\s+cms_versions\s+/,
    cmsPageFields: /\bTABLE DATA\s+public\s+cms_page_fields\s+/,
    authUsers: /\bTABLE DATA\s+auth\s+users\s+/,
    authSessions: /\bTABLE DATA\s+auth\s+sessions\s+/,
    storageObjects: /\bTABLE DATA\s+storage\s+objects\s+/,
    migrationLedger: /\bTABLE DATA\s+supabase_migrations\s+schema_migrations\s+/,
  };
  const missing = Object.entries(checks).filter(([, regexp]) => !regexp.test(content))
    .map(([name]) => name);
  return { complete: missing.length === 0, missing, entries: Object.keys(checks).length };
}

function findExecutable(name) {
  const win = platform() === "win32";
  const bare = win ? `${name}.exe` : name;
  const locations = [];
  if (process.env.CMS_POSTGRES_BIN) locations.push(join(process.env.CMS_POSTGRES_BIN, bare));
  for (const entry of (process.env.PATH || process.env.Path || "").split(win ? ";" : ":"))
    if (entry) locations.push(join(entry, bare));
  if (win) {
    const base = process.env.ProgramFiles || "C:\\Program Files";
    for (const major of [18, 17]) locations.push(join(base, "PostgreSQL", String(major), "bin", bare));
  }
  return locations.find(p => existsSync(p)) || null;
}

function versionMajor(bin) {
  const out = spawnSync(bin, ["--version"], { encoding: "utf8", timeout: 15000 });
  if (out.error || out.status !== 0) throw Error("Could not run PostgreSQL client tool.");
  return Number((out.stdout || "").match(/(?:PostgreSQL\)?\s+)(\d+)(?:\.\d+)?/)?.[1] || 0);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/cms/backup-hosted.mjs [--host db.<ref>.supabase.co]");
    console.log("Only a private local dump; never modifies Supabase, Cloudflare, or GitHub.");
    return;
  }
  let requestedHost = null;
  if (args.length) {
    if (args.length !== 2 || args[0] !== "--host")
      throw Error("Only --host <database host> is supported.");
    requestedHost = args[1];
  }
  const dump = findExecutable("pg_dump");
  const restore = findExecutable("pg_restore");
  if (!dump || !restore)
    throw Error("PostgreSQL 17+ pg_dump and pg_restore are required (PATH or CMS_POSTGRES_BIN).");
  const dumpVersion = versionMajor(dump);
  const restoreVersion = versionMajor(restore);
  if (dumpVersion < 17 || restoreVersion < 17)
    throw Error("PostgreSQL client tools must be version 17 or newer.");
  const cli = createInterface({ input: process.stdin, output: process.stdout });
  let host;
  try {
    host = requestedHost || (await cli.question(
      `Supabase Connect > session pooler host (Enter: ${DIRECT_HOST}): `
    )).trim() || DIRECT_HOST;
  } finally {
    cli.close();
  }
  const lowerHost = host.trim().toLowerCase();
  const target = validateTarget({
    host: lowerHost, port: 5432,
    user: lowerHost === DIRECT_HOST ? "postgres" : `postgres.${PROJECT_REF}`,
    database: "postgres",
  });
  const base = join(process.env.LOCALAPPDATA || join(homedir(), ".local", "share"),
    "IstikbalAerospace", "cms-backups");
  const folder = join(base, `hosted-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const archive = join(folder, "supabase-full-logical.dump");
  console.log(`Host: ${target.host} | user: ${target.user} | database: postgres | port: 5432`);
  console.log(`Private local output: ${archive}`);
  console.log("pg_dump will securely request the DB password; the script does not store or print it.");
  const env = { ...process.env, PGSSLMODE: "require", PGAPPNAME: "istikbal_cms_backup" };
  delete env.PGPASSWORD;
  const out = spawnSync(dump, [
    "--host", target.host, "--port", "5432", "--username", target.user,
    "--dbname", "postgres", "--password", "--format=custom", "--file", archive,
  ], { stdio: "inherit", env });
  if (out.error || out.status !== 0) {
    if (existsSync(archive)) rmSync(archive, { force: true });
    throw Error(`pg_dump failed (exit ${out.status ?? "error"}). No database changes made.`);
  }
  const file = statSync(archive);
  if (file.size < 5000) throw Error("Archive unexpectedly small. Do not continue.");
  const inspect = spawnSync(restore, ["--list", archive],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (inspect.error || inspect.status !== 0)
    throw Error("pg_restore cannot read the archive; do NOT proceed.");
  const coverage = inspectArchiveList(inspect.stdout);
  if (!coverage.complete) {
    renameSync(archive, archive + ".INCOMPLETE");
    throw Error(`Missing archive entries: ${coverage.missing.join(", ")}. Do NOT apply migration.`);
  }
  const hash = await new Promise((ok, fail) => {
    const digest = createHash("sha256");
    const stream = createReadStream(archive);
    stream.on("data", block => digest.update(block));
    stream.on("error", fail);
    stream.on("end", () => ok(digest.digest("hex")));
  });
  const manifest = {
    project_ref: PROJECT_REF,
    host: target.host,
    created_at: new Date().toISOString(),
    pg_dump_major: dumpVersion,
    pg_restore_major: restoreVersion,
    filename: basename(archive),
    bytes: file.size,
    sha256: hash,
    inspected_catalog_entries: coverage.entries,
    status: "logical_archive_created_and_catalog_readable__RESTORE_NOT_VERIFIED",
    notes: "Sensitive Auth data. Storage object binary bytes NOT included. Runtime configuration/global roles need separate capture.",
  };
  writeFileSync(join(folder, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n",
    { mode: 0o600, flag: "wx" });
  console.log("BACKUP ARCHIVE CAPTURED; SHA-256:", hash);
  console.log("IMPORTANT: This is NOT a verified restore. Storage object file contents are NOT included.");
  console.log("Keep the entire folder PRIVATE; do not upload it to chat, GitHub, or public cloud.");
  console.log("Local backup folder:", folder);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error("SAFE STOP:", e.message); process.exitCode = 1; });
}
