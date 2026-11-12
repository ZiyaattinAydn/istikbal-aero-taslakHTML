-- Phase 7. Review local/staging migration drift before applying. Never auto-apply to hosted Supabase.
-- Keep MFA AAL2, publisher role, active session, revision conflict protection,
-- media publication validation triggers, transaction locks and audit/history.
-- Legacy review/approve RPC operations are deliberately no longer accepted.
begin;
create or replace function cms_private.mutate(doc uuid, expected integer, operation text, payload jsonb, content_kind text, content_slug text) returns uuid
language plpgsql security definer set search_path='' as $$
declare current_doc public.cms_documents; old_body jsonb;
begin
 if not cms_private.allowed() then raise exception 'Access denied' using errcode='42501'; end if;
 if operation not in ('create','save','publish','unpublish','archive','restore') then raise exception 'Invalid operation'; end if;
 if operation in ('publish','unpublish','archive') and not cms_private.allowed(true) then raise exception 'Publisher required' using errcode='42501'; end if;
 if operation in ('publish','unpublish','archive') then perform pg_advisory_xact_lock(42761,1); end if;
 if operation='create' then
  if content_kind='page' then raise exception 'Pages must be seeded'; end if;
  doc=coalesce(doc,gen_random_uuid());
  insert into public.cms_documents(id,kind,slug,body) values(doc,content_kind,content_slug,payload) on conflict(id) do nothing returning * into current_doc;
  if current_doc.id is null then
   select * into current_doc from public.cms_documents where id=doc;
   if current_doc.kind<>content_kind or current_doc.slug<>content_slug or current_doc.body<>payload then raise exception 'Revision conflict' using errcode='40001'; end if;
   return current_doc.id;
  end if;
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
  elsif operation='publish' then
   insert into public.cms_published(document_id,kind,slug,body,revision) values(doc,current_doc.kind,current_doc.slug,current_doc.body,current_doc.revision)
   on conflict(document_id) do update set body=excluded.body,revision=excluded.revision,published_at=now();
   update public.cms_documents set status='published' where id=doc;
  elsif operation='unpublish' then
   if not exists(select 1 from public.cms_published where document_id=doc)
    then raise exception 'Publication not found' using errcode='P0002'; end if;
   delete from public.cms_published where document_id=doc;
   update public.cms_documents set status='draft',approval='unreviewed',updated_at=now() where id=doc;
  elsif operation='archive' then
   delete from public.cms_published where document_id=doc;
   update public.cms_documents set status='archived',approval='unreviewed' where id=doc;
  end if;
 end if;
 insert into public.cms_versions(document_id,revision,body,actor) values(current_doc.id,current_doc.revision,current_doc.body,auth.uid()) on conflict do nothing;
 insert into public.cms_audit(document_id,action,actor) values(current_doc.id,operation,auth.uid());
 return current_doc.id;
end $$;
commit;
