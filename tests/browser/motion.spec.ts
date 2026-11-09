import { test, expect, type Page } from "@playwright/test";

async function home(page: Page) {
  await page.goto("/");
  await expect(page.locator(".site-shell")).toHaveClass(/cinematic-ready/);
}
async function wheel(page: Page, deltaY: number, extra = {}) {
  return page.evaluate(({ deltaY, extra }) => {
    const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true, ...extra });
    document.body.dispatchEvent(event);
    return event.defaultPrevented;
  }, { deltaY, extra });
}
async function y(page: Page) { return page.evaluate(() => scrollY); }

test("simulated mouse step, repeated input, hero crossfade and reverse", async ({ page }) => {
  await home(page);
  const target = await page.locator("main > section").nth(1).evaluate(el =>
    Math.round(el.getBoundingClientRect().top + scrollY - document.querySelector("header")!.getBoundingClientRect().height));
  await page.mouse.wheel(0, 120);
  await expect.poll(() => y(page)).toBeGreaterThan(10);
  await page.mouse.wheel(0, 120);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => y(page)).toBeCloseTo(target, 0);
  await expect.poll(() => page.locator(".hero-story").evaluate(el =>
    Number((el as HTMLElement).style.getPropertyValue("--scene-progress")))).toBe(1);
  await page.mouse.wheel(0, -120);
  await expect.poll(() => y(page)).toBeLessThan(2);
  await expect.poll(() => page.locator(".hero-story").evaluate(el =>
    Number((el as HTMLElement).style.getPropertyValue("--scene-progress")))).toBe(0);
});

test("touchpad-like deltas and modified inputs retain native ownership", async ({ page }) => {
  await home(page);
  expect(await wheel(page, 120, { ctrlKey: true })).toBe(false);
  expect(await wheel(page, 120, { deltaX: 130 })).toBe(false);
  expect(await wheel(page, 10.5)).toBe(false);
  // Remaining momentum in the same gesture must not turn into a mouse step.
  expect(await wheel(page, 80)).toBe(false);
});

test("chapter navigation, cancellation, reveals and route cleanup", async ({ page }) => {
  await home(page);
  await page.locator('.chapter-step[data-chapter-index="3"]').click();
  await expect.poll(() => y(page)).toBeGreaterThan(30);
  await page.keyboard.press("Escape");
  const stopped = await y(page);
  // A requestAnimationFrame must not continue moving after a native input cancels it.
  await page.waitForTimeout(1700);
  expect(Math.abs((await y(page)) - stopped)).toBeLessThan(3);
  await page.locator('.chapter-step[data-chapter-index="3"]').click();
  await expect(page.locator('.chapter-step[data-chapter-index="3"]')).toHaveAttribute("aria-current", "location");
  await expect(page.locator(".tech-card").first()).toHaveAttribute("data-actor-state", "in");
  await page.locator('.chapter-step[data-chapter-index="0"]').click();
  await expect.poll(() => y(page)).toBeLessThan(2);
  await expect(page.locator(".tech-card").first()).toHaveAttribute("data-actor-state", "in");
  await page.locator('.desktop-nav a[href="/haberler.html"]').click();
  await expect(page.locator(".site-shell")).toHaveAttribute("data-page", "news");
  expect(await wheel(page, 120)).toBe(false);
  await expect(page.locator("html")).not.toHaveClass(/home-no-scrollbar/);
  await page.locator('header .brand').click();
  await expect(page.locator(".site-shell")).toHaveAttribute("data-page", "home");
  await expect(page.locator(".site-shell")).toHaveClass(/cinematic-ready/);
  expect(await wheel(page, 24.5)).toBe(true);
});

test("reduced motion reveals all content and releases wheel interception", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".tech-card").first()).toHaveAttribute("data-actor-state", "in");
  expect(await wheel(page, 120)).toBe(false);
  await page.locator('.chapter-step[data-chapter-index="3"]').click();
  await expect(page.locator('.chapter-step[data-chapter-index="3"]')).toHaveAttribute("aria-current", "location");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator('.chapter-step[data-chapter-index="0"]').click();
  await expect.poll(() => y(page)).toBeLessThan(2);
  await expect.poll(() => wheel(page, 120)).toBe(true);
});

test("hero starts in flight and finishes crossfade before its sticky pin ends", async ({ page }) => {
  await home(page);
  await expect.poll(() => page.locator(".hero-story").evaluate(el =>
    Number((el as HTMLElement).style.getPropertyValue("--scene-progress")))).toBe(0);
  const pinEnd = await page.locator(".hero-story").evaluate(el =>
    (el as HTMLElement).offsetHeight - (el.querySelector(".hero-stage") as HTMLElement).offsetHeight - document.querySelector("header")!.getBoundingClientRect().height);
  await page.evaluate(top => scrollTo({ top, behavior: "instant" }), Math.floor(pinEnd * 0.94));
  await expect.poll(() => page.locator(".hero-story").evaluate(el =>
    Number((el as HTMLElement).style.getPropertyValue("--scene-progress")))).toBe(1);
  const [stage, header] = await Promise.all([
    page.locator(".hero-stage").boundingBox(), page.locator("header").boundingBox(),
  ]);
  expect(Math.abs(stage!.y - header!.height)).toBeLessThan(2);
});

test("reverse during travel and same-page logo return cancel the previous animation", async ({ page }) => {
  await home(page);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => y(page)).toBeGreaterThan(50);
  await page.mouse.wheel(0, -120);
  await expect.poll(() => y(page)).toBeLessThan(2);
  await page.locator('.chapter-step[data-chapter-index="3"]').click();
  await expect.poll(() => y(page)).toBeGreaterThan(200);
  await page.evaluate(() => document.documentElement.dataset.testDocument = "same");
  await page.locator("header .brand").click();
  await expect.poll(() => y(page)).toBeLessThan(2);
  await expect(page.locator("html")).toHaveAttribute("data-test-document", "same");
});
