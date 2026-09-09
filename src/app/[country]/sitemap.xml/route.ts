import {
  STATIC_PAGES,
  BASE_URL,
  LANGUAGES,
  INDEXABLE_COUNTRIES,
} from "@/lib/constants";
import { NextResponse } from "next/server";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blogs";
import { INDIA_CITIES, getCityIndexableLocales } from "@/lib/cities";
import { INDUSTRY_SLUGS } from "@/lib/industry-data";

// Revalidate at most once per day — Googlebot doesn't need minute-fresh sitemaps,
// and the previous `force-dynamic` was regenerating with a new `lastmod` on every
// crawl, which Google downweights as an unreliable freshness signal.
export const revalidate = 86400;

/**
 * Static timestamps for page-type `lastmod` values. These are bumped manually
 * when the content of the corresponding page meaningfully changes. Previously
 * every page got `new Date()` on every request, which Google flags as spam.
 *
 * Format: ISO date (YYYY-MM-DD).
 */
const STATIC_PAGE_LASTMOD: Record<string, string> = {
  "": "2026-04-15",           // home
  services: "2026-04-10",
  industries: "2026-05-07",
  pricing: "2026-06-18",
  "case-studies": "2026-04-12",
  about: "2026-03-20",
  contact: "2026-03-20",
  privacy: "2026-01-15",
  terms: "2026-01-15",
  blogs: "2026-04-18",         // index bumped when new posts land
  cities: "2026-05-11",        // city hub — bumped on each new metro added or city template shift
};

/**
 * Per-city `lastmod`. Bump when the city's content meaningfully changes.
 * Bumped 2026-05-11 with the introduction of the city sub-page cluster
 * (services / process / case-studies / contact / about / blog) and refreshed
 * mobile carousels across all city templates.
 */
const CITY_LASTMOD_DEFAULT = "2026-05-11";

/** Per-industry-slug `lastmod`. Bump when content of that industry page changes. */
const INDUSTRY_LASTMOD_DEFAULT = "2026-05-07";
const INDUSTRY_PAGE_PRIORITY = 0.85;
/** Industry pages are sitemap-included only for indexable locales. After the
 * 2026-05-09 hi demotion this is en-only — industries don't have Hindi bodies
 * yet, and including /in/hi/industries/* in the sitemap would re-create the
 * fake-Hindi duplicate problem we just fixed. Re-add "hi" only when each
 * industry page has a real Hindi body (mirror the per-city pattern). */
const INDUSTRY_SITEMAP_LOCALES: readonly string[] = LANGUAGES;

/** City-page sitemap locales are now decided per-city via
 * `getCityIndexableLocales(city)` so Ahmedabad (which has a real Hindi body)
 * can include /in/hi/cities/ahmedabad while the other 9 cities stay en-only. */

/**
 * Resolve the public base URL from the incoming request.
 * Reads `x-forwarded-host`/`host` + `x-forwarded-proto` so that the sitemap's
 * <loc> URLs always match the host the sitemap was served from.
 *
 * Google rejects sitemaps containing cross-domain URLs ("General HTTP error").
 */
function resolveBaseUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");
  if (!host) return BASE_URL;

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}

/** SEO priority per page type — homepage highest, legal pages lowest */
const PAGE_PRIORITY: Record<string, number> = {
  "": 1.0,
  services: 0.9,
  industries: 0.9,
  pricing: 0.85,
  "case-studies": 0.8,
  about: 0.7,
  contact: 0.8,
  blogs: 0.9,
  privacy: 0.2,
  terms: 0.2,
  cities: 0.85,
};

const CITY_PAGE_PRIORITY = 0.85;

const PAGE_CHANGEFREQ: Record<string, string> = {
  "": "weekly",
  services: "monthly",
  industries: "monthly",
  pricing: "monthly",
  "case-studies": "weekly",
  about: "monthly",
  contact: "monthly",
  blogs: "weekly",
  privacy: "yearly",
  terms: "yearly",
  cities: "monthly",
};

const BLOG_POST_PRIORITY = 0.7;
const BLOG_CATEGORY_PRIORITY = 0.75;
const BLOG_CHANGEFREQ = "monthly";



export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;

  // Only INDEXABLE markets ship a sitemap. Non-indexable country URLs still
  // resolve and render (with `noindex`), but they don't get a sitemap so
  // Google doesn't waste crawl budget chasing variants we don't want indexed.
  if (
    !(INDEXABLE_COUNTRIES as readonly string[]).includes(country.toLowerCase())
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const base = resolveBaseUrl(request);

  // Latest blog publication date — used as category-page `lastmod` so category
  // freshness actually tracks when new posts land, not when the sitemap renders.
  const latestBlogDate =
    BLOG_POSTS.map((p) => p.updatedAt ?? p.publishedAt)
      .sort()
      .pop() ?? "2026-01-01";

  // Static pages (home, services, industries, case-studies, about, contact, legal)
  // plus the blog index and the cities hub. Cities hub is India-only, so we
  // append it later only inside the IN block.
  const pagesWithBlogIndex = [
    ...STATIC_PAGES,
    "blogs",
    "cities",
  ];

  const staticUrls = LANGUAGES.flatMap((locale) =>
    pagesWithBlogIndex.map((page) => {
      const loc =
        page === ""
          ? `${base}/${country}/${locale}`
          : `${base}/${country}/${locale}/${page}`;


      return {
        loc,
        lastmod: STATIC_PAGE_LASTMOD[page] ?? "2026-01-01",
        priority: PAGE_PRIORITY[page] ?? 0.5,
        changefreq: PAGE_CHANGEFREQ[page] ?? "monthly",
      };
    })
  );

  // Individual blog posts — indexed per locale with hreflang alternates
  const blogPostUrls = LANGUAGES.flatMap((locale) =>
    BLOG_POSTS.map((post) => {
      const loc = `${base}/${country}/${locale}/blogs/${post.slug}`;
      return {
        loc,
        lastmod: post.updatedAt ?? post.publishedAt,
        priority: BLOG_POST_PRIORITY,
        changefreq: BLOG_CHANGEFREQ,
      };
    })
  );

  // Blog category pages
  const categoryKeys = BLOG_CATEGORIES
    .filter((c) => c.key !== "all")
    .map((c) => c.key);
  const blogCategoryUrls = LANGUAGES.flatMap((locale) =>
    categoryKeys.map((catKey) => {
      const loc = `${base}/${country}/${locale}/blogs/category/${catKey}`;
      return {
        loc,
        lastmod: latestBlogDate,
        priority: BLOG_CATEGORY_PRIORITY,
        changefreq: BLOG_CHANGEFREQ,
      };
    })
  );

  // Per-industry URLs — emitted for every indexable country × en+hi locale.
  // Each /industries/[slug] is a standalone page with its own canonical,
  // service JSON-LD, and FAQPage JSON-LD. Hreflang alternates pin the cluster
  // to /in/{en|hi} so Google doesn't fold them into the country-less canonical.
  const industryUrls = INDUSTRY_SLUGS.flatMap((slug) =>
    INDUSTRY_SITEMAP_LOCALES.map((sitemapLocale) => {
      const loc = `${base}/${country}/${sitemapLocale}/industries/${slug}`;
      return {
        loc,
        lastmod: INDUSTRY_LASTMOD_DEFAULT,
        priority: INDUSTRY_PAGE_PRIORITY,
        changefreq: "monthly",
      };
    })
  );

  // Per-city URLs — India only. Sitemap locales are now decided per-city via
  // `getCityIndexableLocales(city)`. So Ahmedabad (which has Hindi body) emits
  // BOTH /in/en/cities/ahmedabad AND /in/hi/cities/ahmedabad, while the other
  // 9 cities only emit /in/en/. Hreflang alternates mirror the same per-city
  // set so the cluster declared in the sitemap matches what each page
  // actually advertises in its <link rel="alternate"> tags.
  //
  // Each city now has 7 indexable URL types per indexable locale:
  //   - /cities/{slug}                 (overview — priority 0.85)
  //   - /cities/{slug}/services        (priority 0.80)
  //   - /cities/{slug}/process         (priority 0.75)
  //   - /cities/{slug}/case-studies    (priority 0.80)
  //   - /cities/{slug}/contact         (priority 0.70)
  //   - /cities/{slug}/about           (priority 0.70)
  //   - /cities/{slug}/blog            (priority 0.65)
  // Each path emits hreflang alternates for the same per-city locale set.
  // Each sub-path declares which locales it's indexable for. Only the main
  // page ("") follows per-city Hindi via getCityIndexableLocales — sub-pages
  // stay EN-only until their templates have real Hindi bodies (the new
  // services/process/case-studies/contact pages introduce fresh English
  // copy that localizeCity doesn't yet translate).
  // CRAWL-BUDGET PRUNE (2026-06-14): on a new, low-authority .in domain,
  // submitting 11 cities × 7 templated page types = 77 near-duplicate URLs
  // diluted Google's tiny index budget — it parked nearly all of them as
  // "Crawled – currently not indexed" and indexed only a handful of pages
  // site-wide. We now submit ONLY the city overview page. The 6 sub-pages
  // (services/process/case-studies/contact/about/blog) still resolve and
  // render for users and direct/AI traffic — they're just no longer begged
  // into the index while they're templated.
  //
  // RE-ADD a sub-path here the moment that template carries genuinely unique,
  // hand-written, per-city content (a real local case study, named local
  // clients, etc.). Until then, more URLs = slower indexing of the good pages.
  const CITY_SUB_PAGES: {
    path: string;
    priority: number;
    /** Sitemap locales for this sub-path. "city-aware" defers to getCityIndexableLocales(city). */
    locales: ReadonlyArray<string> | "city-aware";
  }[] = [
    { path: "", priority: CITY_PAGE_PRIORITY, locales: "city-aware" },
    // --- Pruned 2026-06-14 to concentrate crawl budget. Re-add per-path only
    //     once the page has unique per-city content (see note above). ---
    // { path: "services", priority: 0.8, locales: ["en"] },
    // { path: "process", priority: 0.75, locales: ["en"] },
    // { path: "case-studies", priority: 0.8, locales: ["en"] },
    // { path: "contact", priority: 0.7, locales: ["en"] },
    // { path: "about", priority: 0.7, locales: ["en"] },
    // { path: "blog", priority: 0.65, locales: ["en"] },
  ];

  const cityUrls = INDIA_CITIES.flatMap((city) => {
        const cityLocales = getCityIndexableLocales(city);
        return CITY_SUB_PAGES.flatMap(({ path, priority, locales }) => {
          const pageLocales =
            locales === "city-aware" ? cityLocales : locales;
          return pageLocales.map((sitemapLocale) => {
            const segment = path === "" ? "" : `/${path}`;
            const loc = `${base}/${country}/${sitemapLocale}/cities/${city.slug}${segment}`;
            return {
              loc,
              lastmod: CITY_LASTMOD_DEFAULT,
              priority,
              changefreq: "monthly",
            };
          });
        });
  });

  const urls = [
    ...staticUrls,
    ...industryUrls,
    ...cityUrls,
    ...blogCategoryUrls,
    ...blogPostUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
