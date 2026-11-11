import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, validateBody, validateUpload } from "../src/lib/cms/model";
const body = {
  title: "Başlık",
  summary: "Özet",
  paragraphs: ["İçerik"],
  date: null,
  source: null,
  stage: null,
};
test("CMS validates controlled plain text and Turkish slugs", () => {
  assert.equal(slugify("İnsansız Uçuş — AR-GE"), "insansiz-ucus-ar-ge");
  assert.deepEqual(validateBody(body), body);
  for (const change of [
    { title: "<script>" },
    { source: "javascript:alert(1)" },
    { source: "https://u:p@example.com" },
    { date: "2026-02-30" },
    { paragraphs: ["a".repeat(8001)] },
  ])
    assert.throws(() => validateBody({ ...body, ...change }));
});
test("CMS upload rejects active formats, mismatched signatures and excessive files", () => {
  for (const mime of ["image/svg+xml", "text/html", "image/jpeg"])
    assert.throws(() =>
      validateUpload(
        new TextEncoder().encode('<svg onload="alert(1)"/>'),
        mime,
      ),
    );
  assert.throws(() =>
    validateUpload(new Uint8Array(5 * 1024 * 1024 + 1), "image/png"),
  );
  validateUpload(new Uint8Array([255, 216, 255, 0]), "image/jpeg");
});
