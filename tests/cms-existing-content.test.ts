import assert from "node:assert/strict";
import { test } from "node:test";
import { routes } from "../src/data/routes";
import { pageSchemas } from "../src/lib/cms/pages";
import { validateBody } from "../src/lib/cms/model";
import {
  legacyRecords, legacyRecord, isExistingContent, legacyKindsForPage,
  legacyNewsIdForPage, overlayExistingPublished, legacyRoutesForContent,
} from "../src/lib/cms/legacy-content";

test("one canonical identity for each preexisting article/project/platform/technology", () => {
  assert.equal(legacyRecords.length, 13);
  const actual = Object.fromEntries(["news", "project", "platform", "technology"]
    .map((kind) => [kind, legacyRecords.filter((x) => x.kind === kind).length]));
  assert.deepEqual(actual, { news: 2, project: 2, platform: 3, technology: 6 });
  assert.equal(new Set(legacyRecords.map((x) => x.kind + ":" + x.slug)).size, 13);
  for (const item of legacyRecords) {
    assert.ok(routes.some((route) => route.file === item.legacyHref));
    assert.ok(legacyRecord(item.kind, item.slug) === item);
    assert.deepEqual(validateBody(item.body), item.body);
    assert.equal(isExistingContent(item.kind, item.slug), true);
  }
  assert.equal(isExistingContent("news", "new-unrelated-news"), false);
  assert.equal(isExistingContent("technology", "iha-sistemleri"), false);
  assert.equal(isExistingContent("platform", "iha-sistemleri"), true);
});

test("canonical groups cover the appropriate existing public pages", () => {
  assert.equal(pageSchemas.length, 21);
  assert.equal(pageSchemas.reduce((n, item) => n + item.fields.length, 0), 537);
  assert.deepEqual(new Set(legacyKindsForPage("haberler")), new Set(["news"]));
  assert.ok(legacyKindsForPage("projeler").includes("project"));
  assert.ok(legacyKindsForPage("platformlar").includes("platform"));
  assert.ok(legacyKindsForPage("teknolojiler").includes("technology"));
  assert.deepEqual(new Set(legacyKindsForPage("index")), new Set(["news", "platform", "technology"]));
});

test("canonical published news overlays the original news card without touching unrelated fields", () => {
  const baseline = {
    "NewsContent.title.4": "My page introduction",
    "newsList.1.title": "My separately edited flight control entry",
  };
  const changed = overlayExistingPublished("haberler", baseline, [{
    kind: "news", slug: "tengri-ai-announcement",
    body: { title: "Tengri updated headline", summary: "Updated public summary" },
  }]);
  assert.equal(changed["newsList.0.title"], "Tengri updated headline");
  assert.equal(changed["newsList.0.summary"], "Updated public summary");
  assert.equal(changed["newsList.1.title"], baseline["newsList.1.title"]);
  assert.equal(changed["NewsContent.title.4"], baseline["NewsContent.title.4"]);
  assert.deepEqual(baseline, {
    "NewsContent.title.4": "My page introduction",
    "newsList.1.title": "My separately edited flight control entry",
  });
  assert.equal(changed["newsList.0.href"], undefined);
  assert.strictEqual(overlayExistingPublished("haberler", baseline, []), baseline);
});

test("a canonical platform item updates both appearances in the existing grid", () => {
  const changed = overlayExistingPublished("platformlar", {}, [{
    kind: "platform", slug: "iha-sistemleri",
    body: { title: "Updated platform", summary: "Description updated" },
  }]);
  assert.equal(changed["cards.platform.3.title"], "Updated platform");
  assert.equal(changed["cards.platform.3.description"], "Description updated");
  assert.equal(changed["cards.platform.4.title"], undefined);
});

test("home feature and existing detail URL show the published article in place", () => {
  const latest = {
    kind: "news", slug: "tengri-ai-announcement",
    body: {
      title: "New headline", summary: "New summary",
      paragraphs: ["Updated introduction", "Updated context"],
      source: "https://example.org/news",
    },
  };
  const home = overlayExistingPublished("index", {}, [latest]);
  assert.equal(home["HomeContent.text.33"], "New headline");
  assert.equal(home["HomeContent.text.34"], "New summary");
  assert.equal(home["HomeContent.href.35"], undefined);
  const detail = overlayExistingPublished("haber-detay", {}, [latest], latest);
  assert.equal(detail["news.article.heroTitle"], "New headline");
  assert.equal(detail["news.article.intro"], "Updated introduction");
  assert.equal(detail["news.article.sectionBody"], "Updated context");
  assert.equal(detail["news.sourceUrl"], "https://example.org/news");
  assert.equal(legacyNewsIdForPage("haber-detay"), "tengri-ai-announcement");
  assert.equal(legacyNewsIdForPage("ucus-kontrol-paylasimi"), "flight-controller-announcement");
  assert.equal(legacyNewsIdForPage("haberler"), null);
});

test("invalid, unrecognized and unpublished entries cannot overwrite static pages", () => {
  const values = { "NewsContent.title.4": "Original" };
  const result = overlayExistingPublished("haberler", values, [{
    kind: "news", slug: "unrecognized-story",
    body: { title: "Should not appear", summary: "untrusted" },
  }]);
  assert.equal(result["NewsContent.title.4"], "Original");
  assert.equal(result["newsList.0.title"], undefined);
  for (const page of pageSchemas) {
    const overlays = overlayExistingPublished(page.slug, {}, legacyRecords);
    const keys = new Set(page.fields.map((field) => field.key));
    for (const key of Object.keys(overlays)) {
      assert.ok(keys.has(key), page.slug + " gained an undeclared CMS field: " + key);
    }
  }
});

test("publishing a canonical item invalidates existing clean and .html route aliases", () => {
  const news = legacyRoutesForContent("news", "tengri-ai-announcement");
  for (const slug of ["index", "haberler", "haber-detay", "ucus-kontrol-paylasimi"]) {
    assert.ok(news.includes(slug), slug + " should refresh");
  }
  const platform = legacyRoutesForContent("platform", "iha-sistemleri");
  assert.ok(platform.includes("index"));
  assert.ok(platform.includes("platformlar"));
  assert.ok(legacyRoutesForContent("technology", "otonom-sistemler").length >= 1);
  assert.deepEqual(legacyRoutesForContent("news", "unknown"), []);
});
