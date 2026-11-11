// Creates an isolated staging candidate. Never copies env files or deploys.
import { mkdtempSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
const source = process.cwd(),
  target = mkdtempSync(join(tmpdir(), "istikbal-cf-staging-"));
for (const file of [
  "src",
  "public",
  "package.json",
  "next.config.ts",
  "tsconfig.json",
  "next-env.d.ts",
  "docs/cms/page-snapshots.json",
])
  cpSync(join(source, file), join(target, file), { recursive: true });
const config = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
config.name = "istikbal-cms-staging";
// Keep the core app dependencies pinned. Adapter dependencies are isolated.
delete config.scripts;
writeFileSync(
  join(target, "package.json"),
  JSON.stringify(config, null, 2) + "\n",
);
const args = [
  "--yes",
  "vinext@1.4.5",
  "init",
  "--platform=cloudflare",
  "--name=istikbal-cms-staging",
  "--cdn-cache=static-assets",
  "--data-cache=none",
  "--image-optimization=none",
  "--prerender",
  "--no-install",
];
const result = spawnSync("npx", args, { cwd: target, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status || 1);
const pkgPath = join(target, "package.json"),
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
for (const section of ["dependencies", "devDependencies"])
  for (const [key, value] of Object.entries(pkg[section] || {}))
    if (typeof value === "string" && /^[~^]\d/.test(value))
      pkg[section][key] = value.slice(1);
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
writeFileSync(
  join(target, ".env.example"),
  "CMS_ENABLED=false\nCMS_PUBLIC_READS=false\n",
);
console.log("Isolated staging candidate prepared:", resolve(target));
console.log(
  "No credentials copied; no KV, Images, R2 or paid service configured; no deploy.",
);
console.log(
  "Next: npm install in this isolated directory, vinext check, build and audit.",
);
console.log(
  "Hosting remains NO-GO until free-account staging CPU/cache/auth/upload acceptance. Data cache is intentionally unprovisioned.",
);
