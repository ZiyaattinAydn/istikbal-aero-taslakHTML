import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config";

test("CMS visual preview may be framed by the same origin only", async () => {
  const rules = await nextConfig.headers?.();
  assert.ok(rules, "Next.js security headers must be configured");
  const publicRule = rules.find((rule) => rule.source === "/:path*");
  const previewRule = rules.find(
    (rule) => rule.source === "/admin/pages/:slug/preview",
  );
  assert.ok(publicRule, "Public routes must retain frame protection");
  assert.ok(previewRule, "Authenticated page preview needs a specific exception");
  const value = (rule: (typeof rules)[number], key: string) =>
    rule.headers.find((header) => header.key === key)?.value;

  assert.equal(value(publicRule, "Content-Security-Policy"), "frame-ancestors 'none'");
  assert.equal(value(publicRule, "X-Frame-Options"), "DENY");
  assert.equal(value(previewRule, "Content-Security-Policy"), "frame-ancestors 'self'");
  assert.equal(value(previewRule, "X-Frame-Options"), "SAMEORIGIN");
  assert.equal(value(previewRule, "Cache-Control"), "private, no-store, max-age=0");
  assert.ok(
    rules.indexOf(previewRule) > rules.indexOf(publicRule),
    "More specific exception must override the catch-all security header",
  );
});
