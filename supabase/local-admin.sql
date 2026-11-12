-- Local Mailpit test fixture only; never included in hosted seeding.
insert into cms_private.admin_allowlist(email) values('cms-admin@example.com') on conflict do nothing;

insert into cms_private.admin_allowlist(email) values('cms-ui@example.com') on conflict do nothing;
