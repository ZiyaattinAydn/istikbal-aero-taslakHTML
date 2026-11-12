// CLI-only template readiness check. Nothing from inspect/logs is printed verbatim.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const auth = "supabase_auth_istikbal-aerospace-cms";
const kong = "supabase_kong_istikbal-aerospace-cms";
const inspect = (name) =>
  JSON.parse(
    execFileSync("docker", ["inspect", name], { encoding: "utf8" }),
  )[0];
const env = Object.fromEntries(
  inspect(auth).Config.Env.map((x) => {
    const i = x.indexOf("=");
    return [x.slice(0, i), x.slice(i + 1)];
  }),
);
const ip = Object.values(inspect(kong).NetworkSettings.Networks)[0].IPAddress;
assert.ok(ip);
const expected = readFileSync("supabase/templates/otp.html", "utf8");
for (const flow of ["MAGIC_LINK", "CONFIRMATION", "INVITE", "RECOVERY"]) {
  const url = new URL(env["GOTRUE_MAILER_TEMPLATES_" + flow]);
  assert.equal(url.hostname, kong);
  assert.equal(url.port, "8088");
  url.hostname = ip;
  let ready = false;
  for (let i = 0; i < 50 && !ready; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
      ready = r.ok && (await r.text()) === expected;
    } catch {}
    if (!ready) await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(
    ready,
    "CLI template server did not serve the configured OTP template",
  );
}
console.log(
  "All four CLI email template endpoints serve the exact OTP template.",
);
// Auth starts before Kong. Its initial failed template fetch can cache the built-in
// magic-link fallback. Recreate only Auth's cache once its template server is ready.
execFileSync("docker", ["restart", auth], { stdio: "ignore" });
const status = JSON.parse(
  readFileSync("/tmp/istikbal-local-status.json", "utf8"),
);
let healthy = false;
for (let i = 0; i < 100 && !healthy; i++) {
  try {
    healthy = (
      await fetch(`${status.API_URL}/auth/v1/health`, {
        headers: { apikey: status.ANON_KEY },
        signal: AbortSignal.timeout(1000),
      })
    ).ok;
  } catch {}
  if (!healthy) await new Promise((r) => setTimeout(r, 200));
}
assert.ok(healthy, "Local Auth did not become healthy");
console.log(
  "Local Auth restarted after template readiness; credentials omitted.",
);
