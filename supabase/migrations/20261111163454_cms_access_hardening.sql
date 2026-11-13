begin;
create policy allowlist_closed on cms_private.admin_allowlist for all to anon,authenticated using(false) with check(false);
create index cms_audit_actor on public.cms_audit(actor);
create index cms_versions_actor on public.cms_versions(actor);
create index cms_media_created_by on public.cms_media(created_by);
revoke select on public.cms_media from anon;
grant select(id,path,mime,bytes,width,height,alt,rights_approved,visibility) on public.cms_media to anon;
create or replace function cms_private.allowed(publisher_only boolean default false) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(auth.jwt()->>'aal','')='aal2'
 and exists(select 1 from public.cms_roles r where r.user_id=auth.uid() and r.active and (not publisher_only or r.role='publisher'))
 and exists(select 1 from auth.sessions s where s.user_id=auth.uid() and s.id=nullif(auth.jwt()->>'session_id','')::uuid)
$$;
commit;
