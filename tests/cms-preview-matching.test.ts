import assert from "node:assert/strict";
import { test } from "node:test";
import {
  uniqueTextCandidate,
  normalizedPreviewUrl,
  samePreviewUrl,
  styleHasMediaUrl,
} from "../src/lib/cms/preview-matching";

test("preview selects only one exact text node, never a matching substring", () => {
  const nodes = ["ile", "sistemler ile birlikte", "mühendislik"];
  assert.equal(uniqueTextCandidate(nodes, "ile", (node) => node), "ile");
  assert.equal(uniqueTextCandidate(nodes.slice(1), "ile", (node) => node), null);
  assert.equal(uniqueTextCandidate(nodes, "sistemler", (node) => node), null);
  assert.equal(uniqueTextCandidate([" sistemler ", "başka"], "sistemler", (node) => node), " sistemler ");
  assert.equal(uniqueTextCandidate(["sistemler", "sistemler"], "sistemler", (node) => node), null);
});

test("repeated words or fragments remain unmatched rather than guessing", () => {
  const segments = [
    { id: "one", content: "TEKNOLOJİLER" },
    { id: "two", content: "TEKNOLOJİLER" },
    { id: "three", content: "TEKNOLOJİLER VE SİSTEMLER" },
  ];
  assert.equal(uniqueTextCandidate(segments, "TEKNOLOJİLER", (s) => s.content), null);
  assert.equal(uniqueTextCandidate(segments, "VE SİSTEMLER", (s) => s.content), null);
  assert.equal(uniqueTextCandidate(segments, "TEKNOLOJİLER VE SİSTEMLER", (s) => s.content)?.id, "three");
});

test("background image matching uses the entire resource URL, not a filename fragment", () => {
  assert.equal(styleHasMediaUrl("background-image:url('/assets/hero-flight.webp')", "/assets/hero-flight.webp"), true);
  assert.equal(styleHasMediaUrl('background-image: url("/assets/hero-flight.webp"); opacity:1', "/assets/hero-flight.webp"), true);
  assert.equal(styleHasMediaUrl("background-image: url('/assets/hero-flight.webp?v=2')", "/assets/hero-flight.webp"), false);
  assert.equal(styleHasMediaUrl("background-image: url('/assets/hero-flight-wide.webp')", "/assets/hero-flight.webp"), false);
  assert.equal(styleHasMediaUrl("color: red", "/assets/hero-flight.webp"), false);
  assert.equal(styleHasMediaUrl(null, "/assets/hero-flight.webp"), false);
});

test("preview link matching is strict and rejects unsafe URL schemes", () => {
  assert.equal(samePreviewUrl("/haberler.html", "/haberler.html"), true);
  assert.equal(samePreviewUrl("/haberler.html?id=story-1", "/haberler.html"), false);
  assert.equal(samePreviewUrl("/haberler.html?x=1", "/haberler.html?x=2"), false);
  assert.equal(samePreviewUrl("/haberler.html", "/haberler-2026.html"), false);
  assert.equal(samePreviewUrl("https://example.org/report", "https://other.org/report"), false);
  assert.equal(normalizedPreviewUrl("javascript:alert(1)"), null);
  assert.equal(normalizedPreviewUrl("mailto:hi@example.org"), null);
});
