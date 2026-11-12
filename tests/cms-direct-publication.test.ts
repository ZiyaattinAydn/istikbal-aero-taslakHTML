import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261113013600_cms_direct_publication.sql",
  "utf8",
);
const mutation = readFileSync("src/app/admin/actions.ts", "utf8");
const editor = readFileSync("src/components/admin/ContentEditor.tsx", "utf8");

test("database direct publishing keeps fresh AAL2 publisher and revision checks", () => {
  assert.match(migration, /if not cms_private\.allowed\(\)/);
  assert.match(migration, /operation in \('publish','unpublish','archive'\) and not cms_private\.allowed\(true\)/);
  assert.match(migration, /if current_doc\.revision<>expected then raise exception 'Revision conflict'/);
  assert.match(migration, /operation in \('publish','unpublish','archive'\) then perform pg_advisory_xact_lock/);
  assert.match(migration, /update public\.cms_documents set status='published'/);
  assert.match(migration, /insert into public\.cms_audit\(document_id,action,actor\)/);
});

test("approval steps are not accepted by RPC or surfaced in editorial UI", () => {
  assert.doesNotMatch(migration, /'Approval required'/);
  assert.doesNotMatch(migration, /elsif operation='(?:approve|review)'/);
  assert.match(migration, /operation not in \('create','save','publish','unpublish','archive','restore'\)/);
  assert.doesNotMatch(mutation, /"approve"|"review"/);
  assert.doesNotMatch(editor, /value="(?:approve|review)"/);
  assert.match(editor, /name="operation"\s+value="publish"/);
});

test("unpublish withdraws only published snapshot, retaining private draft and history", () => {
  assert.match(migration, /elsif operation='unpublish' then/);
  assert.match(migration, /delete from public\.cms_published where document_id=doc/);
  assert.match(migration, /update public\.cms_documents set status='draft',approval='unreviewed',updated_at=now\(\)/);
  assert.match(mutation, /\["publish", "unpublish", "archive"\]\.includes\(operation\)/);
  assert.match(editor, /value="unpublish"/);
  assert.match(editor, /Yayından kaldır/);
});

test("publication still validates media rights through existing database trigger", () => {
  const media = readFileSync(
    "supabase/migrations/20261111214959_cms_relations_media_lifecycle.sql",
    "utf8",
  );
  assert.match(media, /create or replace function cms_private\.check_public_media/);
  assert.match(media, /m\.visibility='public' and m\.rights_approved/);
  assert.match(migration, /insert into public\.cms_published/);
});
