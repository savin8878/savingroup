// Site-wide constants for Sanat Dynamo

export const BASE_URL = "https://www.savingroup.in";

/* -------------------------------------------------------------------------- */
/*                  Resolvable vs Indexable — the core split                  */
/* -------------------------------------------------------------------------- */

/**
 * Countries the site can RESOLVE URLs for. A visitor hitting `/us/en/about`
 * still gets a rendered page, country-aware metadata, and country-specific
 * content blocks from `country-content.ts`. Resolvable ≠ indexable: most of
 * these ship `noindex` until we earn local authority in those markets.
 *
 * Tiers (see `country-content.ts` for content depth):
 *   T1 — deep hand-written content: in, us, gb, ae
 *   T2 — templated + market-specific bullets: ca, au, sg, de
 *   T3 — lighter localization:       fr, es, nl, sa
 */
export const RESOLVABLE_COUNTRIES = [
  "in", "us", "gb", "ae",
  "ca", "au", "sg", "de",
  "fr", "es", "nl", "sa",
] as const;

/**
 * Countries we want Google to actually INDEX. Every country here gets:
 *   - an entry in the sitemap index
 *   - a per-country sitemap.xml
 *   - `index,follow` robots metadata on every page
 *
 * The .in TLD pins this site to India in Google's eyes. Until we move TLD
 * or build serious local authority + backlinks per country, expanding this
 * list just creates duplicates Google folds back to /in/. We re-add countries
 * one at a time as we earn local case studies and local backlinks.
 */
export const INDEXABLE_COUNTRIES = ["in"] as const;

/**
 * Locales the site can RESOLVE. Adding a new language = add it here AND in
 * `i18n.ts` (LOCALES record) AND in `middleware.ts` (validLocales).
 */
export const RESOLVABLE_LOCALES = [
  "en", "es", "fr", "de", "ar", "hi", "zh", "gu",
] as const;

/**
 * Locales we want Google to actually INDEX. Other locales resolve but ship
 * `noindex` so Google doesn't fold near-duplicate translation fallbacks
 * back into the canonical English pages.
 *
 * Currently EN-only. `hi` was demoted on 2026-05-09 because blog post bodies
 * (`sections`, `takeaways`, `faq` in [src/lib/blogs.ts](src/lib/blogs.ts))
 * are English-only — `localizePost` only swaps title/subtitle/excerpt, so
 * /in/hi/blogs/* shipped Hindi titles + ~2000 words of English body, which
 * Google reads as either a near-duplicate of /in/en or a low-quality
 * machine-translation fallback. Re-add `hi` per locale once real Hindi
 * bodies exist (start with the manufacturing pillar). `gu` gets promoted
 * here once the Ahmedabad pillar pages have hand-written GU content.
 */
export const INDEXABLE_LOCALES = ["en"] as const;

/* -------------------------------------------------------------------------- */
/*                       Backwards-compat aliases                             */
/* -------------------------------------------------------------------------- */

/** @deprecated Use RESOLVABLE_COUNTRIES (URL works) or INDEXABLE_COUNTRIES (in sitemap). */
export const TARGET_COUNTRIES = RESOLVABLE_COUNTRIES;
export type TargetCountry = (typeof RESOLVABLE_COUNTRIES)[number];

/** Alias used by sitemap routes — equivalent to INDEXABLE_LOCALES. */
export const LANGUAGES = INDEXABLE_LOCALES;

/** Alias used by sitemap-index — equivalent to INDEXABLE_COUNTRIES. */
export const COUNTRIES = INDEXABLE_COUNTRIES;

/* -------------------------------------------------------------------------- */
/*                              Type guards                                   */
/* -------------------------------------------------------------------------- */

/**
 * Is this country/locale combo something we want indexed by Google?
 * Used by layout + seo.ts to decide robots index/noindex flags.
 */
export function isIndexableCountry(
  code: string,
): code is (typeof INDEXABLE_COUNTRIES)[number] {
  return (INDEXABLE_COUNTRIES as readonly string[]).includes(code.toLowerCase());
}

export function isIndexableLocale(
  code: string,
): code is (typeof INDEXABLE_LOCALES)[number] {
  return (INDEXABLE_LOCALES as readonly string[]).includes(code.toLowerCase());
}

/**
 * Combined check — index only when BOTH country and locale are indexable.
 * A page at /us/en/* is noindex (US not indexable) even though en is.
 * A page at /in/zh/* is noindex (zh not indexable) even though in is.
 */
export function isIndexable(country: string, locale: string): boolean {
  return isIndexableCountry(country) && isIndexableLocale(locale);
}

/** Resolvable check — does this country render at all? */
export function isResolvableCountry(
  code: string,
): code is TargetCountry {
  return (RESOLVABLE_COUNTRIES as readonly string[]).includes(code.toLowerCase());
}

/**
 * @deprecated Renamed to isIndexableCountry. Kept as alias because
 * country-content.ts comments reference the old name. Behavior changed:
 * previously checked all 12 markets, now only `in`.
 */
export const isTargetCountry = isIndexableCountry;

/* -------------------------------------------------------------------------- */
/*                              Page registry                                 */
/* -------------------------------------------------------------------------- */

export const STATIC_PAGES = [
  "",
  "services",
  "industries",
  "pricing",
  "case-studies",
  "about",
  "contact",
  "privacy",
  "terms",
];

export const URLS_PER_SITEMAP = 50000;
