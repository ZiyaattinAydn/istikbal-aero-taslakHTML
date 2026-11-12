import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { pageSchemas } from "../src/lib/cms/pages";
import { legacyRecords, canonicalContentForPage, canonicalReferenceForField, editablePageFields } from "../src/lib/cms/legacy-content";
import { CanonicalContentPanel } from "../src/components/admin/CanonicalContentPanel";
import { ContentLibrary } from "../src/components/admin/ContentLibrary";

test("all 21 page templates preserve 537 keys while assigning canonical editorial ownership", () => {
  assert.equal(pageSchemas.length, 21);
  assert.equal(pageSchemas.reduce((count, page) => count + page.fields.length, 0), 537);
  assert.equal(legacyRecords.length, 13);
  let delegated = 0;
  for (const page of pageSchemas) {
    const references = canonicalContentForPage(page.slug);
    const original = page.fields.map((field) => field.key);
    const owned = references.flatMap((reference) => reference.fieldKeys);
    assert.equal(new Set(owned).size, owned.length, page.slug + " has duplicate field ownership");
    for (const key of owned) assert.ok(original.includes(key), page.slug + " has missing field " + key);
    const none = editablePageFields(page.fields, references);
    assert.deepEqual(none.map((field) => field.key), original, page.slug + " lost a field before migration");
    const transferred = editablePageFields(
      page.fields,
      references.map((reference) => ({ ...reference, id: "00000000-0000-0000-0000-000000000099" })),
    );
    assert.equal(transferred.length, page.fields.length - owned.length);
    for (const field of transferred) assert.equal(canonicalReferenceForField(page.slug, field.key), null);
    delegated += owned.length;
    assert.deepEqual(page.fields.map((field) => field.key), original, "schema mutated");
  }
  assert.ok(delegated > 25);
});

test("the same canonical record owns repeated cards while unrelated links stay editable", () => {
  const homepage = canonicalContentForPage("index");
  assert.ok(homepage.some((item) => item.kind === "news" && item.slug === "tengri-ai-announcement"));
  const platform = homepage.find((item) => item.kind === "platform" && item.slug === "iha-sistemleri")!;
  assert.ok(platform.fieldKeys.includes("cards.platform.0.title"));
  const tech = canonicalContentForPage("teknolojiler");
  assert.ok(tech.some((item) => item.kind === "technology"));
  const news = canonicalContentForPage("haberler");
  assert.ok(news.some((item) => item.kind === "news" && item.slug === "flight-controller-announcement"));
  assert.equal(canonicalReferenceForField("haberler", "newsList.0.href"), null);
  assert.equal(canonicalReferenceForField("index", "HomeContent.href.35"), null);
  assert.equal(canonicalReferenceForField("haber-detay", "news.article.heroTitle")?.slug, "tengri-ai-announcement");
  assert.equal(canonicalReferenceForField("ucus-kontrol-paylasimi", "news.article.heroTitle")?.slug, "flight-controller-announcement");
});

test("the page panel shows edit links only for existing protected CMS records", () => {
  const references = canonicalContentForPage("haberler");
  const html = renderToStaticMarkup(createElement(CanonicalContentPanel, {
    items: references.map((item, index) => ({
      ...item,
      id: index === 0 ? "00000000-0000-0000-0000-000000000011" : undefined,
      status: index === 0 ? "published" : undefined,
    })),
  }));
  assert.equal((html.match(/İçeriği düzenle/g) || []).length, 1);
  assert.ok(html.includes("/admin/content/00000000-0000-0000-0000-000000000011"));
  assert.ok(html.includes("Aktarım bekliyor"));
  assert.ok(!html.includes("admin/content/undefined"));
});

test("unified library never invents edit links for unseeded legacy entries", () => {
  const html = renderToStaticMarkup(createElement(ContentLibrary, {
    items: [
      { kind: "news", slug: "tengri-ai-announcement", title: "Original", summary: "Intro", canonical: true },
      { kind: "project", slug: "new-project", title: "New", summary: "Summary", canonical: false,
        id: "00000000-0000-0000-0000-000000000012", status: "draft" },
    ],
  }));
  assert.ok(html.includes("Aktarım bekliyor"));
  assert.ok(html.includes("/admin/content/00000000-0000-0000-0000-000000000012"));
  assert.ok(!html.includes("admin/content/undefined"));
  assert.ok(html.includes("İçerik ara"));
});
