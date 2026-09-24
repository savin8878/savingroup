// Site-wide constants for Savin Group

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
 * Opened to the full resolvable set on 2026-09-09 (previously `["in"]`). Every
 * market the site can render is now indexed, so this deliberately tracks
 * RESOLVABLE_COUNTRIES — adding a country there makes it indexable too.
 *
 * The .in TLD still pins the site to India in Google's eyes, so the non-IN
 * markets depend on the per-country hreflang cluster built in `buildAlternates`
 * (seo.ts) to keep Google from folding them back into /in/.
 */
export const INDEXABLE_COUNTRIES = RESOLVABLE_COUNTRIES;

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
 *
 * Opened to the full resolvable set on 2026-09-09 — every locale the site
 * can render is now indexed, so this tracks RESOLVABLE_LOCALES. The content
 * caveat above still stands as a standing TODO: hi/gu/zh/ar/es/fr/de blog
 * and city bodies are still largely English with only title/subtitle/excerpt
 * localized. Translating those bodies is now the highest-value SEO work.
 */
export const INDEXABLE_LOCALES = RESOLVABLE_LOCALES;

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
 * @deprecated Renamed to isIndexableCountry. Kept as an alias because
 * country-content.ts comments still reference the old name.
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

/* -------------------------------------------------------------------------- */
/*                          Brand + social identity                           */
/* -------------------------------------------------------------------------- */

/**
 * SOCIAL PROFILES — one list, read by the footer icons AND by the
 * `sameAs` array in the Organization JSON-LD (`seo.ts`).
 *
 * WHY IT IS EMPTY. The footer used to render three icons pointing at
 * `https://www.linkedin.com/`, `https://x.com/` and `https://github.com/` —
 * the platforms' own front doors, not profiles. To a visitor checking whether
 * a stranger is real, a "LinkedIn" button that dumps them on LinkedIn's
 * homepage is worse than no button: it reads as a template nobody finished.
 * `seo.ts` had already, correctly, refused to emit those as `sameAs` for the
 * same reason.
 *
 * Both surfaces now render nothing rather than something false, and both come
 * back on the moment a real URL is added here — no other edit needed.
 *
 * TO ENABLE: add the full profile URL, e.g.
 *   { platform: "linkedin", url: "https://www.linkedin.com/company/savin-group" }
 * `platform` must be one of the keys in the footer's icon map.
 */
export const SOCIAL_PROFILES: ReadonlyArray<{
  platform: "linkedin" | "x" | "github" | "instagram" | "youtube";
  url: string;
}> = [];

/**
 * The brand's own name, and the domain it trades under.
 *
 * These differ — the site is Savin Group, the domain is savingroup.in — and
 * nothing on the site acknowledged it, so a visitor who noticed had no way to
 * tell whether they were on the right site. The footer now states the pairing
 * plainly.
 *
 * `legalNote` is deliberately a bare statement of fact about this website. If
 * Savin Group is a unit, brand or subsidiary of a company called Savin Group,
 * say so here — that is a matter of record only the owner can supply, and
 * guessing at a corporate relationship in a footer is how you end up with a
 * misleading disclosure.
 */
export const BRAND = {
  name: "Savin Group",
  domain: "savingroup.in",
  legalNote: "Savin Group is the trading name for this site, savingroup.in.",
} as const;
