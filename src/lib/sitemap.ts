import {
  INDEXABLE_COUNTRIES,
  INDEXABLE_LOCALES,
  STATIC_PAGES,
  isIndexable,
} from "@/lib/constants";
import { BLOG_CATEGORIES, getAllBlogPosts, type BlogPost } from "@/lib/blogs";
import { NEWS_CATEGORY_KEYS, getAllNewsPosts, type NewsPost } from "@/lib/news";
import { INDIA_CITIES, getCityIndexableLocales } from "@/lib/cities";
import { CITY_BLOG_POSTS } from "@/lib/city-blog";
import { INDUSTRY_SLUGS } from "@/lib/industry-data";
import { CITY_LASTMOD, INDUSTRY_LASTMOD, STATIC_PAGE_LASTMOD } from "@/lib/sitemap-lastmod";
import { SITE_ORIGIN, normalizePublicUrl } from "@/lib/public-url";
import type { SitemapEntry } from "@/lib/sitemap-xml";

/**
 * Sitemap architecture:
 *
 *   /sitemap-index.xml        one <sitemap> per INDEXABLE_COUNTRIES entry
 *   /{country}/sitemap.xml    every indexable URL under /{country}/, all locales
 *
 * Countries and locales come from `constants.ts`, the same sets that decide
 * each page's robots directive, so a URL is listed here exactly when the page
 * it points at says `index, follow`. That is every ISO country; only the
 * HREFLANG_COUNTRIES markets also carry an hreflang cluster.
 *
 * If a country ever nears MAX_URLS_PER_SITEMAP, keep /{country}/sitemap.xml as
 * a sitemap index over per-section children built from the `section` field.
 */

export type SitemapCountry = (typeof INDEXABLE_COUNTRIES)[number];

export const SITEMAP_COUNTRIES: readonly SitemapCountry[] = INDEXABLE_COUNTRIES;

export function isSitemapCountry(code: string): code is SitemapCountry {
  return (SITEMAP_COUNTRIES as readonly string[]).includes(code);
}

export const SITEMAP_INDEX_URL = `${SITE_ORIGIN}/sitemap-index.xml`;

export function countrySitemapUrl(country: SitemapCountry): string {
  return `${SITE_ORIGIN}/${country}/sitemap.xml`;
}

/** Database-backed content. Everything else in the inventory is in the repo. */
export interface SitemapContent {
  blogPosts: readonly BlogPost[];
  newsPosts: readonly NewsPost[];
}

/**
 * Build the sitemap data once per process and reuse it across every country
 * route. Each country route does not need to re-hit the blog/news tables, and
 * doing so in a large static build can make the route exceed Next's 60s
 * worker timeout.
 */
let sitemapContentPromise: Promise<SitemapContent> | undefined;

export async function loadSitemapContent(): Promise<SitemapContent> {
  sitemapContentPromise ??= (async () => {
    const [blogPosts, newsPosts] = await Promise.all([getAllBlogPosts(), getAllNewsPosts()]);
    return { blogPosts, newsPosts };
  })();

  return sitemapContentPromise;
}

/** One indexable page, before it is multiplied out across locales. */
export interface IndexableRoute {
  section: "pages" | "industries" | "cities" | "blog" | "newsroom";
  /** Path after `/{country}/{locale}`. */
  path: string;
  lastmod?: string;
  /** Locales this page is indexable in. Defaults to every indexable locale. */
  locales?: readonly string[];
}

function newest(dates: ReadonlyArray<string | undefined>): string | undefined {
  return dates.filter((d): d is string => !!d).sort().pop();
}

const blogDate = (p: BlogPost) => p.updatedAt ?? p.publishedAt;
const newsDate = (p: NewsPost) => (p.updatedAt ?? p.publishedAt).slice(0, 10);

// The blog and newsroom routes compare the raw path segment with the stored
// slug, so a slug with reserved or non-ASCII characters is unreachable (404)
// even though its canonical URL encodes correctly. The publisher's slugify
// only emits [a-z0-9-]; such a slug can only come from a hand-edited row.
const SERVABLE_SLUG = /^[A-Za-z0-9_-]+$/;
const warnedSlugs = new Set<string>();

function servable<T extends { slug: string }>(items: readonly T[], kind: string): T[] {
  return items.filter(({ slug }) => {
    if (SERVABLE_SLUG.test(slug)) return true;
    if (!warnedSlugs.has(slug)) {
      warnedSlugs.add(slug);
      console.warn(`[sitemap] Leaving out ${kind} "${slug}": the route cannot serve that slug.`);
    }
    return false;
  });
}

export function getIndexableRoutes({ blogPosts, newsPosts }: SitemapContent): IndexableRoute[] {
  const newestBlog = newest(blogPosts.map(blogDate));
  const newestNews = newest(newsPosts.map(newsDate));

  // Static pages plus the blog, newsroom and cities hubs. The hubs list
  // content, so their lastmod follows the newest item they show. The cities
  // hub is emitted for every country on purpose: it lists the Indian metros in
  // every market because delivery is remote.
  const pages: IndexableRoute[] = [...STATIC_PAGES, "blogs", "newsroom", "cities"].map((path) => ({
    section: "pages",
    path,
    lastmod:
      path === "blogs"
        ? newest([STATIC_PAGE_LASTMOD.blogs, newestBlog])
        : path === "newsroom"
          ? newest([STATIC_PAGE_LASTMOD.newsroom, newestNews])
          : STATIC_PAGE_LASTMOD[path],
  }));

  const industries: IndexableRoute[] = INDUSTRY_SLUGS.map((slug) => ({
    section: "industries",
    path: `industries/${slug}`,
    lastmod: INDUSTRY_LASTMOD,
  }));

  // City overview pages only. The six city sub-pages (services, process,
  // case-studies, contact, about, blog index) are templated near-duplicates
  // and were pruned on 2026-06-14 to concentrate crawl budget on a young
  // domain. They still render and stay indexable; re-add one here once its
  // template carries genuinely unique per-city content.
  //
  // City blog POSTS are listed: they are the most locally specific long-form
  // pages on the site.
  const cities: IndexableRoute[] = INDIA_CITIES.flatMap((city) => {
    const locales = getCityIndexableLocales(city);
    return [
      { section: "cities" as const, path: `cities/${city.slug}`, lastmod: CITY_LASTMOD, locales },
      ...(CITY_BLOG_POSTS[city.slug] ?? []).map((post) => ({
        section: "cities" as const,
        path: `cities/${city.slug}/blog/${post.slug}`,
        lastmod: post.publishedAt,
        locales,
      })),
    ];
  });

  // Category and desk pages are listed only while they have something on
  // them; the site's own navigation hides empty ones for the same reason.
  const blogCategories: IndexableRoute[] = BLOG_CATEGORIES.flatMap(({ key }) => {
    if (key === "all") return [];
    const posts = blogPosts.filter((p) => p.category === key);
    return posts.length
      ? [{ section: "blog" as const, path: `blogs/category/${key}`, lastmod: newest(posts.map(blogDate)) }]
      : [];
  });

  const blog: IndexableRoute[] = servable(blogPosts, "blog post").map((post) => ({
    section: "blog",
    path: `blogs/${post.slug}`,
    lastmod: blogDate(post),
  }));

  const newsDesks: IndexableRoute[] = NEWS_CATEGORY_KEYS.flatMap((desk) => {
    const stories = newsPosts.filter((p) => p.category === desk);
    return stories.length
      ? [{ section: "newsroom" as const, path: `newsroom/category/${desk}`, lastmod: newest(stories.map(newsDate)) }]
      : [];
  });

  const news: IndexableRoute[] = servable(newsPosts, "news story").map((post) => ({
    section: "newsroom",
    path: `newsroom/${post.slug}`,
    lastmod: newsDate(post),
  }));

  return [...pages, ...industries, ...cities, ...blogCategories, ...blog, ...newsDesks, ...news];
}

/** Every indexable URL under /{country}/, deduplicated, in inventory order. */
export function buildCountrySitemap(country: SitemapCountry, content: SitemapContent): SitemapEntry[] {
  const seen = new Set<string>();
  const urls: SitemapEntry[] = [];
  for (const route of getIndexableRoutes(content)) {
    for (const locale of route.locales ?? INDEXABLE_LOCALES) {
      if (!isIndexable(country, locale)) continue;
      const loc = normalizePublicUrl({ country, locale, pathname: route.path });
      if (seen.has(loc)) continue;
      seen.add(loc);
      urls.push({ loc, lastmod: route.lastmod });
    }
  }
  return urls;
}

/** Index entries; each lastmod is the newest lastmod inside that child sitemap. */
export function buildSitemapIndex(content: SitemapContent): SitemapEntry[] {
  return SITEMAP_COUNTRIES.map((country) => ({
    loc: countrySitemapUrl(country),
    lastmod: newest(buildCountrySitemap(country, content).map((u) => u.lastmod)),
  }));
}
