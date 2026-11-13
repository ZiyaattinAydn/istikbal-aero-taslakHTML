import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync } from "node:fs";
import { PageContent } from "../../src/components/pages/PageContent";
import { routes } from "../../src/data/routes";
import {
  collectFields,
  type PageField,
  type PageValues,
} from "../../src/lib/cms/page-values";
const schema = routes.map((route) => {
  const fields = new Map<string, PageField>();
  const content: PageValues = {
    [collectFields]: (field) => fields.set(field.key, field),
  };
  renderToStaticMarkup(
    createElement(PageContent, { page: route.page, content }),
  );
  return {
    page: route.page,
    slug: route.slug,
    title: route.title,
    description: route.description,
    fields: [...fields.values()],
  };
});
const result = JSON.stringify(schema, null, 2) + "\n",
  path = "src/data/cms-page-schema.json";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== result)
    throw Error("Page schema changed; review mappings and regenerate");
} else writeFileSync(path, result);
console.log(
  `${schema.length} page templates, ${schema.reduce((n, p) => n + p.fields.length, 0)} controlled field occurrences`,
);
