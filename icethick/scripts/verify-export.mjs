import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('out');
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const meta = (html, key) => html.match(new RegExp(`<meta[^>]*(?:property|name)="${key}"[^>]*content="([^"]*)"`))?.[1];
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(decode(match[1])));
assert.ok(urls.length > 0, 'Sitemap is empty');
assert.equal(new Set(urls.map((url) => url.href)).size, urls.length, 'Duplicate sitemap URLs');
const origin = urls[0].origin;
const production = process.argv.includes('--production');
if (production) {
  assert.equal(new URL(origin).protocol, 'https:', 'Production canonical origin must use HTTPS');
  assert.ok(!['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Production cannot use local canonical URLs');
}
const robots = await readFile(join(root, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'Robots and sitemap origins differ');
assert.ok(robots.includes('Disallow: /api/'), 'Robots must exclude API crawling');

const paths = new Set(urls.map((url) => url.pathname));
const expectedPages = [];
async function findPages(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['_next', '_not-found', '404'].includes(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await findPages(file);
    else if (entry.name === 'index.html' && !file.startsWith(join(root, '404'))) expectedPages.push(file);
  }
}
await findPages(root);
assert.equal(expectedPages.length, urls.length, 'Exported public pages and sitemap count differ');

for (const url of urls) {
  assert.equal(url.origin, origin, 'Sitemap has mixed origins');
  assert.equal(url.search, '', 'Sitemap must not contain query-string map views');
  const file = join(root, decodeURIComponent(url.pathname), 'index.html');
  const html = await readFile(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(decode(canonical || ''), url.href, `${url.pathname}: canonical mismatch`);
  assert.equal(decode(meta(html, 'og:url') || ''), url.href, `${url.pathname}: Open Graph URL mismatch`);
  assert.ok(!/name="robots" content="[^"]*noindex/.test(html), `${url.pathname}: public page is noindex`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${url.pathname}: expected one H1`);
  assert.ok(html.includes('application/ld+json'), `${url.pathname}: missing structured data`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((schema) => schema['@type'] === 'WebSite'), `${url.pathname}: missing valid WebSite schema`);
  if (['/resources/', '/community-ice-reports/', '/report-poor-ice-conditions/'].includes(url.pathname)) {
    const breadcrumbs = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumbs, `${url.pathname}: missing breadcrumbs schema`);
    assert.equal(breadcrumbs.itemListElement.at(-1).item, url.href, `${url.pathname}: breadcrumb URL mismatch`);
  }
  if (url.pathname !== '/') {
    assert.equal(meta(html, 'og:title'), html.match(/<title>(.*?)<\/title>/)?.[1], `${url.pathname}: share title mismatch`);
    assert.equal(meta(html, 'og:description'), meta(html, 'description'), `${url.pathname}: share description mismatch`);
  }
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const linked = new URL(href, url);
    if (linked.pathname.startsWith('/api/')) continue;
    if (linked.pathname.endsWith('/')) {
      assert.ok(paths.has(linked.pathname), `${url.pathname}: broken internal page ${href}`);
    } else {
      const target = join(root, decodeURIComponent(linked.pathname));
      const exists = await stat(target).then(() => true, (error) => {
        if (error.code === 'ENOENT') return false;
        throw error;
      });
      assert.ok(exists, `${url.pathname}: missing linked asset/page ${href}`);
    }
  }
}

const notFound = await readFile(join(root, '404.html'), 'utf8');
assert.ok(/name="robots" content="[^"]*noindex/.test(notFound), '404 must be noindex');
assert.ok(notFound.includes('404 Page Not Found'), '404 content is missing');
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'));
assert.equal(config.responseOverrides['404'].rewrite, '/404.html');
if (process.env.ICE_RELAY_PREVIEW === 'true') {
  assert.equal(config.globalHeaders['x-robots-tag'], 'noindex, nofollow', 'Preview responses must be noindex');
} else if (production) {
  assert.ok(!config.globalHeaders['x-robots-tag']?.includes('noindex'), 'Production headers must not block indexing');
}
assert.ok(!config.navigationFallback, 'SPA fallback would hide real 404s');
assert.equal(config.globalHeaders['x-content-type-options'], 'nosniff');
assert.equal(config.globalHeaders['x-frame-options'], 'DENY');
assert.ok(config.globalHeaders['permissions-policy'].includes('geolocation=(self)'));
const csp = config.globalHeaders['content-security-policy'];
assert.ok(!csp.includes("'unsafe-eval'"), 'Production CSP must not allow eval');
assert.ok(csp.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'"));
assert.ok(!csp.includes(' https: '), 'CSP must not allow every HTTPS origin');
await stat(join(root, 'pin-marker.svg'));
console.log(`Verified ${urls.length} public pages, sitemap/robots, internal links, sharing metadata, 404, map marker, and security header configuration.`);
