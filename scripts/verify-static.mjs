import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const code = readFileSync('app.js', 'utf8');
const motion = readFileSync('motion.js', 'utf8');
const pivot = code.indexOf('document.title=');
assert(pivot > 0, 'app.js page-render bootstrap marker was not found.');
const codeBeforeBootstrap = code.slice(0, pivot);
const htmlFiles = readdirSync('.').filter(file => file.endsWith('.html') && file !== '404.html');
assert.equal(htmlFiles.length, 21, 'Expected exactly 21 content page shells.');

function render(page, search = '') {
  const source = codeBeforeBootstrap + '\n({body:(pages[page]||homepage)(),head:header(),foot:footer(),chapters:chapterNavigation()})';
  const context = {
    document: { body: { dataset: { page } } },
    location: { search },
    URL,
    URLSearchParams,
  };
  return runInNewContext(source, context, { timeout: 2000 });
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = html.match(/data-page="([^"]+)"/)?.[1];
  assert(page, file + ': missing data-page.');
  assert(html.includes('name="robots" content="noindex,nofollow"'), file + ': noindex missing.');
  assert(html.includes('assets/favicon.svg'), file + ': favicon missing.');
  assert(html.includes('property="og:title"'), file + ': Open Graph title missing.');
  const { body, head, foot } = render(page);
  assert(body.length > 200, file + ': empty content.');
  assert.equal((body.match(/<h1\b/g) ?? []).length, 1, file + ': expected one h1.');
  assert(head.includes('class="site-header"'), file + ': header missing.');
  assert(foot.includes('class="footer"'), file + ': footer missing.');
  assert.equal((body.match(/<div\b/g) ?? []).length, (body.match(/<\/div>/g) ?? []).length,
    file + ': unbalanced div tags.');
  for (const [, target] of body.matchAll(/href="([a-z0-9-]+\.html)"/g)) {
    assert(existsSync(target), file + ': missing linked page ' + target);
  }
}

const first = render('newsDetail');
const flight = render('flightControlNews');
assert(first.body.includes('Tengri AI ve bağlantılı savunma sistemleri.'));
assert(flight.body.includes('Yapay zekâ ile entegre uçuş kontrolü.'));
const other = render('newsDetail', '?id=flight-controller-announcement');
assert(other.body.includes('Yapay zekâ ile entegre uçuş kontrolü.'));
const attack = '"><img src=x onerror=alert(1)>';
const malicious = render('newsDetail', '?id=' + encodeURIComponent(attack));
assert(malicious.body.includes('İçerik bulunamadı'));
assert(!malicious.body.includes('onerror='));
assert(!malicious.body.includes(attack));

assert(motion.includes('if (home && !reduced.matches && desktopMouse.matches)'),
  'Wheel mode must be restricted to the homepage.');
assert(!motion.includes('smoothWheel('), 'Inner-page custom wheel helper must not return.');

console.log('PASS: 21 page renderers, internal links, metadata, legacy news URLs, XSS query and wheel guard.');
console.log('NOTE: Visual responsive testing, actual screen readers, and browser wheel gestures require real devices.');
