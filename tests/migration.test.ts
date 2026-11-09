import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PageContent } from "../src/components/pages/PageContent";
import { Footer } from "../src/components/layout/Footer";
import { Header } from "../src/components/layout/Header";
import { routes, getRoute } from "../src/data/routes";
import { findNews } from "../src/lib/news";
import { safeExternalSource, safeLocalHref, safeMediaName } from "../src/lib/urls";
import { EventScope } from "../src/lib/events";

test("all 21 original .html routes and their clean aliases resolve", () => {
  assert.equal(routes.length, 21);
  assert.equal(new Set(routes.map(route => route.file)).size, 21);
  assert.equal(new Set(routes.map(route => route.slug)).size, 21);
  for (const route of routes) {
    assert.equal(getRoute(route.file), route);
    assert.equal(getRoute(route.slug), route);
  }
  assert.equal(getRoute("unknown.html"), undefined);
});

for (const route of routes) {
  test(route.file + ": SSR content, headings, navigation, and footer remain valid", () => {
    const html = renderToStaticMarkup(createElement(PageContent, { page: route.page }));
    assert.ok(html.length > 200, route.file + ": unexpectedly short content");
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route.file + ": H1 count");
    for (const [, href] of html.matchAll(/href="\/?([a-z0-9-]+\.html)(?:\?[^"]*)?"/g))
      assert.ok(getRoute(href), route.file + ": unknown link " + href);
    const header = renderToStaticMarkup(createElement(Header, { page: route.page }));
    const footer = renderToStaticMarkup(createElement(Footer));
    assert.ok(header.includes('class="site-header"'), route.file + ": header missing");
    assert.ok(footer.includes('class="footer"'), route.file + ": footer missing");
  });
}

test("news ID validation retains legacy URL defaults and rejects hostile IDs", () => {
  assert.equal(findNews(undefined)?.id, "tengri-ai-announcement");
  assert.equal(findNews(undefined, true)?.id, "flight-controller-announcement");
  assert.equal(findNews(["flight-controller-announcement", "missing"])?.id, "flight-controller-announcement");
  for (const id of ["missing", '"><img src=x onerror=alert(1)>', "a".repeat(5000)]) {
    assert.equal(findNews(id), undefined);
    for (const page of ["newsDetail", "flightControlNews"] as const) {
      const html = renderToStaticMarkup(createElement(PageContent, { page, newsId: id }));
      assert.match(html, /İçerik bulunamadı/);
      assert.ok(!html.includes("onerror="));
    }
  }
});

test("media and URL helpers reject unsafe destinations", () => {
  assert.equal(safeExternalSource("javascript:alert(1)"), null);
  assert.equal(safeExternalSource("http://example.com"), null);
  assert.equal(safeExternalSource("https://example.com/post"), "https://example.com/post");
  assert.equal(safeLocalHref("//example.com"), "#");
  assert.equal(safeLocalHref("haber-detay.html?id=tengri-ai-announcement"), "/haber-detay.html?id=tengri-ai-announcement");
  assert.equal(safeMediaName("../evil.svg"), "research-lab.svg");
});

test("event listener registry cleans up after route disposal", () => {
  const target = new EventTarget();
  const scope = new EventScope();
  let calls = 0;
  scope.on(target as unknown as HTMLElement, "click", () => calls++, { passive: true });
  target.dispatchEvent(new Event("click"));
  assert.equal(calls, 1);
  scope.dispose();
  scope.dispose();
  target.dispatchEvent(new Event("click"));
  assert.equal(calls, 1);
});

test("runtime media are present without duplicated root HTML assets", () => {
  for (const file of ["favicon.svg", "hero-flight.webp", "hero-hangar-photo.webp", "platform-flight.svg", "platform-systems.svg", "tengri-network.svg", "research-lab.svg"])
    assert.ok(existsSync("public/assets/" + file), file);
});
