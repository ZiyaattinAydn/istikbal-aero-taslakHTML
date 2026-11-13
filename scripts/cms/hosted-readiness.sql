-- İstikbal Aerospace CMS: hosted readiness inventory (READ ONLY).
-- Returns aggregate counts, security booleans, and function fingerprint only.
-- No row content, emails, OTPs, access tokens, SQL definitions, or secrets.
-- Before any deployment/migration, execute in the linked project's SQL editor.
-- STOP unless project ref = uftnykormtwlzolwbhfb.
select jsonb_build_object(
  'documents', (select count(*) from public.cms_documents),
  'page_documents', (select count(*) from public.cms_documents where kind='page'),
  'page_slugs_unique', (select count(distinct slug) from public.cms_documents where kind='page'),
  'canonical_documents', (select count(*) from public.cms_documents where kind<>'page'),
  'fields', (select count(*) from public.cms_page_fields),
  'versions', (select count(*) from public.cms_versions),
  'published', (select count(*) from public.cms_published),
  'cms_media', (select count(*) from public.cms_media),
  'storage_objects', (select count(*) from storage.objects where bucket_id='cms-media'),
  'auth_users', (select count(*) from auth.users),
  'active_publishers', (select count(*) from public.cms_roles where active=true and role='publisher'),
  'rls', (
    select coalesce(jsonb_object_agg(c.relname,c.relrowsecurity),'{}'::jsonb)
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p')
      and c.relname in ('cms_documents','cms_page_fields','cms_versions','cms_published','cms_media','cms_roles','cms_audit','cms_relations')
  ),
  'mutation_function', (
    select jsonb_build_object(
      'signature',pg_get_function_identity_arguments(p.oid),
      'definition_sha_md5',md5(pg_get_functiondef(p.oid)),
      'supports_unpublish',position('unpublish' in pg_get_functiondef(p.oid))>0,
      'mentions_old_approval',position('approved' in pg_get_functiondef(p.oid))>0
    )
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='cms_private' and p.proname='mutate'
    limit 1
  ),
  'publication_media_validation_trigger', (
    select count(*) from pg_trigger t
      join pg_class c on c.oid=t.tgrelid
      join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='cms_published'
      and t.tgname='cms_public_media_validation' and t.tgenabled='O'
  ),
  'migration_history', (
    select coalesce(jsonb_agg(jsonb_build_object('version',version,'name',name) order by version),'[]'::jsonb)
    from supabase_migrations.schema_migrations where name like 'cms_%'
  )
) as preflight;
