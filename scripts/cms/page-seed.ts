import { readFileSync, writeFileSync } from "node:fs";
import schema from "../../src/data/cms-page-schema.json";
const q = (s: string) => "'" + s.replaceAll("'", "''") + "'";
const rows = schema.flatMap((p) =>
  p.fields.map(
    (f) =>
      `(${q(p.slug)},${q(f.key)},${q(f.kind)},${q(f.label)},${q(f.value)})`,
  ),
);
const sql = [
  "begin;",
  `insert into public.cms_page_fields(page_slug,key,kind,label,fallback) values ${rows.join(",\n")} on conflict(page_slug,key) do update set kind=excluded.kind,label=excluded.label,fallback=excluded.fallback;`,
  ...schema.map((p) => {
    const fields = Object.fromEntries(p.fields.map((f) => [f.key, f.value]));
    const body = {
      title: p.title,
      summary: p.description,
      paragraphs: [],
      date: null,
      source: null,
      stage: null,
      fields,
    };
    return `insert into public.cms_documents(kind,slug,body) values('page',${q(p.slug)},${q(JSON.stringify(body))}::jsonb) on conflict(kind,slug) do update set body=excluded.body where cms_documents.revision=1 and not(cms_documents.body ? 'fields');`;
  }),
  "insert into public.cms_versions(document_id,revision,body) select id,revision,body from public.cms_documents where kind='page' on conflict do nothing;",
  "commit;",
  "",
].join("\n");
const path = "supabase/page-seed.sql";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== sql) throw Error("Page seed changed");
} else writeFileSync(path, sql);
console.log("21 controlled page seeds ready");
