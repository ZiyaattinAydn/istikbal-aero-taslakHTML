begin;
-- Auth Admin generates an internal random password even when no password is supplied.
-- Discard that hash at creation; later attempts to enable a password remain blocked.
create or replace function cms_private.guard_admin_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from cms_private.admin_allowlist a where a.email=lower(new.email)) then raise exception 'Account creation is restricted'; end if;
 if tg_op='INSERT' then new.encrypted_password='';
 elsif coalesce(new.encrypted_password,'')<>'' then raise exception 'Password authentication is disabled';
 end if;
 return new;
end $$;
commit;
