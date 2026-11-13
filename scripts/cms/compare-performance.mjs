import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const compare = [
  { cwd: resolve("performance-base"), port: 3111, file: "browser-before.json" },
  { cwd: process.cwd(), port: 3112, file: "browser-after.json" },
];
for (const test of compare) {
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(test.port),
    ],
    {
      cwd: test.cwd,
      stdio: "ignore",
      env: { ...process.env, CMS_ENABLED: "false", CMS_PUBLIC_READS: "false" },
    },
  );
  try {
    let ready = false;
    for (let i = 0; i < 200; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${test.port}`)).ok) {
          ready = true;
          break;
        }
      } catch {}
      await setTimeout(100);
    }
    if (!ready) throw Error("Performance server failed");
    const child = spawn(
      process.execPath,
      ["scripts/cms/measure.mjs", `docs/cms/evidence/${test.file}`],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          MEASURE_BASE_URL: `http://127.0.0.1:${test.port}`,
        },
      },
    );
    await new Promise((ok, fail) =>
      child.on("exit", (c) =>
        c === 0 ? ok() : fail(Error("Browser measurement failed")),
      ),
    );
  } finally {
    server.kill("SIGTERM");
  }
}
const before = JSON.parse(
    readFileSync("docs/cms/evidence/browser-before.json", "utf8"),
  ),
  after = JSON.parse(
    readFileSync("docs/cms/evidence/browser-after.json", "utf8"),
  );
const quantile = (values, p) =>
  values.sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const rows = [];
for (const mobile of [false, true])
  for (const path of [...new Set(before.rows.map((r) => r.path))]) {
    const a = before.rows.filter((r) => r.mobile === mobile && r.path === path),
      b = after.rows.filter((r) => r.mobile === mobile && r.path === path);
    rows.push({
      mobile,
      path,
      beforeMedianLcp: quantile(
        a.map((r) => r.lcp),
        0.5,
      ),
      afterMedianLcp: quantile(
        b.map((r) => r.lcp),
        0.5,
      ),
      beforeMedianTtfb: quantile(
        a.map((r) => r.ttfb),
        0.5,
      ),
      afterMedianTtfb: quantile(
        b.map((r) => r.ttfb),
        0.5,
      ),
      beforeP95Ttfb: quantile(
        a.map((r) => r.ttfb),
        0.95,
      ),
      afterP95Ttfb: quantile(
        b.map((r) => r.ttfb),
        0.95,
      ),
      beforeCls: Math.max(...a.map((r) => r.cls)),
      afterCls: Math.max(...b.map((r) => r.cls)),
      beforeJsBytes: a[0].jsBytes,
      afterJsBytes: b[0].jsBytes,
    });
  }
writeFileSync(
  "docs/cms/evidence/browser-comparison.json",
  JSON.stringify(
    {
      conditions:
        "CI Chromium, 3 loads/route/device, no CPU/network throttling; CMS_PUBLIC_READS=false. Does not validate Workers, DB integration, field INP or device performance.",
      rows,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Browser before/after comparison saved; no production or database performance claim.",
);
