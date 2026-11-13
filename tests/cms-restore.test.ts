import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("isolated physical fixture restore preserves 21 pages, versions, publication, relations and RLS", async () => {
  const source = new PGlite();
  let restored: PGlite | undefined;
  const uid = "00000000-0000-0000-0000-000000000001";
  const sid = "00000000-0000-0000-0000-000000000002";
  const claim = async (db: PGlite, aal = "aal2") => {
    await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
      [uid, JSON.stringify({ aal, session_id: sid })]);
    await db.exec("set role authenticated");
  };
  const body = { title: "Restore fixture", summary: "Test", paragraphs: ["Private draft"], date: null, source: null, stage: null };
  try {
    // Synthetic Auth/Storage fixtures only; never connects to any hosted project.
    await source.exec(`create role anon;create role authenticated;create role service_role;
      create schema auth;create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert on storage.objects to anon,authenticated;
      create table auth.users(id uuid primary key,email text,encrypted_password text,email_confirmed_at timestamptz);
      create table auth.sessions(id uuid primary key,user_id uuid);
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;`);
    for (const file of readdirSync("supabase/migrations").sort())
      await source.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
    await source.exec(readFileSync("supabase/page-seed.sql", "utf8"));
    await source.exec(`insert into cms_private.admin_allowlist values('restore-fixture@example.test');
      insert into auth.users(id,email,email_confirmed_at) values('${uid}','restore-fixture@example.test',now());
      insert into auth.sessions values('${sid}','${uid}');`);
    await claim(source);
    const create = async (kind: string, payload: object) => (await source.query<{ id: string }>(
      "select cms_mutate(null,0,'create',$1,$2,$3) as id", [JSON.stringify(payload), kind, crypto.randomUUID()],
    )).rows[0].id;
    const target = await create("technology", body);
    const id = await create("project", { ...body, related_ids: [target] });
    // Direct publisher publication must be preserved byte-for-byte in backups.
    await source.query("select cms_mutate($1,1,'publish','{}');", [id]);
    await source.query("select cms_mutate($1,1,'save',$2)", [id, JSON.stringify({ ...body, title: "Unpublished edit", related_ids: [target] })]);
    await source.exec("reset role");
    const tables = ["cms_documents", "cms_versions", "cms_published", "cms_relations", "cms_audit", "cms_page_fields", "cms_roles"];
    const snapshot = async (db: PGlite) => Promise.all(tables.map(async (table) =>
      (await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as data from public.${table} t`)).rows));
    const expected = await snapshot(source);
    const backup = await source.dumpDataDir("none");
    const bytes = Buffer.from(await backup.arrayBuffer());
    const hash = createHash("sha256").update(bytes).digest("hex");
    assert.match(hash, /^[a-f0-9]{64}$/);
    // Modify only the disposable source after the backup, proving recovery uses the saved image.
    await claim(source);
    await source.query("select cms_mutate($1,2,'save',$2)", [id, JSON.stringify({ ...body, title: "Later edit" })]);
    await source.exec("reset role");
    assert.notDeepEqual(await snapshot(source), expected);
    restored = new PGlite({ loadDataDir: new Blob([bytes]) });
    assert.deepEqual(await snapshot(restored), expected);
    assert.equal((await restored.query<{ n: number }>("select count(*)::int as n from cms_documents where kind='page'")).rows[0].n, 21);
    assert.equal((await restored.query<{ n: number }>("select count(*)::int as n from cms_page_fields")).rows[0].n, 537);
    await restored.exec("set role anon");
    await assert.rejects(() => restored!.query("select * from cms_documents"), /permission denied/);
    assert.equal((await restored.query<{ body: typeof body }>("select body from cms_published where document_id=$1", [id])).rows[0].body.title, body.title);
    await restored.exec("reset role");
    await claim(restored, "aal1");
    assert.equal((await restored.query("select * from cms_documents")).rows.length, 0);
    await assert.rejects(() => restored!.query("select cms_mutate($1,2,'restore','{\"revision\":1}')", [id]), /Access denied/);
    await restored.exec("reset role");
    await claim(restored);
    await restored.query("select cms_mutate($1,2,'restore','{\"revision\":1}')", [id]);
    assert.equal((await restored.query<{ body: typeof body; revision: number }>("select body,revision from cms_documents where id=$1", [id])).rows[0].revision, 3);
    assert.equal((await restored.query("select * from cms_relations where source_id=$1", [id])).rows.length, 1);
    await restored.exec("reset role;update cms_roles set active=false");
    await claim(restored);
    await assert.rejects(() => restored!.query("select cms_mutate($1,3,'archive','{}')", [id]), /Access denied/);
  } finally {
    await restored?.close();
    await source.close();
  }
});
