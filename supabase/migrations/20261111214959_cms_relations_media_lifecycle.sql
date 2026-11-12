begin;
-- Seeded documents also need a baseline snapshot before the first UI edit.
insert into public.cms_versions(document_id,revision,body) select id,revision,body from public.cms_documents on conflict(document_id,revision) do nothing;
create function cms_private.preserve_previous_version() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.cms_versions(document_id,revision,body,actor) values(old.id,old.revision,old.body,auth.uid()) on conflict do nothing;
 return new;
end $$;
revoke all on function cms_private.preserve_previous_version() from public;
create trigger cms_preserve_previous_version before update of body on public.cms_documents for each row execute function cms_private.preserve_previous_version();
alter table public.cms_media add column caption text not null default '' check(length(caption)<=1000 and caption !~ '[<>]'), add column revision integer not null default 1;
-- Body references are versioned with the draft, so restore also restores links/cover.
create function cms_private.check_entry_references() returns trigger language plpgsql security definer set search_path='' as $$
declare ref text; ids jsonb;
begin
 if new.body ? 'cover_id' and new.body->'cover_id'<>'null'::jsonb then
  if jsonb_typeof(new.body->'cover_id')<>'string' or (new.body->>'cover_id') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or not exists(select 1 from public.cms_media where id=(new.body->>'cover_id')::uuid) then raise exception 'Invalid cover'; end if;
 end if;
 ids=coalesce(new.body->'related_ids','[]'::jsonb);
 if jsonb_typeof(ids)<>'array' then raise exception 'Invalid relations'; end if;
 if jsonb_array_length(ids)>12 then raise exception 'Too many relations'; end if;
 if jsonb_array_length(ids)>0 and new.kind not in ('project','platform','technology') then raise exception 'Relations not supported for this kind'; end if;
 if (select count(*) from jsonb_array_elements(ids))<>(select count(distinct value) from jsonb_array_elements(ids)) then raise exception 'Duplicate relation'; end if;
 for ref in select value #>> '{}' from jsonb_array_elements(ids) loop
  if ref !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or ref=new.id::text or not exists(select 1 from public.cms_documents where id=ref::uuid and kind in ('project','platform','technology')) then raise exception 'Invalid relation'; end if;
 end loop;
 return new;
end $$;
revoke all on function cms_private.check_entry_references() from public;
create trigger cms_entry_reference_validation before insert or update of body on public.cms_documents for each row execute function cms_private.check_entry_references();
create function cms_private.sync_relations() returns trigger language plpgsql security definer set search_path='' as $$
begin
 delete from public.cms_relations where source_id=new.id;
 insert into public.cms_relations(source_id,target_id) select new.id,(value #>> '{}')::uuid from jsonb_array_elements(coalesce(new.body->'related_ids','[]'::jsonb));
 return new;
end $$;
revoke all on function cms_private.sync_relations() from public;
create trigger cms_sync_relations after insert or update of body on public.cms_documents for each row execute function cms_private.sync_relations();
create function cms_private.media_references(b jsonb) returns setof uuid language sql immutable set search_path='' as $$
 select substring(value from 5)::uuid from jsonb_each_text(coalesce(b->'fields','{}')) where value ~ '^cms:[0-9a-f-]{36}$'
 union select (b->>'cover_id')::uuid where b->>'cover_id' is not null
$$;
revoke all on function cms_private.media_references(jsonb) from public;
create or replace function cms_private.check_public_media() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(42761,1);
 if exists(select 1 from cms_private.media_references(new.body) ref where not exists(select 1 from public.cms_media m where m.id=ref and m.visibility='public' and m.rights_approved)) then raise exception 'Image must be approved for public use'; end if;
 return new;
end $$;
-- Metadata and visibility writes must use the revision/role/withdrawal transaction.
revoke update on public.cms_media from authenticated;
revoke update(visibility) on public.cms_media from authenticated;
drop policy media_publish on public.cms_media;
create function cms_private.manage_media(media_id uuid, expected integer, operation text, payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.cms_media; affected jsonb='[]'; publication record;
begin
 if not cms_private.allowed() then raise exception 'Access denied' using errcode='42501'; end if;
 if operation not in ('metadata','allow','revoke') then raise exception 'Invalid media operation'; end if;
 if operation<>'metadata' and not cms_private.allowed(true) then raise exception 'Publisher required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(42761,1);
 select * into m from public.cms_media where id=media_id for update;
 if m.id is null then raise exception 'Media not found'; end if;
 if m.revision<>expected then raise exception 'Revision conflict' using errcode='40001'; end if;
 if operation='metadata' then
  if jsonb_typeof(payload->'alt')<>'string' or length(trim(payload->>'alt')) not between 1 and 300 or (payload->>'alt') ~ '[<>]' or jsonb_typeof(payload->'caption')<>'string' or length(payload->>'caption')>1000 or (payload->>'caption') ~ '[<>]' then raise exception 'Invalid media metadata'; end if;
  update public.cms_media set alt=trim(payload->>'alt'),caption=payload->>'caption',revision=revision+1 where id=media_id;
 elsif operation='allow' then
  update public.cms_media set visibility='public',revision=revision+1 where id=media_id;
 else
  if exists(select 1 from public.cms_published p where media_id in (select cms_private.media_references(p.body))) and coalesce(payload->>'withdraw_publications','false')<>'true' then raise exception 'Published references require withdrawal confirmation'; end if;
  for publication in select document_id,kind,slug from public.cms_published p where media_id in (select cms_private.media_references(p.body)) order by document_id loop
   affected=affected||jsonb_build_array(jsonb_build_object('id',publication.document_id,'kind',publication.kind,'slug',publication.slug));
   delete from public.cms_published where document_id=publication.document_id;
   update public.cms_documents set status='draft',approval='unreviewed',updated_at=now() where id=publication.document_id;
   insert into public.cms_audit(document_id,action,actor) values(publication.document_id,'media_withdrawal',auth.uid());
  end loop;
  update public.cms_media set visibility='private',revision=revision+1 where id=media_id;
 end if;
 return jsonb_build_object('revision',m.revision+1,'affected',affected);
end $$;
revoke all on function cms_private.manage_media(uuid,integer,text,jsonb) from public;
grant execute on function cms_private.manage_media(uuid,integer,text,jsonb) to authenticated;
create function public.cms_manage_media(media_id uuid,expected integer,operation text,payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select cms_private.manage_media(media_id,expected,operation,payload) $$;
revoke all on function public.cms_manage_media(uuid,integer,text,jsonb) from public;
grant execute on function public.cms_manage_media(uuid,integer,text,jsonb) to authenticated;
create or replace function cms_private.mutate(doc uuid, expected integer, operation text, payload jsonb, content_kind text, content_slug text) returns uuid
language plpgsql security definer set search_path='' as $$
declare current_doc public.cms_documents; old_body jsonb;
begin
 if not cms_private.allowed() then raise exception 'Access denied' using errcode='42501'; end if;
 if operation not in ('create','save','review','approve','publish','archive','restore') then raise exception 'Invalid operation'; end if;
 if operation in ('approve','publish','archive') and not cms_private.allowed(true) then raise exception 'Publisher required' using errcode='42501'; end if;
 if operation='publish' then perform pg_advisory_xact_lock(42761,1); end if;
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
commit;
