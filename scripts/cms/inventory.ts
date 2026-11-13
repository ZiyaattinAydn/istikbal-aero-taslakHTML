import ts from "typescript";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { routes } from "../../src/data/routes";
const directories = [
  "src/components/pages",
  "src/components/layout",
  "src/components/ui",
  "src/data",
];
const sources = directories
  .flatMap((dir) =>
    readdirSync(dir)
      .filter((n) => /\.tsx?$/.test(n))
      .map((n) => `${dir}/${n}`),
  )
  .sort();
const records = sources.map((path) => {
  const source = readFileSync(path, "utf8");
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const fields: {
    key: string;
    line: number;
    value: string;
    candidate: boolean;
  }[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isJsxText(node)
    ) {
      const value = node.text.trim();
      if (value)
        fields.push({
          key: `${path}:${node.getStart(file)}`,
          line:
            file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
          value,
          candidate:
            !ts.isImportDeclaration(node.parent) &&
            (/[\sçğıöşüÇĞİÖŞÜ]/.test(value) ||
              /\.(webp|svg|png|jpe?g|html)$/.test(value)),
        });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return {
    path,
    sha256: createHash("sha256").update(source).digest("hex"),
    fields,
  };
});
const result =
  JSON.stringify({ version: 1, routes, sources: records }, null, 2) + "\n";
const target = "docs/cms/content-inventory.json";
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== result) {
    const previous = JSON.parse(readFileSync(target, "utf8")) as {
      sources: typeof records;
    };
    const mismatches = records.filter(
      (record) => JSON.stringify(previous.sources.find((item) => item.path === record.path)) !== JSON.stringify(record),
    );
    console.error("Changed CMS inventory source records:", JSON.stringify(mismatches));
    throw Error("Content inventory is stale; regenerate and review");
  }
} else writeFileSync(target, result);
console.log(
  `${routes.length} routes; ${records.length} sources; ${records.reduce((n, s) => n + s.fields.length, 0)} source literals (candidates require editorial mapping)`,
);
