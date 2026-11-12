import { writeFileSync } from "node:fs";
import { legacyRecords } from "../../src/lib/cms/legacy-content";
import { validateBody } from "../../src/lib/cms/model";

/**
 * Operator-only, idempotent preflight seed generator.
 * Run against an isolated/staging database after migration drift is resolved
 * and a verified backup exists. NEVER invoke against live production as part
 * of a build or CI step.
 *
 * node --import tsx scripts/cms/existing-content-seed.ts
 * node --import tsx scripts/cms/existing-content-seed.ts --write
 */
const quote = (value: string) => "'" + value.replaceAll("'", "''") + "'";
const unique = new Set<string>();
for (const item of legacyRecords) {
  const identity = item.kind + ":" + item.slug;
  if (unique.has(identity)) throw Error("Duplicate canonical identity: " + identity);
  unique.add(identity);
  if (!/^[a-z0-9-]{1,80}$/.test(item.slug)) throw Error("Unsafe canonical slug");
  validateBody(item.body);
}

const insert = legacyRecords.map((item) =>
  `(${quote(item.kind)},${quote(item.slug)},${quote(JSON.stringify(item.body))}::jsonb)`
);
const identity = legacyRecords.map((item) =>
  `(${quote(item.kind)},${quote(item.slug)})`
);
const sql = [
  "-- ISOLATED STAGING ONLY. Review the preview and database backup first.",
  "-- Do not run automatically in Vercel, Cloudflare, or Supabase deployment.",
  "-- Inserts only absent (kind,slug) pairs, never overwrites existing user drafts.",
  "-- Public pages remain static until an authorized publisher explicitly publishes.",
  "begin;",
  "insert into public.cms_documents (kind,slug,body)",
  "values",
  insert.join(",\n"),
  "on conflict (kind,slug) do nothing;",
  "insert into public.cms_versions (document_id,revision,body)",
  "select d.id,d.revision,d.body from public.cms_documents d",
  "where (d.kind,d.slug) in (",
  identity.join(",\n"),
  ") and not exists (",
  "  select 1 from public.cms_versions v",
  "  where v.document_id=d.id and v.revision=d.revision",
  ")",
  "on conflict do nothing;",
  "commit;",
  "",
].join("\n");

if (process.argv.includes("--write")) {
  writeFileSync("supabase/existing-content-seed.sql", sql);
  console.log("Wrote staging-only seed; inspect before running.");
} else {
  console.log("Dry run: " + legacyRecords.length + " canonical identities");
  const totals: Record<string, number> = {};
  for (const item of legacyRecords) totals[item.kind] = (totals[item.kind] ?? 0) + 1;
  console.log(Object.entries(totals).map(([kind, total]) => kind + "=" + total).join(", "));
  console.log("No SQL executed and no database mutated.");
}
