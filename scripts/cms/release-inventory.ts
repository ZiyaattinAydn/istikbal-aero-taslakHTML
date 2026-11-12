/**
 * Phase 9: offline, read-only release manifest / source invariants.
 *
 * This is NOT a hosted deployment approval and deliberately has no network
 * calls, database mutations, credentials, or Cloudflare deploy commands.
 * Hosted DB backups, migration drift, worker and CEO acceptance are separate.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { routes } from "../../src/data/routes";
import { pageSchemas } from "../../src/lib/cms/pages";
import { legacyRecords } from "../../src/lib/cms/legacy-content";
import { siteMedia } from "../../src/lib/cms/site-media";

const schemas = pageSchemas;
const fields = schemas.flatMap((s) => s.fields);
const imageFields = fields.filter((f) => f.kind === "image");
const unique = <T>(items: T[]) => new Set(items).size === items.length;
const migrations = readFileSync(
  "supabase/migrations/20261113013600_cms_direct_publication.sql",
  "utf8",
);
const sql = migrations.toLowerCase();
const sources = {
  statusActions: readFileSync("src/app/admin/actions.ts", "utf8"),
  editor: readFileSync("src/components/admin/ContentEditor.tsx", "utf8"),
  siteMedia: readFileSync("src/lib/cms/site-media.ts", "utf8"),
};

assert.equal(routes.length, 21, "21 public routes must remain");
assert.equal(schemas.length, 21, "21 page schemas must remain");
assert.ok(unique(routes.map((r) => r.slug)), "Route slug must be unique");
assert.ok(unique(schemas.map((s) => s.slug)), "CMS page slug must be unique");
assert.deepEqual(
  new Set(routes.map((r) => r.slug)),
  new Set(schemas.map((s) => s.slug)),
  "Every public page needs exactly one CMS schema",
);
assert.equal(fields.length, 537, "Existing 537 field keys must remain");
assert.ok(schemas.every((s) => unique(s.fields.map((f) => f.key))),
  "CMS field keys must be unique within each page; shared component keys may repeat across pages");
assert.equal(imageFields.length, 43, "Existing 43 image fields must remain");
assert.equal(siteMedia.length, 9, "All existing public assets must remain in catalog");
assert.ok(unique(siteMedia.map((f) => f.name)), "Public media paths must be unique");
for (const f of imageFields)
  assert.ok(siteMedia.some((m) => m.name === f.value), "Uncataloged image field " + f.key);
assert.equal(legacyRecords.length, 13, "Canonical existing content set must remain 13");
assert.ok(
  unique(legacyRecords.map((item) => item.kind + ":" + item.slug)),
  "Existing content identities must be unique",
);
assert.deepEqual(
  Object.fromEntries(["news", "project", "platform", "technology"].map(
    (kind) => [kind, legacyRecords.filter((r) => r.kind === kind).length],
  )),
  { news: 2, project: 2, platform: 3, technology: 6 },
);
assert.match(sql, /operation not in \('create','save','publish','unpublish','archive','restore'\)/);
assert.match(sql, /cms_private\.allowed\(true\)/);
assert.match(sql, /delete from public\.cms_published where document_id=doc/);
assert.doesNotMatch(sources.editor, /value="review"|value="approve"/);
assert.match(sources.statusActions, /unpublish/);

const manifest = {
  staticSourceOnly: true,
  canDeploy: false,
  status: "OFFLINE_SOURCE_GATE_ONLY",
  pages: routes.length,
  cmsFields: fields.length,
  imageFields: imageFields.length,
  siteAssets: siteMedia.length,
  canonicalEntries: legacyRecords.length,
  directPublicationMigration: "20261113013600_cms_direct_publication",
  outsideScope: ["hosted-database-backup", "migration-drift", "cloudflare", "ceo-acceptance"],
};
console.log(JSON.stringify(manifest, null, 2));
