/**
 * Offline tests for the sitemap inventory, URL normalization and XML output.
 *
 *   node --test scripts/sitemap.test.mjs
 *
 * Loads the real modules from src/ through Node's TypeScript type stripping
 * (Node >= 22.18). Database content is replaced by fixtures, so these run
 * without DATABASE_URL.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// Resolve the `@/` alias and extensionless imports inside src/, and load the
// locale JSON files as modules (they are imported without import attributes).
const SRC = new URL("../src/", import.meta.url).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const SRC = ${JSON.stringify(SRC)};
function withExtension(href) {
  if (/\\.(ts|tsx|mjs|js|json)$/.test(href)) return href;
  for (const ext of [".ts", ".tsx", "/index.ts"]) {
    if (existsSync(fileURLToPath(href + ext))) return href + ext;
  }
  return href;
}
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) return next(withExtension(new URL(specifier.slice(2), SRC).href), context);
  if (specifier.startsWith(".") && context.parentURL?.startsWith(SRC)) {
    return next(withExtension(new URL(specifier, context.parentURL).href), context);
  }
  try {
    return await next(specifier, context);
  } catch (err) {
    // Package subpaths without an exports map (next/cache) need the extension under ESM.
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^[@\\w]/.test(specifier) && !/\\.\\w+$/.test(specifier)) {
      return next(specifier + ".js", context);
    }
    throw err;
  }
}
export async function load(url, context, next) {
  if (url.startsWith(SRC) && url.endsWith(".json")) {
    return { format: "module", source: "export default " + (await readFile(new URL(url), "utf8")) + ";", shortCircuit: true };
  }
  return next(url, context);
}
`),
);

const { SITE_ORIGIN, localizedPath, normalizePublicUrl } = await import("../src/lib/public-url.ts");
const xml = await import("../src/lib/sitemap-xml.ts");
const sitemap = await import("../src/lib/sitemap.ts");
const { INDEXABLE_COUNTRIES, INDEXABLE_LOCALES, isIndexable } = await import("../src/lib/constants.ts");
const { getCityBySlug } = await import("../src/lib/cities.ts");
const { buildAlternates, buildCityAlternates } = await import("../src/lib/seo.ts");
const { checkXml, extractEntries, urlProblems } = await import("./validate-sitemaps.mjs");

const SITE = new URL(SITE_ORIGIN);

const post = (slug, category, publishedAt, updatedAt) => ({ slug, category, publishedAt, updatedAt });
const story = (slug, category, publishedAt, updatedAt) => ({ slug, category, publishedAt, updatedAt });

const CONTENT = {
  blogPosts: [
    post("alpha", "seo", "2026-05-01"),
    post("beta", "seo", "2026-06-01", "2026-07-01"),
    post("r&d-ü", "growth", "2026-04-01"),
  ],
  newsPosts: [story("story-1", "ai", "2026-09-20T10:00:00Z")],
};

test("normalizePublicUrl produces exactly one form per page", () => {
  const about = `${SITE_ORIGIN}/in/en/about`;
  for (const pathname of ["about", "/about", "about/", "//about//", "/in/en/about", "in/en/about/", "about?utm=1#top", "./about"]) {
    assert.equal(normalizePublicUrl({ country: "in", locale: "en", pathname }), about, pathname);
  }
  assert.equal(normalizePublicUrl({ country: "IN", locale: "En", pathname: "about" }), about);
  assert.equal(normalizePublicUrl({ country: "in", locale: "en" }), `${SITE_ORIGIN}/in/en`);
  assert.equal(normalizePublicUrl({ country: "in", locale: "en", pathname: "/" }), `${SITE_ORIGIN}/in/en`);
  assert.equal(localizedPath({ country: "de", locale: "de", pathname: "blogs/café-ü" }), "/de/de/blogs/caf%C3%A9-%C3%BC");
  assert.equal(localizedPath({ country: "de", locale: "de", pathname: "blogs/caf%C3%A9" }), "/de/de/blogs/caf%C3%A9");
  assert.equal(localizedPath({ country: "in", locale: "en", pathname: "blogs/r&d" }), "/in/en/blogs/r%26d");
  assert.equal(localizedPath({ country: "in", locale: "en", pathname: "blogs/100%" }), "/in/en/blogs/100%25");
  assert.equal(SITE.protocol, "https:");
  assert.equal(SITE.host, "www.savingroup.in");
});

test("XML output escapes, validates dates and enforces protocol limits", () => {
  const raw = `${SITE_ORIGIN}/in/en/a&b<c>`;
  const out = xml.renderUrlset([
    { loc: raw, lastmod: "2026-07-01" },
    { loc: `${SITE_ORIGIN}/in/en/x`, lastmod: "2026-07-01 10:00:00+00" },
    { loc: `${SITE_ORIGIN}/in/en/y` },
  ]);
  assert.deepEqual(checkXml(out).errors, []);
  assert.match(out, /a&amp;b&lt;c&gt;/);
  assert.equal(checkXml(out).root.attrs.xmlns, xml.SITEMAP_NS);
  const entries = extractEntries(out, "url");
  assert.equal(entries[0].loc, raw);
  assert.equal(entries[0].lastmod, "2026-07-01");
  assert.equal(entries[1].lastmod, undefined, "malformed lastmod is omitted, not emitted");
  assert.equal(entries[2].lastmod, undefined);
  assert.doesNotMatch(out, /changefreq|priority/);

  assert.ok(checkXml("<urlset><url><loc>a&b</loc></url></urlset>").errors.some((e) => e.includes("unescaped")));
  assert.ok(checkXml("<urlset><url></urlset>").errors.length > 0);
  assert.ok(checkXml("<!DOCTYPE html><html></html>").errors.length > 0);

  const tooMany = Array.from({ length: xml.MAX_URLS_PER_SITEMAP + 1 }, (_, i) => ({ loc: `${SITE_ORIGIN}/in/en/p${i}` }));
  assert.throws(() => xml.renderUrlset(tooMany), /protocol limit/);
  assert.equal(checkXml(xml.renderSitemapIndex([{ loc: `${SITE_ORIGIN}/in/sitemap.xml` }])).root.name, "sitemapindex");
});

test("each country sitemap lists only that country's indexable URLs", () => {
  for (const country of INDEXABLE_COUNTRIES) {
    const urls = sitemap.buildCountrySitemap(country, CONTENT);
    const out = xml.renderUrlset(urls);
    assert.deepEqual(checkXml(out).errors, [], country);
    assert.equal(new Set(urls.map((u) => u.loc)).size, urls.length, `${country}: duplicates`);
    for (const { loc, lastmod } of urls) {
      assert.deepEqual(urlProblems(loc, SITE, country), [], loc);
      assert.ok(lastmod === undefined || xml.isW3cDatetime(lastmod), `${loc}: ${lastmod}`);
    }
    const expected = sitemap
      .getIndexableRoutes(CONTENT)
      .reduce((n, r) => n + (r.locales ?? INDEXABLE_LOCALES).filter((l) => isIndexable(country, l)).length, 0);
    assert.equal(urls.length, expected, country);
  }
});

test("dynamic content drives the inventory", () => {
  const byLoc = new Map(sitemap.buildCountrySitemap("ae", CONTENT).map((u) => [u.loc, u.lastmod]));
  const at = (path, locale = "en") => `${SITE_ORIGIN}/ae/${locale}/${path}`;

  for (const locale of INDEXABLE_LOCALES) assert.ok(byLoc.has(at("blogs/alpha", locale)), locale);
  assert.equal(byLoc.get(at("blogs/beta")), "2026-07-01", "updatedAt wins over publishedAt");
  assert.ok(!byLoc.has(at("blogs/r%26d-%C3%BC")), "a slug the blog route cannot serve is left out");
  assert.equal(byLoc.get(at("blogs/category/growth")), "2026-04-01", "…but still counts for the category page that lists it");
  assert.equal(byLoc.get(at("blogs/category/seo")), "2026-07-01", "category lastmod is its newest post");
  assert.ok(!byLoc.has(at("blogs/category/ops")), "empty category is left out");
  assert.equal(byLoc.get(at("newsroom/category/ai")), "2026-09-20");
  assert.ok(!byLoc.has(at("newsroom/category/policy")), "empty desk is left out");
  assert.equal(byLoc.get(at("newsroom/story-1")), "2026-09-20");
  assert.equal(byLoc.get(at("newsroom")), "2026-09-26", "newsroom hub never older than its floor date");
  assert.equal(byLoc.get(at("blogs")), "2026-07-01", "blog hub follows its newest post");
  assert.ok(byLoc.has(at("cities/jaipur/blog/block-print-export-website-playbook")));
  assert.ok(!byLoc.has(at("cities/mumbai/services")), "templated city sub-pages stay out");
  assert.ok(!byLoc.has(at("ind-figures-preview")));

  const withoutAlpha = { ...CONTENT, blogPosts: CONTENT.blogPosts.filter((p) => p.slug !== "alpha") };
  const after = sitemap.buildCountrySitemap("ae", withoutAlpha).map((u) => u.loc);
  assert.ok(!after.includes(at("blogs/alpha")), "a deleted post disappears");

  const first = xml.renderUrlset(sitemap.buildCountrySitemap("in", CONTENT));
  const second = xml.renderUrlset(sitemap.buildCountrySitemap("in", CONTENT));
  assert.equal(first, second, "output is deterministic (no clock-based lastmod)");
});

test("index lists one sitemap per indexable country and nothing else", () => {
  const index = sitemap.buildSitemapIndex(CONTENT);
  assert.deepEqual(index.map((s) => s.loc), INDEXABLE_COUNTRIES.map((c) => `${SITE_ORIGIN}/${c}/sitemap.xml`));
  for (const entry of index) {
    const cc = new URL(entry.loc).pathname.split("/")[1];
    const newest = sitemap.buildCountrySitemap(cc, CONTENT).map((u) => u.lastmod).filter(Boolean).sort().pop();
    assert.equal(entry.lastmod, newest, cc);
  }
  assert.equal(sitemap.isSitemapCountry("in"), true);
  assert.equal(sitemap.isSitemapCountry("IN"), false, "uppercase variants are not served");
  assert.equal(sitemap.isSitemapCountry("cn"), false, "noindex markets get no sitemap");
  assert.equal(sitemap.SITEMAP_INDEX_URL, `${SITE_ORIGIN}/sitemap-index.xml`);
});

test("every sitemap URL is the canonical its page declares, inside its hreflang cluster", () => {
  let checked = 0;
  for (const country of INDEXABLE_COUNTRIES) {
    const locs = new Set(sitemap.buildCountrySitemap(country, CONTENT).map((u) => u.loc));
    for (const route of sitemap.getIndexableRoutes(CONTENT)) {
      for (const locale of route.locales ?? INDEXABLE_LOCALES) {
        const segs = route.path.split("/");
        const alt = segs[0] === "cities" && segs.length > 1
          ? buildCityAlternates({ country, locale, city: getCityBySlug(segs[1]), cityPath: segs.slice(1).join("/") })
          : buildAlternates({ country, locale, subPath: route.path });
        const canonical = SITE_ORIGIN + alt.canonical;
        assert.ok(locs.has(canonical), `${canonical} missing from /${country}/sitemap.xml`);
        assert.equal(alt.languages?.[`${locale}-${country.toUpperCase()}`], canonical, `${canonical} not in its own hreflang cluster`);
        assert.ok(alt.languages?.["x-default"]?.startsWith(`${SITE_ORIGIN}/in/en`));
        checked++;
      }
    }
  }
  assert.ok(checked > 1000, `checked ${checked}`);

  const noindex = buildAlternates({ country: "cn", locale: "en", subPath: "services" });
  assert.deepEqual(noindex, { canonical: "/cn/en/services" }, "noindex pages declare no cluster");
});
