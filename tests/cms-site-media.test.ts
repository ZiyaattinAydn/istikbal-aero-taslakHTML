import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pageSchemas } from "../src/lib/cms/pages";
import { mediaThumbnail, siteMedia, siteMediaUrl, isSiteMedia } from "../src/lib/cms/site-media";

test("all preexisting public assets are listed exactly once without a storage import", () => {
  const disk = readdirSync(join(process.cwd(), "public/assets"))
    .filter((name) => /\.(svg|webp)$/i.test(name))
    .sort();
  const library = siteMedia.map((item) => item.name).sort();
  assert.equal(disk.length, 9);
  assert.deepEqual(library, disk);
  assert.equal(new Set(library).size, library.length);
  for (const item of siteMedia) {
    assert.ok(item.label && item.category);
    assert.equal(siteMediaUrl(item.name), "/assets/" + item.name);
    assert.equal(mediaThumbnail(item.name), "/assets/" + item.name);
    assert.equal(isSiteMedia(item.name), true);
  }
});

test("every page image fallback remains selectable from the read-only site catalog", () => {
  assert.equal(pageSchemas.length, 21);
  const fields = pageSchemas.flatMap((page) => page.fields);
  assert.equal(fields.length, 537);
  const imageFields = fields.filter((field) => field.kind === "image");
  assert.equal(imageFields.length, 43);
  for (const field of imageFields) {
    assert.ok(isSiteMedia(field.value), "Missing site asset " + field.value);
    assert.equal(mediaThumbnail(field.value), "/assets/" + field.value);
  }
});

test("media URL resolver accepts only exact checked-in filenames and valid private UUIDs", () => {
  assert.equal(siteMediaUrl("hero-flight.webp"), "/assets/hero-flight.webp");
  for (const unsafe of [
    "../secret.webp", "hero-flight.webp?redirect=https://example.com",
    "unknown.svg", "javascript:alert(1)", "/assets/hero-flight.webp",
    "cms:../../private", "cms:zzzz",
  ]) {
    assert.equal(siteMediaUrl(unsafe), null);
    assert.equal(mediaThumbnail(unsafe), null);
  }
  const id = "00000000-0000-4000-8000-000000000012";
  assert.equal(mediaThumbnail("cms:" + id), "/admin/media/" + id + "/file");
  assert.equal(mediaThumbnail("cms-preview:" + id), null);
});
