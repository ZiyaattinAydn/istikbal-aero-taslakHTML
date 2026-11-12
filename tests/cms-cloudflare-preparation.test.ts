import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("Cloudflare staging builder remains isolated, free-tier and Windows compatible", () => {
  const code = readFileSync("scripts/cms/prepare-cloudflare.mjs", "utf8");
  assert.match(code, /mkdtempSync\(join\(tmpdir\(\), "istikbal-cf-staging-"\)\)/);
  assert.match(code, /"istikbal-cms-staging"/);
  assert.match(code, /process\.platform === "win32"/);
  assert.match(code, /spawnSync\(windows \? "npx\.cmd" : "npx", args/);
  assert.match(code, /shell: windows/);
  assert.match(code, /result\.error/);
  assert.match(code, /"--data-cache=none"/);
  assert.match(code, /"--image-optimization=none"/);
  assert.doesNotMatch(code, /--force/);
  assert.doesNotMatch(code, /CLOUDFLARE_API_TOKEN|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(code, /No credentials copied/);
});
