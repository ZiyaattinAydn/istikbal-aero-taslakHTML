import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../src/data/cms-page-schema.json";
import { routes } from "../src/data/routes";
import type { PageField } from "../src/lib/cms/page-values";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PageLinkField } from "../src/components/admin/PageLinkField";
import {
  normalizePageSearch,
  pageCategories,
  pageCategory,
  pageContentBlocks,
  pageFieldLabel,
  pageMenu,
} from "../src/lib/cms/page-organization";

const fieldsOf = (values: { key: string; label: string; kind: string; value: string }[]): PageField[] =>
  values.map((item) => ({ ...item, kind: item.kind as PageField["kind"] }));

test("21 public pages are categorized once using the existing navigation", () => {
  assert.equal(routes.length, 21);
  const categoryIds: Set<string> = new Set(pageCategories.map((item) => item.id));
  assert.equal(categoryIds.size, pageCategories.length);
  for (const route of routes) {
    const category = pageCategory(route.slug);
    assert.ok(category && categoryIds.has(category), route.slug + " must have a category");
    assert.equal(
      pageMenu(category).filter((item) => item.slug === route.slug).length,
      1,
      route.slug + " must occur once in its category submenu",
    );
  }
  assert.equal(pageMenu("platforms").length, 5);
  assert.equal(pageMenu("tech").length, 8);
  assert.equal(pageMenu("news").length, 3);
});

test("search normalizes Turkish characters without changing original titles", () => {
  assert.equal(normalizePageSearch("İLETİŞİM"), "iletisim");
  assert.equal(normalizePageSearch("Gömülü Sistemler"), "gomulu sistemler");
  assert.equal(normalizePageSearch("PROJELER & AR-GE"), "projeler ar ge");
});

test("537 controlled fields retain their exact key, type, fallback, and membership", () => {
  assert.equal(schema.length, 21);
  let count = 0;
  for (const page of schema) {
    const fields = fieldsOf(page.fields);
    const before = fields.map(({ key, kind, value }) => ({ key, kind, value }));
    const blocks = pageContentBlocks(fields);
    const after = blocks.flatMap((block) => block.fields)
      .map(({ key, kind, value }) => ({ key, kind, value }));
    const sort = (items: typeof before) => items.sort((a, b) => a.key.localeCompare(b.key));
    assert.deepEqual(sort(after), sort(before), page.slug + " changed persisted field data");
    assert.equal(new Set(after.map((item) => item.key)).size, fields.length);
    for (const block of blocks) {
      assert.ok(block.title.trim(), page.slug + " has an unnamed group");
      assert.ok(block.fields.length > 0);
      for (const field of block.fields) {
        const display = pageFieldLabel(field);
        assert.ok(display.trim());
        assert.ok(!/^\\d+\\.\\s/.test(display));
        assert.ok(!/\\.html/.test(display));
        assert.notEqual(display, "Metin");
        assert.notEqual(display, "Bağlantı");
      }
    }
    count += fields.length;
  }
  assert.equal(count, 537);
});

test("related fields appear in the same logical card", () => {
  const home = schema.find((page) => page.slug === "index")!;
  const blocks = pageContentBlocks(fieldsOf(home.fields));
  const platform = blocks.find((block) => block.id === "cards.platform.0")!;
  assert.equal(platform.fields.length, 4);
  assert.equal(platform.title, "İnsansız Hava Sistemleri");
  assert.equal(platform.fields.some((field) => field.key.endsWith(".href")), true);
  const hero = blocks.find((block) => block.id === "home-hero")!;
  assert.equal(hero.fields.length, 13);
  const focus = schema.find((page) => page.slug === "gomulu-sistemler")!;
  assert.equal(
    pageContentBlocks(fieldsOf(focus.fields)).filter((block) => block.id.includes(".modules.")).length, 3,
  );
});

test("page link editor displays human-readable destinations while preserving the link", () => {
  const local = renderToStaticMarkup(createElement(PageLinkField, {
    id: "field", value: "platformlar.html", onChange: () => {}, onFocus: () => {},
  }));
  assert.ok(local.includes("Sitedeki sayfa"));
  assert.ok(local.includes("Platformlar"));
  assert.ok(local.includes("value=\"platformlar.html\""));
  const external = renderToStaticMarkup(createElement(PageLinkField, {
    id: "external", value: "https://example.com/", onChange: () => {}, onFocus: () => {},
  }));
  assert.ok(external.includes("https://example.com/"));
  assert.ok(external.includes("Güvenli web adresi"));
});
