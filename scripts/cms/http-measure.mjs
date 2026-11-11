import { gzipSync } from "node:zlib";
import { writeFileSync } from "node:fs";
const base = process.argv[2],
  target = process.argv[3],
  rows = [];
for (const path of [
  "/",
  "/kurumsal",
  "/platformlar",
  "/teknolojiler",
  "/projeler",
  "/haberler",
  "/haber-detay",
]) {
  for (let run = 0; run < 11; run++) {
    const start = performance.now();
    const response = await fetch(base + path);
    const headersMs = performance.now() - start;
    const body = await response.text();
    const scriptPaths = [...body.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
      (m) => m[1],
    );
    let jsBytes = 0,
      jsGzipBytes = 0;
    for (const script of new Set(scriptPaths)) {
      const bytes = Buffer.from(
        await (await fetch(new URL(script, base))).arrayBuffer(),
      );
      jsBytes += bytes.length;
      jsGzipBytes += gzipSync(bytes).length;
    }
    rows.push({
      path,
      run,
      status: response.status,
      headersMs,
      totalMs: performance.now() - start,
      bytes: Buffer.byteLength(body),
      jsBytes,
      jsGzipBytes,
      scripts: [...body.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
        (m) => m[1],
      ),
    });
  }
}
writeFileSync(
  target,
  JSON.stringify(
    {
      note: "Local HTTP timings, not browser Web Vitals. run 0 first sample (readiness probe warmed /), 1–10 repeated samples; no network throttling.",
      rows,
    },
    null,
    2,
  ),
);
