import { test, expect } from "@playwright/test";
test("CMS remains closed without explicit configuration", async ({
  page,
  request,
}) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  const html = await page.content();
  expect(html).not.toContain("Taslak kaydet");
  for (const path of [
    "/admin/pages",
    "/admin/pages/kurumsal",
    "/admin/pages/kurumsal/preview",
    "/admin/media",
    "/admin/content/00000000-0000-0000-0000-000000000001/preview",
    "/admin/media/00000000-0000-0000-0000-000000000001/file",
    "/admin/mfa",
    "/admin/new/news",
    "/admin/content/00000000-0000-0000-0000-000000000001",
  ]) {
    const r = await request.get(path);
    expect(r.status()).toBe(404);
    expect(r.headers()["cache-control"]).toContain("no-store");
  }
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: "Tekrar hoş geldiniz." }),
  ).toBeVisible();
  await expect(
    page.getByText("Yönetim girişi henüz kullanıma açılmadı."),
  ).toBeVisible();
  expect(await page.locator("input").count()).toBe(0);
});
test("public page does not request admin chunks or Supabase", async ({
  page,
}) => {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/kurumsal");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(urls.some((url) => /supabase|AuthForms|ContentEditor/.test(url))).toBe(
    false,
  );
});
