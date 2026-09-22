/**
 * Shared `lastmod` dates for the sitemaps.
 *
 * These live here rather than inside the route handler so that
 * `/sitemap-index.xml` and `/{country}/sitemap.xml` cannot disagree. The
 * index previously derived its `lastmod` from blog dates alone, which made it
 * report the whole country sitemap as ~4 weeks staler than its own newest
 * entries.
 *
 * Bump a value by hand when the corresponding content meaningfully changes.
 * Deliberately NOT `new Date()`: a lastmod that moves on every render is a
 * freshness signal Google learns to discount.
 *
 * Format: ISO date (YYYY-MM-DD).
 */

export const STATIC_PAGE_LASTMOD: Record<string, string> = {
  "": "2026-04-15", // home
  services: "2026-04-10",
  industries: "2026-05-07",
  pricing: "2026-06-18",
  "case-studies": "2026-04-12",
  about: "2026-03-20",
  contact: "2026-03-20",
  privacy: "2026-01-15",
  terms: "2026-01-15",
  blogs: "2026-04-18", // index bumped when new posts land
  cities: "2026-05-11", // city hub — bumped on each new metro or template shift
};

/**
 * Per-city `lastmod`. Bumped 2026-05-11 with the city sub-page cluster
 * (services / process / case-studies / contact / about / blog) and the
 * refreshed mobile carousels across all city templates.
 */
export const CITY_LASTMOD = "2026-05-11";

/** Per-industry-slug `lastmod`. Bump when that industry page's content changes. */
export const INDUSTRY_LASTMOD = "2026-05-07";
