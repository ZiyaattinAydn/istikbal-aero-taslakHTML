import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { validateBody } from "../src/lib/cms/model";
const uid = "00000000-0000-0000-0000-000000000001",
  sid = "00000000-0000-0000-0000-000000000002",
  image = "10000000-0000-0000-0000-000000000001";
const base = {
  title: "Başlık",
  summary: "Özet",
  paragraphs: ["Paragraf"],
  date: null,
  source: null,
  stage: null,
};
test("entry reference input rejects malformed/duplicate/excessive values", () => {
  for (const more of [
    { cover_id: "javascript:bad" },
    { related_ids: [uid, uid] },
    { related_ids: Array.from({ length: 13 }, () => uid) },
    { related_ids: ["missing"] },
  ])
    assert.throws(() => validateBody({ ...base, ...more }));
  assert.deepEqual(
    validateBody({ ...base, cover_id: image, related_ids: [uid] }).related_ids,
    [uid],
  );
});
test("versioned relations, media metadata, publisher withdrawal and stale revisions are atomic", async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert on storage.objects to anon,authenticated;create table auth.users(id uuid primary key,email text,encrypted_password text,email_confirmed_at timestamptz);create table auth.sessions(id uuid primary key,user_id uuid);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;`,
  );
  for (const f of readdirSync("supabase/migrations").sort())
    await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));
  await db.exec(
    `insert into cms_private.admin_allowlist values('fixture@example.com');insert into auth.users(id,email,email_confirmed_at)values('${uid}','fixture@example.com',now());insert into auth.sessions values('${sid}','${uid}');`,
  );
  const claims = async () => {
    await db.query(
      "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
      [uid, JSON.stringify({ aal: "aal2", session_id: sid })],
    );
    await db.exec("set role authenticated");
  };
  const create = async (kind: string, body: unknown = base) =>
    (
      await db.query<{ id: string }>(
        "select public.cms_mutate(null,0,'create',$1,$2,$3) as id",
        [JSON.stringify(body), kind, crypto.randomUUID()],
      )
    ).rows[0].id;
  const mutate = (
    id: string,
    revision: number,
    op: string,
    body: unknown = {},
  ) =>
    db.query("select public.cms_mutate($1,$2,$3,$4)", [
      id,
      revision,
      op,
      JSON.stringify(body),
    ]);
  const media = (expected: number, operation: string, payload: unknown = {}) =>
    db.query<{ result: { revision: number; affected: { id: string }[] } }>(
      "select public.cms_manage_media($1,$2,$3,$4) as result",
      [image, expected, operation, JSON.stringify(payload)],
    );
  const publish = async (id: string, rev = 1) => {
    await mutate(id, rev, "approve");
    await mutate(id, rev, "publish");
  };
  try {
    await claims();
    await db.query(
      "insert into public.cms_media(id,path,mime,bytes,width,height,alt,rights_approved,created_by)values($1,$2,'image/webp',100,100,100,'Görsel',true,$3)",
      [image, `${uid}/${image}.webp`, uid],
    );
    const tech = await create("technology"),
      platform = await create("platform"),
      project = await create("project", {
        ...base,
        cover_id: image,
        related_ids: [tech, platform],
      });
    assert.equal(
      (
        await db.query(
          "select * from public.cms_relations where source_id=$1",
          [project],
        )
      ).rows.length,
      2,
    );
    await assert.rejects(
      () => mutate(project, 1, "save", { ...base, related_ids: [project] }),
      /Invalid relation/,
    );
    await assert.rejects(
      () => mutate(project, 1, "save", { ...base, related_ids: [tech, tech] }),
      /Duplicate relation/,
    );
    await assert.rejects(
      () => mutate(project, 1, "save", { ...base, related_ids: [image] }),
      /Invalid relation/,
    );
    await mutate(project, 1, "approve");
    await assert.rejects(
      () => mutate(project, 1, "publish"),
      /Image must be approved/,
    );
    await media(1, "allow");
    await publish(project);
    await publish(tech);
    await mutate(project, 1, "save", { ...base, related_ids: [tech] });
    await mutate(project, 2, "restore", { revision: 1 });
    assert.equal(
      (
        await db.query(
          "select * from public.cms_relations where source_id=$1",
          [project],
        )
      ).rows.length,
      2,
    );
    // A page field and a record cover must both be withdrawn safely.
    await db.exec("reset role");
    await db.exec(readFileSync("supabase/page-seed.sql", "utf8"));
    const page = (
      await db.query<{ id: string; body: Record<string, unknown> }>(
        "select id,body from public.cms_documents where kind='page' and slug='kurumsal'",
      )
    ).rows[0];
    const key = (
      await db.query<{ key: string }>(
        "select key from public.cms_page_fields where page_slug='kurumsal' and kind='image' limit 1",
      )
    ).rows[0].key;
    await claims();
    await mutate(page.id, 1, "save", {
      ...page.body,
      fields: { ...(page.body.fields as object), [key]: `cms:${image}` },
    });
    await publish(page.id, 2);
    await assert.rejects(() => media(2, "revoke"), /withdrawal confirmation/);
    assert.equal(
      (await db.query("select * from public.cms_published")).rows.length,
      3,
    );
    await assert.rejects(
      () => db.exec("update public.cms_media set visibility='private'"),
      /permission denied/,
    );
    await db.exec("reset role;update public.cms_roles set role='editor'");
    await claims();
    await assert.rejects(
      () => media(2, "revoke", { withdraw_publications: true }),
      /Publisher required/,
    );
    await media(2, "metadata", {
      alt: "Yeni alt metin",
      caption: "Lisans: şirket izni",
    });
    await assert.rejects(
      () => media(2, "metadata", { alt: "Eski", caption: "" }),
      /Revision conflict/,
    );
    await db.exec("reset role;update public.cms_roles set role='publisher'");
    await claims();
    const result = await media(3, "revoke", { withdraw_publications: true });
    assert.equal(result.rows[0].result.affected.length, 2);
    assert.equal(
      (await db.query("select * from public.cms_published")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.cms_media")).rows.length,
      1,
    );
    await mutate(project, 3, "approve");
    await assert.rejects(
      () => mutate(project, 3, "publish"),
      /Image must be approved/,
    );
    await db.exec(
      "select set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claims','{}',false);set role anon",
    );
    assert.equal(
      (await db.query("select id from public.cms_media")).rows.length,
      0,
    );
    await assert.rejects(
      () => db.exec("select * from public.cms_relations"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
