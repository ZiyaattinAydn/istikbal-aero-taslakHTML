begin;
create table public.cms_page_fields(page_slug text not null, key text not null, kind text not null check(kind in ('text','image','link')), label text not null, fallback text not null, primary key(page_slug,key));
alter table public.cms_page_fields enable row level security;
create policy page_fields_read on public.cms_page_fields for select to authenticated using((select cms_private.allowed()));
revoke all on public.cms_page_fields from anon,authenticated;
grant select on public.cms_page_fields to authenticated;
create function cms_private.check_page() returns trigger language plpgsql security definer set search_path='' as $$
declare f record; rule public.cms_page_fields;
begin
 if new.kind<>'page' then return new; end if;
 if new.body ? 'fields' then
  if jsonb_typeof(new.body->'fields')<>'object' then raise exception 'Invalid page fields'; end if;
  for f in select key,value from jsonb_each(new.body->'fields') loop
   select * into rule from public.cms_page_fields where page_slug=new.slug and key=f.key;
   if rule.key is null or jsonb_typeof(f.value)<>'string' or length(f.value #>> '{}')>8000 then raise exception 'Invalid page field'; end if;
   if rule.kind='image' and (f.value #>> '{}') !~ '^(cms:[0-9a-f-]{36}|[a-z0-9-]+\.(svg|webp))$' then raise exception 'Invalid image'; end if;
   if rule.kind='link' and (f.value #>> '{}') !~ '^(https://[^/@]+/|[a-z0-9-]+\.html|mailto:[^ <>]+@[^ <>]+|tel:\+?[0-9 -]+)' then raise exception 'Invalid link'; end if;
  end loop;
 end if;
 return new;
end $$;
revoke all on function cms_private.check_page() from public;
create trigger cms_page_validation before insert or update on public.cms_documents for each row execute function cms_private.check_page();
create table public.cms_media(id uuid primary key, path text not null unique, mime text not null check(mime='image/webp'), bytes integer not null check(bytes between 1 and 5242880), width integer not null check(width between 1 and 6000), height integer not null check(height between 1 and 6000), alt text not null check(length(alt) between 1 and 300), rights_approved boolean not null check(rights_approved), visibility text not null default 'private' check(visibility in ('private','public')), created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), check(width::bigint*height<=24000000), check(path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'));
alter table public.cms_media enable row level security;
create policy media_read on public.cms_media for select to anon,authenticated using(visibility='public' or (select cms_private.allowed()));
create policy media_insert on public.cms_media for insert to authenticated with check((select cms_private.allowed()) and created_by=(select auth.uid()) and visibility='private' and path=auth.uid()::text||'/'||id::text||'.webp');
create policy media_publish on public.cms_media for update to authenticated using((select cms_private.allowed(true))) with check((select cms_private.allowed(true)));
grant select on public.cms_media to anon,authenticated;
grant insert on public.cms_media to authenticated;
grant update(visibility) on public.cms_media to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('cms-media','cms-media',false,5242880,array['image/webp']) on conflict(id) do nothing;
create policy cms_storage_read on storage.objects for select to anon,authenticated using(bucket_id='cms-media' and ((select cms_private.allowed()) or exists(select 1 from public.cms_media m where m.path=name and m.visibility='public')));
create policy cms_storage_insert on storage.objects for insert to authenticated with check(bucket_id='cms-media' and (select cms_private.allowed()) and split_part(name,'/',1)=auth.uid()::text and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$');
commit;
begin;
grant usage on schema cms_private to anon;
grant execute on function cms_private.allowed(boolean) to anon;
create function cms_private.check_public_media() returns trigger language plpgsql security definer set search_path='' as $$
declare v text;
begin
 for v in select value from jsonb_each_text(coalesce(new.body->'fields','{}')) where value like 'cms:%' loop
  if not exists(select 1 from public.cms_media m where m.id::text=substring(v from 5) and m.visibility='public' and m.rights_approved) then raise exception 'Image must be approved for public use'; end if;
 end loop;
 return new;
end $$;
revoke all on function cms_private.check_public_media() from public;
create trigger cms_public_media_validation before insert or update on public.cms_published for each row execute function cms_private.check_public_media();
commit;
begin;
create table cms_private.admin_allowlist(email text primary key check(email=lower(email)));
alter table cms_private.admin_allowlist enable row level security;
revoke all on cms_private.admin_allowlist from public,anon,authenticated;
create function cms_private.guard_admin_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from cms_private.admin_allowlist a where a.email=lower(new.email)) then raise exception 'Account creation is restricted'; end if;
 if coalesce(new.encrypted_password,'')<>'' then raise exception 'Password authentication is disabled'; end if;
 return new;
end $$;
revoke all on function cms_private.guard_admin_account() from public;
create trigger cms_guard_admin_account before insert or update of email,encrypted_password on auth.users for each row execute function cms_private.guard_admin_account();
create function cms_private.assign_admin_role() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.email_confirmed_at is not null and exists(select 1 from cms_private.admin_allowlist a where a.email=lower(new.email)) then
 insert into public.cms_roles(user_id,role,active) values(new.id,'publisher',true) on conflict(user_id) do nothing;
 end if;
 return new;
end $$;
revoke all on function cms_private.assign_admin_role() from public;
create trigger cms_assign_admin_role after insert or update of email_confirmed_at on auth.users for each row execute function cms_private.assign_admin_role();
commit;
