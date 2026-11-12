import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("Postgres RLS: MFA, fresh roles, revoked sessions, direct publication, concurrency and restore", async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert on storage.objects to anon,authenticated;create table auth.users(id uuid primary key,email text,encrypted_password text,email_confirmed_at timestamptz);create table auth.sessions(id uuid primary key,user_id uuid);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;`,
  );
  const migration = readdirSync("supabase/migrations").find((f) =>
    f.endsWith("_cms_foundation.sql"),
  )!;
  await db.exec(readFileSync(`supabase/migrations/${migration}`, "utf8"));
  for (const extra of readdirSync("supabase/migrations")
    .filter((f) => !f.endsWith("_cms_foundation.sql"))
    .sort())
    await db.exec(readFileSync(`supabase/migrations/${extra}`, "utf8"));
  await db.exec(
    "insert into cms_private.admin_allowlist(email) values('cms-admin@example.test')",
  );
  const uid = "00000000-0000-0000-0000-000000000001",
    sid = "00000000-0000-0000-0000-000000000002";
  await db.query(
    "insert into auth.users(id,email) values($1,'cms-admin@example.test')",
    [uid],
  );
  await db.query("insert into auth.sessions values($1,$2)", [sid, uid]);
  await db.query("insert into public.cms_roles values($1,'editor',true)", [
    uid,
  ]);
  async function claims(aal = "aal2") {
    await db.query(
      "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
      [uid, JSON.stringify({ aal, session_id: sid })],
    );
    await db.exec("set role authenticated");
  }
  const body = {
    title: "Örnek",
    summary: "Özet",
    paragraphs: ["Paragraf"],
    date: null,
    source: null,
    stage: null,
  };
  async function mutate(
    id: string | null,
    revision: number,
    op: string,
    payload: unknown = body,
  ) {
    return db.query<{ cms_mutate: string }>(
      "select public.cms_mutate($1,$2,$3,$4,'news','ornek')",
      [id, revision, op, JSON.stringify(payload)],
    );
  }
  try {
    await claims("aal1");
    await assert.rejects(() => mutate(null, 0, "create"), /Access denied/);
    await claims();
    await assert.rejects(
      () => mutate(null, 0, "create", { ...body, title: "<script>" }),
      /check constraint/,
    );
    const id = (await mutate(null, 0, "create")).rows[0].cms_mutate;
    assert.equal((await mutate(id, 0, "create")).rows[0].cms_mutate, id);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public.cms_documents",
        )
      ).rows[0].count,
      1,
    );
    await assert.rejects(() => mutate(id, 1, "publish"), /Publisher required/);
    await assert.rejects(
      () => db.exec("update public.cms_documents set approval='approved'"),
      /permission denied/,
    );
    await db.exec("set role anon");
    await assert.rejects(
      () => db.exec("select * from public.cms_documents"),
      /permission denied/,
    );
    assert.equal(
      (await db.query("select * from public.cms_published")).rows.length,
      0,
    );
    await db.exec("reset role");
    await db.query(
      "update public.cms_roles set role='publisher' where user_id=$1",
      [uid],
    );
    await claims();
    await assert.rejects(() => mutate(id, 1, "approve"), /Invalid operation/);
    await assert.rejects(() => mutate(id, 1, "review"), /Invalid operation/);
    await mutate(id, 1, "publish");
    await mutate(id, 1, "unpublish");
    assert.equal((await db.query("select * from public.cms_published")).rows.length, 0);
    const retained = await db.query<{status:string;revision:number}>(
      "select status,revision from public.cms_documents where id=$1", [id],
    );
    assert.equal(retained.rows[0].status, "draft");
    assert.equal(retained.rows[0].revision, 1);
    await assert.rejects(() => mutate(id, 1, "unpublish"), /Publication not found/);
    await mutate(id, 1, "publish");
    await mutate(id, 1, "save", { ...body, title: "Taslak değişikliği" });
    assert.equal(
      (
        await db.query<{ body: typeof body }>(
          "select body from public.cms_published",
        )
      ).rows[0].body.title,
      "Örnek",
    );
    await assert.rejects(() => mutate(id, 1, "save"), /Revision conflict/);
    await mutate(id, 2, "restore", { revision: 1 });
    assert.equal(
      (
        await db.query<{ body: typeof body }>(
          "select body from public.cms_documents",
        )
      ).rows[0].body.title,
      "Örnek",
    );
    await mutate(id, 3, "archive");
    assert.equal(
      (await db.query("select * from public.cms_published")).rows.length,
      0,
    );
    await db.exec("reset role");
    await db.exec("update public.cms_roles set active=false");
    await claims();
    assert.equal(
      (await db.query("select * from public.cms_documents")).rows.length,
      0,
    );
    await assert.rejects(() => mutate(id, 3, "save"), /Access denied/);
    await db.exec("reset role");
    await db.exec(
      "update public.cms_roles set active=true;delete from auth.sessions",
    );
    await claims();
    await assert.rejects(() => mutate(id, 3, "save"), /Access denied/);
    await db.exec("reset role");
    await assert.rejects(
      () =>
        db.exec(
          "insert into auth.users(id,email) values(gen_random_uuid(),'outsider@example.test')",
        ),
      /Account creation is restricted/,
    );
    await assert.rejects(
      () =>
        db.exec(
          "update auth.users set encrypted_password='password' where email='cms-admin@example.test'",
        ),
      /Password authentication is disabled/,
    );
    const pageSeed = readFileSync("supabase/page-seed.sql", "utf8");
    await db.exec(pageSeed);
    await db.exec(pageSeed);
    await assert.rejects(
      () =>
        db.exec(
          "update public.cms_documents set body=jsonb_set(body,'{fields}','{\"unknown\":\"text\"}') where kind='page' and slug='kurumsal'",
        ),
      /Invalid page field/,
    );
    const seed = readFileSync("supabase/seed.sql", "utf8");
    await db.exec(seed);
    await db.exec(seed);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public.cms_documents where kind='page'",
        )
      ).rows[0].count,
      21,
    );
    await db.exec(
      "update public.cms_documents set body=jsonb_set(body,'{title}','\"Edited\"') where kind='page' and slug='index'",
    );
    await db.exec(seed);
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select body->>'title' as title from public.cms_documents where kind='page' and slug='index'",
        )
      ).rows[0].title,
      "Edited",
    );
  } finally {
    await db.close();
  }
});
