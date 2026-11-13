import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTarget, inspectArchiveList, PROJECT_REF } from "../scripts/cms/backup-hosted.mjs";

test("hosted backup only allows the known project, never arbitrary database hosts", () => {
  assert.equal(
    validateTarget({host: `db.${PROJECT_REF}.supabase.co`,user:"postgres"}).port, 5432,
  );
  assert.equal(
    validateTarget({host:"aws-0-eu-central-1.pooler.supabase.com",user:`postgres.${PROJECT_REF}`}).user,
    `postgres.${PROJECT_REF}`,
  );
  for(const bad of [
    {host:"db.elsewhere.supabase.co",user:"postgres"},
    {host:"some-malicious-host.invalid",user:"postgres"},
    {host:"aws-0-eu-central-1.pooler.supabase.com",user:"postgres"},
    {host:`db.${PROJECT_REF}.supabase.co`,user:"postgres",port:6543},
    {host:`db.${PROJECT_REF}.supabase.co`,user:"postgres",database:"foreign"},
  ]) assert.throws(() => validateTarget(bad));
});

test("logical backup catalog must include Auth, CMS data and migration history", () => {
  const list = [
    "public cms_documents","public cms_versions","public cms_page_fields",
    "auth users","auth sessions","storage objects","supabase_migrations schema_migrations",
  ].map((entry,i) => `${i}; 0 42 TABLE DATA ${entry} postgres`).join("\n");
  assert.equal(inspectArchiveList(list).complete,true);
  const missing = inspectArchiveList(list.replace("TABLE DATA auth users","TABLE public users"));
  assert.equal(missing.complete,false);
  assert.ok(missing.missing.includes("authUsers"));
});
