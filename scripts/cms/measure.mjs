import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const rows = [];
for (const mobile of [false, true]) {
  const context = await browser.newContext({
    viewport: mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
    isMobile: mobile,
    deviceScaleFactor: 1,
  });
  for (const path of [
    "/",
    "/kurumsal",
    "/platformlar",
    "/teknolojiler",
    "/projeler",
    "/haberler",
    "/haber-detay",
  ]) {
    for (let run = 0; run < 3; run++) {
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__vitals = { lcp: 0, cls: 0 };
        new PerformanceObserver((l) =>
          l.getEntries().forEach((e) => (window.__vitals.lcp = e.startTime)),
        ).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) =>
          l.getEntries().forEach((e) => {
            if (!e.hadRecentInput) window.__vitals.cls += e.value;
          }),
        ).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(
        (process.env.MEASURE_BASE_URL || "http://127.0.0.1:3100") + path,
        {
          waitUntil: "networkidle",
        },
      );
      await page.waitForTimeout(300);
      rows.push({
        mobile,
        path,
        run,
        ...(await page.evaluate(() => {
          const n = performance.getEntriesByType("navigation")[0];
          const r = performance.getEntriesByType("resource");
          return {
            ...window.__vitals,
            ttfb: n.responseStart - n.requestStart,
            requests: r.length,
            jsBytes: r
              .filter((e) => e.initiatorType === "script")
              .reduce((n, e) => n + e.encodedBodySize, 0),
          };
        })),
      });
      await page.close();
    }
  }
  await context.close();
}
await browser.close();
writeFileSync(
  process.argv[2],
  JSON.stringify(
    {
      environment:
        "Local production, Chromium, no CPU/network throttling; three loads per route/device; no field INP",
      rows,
    },
    null,
    2,
  ),
);
