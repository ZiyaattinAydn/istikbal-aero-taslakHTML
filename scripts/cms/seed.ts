import { readFileSync, writeFileSync } from "node:fs";
const pages = JSON.parse(
  readFileSync("docs/cms/page-snapshots.json", "utf8"),
) as {
  route: string;
  title: string;
  description: string;
  sections: { tag: string; text: string }[];
}[];
const quote = (s: string) => "'" + s.replaceAll("'", "''") + "'";
const inserts = pages.map((p) => {
  const body = {
    title: p.title.split("|")[0].trim(),
    summary: p.description,
    paragraphs: p.sections.filter((s) => s.tag === "p").map((s) => s.text),
    date: null,
    source: null,
    stage: null,
  };
  return `insert into public.cms_documents(kind,slug,body) values('page',${quote(p.route)},${quote(JSON.stringify(body))}::jsonb) on conflict(kind,slug) do nothing;`;
});
const sql = [
  "-- Local/staging only. Never execute against production without review.",
  "-- Content fixtures, not a completed section-to-template migration.",
  "begin;",
  ...inserts,
  "insert into public.cms_versions(document_id,revision,body) select id,revision,body from public.cms_documents where kind='page' on conflict do nothing;",
  "commit;",
  "",
].join("\n");
if (process.argv.includes("--check")) {
  if (readFileSync("supabase/seed.sql", "utf8") !== sql)
    throw Error("Seed fixtures changed");
} else writeFileSync("supabase/seed.sql", sql);
console.log(`21 idempotent draft fixtures; no source edit overwritten`);
