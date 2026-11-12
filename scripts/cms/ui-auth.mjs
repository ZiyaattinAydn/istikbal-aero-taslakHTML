// Real browser -> Next Server Actions -> local Auth/PostgREST/Storage.
// No traces, auth screenshots, cookies, OTPs, TOTP secrets, or keys are saved.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
export async function runUiChecks({ status, admin, totp }) {
  const email = "cms-ui@example.com",
    url = "http://127.0.0.1:3200";
  let stage = "ui-start",
    browser,
    page;
  const timings = { save: [], navigation: [] };
  const checks = [];
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3200",
    ],
    {
      stdio: "ignore",
      env: {
        ...process.env,
        NODE_ENV: "development",
        CMS_ENABLED: "true",
        CMS_PUBLIC_READS: "true",
        SUPABASE_URL: status.API_URL,
        SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
        CMS_ALLOWED_EMAILS: email,
      },
    },
  );
  const until = async (fn, message, limit = 120000) => {
    const start = Date.now();
    while (Date.now() - start < limit) {
      if (await fn()) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw Error(message);
  };
  const record = async (id) => {
    const { data, error } = await admin
      .from("cms_documents")
      .select("*")
      .eq("id", id)
      .single();
    assert.equal(error, null);
    return data;
  };
  try {
    await until(async () => {
      try {
        return (await fetch(url + "/admin/login")).ok;
      } catch {
        return false;
      }
    }, "server_start");
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    assert.equal(created.error, null);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(120000);
    page.on("dialog", (dialog) => dialog.accept());
    stage = "login-otp";
    await page.goto(url + "/admin/login");
    const forms = page.locator("form");
    await forms.nth(0).getByLabel("E-posta adresi", { exact: true }).fill(email);
    await page
      .getByRole("button", { name: "Doğrulama kodu gönder", exact: true })
      .click();
    let token;
    await until(
      async () => {
        const list = await (
          await fetch(`${status.MAILPIT_URL}/api/v1/messages`)
        ).json();
        const mail = list.messages?.find(
          (m) =>
            m.To?.some((t) => t.Address === email) &&
            m.Subject.includes("İstikbal"),
        );
        if (!mail) return false;
        const item = await (
          await fetch(`${status.MAILPIT_URL}/api/v1/message/${mail.ID}`)
        ).json();
        token = [item.Text, item.HTML]
          .filter(Boolean)
          .join("\n")
          .match(/\b\d{6}\b/)?.[0];
        return !!token;
      },
      "otp_mail",
      30000,
    );
    await forms.nth(1).getByLabel("E-posta adresi", { exact: true }).fill(email);
    await page.getByLabel("6 haneli giriş kodu", { exact: true }).fill(token);
    await page.getByRole("button", { name: "Girişe devam et", exact: true }).click();
    await page.waitForURL("**/admin/mfa");
    stage = "login-totp";
    await page
      .getByRole("button", { name: "QR kodu oluştur", exact: true })
      .click();
    // The QR enrollment deliberately hides the manual secret in a disclosure.
    // Open it only inside the disposable local Auth test fixture.
    await page.locator(".cms-mfa-enroll details").evaluate((element) => {
      element.open = true;
    });
    await page.locator(".cms-mfa-enroll code").waitFor({ state: "visible" });
    const secret = await page.locator(".cms-mfa-enroll code").innerText();
    await page.locator(".cms-mfa-verify select[name=factor]").selectOption({
      label: "Yeni uygulama",
    });
    await page.getByLabel("6 haneli uygulama kodu", { exact: true }).fill(totp(secret));
    await page.getByRole("button", { name: "Doğrula ve panele geç", exact: true }).click();
    await page.waitForURL("**/admin");
    checks.push(
      "Browser OTP and first-time TOTP enrollment; real HttpOnly session",
    );
    assert.ok(
      (await context.cookies())
        .filter((c) => c.name.includes("auth-token"))
        .every((c) => c.httpOnly && c.path === "/admin"),
    );
    const schema = JSON.parse(
      readFileSync("src/data/cms-page-schema.json", "utf8"),
    );
    async function submitStatus(operation, id, expected) {
      stage = stage.split(":")[0] + ":" + operation;
      await page.locator(`button[name=operation][value=${operation}]`).click();
      await until(
        async () => expected(await record(id)),
        "status_" + operation,
        30000,
      );
    }
    for (const entry of schema) {
      stage = "page-" + entry.slug;
      const navStart = Date.now();
      await page.goto(`${url}/admin/pages/${entry.slug}`);
      const form = page
        .locator("form")
        .filter({ has: page.locator("input[name=slug]") });
      const field = entry.fields.find((f) => f.kind === "text");
      assert.ok(field);
      const area = form.locator(`textarea[data-field="${field.key}"]`);
      // Semantic field groups are collapsible; open the exact group containing
      // the field before exercising the same real save/preview/publish checks.
      const revealArea = async () => {
        await area.locator("xpath=ancestor::details[1]").evaluate((section) => {
          section.open = true;
        });
        await area.waitFor({ state: "visible" });
      };
      await revealArea();
      timings.navigation.push(Date.now() - navStart);
      const { data: doc } = await admin
        .from("cms_documents")
        .select("id,revision")
        .eq("kind", "page")
        .eq("slug", entry.slug)
        .single();
      assert.ok(doc);
      stage = "page-" + entry.slug + ":save";
      const saveStart = Date.now();
      await area.fill("QA sayfa " + entry.slug);
      await form
        .getByRole("button", { name: "Taslak kaydet", exact: true })
        .click();
      await until(
        async () => {
          const saved = await record(doc.id);
          if (saved.revision === doc.revision + 1) return true;
          const text = await form.innerText();
          if (text.includes("Taslak kaydedilemedi."))
            throw Error("page_database_rejected");
          for (const [message, code] of [
            ["Sayfa bulunamadı.", "page_slug"],
            ["Sayfa alanları geçersiz.", "page_object"],
            ["Sayfa alanlarını kontrol edin.", "page_field"],
            ["Görseli medya kütüphanesinden seçin.", "page_image"],
            ["Bağlantıyı kontrol edin.", "page_link"],
            ["Başlık ve açıklamayı kontrol edin.", "page_seo"],
          ])
            if (text.includes(message)) throw Error(code);
          if (text.includes("Alanlar kaydedilemedi."))
            throw Error("page_validation_rejected");
          return false;
        },
        "page_save",
        30000,
      );
      await until(async()=>Number(await form.locator('input[name=revision]').inputValue())===doc.revision+1,'page_refresh',30000);
      timings.save.push(Date.now() - saveStart);
      await page.reload();
      await revealArea();
      assert.equal(await area.inputValue(), "QA sayfa " + entry.slug);
      stage = "page-" + entry.slug + ":preview";
      const preview = await context.newPage();
      await preview.goto(`${url}/admin/pages/${entry.slug}/preview`);
      assert.ok(
        (await preview.locator("body").textContent()).includes(
          "QA sayfa " + entry.slug,
        ),
      );
      await preview.close();
      await submitStatus("approve", doc.id, (d) => d.approval === "approved");
      await until(
        () => page.locator("button[value=publish]").isEnabled(),
        "approve_render",
        30000,
      );
      await submitStatus("publish", doc.id, (d) => d.status === "published");
      const publicPath = entry.slug === "index" ? "/" : "/" + entry.slug;
      stage = "page-" + entry.slug + ":public";
      const publicPage = await browser.newPage();
      await publicPage.goto(url + publicPath);
      assert.ok(
        (await publicPage.locator("body").textContent()).includes(
          "QA sayfa " + entry.slug,
        ),
      );
      await publicPage.close();
      // Baseline revision must be available even for source-seeded pages.
      await page
        .locator("select[name=version]")
        .selectOption(String(doc.revision));
      await submitStatus(
        "restore",
        doc.id,
        (d) => d.revision === doc.revision + 2,
      );
      await until(async()=>Number(await form.locator('input[name=revision]').inputValue())===doc.revision+2,'restore_refresh',30000);
      await page.reload();
      assert.notEqual(await area.inputValue(), "QA sayfa " + entry.slug);
      await submitStatus("approve", doc.id, (d) => d.approval === "approved");
      await until(
        () => page.locator("button[value=publish]").isEnabled(),
        "restore_approval",
        30000,
      );
      await submitStatus("publish", doc.id, (d) => d.status === "published");
    }
    console.log("PASS: all 21 page browser workflows.");
    checks.push(
      "All 21 seeded pages: edit/save, actual template preview, approval/publication, baseline restore and republish",
    );
    // Local disposable fixture: verify that an imported legacy record becomes
    // the only editor for its shared slots. Never seed hosted databases in QA.
    stage = "canonical-single-source";
    const canonicalBody = {
      title: "QA ortak haber kaydı",
      summary: "QA tek kaynaktan yönetilen haber",
      paragraphs: ["QA giriş metni", "QA ikinci paragraf"],
      date: null,
      source: null,
      stage: null,
    };
    const { data: canonicalFixture, error: canonicalError } = await admin
      .from("cms_documents")
      .insert({
        kind: "news",
        slug: "tengri-ai-announcement",
        body: canonicalBody,
      })
      .select("id")
      .single();
    assert.equal(canonicalError, null);
    assert.ok(canonicalFixture?.id);
    const { data: beforePage } = await admin
      .from("cms_documents")
      .select("body")
      .eq("kind", "page")
      .eq("slug", "haberler")
      .single();
    assert.ok(beforePage);

    await page.goto(url + "/admin/library");
    const libraryCard = page.locator(".cms-library-results article").filter({
      has: page.getByRole("heading", { name: canonicalBody.title, exact: true }),
    });
    await libraryCard.waitFor();
    assert.equal(
      await libraryCard.locator("a.cms-canonical-action").getAttribute("href"),
      "/admin/content/" + canonicalFixture.id,
    );
    assert.ok((await page.locator("body").innerText()).includes("Aktarım bekliyor"));

    await page.goto(url + "/admin/pages/haberler");
    assert.equal(
      await page.locator('textarea[data-field="newsList.0.title"]').count(),
      0,
      "Canonical news title must not be independently editable in the page",
    );
    assert.equal(
      await page.locator('textarea[data-field="newsList.1.title"]').count(),
      1,
      "Unseeded legacy news must keep its existing editor",
    );
    const linked = page.locator(".cms-canonical-panel").getByRole("link", {
      name: /İçeriği düzenle/,
    });
    assert.equal(await linked.getAttribute("href"), "/admin/content/" + canonicalFixture.id);
    await linked.click();
    await page.waitForURL("**/admin/content/" + canonicalFixture.id);
    assert.ok(
      (await page.getByRole("heading", { name: canonicalBody.title, exact: true }).count()) > 0,
    );
    const { data: afterPage } = await admin
      .from("cms_documents")
      .select("body")
      .eq("kind", "page")
      .eq("slug", "haberler")
      .single();
    assert.deepEqual(afterPage?.body, beforePage.body);
    checks.push(
      "Imported canonical news links once from shared page/editor library; unseeded fields and draft history remain untouched",
    );
    stage = "media-upload";
    await page.goto(url + "/admin/media");
    await page
      .locator("input[type=file]")
      .setInputFiles("public/assets/hero-flight.webp");
    await page
      .getByLabel("Görsel açıklaması", { exact: true })
      .fill("QA kapak");
    await page
      .getByRole("checkbox", {
        name: "Bu görseli kullanma ve yayımlama iznim var.",
      })
      .check();
    await page
      .getByRole("button", { name: "Özel kütüphaneye yükle", exact: true })
      .click();
    let media;
    await until(
      async () => {
        const r = await admin
          .from("cms_media")
          .select("*")
          .eq("created_by", created.data.user.id)
          .maybeSingle();
        media = r.data;
        return !!media;
      },
      "media_upload",
      30000,
    );
    await page.reload();
    const mediaArticle = page.locator("article").filter({
      has: page.getByRole("heading", { name: "QA kapak", exact: true }),
    });
    await mediaArticle
      .getByLabel("Alternatif metin", { exact: true })
      .fill("QA kapak düzenlendi");
    await mediaArticle
      .getByLabel("Medya notu / kaynak ve kullanım bilgisi", { exact: true })
      .fill("QA izin notu");
    await mediaArticle
      .getByRole("button", { name: "Bilgileri kaydet", exact: true })
      .click();
    await until(
      async () => {
        const r = await admin
          .from("cms_media")
          .select("revision")
          .eq("id", media.id)
          .single();
        return r.data.revision === 2;
      },
      "media_edit",
      30000,
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: "Herkese açık kullanımını onayla",
        exact: true,
      })
      .last()
      .click();
    await until(
      async () => {
        const r = await admin
          .from("cms_media")
          .select("visibility")
          .eq("id", media.id)
          .single();
        return r.data.visibility === "public";
      },
      "media_allow",
      30000,
    );
    async function createEntry(kind, title, related = []) {
      stage = "create-" + kind + ":fields";
      await page.goto(`${url}/admin/new/${kind}`);
      await page.getByLabel("Başlık", { exact: true }).fill(title);
      await page
        .getByLabel("Kısa açıklama", { exact: true })
        .fill("QA açıklama");
      if (kind === "project") {
        await page
          .locator("select[name=cover]")
          .selectOption(media.id);
        stage = "create-" + kind + ":relations";
        for (const id of related)
          await page.locator(`input[type=checkbox][value="${id}"]`).check();
      }
      stage = "create-" + kind + ":save";
      await page
        .getByRole("button", { name: "Taslak kaydet", exact: true })
        .click();
      await page.waitForURL("**/admin/content/*");
      const id = new URL(page.url()).pathname.split("/").at(-1);
      return await record(id);
    }
    stage = "relations";
    const tech = await createEntry("technology", "QA Teknoloji");
    await submitStatus("approve", tech.id, (d) => d.approval === "approved");
    await until(
      () => page.locator("button[value=publish]").isEnabled(),
      "entry_approve",
      30000,
    );
    await submitStatus("publish", tech.id, (d) => d.status === "published");
    const platform = await createEntry("platform", "QA Platform");
    const project = await createEntry("project", "QA Proje", [
      tech.id,
      platform.id,
    ]);
    await page.goto(`${url}/admin/content/${project.id}/preview`);
    assert.equal(
      await page.locator("img.entry-cover").getAttribute("alt"),
      "QA kapak düzenlendi",
    );
    assert.ok(
      (await page.locator("body").innerText()).includes(platform.body.title),
    );
    await page.goto(`${url}/admin/content/${project.id}`);
    await submitStatus("approve", project.id, (d) => d.approval === "approved");
    await until(
      () => page.locator("button[value=publish]").isEnabled(),
      "project_approve",
      30000,
    );
    await submitStatus("publish", project.id, (d) => d.status === "published");
    const anonymous = await browser.newContext();
    const visitor = await anonymous.newPage();
    const publicProject = `${url}/icerik/project/${project.slug}`;
    await visitor.goto(publicProject);
    assert.ok(
      (await visitor.locator("body").innerText()).includes(tech.body.title),
    );
    assert.ok(
      !(await visitor.locator("body").innerText()).includes(
        platform.body.title,
      ),
    );
    assert.equal(
      await visitor.locator("img.entry-cover").getAttribute("alt"),
      "QA kapak düzenlendi",
    );
    const file = await visitor.request.get(`${url}/cms-media/${media.id}`);
    assert.equal(file.status(), 200);
    assert.ok(file.headers()["cache-control"].includes("no-store"));
    // Archiving a target must invalidate incoming relation caches without leaking its draft.
    await page.goto(`${url}/admin/content/${tech.id}`);
    await submitStatus("archive", tech.id, (d) => d.status === "archived");
    await visitor.reload();
    assert.ok(
      !(await visitor.locator("body").innerText()).includes(tech.body.title),
    );
    checks.push(
      "Real UI CRUD: versioned relations, draft-target isolation, archive invalidation, cover and media metadata",
    );
    stage = "withdraw";
    await page.goto(url + "/admin/media");
    const current = page.locator("article").filter({
      has: page.getByRole("heading", {
        name: "QA kapak düzenlendi",
        exact: true,
      }),
    });
    await current
      .getByRole("checkbox", {
        name: "Görseli kullanan yayınları da taslağa almayı onaylıyorum.",
      })
      .check();
    await current
      .getByRole("button", { name: "Yayın iznini geri çek", exact: true })
      .click();
    await until(
      async () => (await record(project.id)).status === "draft",
      "withdraw_publication",
      30000,
    );
    assert.equal((await visitor.goto(publicProject)).status(), 404);
    assert.equal(
      (await visitor.request.get(`${url}/cms-media/${media.id}`)).status(),
      404,
    );
    checks.push(
      "Withdrawal atomically removes dependent publication; anonymous image/detail now 404; draft/file preserved",
    );
    stage = "mobile";
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + "/admin/pages/kurumsal");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.getByRole("searchbox", { name: "Alan ara", exact: true }).focus();
    assert.equal(
      await page
        .getByRole("searchbox", { name: "Alan ara", exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    checks.push(
      "Mobile editor has no horizontal overflow and keyboard focus works",
    );
    // No auth screen is captured. Only fixture content editors are saved for visual QA.
    await page.screenshot({
      path: "docs/cms/evidence/admin-mobile.png",
      fullPage: false,
    });
    await page.goto(url + "/admin/library");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Shared content library must fit mobile width",
    );
    checks.push("Unified content library fits the mobile viewport");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url + "/admin/media");
    await page.screenshot({
      path: "docs/cms/evidence/admin-media.png",
      fullPage: false,
    });
    await page.goto(url + "/admin");
    await page
      .getByRole("button", { name: /Oturumu kapat$/ })
      .click();
    await page.waitForURL("**/admin/login");
    await page.goto(url + "/admin/pages");
    assert.ok(page.url().endsWith("/admin/login"));
    checks.push("Browser logout protects subsequent admin navigation");
    const distribution = (values) => {
      const sorted = values.toSorted((a, b) => a - b);
      return {
        samples: sorted.length,
        medianMs: sorted[Math.floor(sorted.length / 2)],
        p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
      };
    };
    const result = {
      status: "passed",
      checks,
      pages: 21,
      timings: {
        save: distribution(timings.save),
        navigation: distribution(timings.navigation),
      },
      environment:
        "GitHub runner; Next development, disposable local Supabase; navigation includes route compilation; NOT hosted/production performance",
    };
    writeFileSync(
      "docs/cms/evidence/admin-ui.json",
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(
      "PASS: authenticated browser UI, all 21 pages, relations, media withdrawal and mobile checks. Secrets omitted.",
    );
  } catch (error) {
    console.error("Authenticated UI failure stage:", stage);
    console.error(
      "UI operation class:",
      String(error?.message || "")
        .split("\n")[0]
        .match(/^[a-zA-Z.]+:/)?.[0],
    );
    if (stage.startsWith("page-")) {
      const values = JSON.parse(
        await page.locator('input[name="fields"]').inputValue(),
      );
      const pageSlug = await page.locator('input[name="slug"]').inputValue();
      const schema = JSON.parse(
        readFileSync("src/data/cms-page-schema.json", "utf8"),
      ).find((p) => p.slug === pageSlug);
      console.log(
        "Page field diagnostics (keys only):",
        Object.entries(values)
          .filter(
            ([key, value]) =>
              !schema.fields.some((f) => f.key === key) ||
              typeof value !== "string" ||
              /[<>\u0000]/.test(value),
          )
          .map(([key]) => key),
      );
    }
    console.error("UI failure class:", {
      name: error?.name,
      knownFailure: /^[a-z_]+$/.test(error?.message || "")
        ? error.message
        : undefined,
    });
    throw error;
  } finally {
    if (browser) await browser.close();
    child.kill("SIGTERM");
  }
}
