import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import schema from "../src/data/cms-page-schema.json";
import { PageContent } from "../src/components/pages/PageContent";
import { routes } from "../src/data/routes";
import { validatePageFields } from "../src/lib/cms/pages";
for (const page of schema) {
  test(`${page.slug}: controlled fields preserve default HTML and edit actual template`, () => {
    const route = routes.find((r) => r.slug === page.slug)!;
    const base = renderToStaticMarkup(
      createElement(PageContent, { page: route.page }),
    );
    const fields = Object.fromEntries(page.fields.map((f) => [f.key, f.value]));
    assert.equal(
      renderToStaticMarkup(
        createElement(PageContent, { page: route.page, content: fields }),
      ),
      base,
    );
    const field = page.fields.find(
      (f) => f.kind === "text" && f.value.length > 8,
    )!;
    assert.ok(field);
    const edited = { ...fields, [field.key]: "Kontrollü içerik testi" };
    const html = renderToStaticMarkup(
      createElement(PageContent, { page: route.page, content: edited }),
    );
    assert.ok(html.includes("Kontrollü içerik testi"));
    assert.notEqual(html, base);
    assert.deepEqual(validatePageFields(page.slug, fields), fields);
  });
}
test("page schemas reject unknown keys, markup and unsafe media/link destinations", () => {
  assert.throws(() => validatePageFields("kurumsal", { unknown: "x" }));
  const page = schema.find((p) => p.slug === "kurumsal")!;
  assert.throws(() =>
    validatePageFields(page.slug, { [page.fields[0].key]: "<script>" }),
  );
  const image = page.fields.find((f) => f.kind === "image")!;
  assert.throws(() =>
    validatePageFields(page.slug, { [image.key]: "https://evil.test/x.svg" }),
  );
});

test("new record draft and public views share the same escaped template", async () => {
  const { EntryContent } = await import("../src/components/pages/EntryContent");
  const body = {
    title: "Önizleme örneği",
    summary: "Açıklama",
    paragraphs: ["Kontrollü paragraf"],
    date: null,
    source: null,
    stage: null,
  };
  const html = renderToStaticMarkup(
    createElement(EntryContent, { body, kind: "news" }),
  );
  assert.ok(html.includes("Önizleme örneği"));
  assert.ok(html.includes("Kontrollü paragraf"));
  assert.equal((html.match(/<h1/g) || []).length, 1);
});

test("new records render approved cover metadata and related links in public and private templates", async () => {
  const { EntryContent } = await import("../src/components/pages/EntryContent");
  const body = {
    title: "Proje",
    summary: "Özet",
    paragraphs: ["Detay"],
    date: null,
    source: null,
    stage: "Geliştirme",
  };
  const cover = {
    id: "10000000-0000-0000-0000-000000000001",
    alt: "Güvenli kapak açıklaması",
    width: 1200,
    height: 800,
  };
  const related = [
    {
      document_id: "20000000-0000-0000-0000-000000000001",
      kind: "technology",
      slug: "teknoloji",
      body: { ...body, title: "İlişkili teknoloji" },
    },
  ];
  const html = renderToStaticMarkup(
    createElement(EntryContent, { body, kind: "project", cover, related }),
  );
  assert.ok(html.includes("/cms-media/" + cover.id));
  assert.ok(html.includes('alt="Güvenli kapak açıklaması"'));
  assert.ok(html.includes("/icerik/technology/teknoloji"));
  const preview = renderToStaticMarkup(
    createElement(EntryContent, {
      body,
      kind: "project",
      cover,
      related,
      preview: true,
    }),
  );
  assert.ok(preview.includes("/admin/media/" + cover.id + "/file"));
  assert.ok(
    preview.includes("/admin/content/" + related[0].document_id + "/preview"),
  );
  assert.ok(!html.includes("/admin/"));
});
