import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = (path: string) => readFileSync(path, "utf8");

test("admin cookie policy has one bounded HttpOnly path-scoped definition", () => {
  const policy = source("src/lib/cms/cookie-policy.ts");
  assert.match(policy, /7 \* 24 \* 60 \* 60/);
  assert.match(policy, /httpOnly: true/);
  assert.match(policy, /sameSite: "lax"/);
  assert.match(policy, /secure: process\.env\.NODE_ENV === "production"/);
  assert.match(policy, /path: "\/admin"/);
  for (const path of ["src/proxy.ts", "src/lib/cms/server.ts"]) {
    const file = source(path);
    assert.match(file, /CMS_AUTH_COOKIE_OPTIONS/);
    assert.doesNotMatch(file, /60 \* 60 \* 24 \* 365/);
  }
});

test("passwordless OTP request AND verification use the same invitation allowlist", () => {
  const login = source("src/app/admin/login/actions.ts");
  const allow = source("src/lib/cms/allowed-email.ts");
  assert.match(allow, /CMS_ALLOWED_EMAILS/);
  assert.match(allow, /value\.length > 254/);
  assert.equal((login.match(/allowedCmsEmail\(email\)/g) || []).length, 2);
  assert.match(login, /shouldCreateUser: false/);
  assert.match(login, /factor\.id === factorId/);
  assert.match(login, /factor\.factor_type === "totp"/);
});

test("preview, admin paths and media all preserve no-store and restricted access", () => {
  const config = source("next.config.ts");
  const proxy = source("src/proxy.ts");
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /frame-ancestors 'self'/);
  assert.match(config, /private, no-store, max-age=0/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(proxy, /matcher: \["\/admin\/:path\*"\]/);
  const privateMedia = source("src/app/admin/media/[id]/file/route.ts");
  const publicMedia = source("src/app/cms-media/[id]/route.ts");
  assert.match(privateMedia, /requireAdmin\(\)/);
  assert.match(privateMedia, /private, no-store/);
  assert.match(publicMedia, /publicReadsEnabled\(\)/);
  assert.match(publicMedia, /\.eq\("visibility", "public"\)/);
  assert.match(publicMedia, /no-store/);
});

test("fresh AAL2 session, publisher role and media publication rights are checked by SQL", () => {
  const auth = source("supabase/migrations/20261111115015_cms_foundation.sql");
  const media = source("supabase/migrations/20261111214959_cms_relations_media_lifecycle.sql");
  const direct = source("supabase/migrations/20261113013600_cms_direct_publication.sql");
  assert.match(auth, /auth\.jwt\(\)->>'aal',''\)='aal2'/);
  assert.match(auth, /from auth\.sessions s where s\.user_id=auth\.uid\(\)/);
  assert.match(auth, /r\.active and \(not publisher_only or r\.role='publisher'\)/);
  assert.match(media, /m\.visibility='public' and m\.rights_approved/);
  assert.match(direct, /cms_private\.allowed\(true\)/);
});
