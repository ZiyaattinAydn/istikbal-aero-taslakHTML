import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseFragment, type DefaultTreeAdapterTypes } from "parse5";
import { PageContent } from "../src/components/pages/PageContent";
import { Footer } from "../src/components/layout/Footer";
import { Header } from "../src/components/layout/Header";
import { routes, getRoute } from "../src/data/routes";
import { findNews } from "../src/lib/news";
import {
  safeExternalSource,
  safeLocalHref,
  safeMediaName,
} from "../src/lib/urls";
import { EventScope } from "../src/lib/events";
type Node = DefaultTreeAdapterTypes.Node;
function text(node: Node): string {
  if ("nodeName" in node && node.nodeName === "#text")
    return (node as DefaultTreeAdapterTypes.TextNode).value;
  return "childNodes" in node ? node.childNodes.map(text).join("") : "";
}
const normalize = (html: string) =>
  text(parseFragment(html)).replace(/\s+/g, " ").trim();
const legacyRoot = "legacy-ref";
const hasLegacy = existsSync(legacyRoot + "/app.js");
const source = hasLegacy ? readFileSync(legacyRoot + "/app.js", "utf8").split("document.title=")[0] : "";
function legacy(
  page: string,
  search = "",
): { body: string; head: string; foot: string } {
  assert.ok(hasLegacy, "legacy branch reference must be checked out");
  return runInNewContext(
    source + "\n({body:pages[page](),head:header(),foot:footer()})",
    {
      document: { body: { dataset: { page } } },
      location: { search },
      URL,
      URLSearchParams,
    },
    { timeout: 2000 },
  );
}
test("all 21 source documents have both extension and clean routes", () => {
  const files = hasLegacy
    ? readdirSync(legacyRoot).filter((name) => name.endsWith(".html") && name !== "404.html")
    : routes.map((route) => route.file);
  assert.equal(routes.length, 21);
  assert.deepEqual([...routes.map((route) => route.file)].sort(), files.sort());
  for (const route of routes) {
    assert.equal(getRoute(route.file), route);
    assert.equal(getRoute(route.slug), route);
  }
  assert.equal(getRoute("missing.html"), undefined);
});
for (const route of routes) {
  test(`${route.file}: all source text, main headings and linked documents survive SSR`, () => {
    const expected = hasLegacy ? legacy(route.page) : null;
    const actual = renderToStaticMarkup(
      createElement(PageContent, { page: route.page }),
    );
    if (expected) assert.equal(normalize(actual), normalize(expected.body));
    assert.ok(normalize(actual).length > 100);
    assert.equal((actual.match(/<h1\b/g) || []).length, 1);
    for (const [, href] of actual.matchAll(
      /href="\/?([a-z0-9-]+\.html)(?:\?[^"]*)?"/g,
    ))
      assert.ok(getRoute(href), href);
    const header = renderToStaticMarkup(createElement(Header, { page: route.page }));
    const footer = renderToStaticMarkup(createElement(Footer));
    assert.ok(header.includes('class="site-header"'));
    assert.ok(footer.includes('class="footer"'));
    if (expected) {
      assert.equal(normalize(header), normalize(expected.head));
      assert.equal(normalize(footer), normalize(expected.foot));
    }
  });
}
test("news query selects records, supports both legacy defaults and rejects hostile IDs", () => {
  for (const flight of [false, true]) {
    const page = flight ? "flightControlNews" : "newsDetail";
    for (const id of [
      undefined,
      "",
      "flight-controller-announcement",
      "tengri-ai-announcement",
      "missing",
      '\"><img src=x onerror=alert(1)>',
      "a".repeat(5000),
    ]) {
      const actual = renderToStaticMarkup(
        createElement(PageContent, { page, newsId: id }),
      );
      if (hasLegacy) {
        assert.equal(
          normalize(actual),
          normalize(legacy(page, id === undefined ? "" : "?id=" + encodeURIComponent(id)).body),
        );
      }
      assert.ok(!actual.includes("onerror="));
    }
  }
  assert.equal(
    findNews(["flight-controller-announcement", "missing"])?.id,
    "flight-controller-announcement",
  );
});
test("media, internal URLs and publication sources cannot become script destinations", () => {
  assert.equal(safeExternalSource("javascript:alert(1)"), null);
  assert.equal(safeExternalSource("http://example.com"), null);
  assert.equal(
    safeExternalSource("https://example.com/post"),
    "https://example.com/post",
  );
  assert.equal(safeLocalHref("//example.com"), "#");
  assert.equal(
    safeLocalHref("haber-detay.html?id=tengri-ai-announcement"),
    "/haber-detay.html?id=tengri-ai-announcement",
  );
  assert.equal(safeMediaName("../evil.svg"), "research-lab.svg");
});
test("route effect registry removes listeners including capture flags on disposal", () => {
  const target = new EventTarget();
  const scope = new EventScope();
  let count = 0;
  scope.on(target as unknown as HTMLElement, "click", () => count++, {
    passive: true,
  });
  target.dispatchEvent(new Event("click"));
  assert.equal(count, 1);
  scope.dispose();
  scope.dispose();
  target.dispatchEvent(new Event("click"));
  assert.equal(count, 1);
});
test("all original visuals are available; CI verifies byte identity", () => {
  const files = readdirSync(hasLegacy ? legacyRoot + "/assets" : "public/assets");
  for (const file of files) {
    assert.ok(existsSync("public/assets/" + file), file);
    if (hasLegacy)
      assert.deepEqual(
        readFileSync(legacyRoot + "/assets/" + file),
        readFileSync("public/assets/" + file),
        file,
      );
  }
});
