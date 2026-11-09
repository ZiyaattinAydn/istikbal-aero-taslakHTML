import fs from "node:fs";
import path from "node:path";
const dir = "public/qa";
fs.mkdirSync(dir + "/reference", { recursive: true });
for (const name of fs.readdirSync("."))
  if (/\.(html|css|js)$/.test(name))
    fs.copyFileSync(name, dir + "/reference/" + name);
fs.cpSync("assets", dir + "/reference/assets", { recursive: true });
const widths = [390, 768, 1024, 1280, 1440, 1920];
const routes = ["index.html", "platformlar.html", "teknolojiler.html", "haberler.html", "iletisim.html"];
const head = '<!doctype html><html lang="tr"><meta name="robots" content="noindex,nofollow"><title>Migration comparison</title>';
function pair(route, width, height) {
  return `<section><h2>${route} · ${width} × ${height} CSS px</h2><div style="display:flex;gap:8px;width:max-content"><iframe title="legacy" src="/qa/reference/${route}" width="${width}" height="${height}"></iframe><iframe title="react" src="/${route}" width="${width}" height="${height}"></iframe></div></section>`;
}
for (const route of routes) {
  const slug = route.replace(/\.html$/, "");
  fs.writeFileSync(path.join(dir, route), head +
    '<style>body{margin:0;background:#142235;color:#fff;font:14px system-ui}h2{margin:12px}iframe{border:0;display:block}section{margin-bottom:20px}</style>' +
    widths.map(width => pair(route, width, 900)).join("") + "</html>");
  for (const width of widths) for (const height of [600, 900]) {
    fs.writeFileSync(path.join(dir, `${slug}-${width}-${height}.html`), head +
      '<style>body{margin:0;background:#142235;color:#fff;font:14px system-ui}iframe{border:0;display:block}</style>' +
      pair(route, width, height) + "</html>");
  }
  fs.writeFileSync(path.join(dir, `compare-${slug}.html`), head +
    '<style>body{margin:20px;background:#142235;color:#fff;font:14px sans-serif}main{display:flex;gap:16px}.frame{width:648px;height:405px}iframe{border:0;width:1440px;height:900px;transform:scale(.45);transform-origin:top left}h2{font-size:15px}</style>' +
    `<h1>${slug} · 1440 × 900 CSS px</h1><main><section><h2>Eski HTML</h2><div class="frame"><iframe title="legacy" src="/qa/reference/${route}"></iframe></div></section><section><h2>Next.js / React</h2><div class="frame"><iframe title="react" src="/${route}"></iframe></div></section></main></html>`);
}
console.log("Created disposable reference/React fixtures: 5 page types × 6 widths × 2 heights, plus desktop comparisons.");
