-- Not applied to a hosted project. Review and test in an isolated project first.
begin;
create schema if not exists cms_private;
revoke all on schema cms_private from public;
grant usage on schema cms_private to authenticated;
create table public.cms_roles (
 user_id uuid primary key references auth.users(id),
 role text not null check(role in ('editor','publisher')),
 active boolean not null default true
);
alter table public.cms_roles enable row level security;
create policy own_role on public.cms_roles for select to authenticated using(user_id=(select auth.uid()));
grant select on public.cms_roles to authenticated;
create function cms_private.allowed(publisher_only boolean default false) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(auth.jwt()->>'aal','')='aal2'
 and exists(select 1 from public.cms_roles r where r.user_id=auth.uid() and r.active and (not publisher_only or r.role='publisher'))
 and exists(select 1 from auth.sessions s where s.user_id=auth.uid() and s.id::text=auth.jwt()->>'session_id')
$$;
revoke all on function cms_private.allowed(boolean) from public;
grant execute on function cms_private.allowed(boolean) to authenticated;
create function cms_private.valid_body(b jsonb) returns boolean
language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(b)='object'
 and jsonb_typeof(b->'title')='string' and length(b->>'title') between 1 and 160
 and jsonb_typeof(b->'summary')='string' and length(b->>'summary')<=1000
 and jsonb_typeof(b->'paragraphs')='array'
 and case when jsonb_typeof(b->'paragraphs')='array' then jsonb_array_length(b->'paragraphs')<=30 and not exists(select 1 from jsonb_array_elements(b->'paragraphs') p where jsonb_typeof(p)<>'string' or length(p #>> '{}')>8000) else false end
 and octet_length(b::text)<=250000
 and b::text !~ '[<>]'
 and (b->>'source' is null or b->>'source' ~ '^https://[^/@:]+([/:][^@]*)?$')
 and (b->>'date' is null or b->>'date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
 and (b->>'stage' is null or length(b->>'stage')<=100),false)
$$;
revoke all on function cms_private.valid_body(jsonb) from public;
create table public.cms_documents (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('page','news','project','platform','technology','capability')),
 slug text not null check(slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
 body jsonb not null check(cms_private.valid_body(body)),
 approval text not null default 'unreviewed' check(approval in ('unreviewed','in_review','approved')),
 status text not null default 'draft' check(status in ('draft','in_review','approved','published','archived')),
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 unique(kind,slug)
);
create table public.cms_versions (
 document_id uuid not null references public.cms_documents(id), revision integer not null,
 body jsonb not null, actor uuid references auth.users(id), created_at timestamptz not null default now(),
 primary key(document_id,revision)
);
create table public.cms_published (
 document_id uuid primary key references public.cms_documents(id), kind text not null, slug text not null,
 body jsonb not null, revision integer not null, published_at timestamptz not null default now(), unique(kind,slug)
);
create table public.cms_audit (
 id bigint generated always as identity primary key, document_id uuid references public.cms_documents(id),
 action text not null, actor uuid references auth.users(id), created_at timestamptz not null default now()
);
create table public.cms_relations (
 source_id uuid references public.cms_documents(id), target_id uuid references public.cms_documents(id),
 primary key(source_id,target_id), check(source_id<>target_id)
);
create index cms_document_list on public.cms_documents(kind,updated_at desc);
create index cms_relation_target on public.cms_relations(target_id);
create index cms_audit_document on public.cms_audit(document_id,created_at desc);
alter table public.cms_documents enable row level security;
alter table public.cms_versions enable row level security;
alter table public.cms_published enable row level security;
alter table public.cms_audit enable row level security;
alter table public.cms_relations enable row level security;
create policy document_read on public.cms_documents for select to authenticated using((select cms_private.allowed()));
create policy version_read on public.cms_versions for select to authenticated using((select cms_private.allowed()));
create policy audit_read on public.cms_audit for select to authenticated using((select cms_private.allowed()));
create policy relation_read on public.cms_relations for select to authenticated using((select cms_private.allowed()));
create policy published_read on public.cms_published for select to anon,authenticated using(true);
revoke all on public.cms_documents,public.cms_versions,public.cms_published,public.cms_audit,public.cms_relations from anon,authenticated;
grant select on public.cms_documents,public.cms_versions,public.cms_audit,public.cms_relations to authenticated;
grant select on public.cms_published to anon,authenticated;
-- All writes pass through one locked transaction with fresh role/session/AAL checks.
create function cms_private.mutate(doc uuid, expected integer, operation text, payload jsonb, content_kind text, content_slug text) returns uuid
language plpgsql security definer set search_path='' as $$
declare current_doc public.cms_documents; old_body jsonb;
begin
 if not cms_private.allowed() then raise exception 'Access denied' using errcode='42501'; end if;
 if operation not in ('create','save','review','approve','publish','archive','restore') then raise exception 'Invalid operation'; end if;
 if operation in ('approve','publish','archive') and not cms_private.allowed(true) then raise exception 'Publisher required' using errcode='42501'; end if;
 if operation='create' then
  if content_kind='page' then raise exception 'Pages must be seeded'; end if;
  insert into public.cms_documents(kind,slug,body) values(content_kind,content_slug,payload) returning * into current_doc;
 else
  select * into current_doc from public.cms_documents where id=doc for update;
  if current_doc.id is null then raise exception 'Not found'; end if;
  if current_doc.revision<>expected then raise exception 'Revision conflict' using errcode='40001'; end if;
  if operation in ('save','restore') then
   if operation='restore' then
    select body into old_body from public.cms_versions where document_id=doc and revision=(payload->>'revision')::integer;
    if old_body is null then raise exception 'Version not found'; end if;
    payload=old_body;
   end if;
   update public.cms_documents set body=payload,approval='unreviewed',status='draft',revision=revision+1,updated_at=now() where id=doc returning * into current_doc;
  elsif operation='review' then
   update public.cms_documents set approval='in_review',status='in_review' where id=doc returning * into current_doc;
  elsif operation='approve' then
   update public.cms_documents set approval='approved',status='approved' where id=doc returning * into current_doc;
  elsif operation='publish' then
   if current_doc.approval<>'approved' then raise exception 'Approval required'; end if;
   insert into public.cms_published(document_id,kind,slug,body,revision) values(doc,current_doc.kind,current_doc.slug,current_doc.body,current_doc.revision)
   on conflict(document_id) do update set body=excluded.body,revision=excluded.revision,published_at=now();
   update public.cms_documents set status='published' where id=doc;
  elsif operation='archive' then
   delete from public.cms_published where document_id=doc;
   update public.cms_documents set status='archived',approval='unreviewed' where id=doc;
  end if;
 end if;
 insert into public.cms_versions(document_id,revision,body,actor) values(current_doc.id,current_doc.revision,current_doc.body,auth.uid()) on conflict do nothing;
 insert into public.cms_audit(document_id,action,actor) values(current_doc.id,operation,auth.uid());
 return current_doc.id;
end $$;
revoke all on function cms_private.mutate(uuid,integer,text,jsonb,text,text) from public;
grant execute on function cms_private.mutate(uuid,integer,text,jsonb,text,text) to authenticated;
create function public.cms_mutate(doc uuid,expected integer,operation text,payload jsonb default '{}',content_kind text default null,content_slug text default null) returns uuid
language sql security invoker set search_path='' as $$ select cms_private.mutate(doc,expected,operation,payload,content_kind,content_slug) $$;
revoke all on function public.cms_mutate(uuid,integer,text,jsonb,text,text) from public;
grant execute on function public.cms_mutate(uuid,integer,text,jsonb,text,text) to authenticated;
commit;
