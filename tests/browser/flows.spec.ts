import { test, expect, type Page } from "@playwright/test";
import { routes } from "../../src/data/routes";

async function ready(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  // A rendered SSR shell alone is insufficient: prove that React handled input.
  const language = page.locator("#language-trigger");
  await language.click();
  await expect(language).toHaveAttribute("aria-expanded", "true");
  await language.press("Escape");
  await expect(language).toHaveAttribute("aria-expanded", "false");
}

for (const route of routes) {
  for (const path of [route.file, route.slug]) {
    test(`hydrated route /${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => {
        if (["error", "warning"].includes(message.type())) errors.push(message.text());
      });
      const failed: string[] = [];
      page.on("response", response => {
        if (response.url().includes(new URL(page.url()).origin) && response.status() >= 400)
          failed.push(`${response.status()} ${response.url()}`);
      });
      await ready(page, `/${path}`);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      expect(errors).toEqual([]);
      expect(failed).toEqual([]);
    });
  }
}

test("news filters remove cards, announce empty state and restore both cards", async ({ page }) => {
  await ready(page, "/haberler.html");
  const cards = page.locator(".filter-target .news-card");
  await expect(cards).toHaveCount(2);
  await page.locator('[data-filter="Duyuru"]').click();
  await expect(cards).toHaveCount(0);
  await expect(page.locator(".filter-empty")).toBeVisible();
  await page.locator('[data-filter="Paylaşım"]').click();
  await expect(cards).toHaveCount(2);
  await expect(page.locator(".filter-empty")).toBeHidden();
  await page.locator('[data-filter="all"]').click();
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) await expect(card).toBeVisible();
});

test("keyboard mega menus, Escape focus, client routing and mobile disclosure", async ({ page }) => {
  await ready(page, "/");
  const trigger = page.locator("#tech-trigger");
  await trigger.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mega-menu a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("#mega-menu")).toHaveAttribute("inert", "");
  // Keep a document marker to distinguish Next navigation from a full reload.
  await page.evaluate(() => document.documentElement.dataset.testDocument = "same");
  await page.locator('.desktop-nav a[href="/haberler.html"]').click();
  await expect(page).toHaveURL(/haberler\.html$/);
  await expect(page.locator(".site-shell")).toHaveAttribute("data-page", "news");
  await expect(page.locator("html")).toHaveAttribute("data-test-document", "same");
  await page.setViewportSize({ width: 390, height: 700 });
  const mobile = page.locator("#mobile-trigger");
  await mobile.click();
  await expect(page.locator("#mobile-nav")).not.toHaveAttribute("inert", "");
  await page.locator("#mobile-tech").click();
  await expect(page.locator("#mobile-sub")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobile).toBeFocused();
  await expect(mobile).toHaveAttribute("aria-expanded", "false");
});

test("form uses native validation, reports local-only result and makes no POST", async ({ page }) => {
  await ready(page, "/iletisim");
  const posts: string[] = [];
  page.on("request", request => { if (request.method() === "POST") posts.push(request.url()); });
  const submit = page.getByRole("button", { name: /Formu Kontrol Et/ });
  await submit.click();
  await expect(page.locator("#name")).toBeFocused();
  await expect(page.locator("#form-message")).toBeEmpty();
  await page.locator("#name").fill("QA Test");
  await page.locator("#email").fill("invalid");
  await page.locator("#topic").selectOption({ label: "Genel iletişim" });
  await page.locator("#message").fill("Yerel doğrulama testi.");
  await submit.click();
  await expect(page.locator("#email")).toBeFocused();
  await expect(page.locator("#form-message")).toBeEmpty();
  await page.locator("#email").fill("qa@example.com");
  await submit.click();
  await expect(page.locator("#form-message")).toContainText("Mesaj gönderilmedi");
  await expect(page.locator("#name")).toHaveValue("");
  expect(posts).toEqual([]);
});

test("news query edge cases and 404 return link", async ({ page }) => {
  for (const [path, heading] of [
    ["/haber-detay.html", /Tengri/i],
    ["/haber-detay?id=", /Tengri/i],
    ["/ucus-kontrol-paylasimi.html", /Uçuş/i],
    ["/haber-detay.html?id=flight-controller-announcement&id=missing", /Uçuş/i],
    ["/haber-detay.html?id=missing", /İçerik bulunamadı/i],
    ["/haber-detay.html?id=%3Cscript%3E", /İçerik bulunamadı/i],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("h1")).toContainText(heading);
    await expect(page.locator("main script")).toHaveCount(0);
  }
  const response = await page.goto("/qa-nonexistent-page");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText(/bulunamadı/i);
  await page.locator(".not-found-page a").click();
  await expect(page.locator(".hero-story")).toBeVisible();
});

// Security headers must be present in both development and production.
// Keep search indexing disabled until the company explicitly approves release.
test("response security headers remain enforced across public routes", async ({ page }) => {
  for (const route of ["/", "/haberler.html", "/iletisim"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["permissions-policy"]).toContain("microphone=()");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
    expect(headers["x-robots-tag"]).toMatch(/noindex/);
  }
});
