import { test, expect } from "@playwright/test";

for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
  for (const height of [600, 900]) {
    test(`content bounds ${width}x${height}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height });
      // Static readable content is also required when animation is disabled.
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const path of ["/", "/platformlar", "/teknolojiler", "/haberler", "/iletisim"]) {
        await page.goto(path);
        await expect(page.locator(".tech-card, .platform-card, h1").first()).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const issues = await page.evaluate(() => {
          const issues: string[] = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push("document overflow");
          // Check actual text bounds against clipping ancestors, not just scrollWidth.
          for (const element of document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main a, .footer a, .footer p")) {
            if (!element.checkVisibility()) continue;
            const rect = element.getBoundingClientRect();
            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
              const css = getComputedStyle(ancestor);
              const bounds = ancestor.getBoundingClientRect();
              if (["hidden", "clip"].includes(css.overflowY) && (rect.top < bounds.top - 2 || rect.bottom > bounds.bottom + 2)) {
                issues.push(`clipped vertically: ${element.textContent?.trim().slice(0, 60)} by ${ancestor.className}`);
                break;
              }
              if (["hidden", "clip"].includes(css.overflowX) && (rect.left < bounds.left - 2 || rect.right > bounds.right + 2)) {
                issues.push(`clipped horizontally: ${element.textContent?.trim().slice(0, 60)} by ${ancestor.className}`);
                break;
              }
              ancestor = ancestor.parentElement;
            }
          }
          for (const grid of document.querySelectorAll(".platform-grid, .tech-grid, .editorial-grid")) {
            const boxes = [...grid.children].map(child => child.getBoundingClientRect());
            for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
              if (Math.min(boxes[a].right, boxes[b].right) - Math.max(boxes[a].left, boxes[b].left) > 2 &&
                  Math.min(boxes[a].bottom, boxes[b].bottom) - Math.max(boxes[a].top, boxes[b].top) > 2)
                issues.push(`overlapping cards in ${grid.className}`);
            }
          }
          return issues;
        });
        expect(issues, path).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll("/", "") || "home"}.png`), fullPage: true });
      }
    });
  }
}

test("short desktop mega menu remains scrollable and all links reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto("/");
  await page.locator("#tech-trigger").press("ArrowDown");
  const last = page.locator("#mega-menu a").last();
  await last.focus();
  await expect(last).toBeInViewport();
  const rect = await last.boundingBox();
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(601);
});
