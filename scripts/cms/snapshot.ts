import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseFragment, type DefaultTreeAdapterTypes } from "parse5";
import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { routes } from "../../src/data/routes";
import { PageContent } from "../../src/components/pages/PageContent";
type Node = DefaultTreeAdapterTypes.Node;
function text(n: Node): string {
  return n.nodeName === "#text"
    ? (n as DefaultTreeAdapterTypes.TextNode).value
    : "childNodes" in n
      ? n.childNodes.map(text).join("")
      : "";
}
const snapshots = routes.map((route) => {
  const html = renderToStaticMarkup(
    createElement(PageContent, { page: route.page }),
  );
  const sections: { tag: string; text: string }[] = [];
  const media = new Set<string>(),
    links = new Set<string>();
  function visit(n: Node) {
    if ("tagName" in n) {
      if (["h1", "h2", "h3", "p", "li", "figcaption"].includes(n.tagName))
        sections.push({
          tag: n.tagName,
          text: text(n).replace(/\s+/g, " ").trim(),
        });
      for (const a of n.attrs) {
        if (a.name === "href") links.add(a.value);
        if (
          a.name === "src" ||
          (a.name === "style" && a.value.includes("url("))
        )
          media.add(a.value);
      }
    }
    if ("childNodes" in n) n.childNodes.forEach(visit);
  }
  visit(parseFragment(html));
  return {
    key: route.page,
    route: route.slug,
    title: route.title,
    description: route.description,
    renderSha256: createHash("sha256").update(html).digest("hex"),
    sections,
    media: [...media],
    links: [...links],
  };
});
const output = JSON.stringify(snapshots, null, 2) + "\n",
  path = "docs/cms/page-snapshots.json";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("Rendered content changed");
} else writeFileSync(path, output);
console.log(`Verified ${snapshots.length} rendered page snapshots`);
