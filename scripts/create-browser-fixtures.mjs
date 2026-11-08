import fs from "node:fs";
import path from "node:path";
const dir = "public/qa";
fs.mkdirSync(dir + "/reference", { recursive: true });
for (const name of fs.readdirSync("."))
  if (/\.(html|css|js)$/.test(name))
    fs.copyFileSync(name, dir + "/reference/" + name);
fs.cpSync("assets", dir + "/reference/assets", { recursive: true });
const widths = [390, 768, 1024, 1280, 1440, 1920];
const routes = [
  "index.html",
  "teknolojiler.html",
  "iletisim.html",
  "haberler.html",
];
for (const route of routes) {
  const frames = widths
    .map(
      (width) =>
        `<section><h2>${route} · ${width}px</h2><div style="display:flex;gap:12px;width:max-content"><iframe title="original-${width}" src="/qa/reference/${route}" width="${width}" height="900"></iframe><iframe title="react-${width}" src="/${route}" width="${width}" height="900"></iframe></div></section>`,
    )
    .join("");
  fs.writeFileSync(
    path.join(dir, route),
    '<!doctype html><html lang="tr"><meta name="robots" content="noindex,nofollow"><title>Migration comparison</title><style>body{margin:0;background:#142235;color:#fff;font:14px system-ui}h2{margin:12px}iframe{border:0;display:block}section{margin-bottom:20px}</style>' +
      frames +
      "</html>",
  );
}
console.log(
  "Created disposable same-origin reference/React comparison frames: 4 page types × 6 CSS viewport widths.",
);
