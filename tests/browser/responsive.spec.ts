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
          const eyebrow = document.querySelector(".hero-story-eyebrow");
          const header = document.querySelector("header");
          if (eyebrow && header && eyebrow.getBoundingClientRect().top < header.getBoundingClientRect().bottom - 2) issues.push("hero eyebrow covered by header");
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push("document overflow");
          // Check actual text bounds against clipping ancestors, not just scrollWidth.
          for (const element of document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main a, .hero-story-eyebrow, .footer a, .footer p")) {
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

test("hover keeps card titles and links within their cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/platformlar", "/teknolojiler", "/haberler"]) {
    await page.goto(path);
    for (const card of await page.locator(".platform-card, .tech-card, .news-card").all()) {
      await card.hover();
      expect(await card.evaluate(el => {
        const box = el.getBoundingClientRect();
        return [...el.querySelectorAll("h3, p, a, .card-bottom")].every(child => {
          const rect = child.getBoundingClientRect();
          return rect.left >= box.left - 2 && rect.right <= box.right + 2 && rect.top >= box.top - 2 && rect.bottom <= box.bottom + 2;
        });
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test.describe("emulated touch input", () => {
  test.use({ hasTouch: true, isMobile: true });
  for (const width of [390, 768]) {
    test(`touch menu and static hero ${width}x600`, async ({ page }) => {
      await page.setViewportSize({ width, height: 600 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.locator("#mobile-trigger").click();
      await page.locator("#mobile-tech").click();
      await expect(page.locator("#mobile-sub")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("#mobile-trigger")).toBeFocused();
      const [header, eyebrow, lastAction] = await Promise.all([
        page.locator("header").boundingBox(), page.locator(".hero-story-eyebrow").boundingBox(), page.locator(".hero-story-actions a").last().boundingBox(),
      ]);
      expect(eyebrow!.y).toBeGreaterThanOrEqual(header!.height - 2);
      expect(lastAction!.y + lastAction!.height).toBeLessThanOrEqual(601);
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    });
  }
});
