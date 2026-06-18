import type { Metadata } from "next";
import {
  getTranslation,
  LOCALE_CODES,
  LOCALES,
  type Locale,
  type Messages,
} from "@/lib/i18n";
import {
  BASE_URL,
  INDEXABLE_LOCALES,
  isIndexable,
} from "@/lib/constants";
import { validCountryISOs } from "@/middleware";
import { getGeo, formatLocation, formatLocationShort, type GeoInfo } from "@/lib/geo";
import {
  getCityIndexableLocales,
  isCityIndexable,
  type CityContent,
} from "@/lib/cities";

/* -------------------------------------------------------------------------- */
/*                Hreflang / canonical helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * The shape Next.js wants under `metadata.alternates`. We always ship
 * `canonical` (self-referencing for indexable pages, self-referencing for
 * noindex pages too — the noindex header tells Google not to index, but the
 * canonical still tells Google "this URL is the URL for this content").
 *
 * `languages` is omitted entirely for noindex pages. Per Google's i18n docs,
 * pages marked `noindex` cannot be members of an hreflang cluster, so emitting
 * cluster info from them is wasted bytes and creates the appearance of a
 * one-page cluster from every locale variant — which Google then discards.
 */
type AlternatesShape = {
  canonical: string;
  languages?: Record<string, string>;
};

/**
 * Standard hreflang + canonical for pages whose indexable surface is the
 * site-wide one (INDEXABLE_COUNTRIES × INDEXABLE_LOCALES).
 *
 * - When the requested URL is INDEXABLE: emit a self-canonical and a
 *   languages map listing each indexable locale variant of THIS page,
 *   keyed by the locale's `hreflang` (region-tagged where applicable),
 *   plus an `x-default` pointing at the EN variant.
 * - When the requested URL is NOINDEX (e.g. /us/en/services or /in/zh/...):
 *   emit a self-canonical and OMIT the languages map. The page is not a
 *   cluster member — including hreflangs from it would have Google try to
 *   form a cluster keyed off a noindex page, which it then discards.
 *
 * `subPath` is the part AFTER `/in/{locale}/` — pass `""` for the homepage,
 * `"services"` for the services page, `"industries/manufacturing"` for an
 * industry slug, etc. Leading/trailing slashes are stripped.
 */
export function buildAlternates({
  country,
  locale,
  subPath,
}: {
  country: string;
  locale: string;
  subPath: string;
}): AlternatesShape {
  const cleanSub = subPath.replace(/^\/+|\/+$/g, "");
  const subSegment = cleanSub ? `/${cleanSub}` : "";
  const canonical = `/${country}/${locale}${subSegment}`;

  if (!isIndexable(country, locale)) {
    return { canonical };
  }

  const languages: Record<string, string> = {};
  for (const lang of INDEXABLE_LOCALES) {
    languages[LOCALES[lang].hreflang] =
      `${BASE_URL}/in/${lang}${subSegment}`;
  }
  languages["x-default"] = `${BASE_URL}/in/en${subSegment}`;

  return { canonical, languages };
}

/**
 * Hreflang + canonical for city-anchored pages (`/in/{locale}/cities/{slug}`
 * and its sub-routes). Indexability is per-CITY here — a city with a
 * complete Hindi body emits `hi-IN` alongside `en-IN`, while every other
 * city only emits `en-IN`. See `getCityIndexableLocales` in lib/cities.ts.
 *
 * `cityPath` is everything after `cities/` — e.g. `mumbai`, `mumbai/about`,
 * `mumbai/blog/some-post`. Leading/trailing slashes are stripped.
 */
export function buildCityAlternates({
  country,
  locale,
  city,
  cityPath,
}: {
  country: string;
  locale: string;
  city: CityContent;
  cityPath: string;
}): AlternatesShape {
  const cleanCityPath = cityPath.replace(/^\/+|\/+$/g, "");
  const fullSub = `cities/${cleanCityPath}`;
  const canonical = `/${country}/${locale}/${fullSub}`;

  if (!isCityIndexable(city, country, locale)) {
    return { canonical };
  }

  const cityLocales = getCityIndexableLocales(city);
  const languages: Record<string, string> = {};
  for (const lang of cityLocales) {
    languages[LOCALES[lang].hreflang] =
      `${BASE_URL}/in/${lang}/${fullSub}`;
  }
  languages["x-default"] = `${BASE_URL}/in/en/${fullSub}`;

  return { canonical, languages };
}


export type PageKey =
  | "home"
  | "about"
  | "services"
  | "industries"
  | "pricing"
  | "caseStudies"
  | "contact"
  | "privacy"
  | "terms";

const PAGE_PATHS: Record<PageKey, string> = {
  home: "",
  about: "about",
  services: "services",
  industries: "industries",
  pricing: "pricing",
  caseStudies: "case-studies",
  contact: "contact",
  privacy: "privacy",
  terms: "terms",
};

/** Pages that should be geo-personalized in metadata. Legal pages skip personalization. */
const GEO_PERSONALIZED: PageKey[] = [
  "home",
  "about",
  "services",
  "industries",
  "pricing",
  "caseStudies",
  "contact",
];

interface BuildMetadataArgs {
  page: PageKey;
  country: string;
  locale: Locale;
}

/* -------------------------------------------------------------------------- */
/*               Geo-aware title, description, keywords injection             */
/* -------------------------------------------------------------------------- */

/**
 * Inject the visitor's country (and optionally city) into the title.
 *
 * The country slug is always known from the URL, so the country name is
 * GUARANTEED to appear in every personalized title — even when IP geo
 * detection fails. The city is added only when it makes the title fit.
 *
 * Examples:
 *   IN, detected city: "Sanat Dynamo in Bangalore, India — We Build Revenue Systems…"
 *   IN, no city:       "Sanat Dynamo in India — We Build Revenue Systems…"
 *   US, detected city: "Sanat Dynamo in New York, United States — We Build…"
 *
 * Length budget: ~85 chars. The country always wins; city is dropped first
 * if total length would exceed the budget.
 */
function geoifyTitle(title: string, geo: GeoInfo): string {
  const country = geo.countryName;
  if (!country) return title;

  const cityPart = geo.detected && geo.city ? `${geo.city}, ` : "";
  const fullInsert = `in ${cityPart}${country}`;
  const countryOnlyInsert = `in ${country}`;

  // 1. Try inserting "in {city}, {country}" right after the brand name
  //    Matches: "Sanat Dynamo —", "Sanat Dynamo -", "Sanat Dynamo ·", "Sanat Dynamo |"
  const brandRe = /^(Sanat Dynamo)(\s*[—\-·|])/;

  if (brandRe.test(title)) {
    // First try full city+country
    const withCity = title.replace(brandRe, `$1 ${fullInsert}$2`);
    if (withCity.length <= 90) return withCity;

    // City made it too long → drop the city, keep the country
    const withCountry = title.replace(brandRe, `$1 ${countryOnlyInsert}$2`);
    if (withCountry.length <= 90) return withCountry;

    // Even country is too long → truncate the suffix after the separator
    // but always keep the country in the title
    const parts = title.split(/\s*[—\-·|]\s*/);
    if (parts.length >= 2) {
      const core = `Sanat Dynamo ${countryOnlyInsert} — ${parts[1]}`;
      return core.length <= 90 ? core : `Sanat Dynamo ${countryOnlyInsert} — ${parts[1].slice(0, 40)}…`;
    }
    return withCountry;
  }

  // 2. Brand didn't match the start of the title — append " · {city, country}"
  const withCity = `${title} · ${cityPart}${country}`;
  if (withCity.length <= 90) return withCity;

  const countryOnly = `${title} · ${country}`;
  return countryOnly.length <= 90 ? countryOnly : title;
}

/**
 * Prepend "Serving {city}, {state}, {country}." (or "Serving {country}." when
 * city/state are not detected) to the meta description.
 */
function geoifyDescription(desc: string, geo: GeoInfo): string {
  const loc = geo.detected ? formatLocation(geo) : geo.countryName;
  if (!loc) return desc;
  const prefix = `Serving ${loc}. `;
  const combined = prefix + desc;
  // Google snippet limit ~170 chars
  return combined.length > 170 ? combined.slice(0, 167) + "…" : combined;
}

/**
 * Append local keywords. Country keywords are always added; city/state
 * keywords are added only when they were actually detected.
 */
function geoifyKeywords(keywords: string, geo: GeoInfo): string {
  const parts = new Set(
    keywords.split(",").map((k) => k.trim()).filter(Boolean)
  );
  const extra: string[] = [];

  // Country keywords — always present
  if (geo.countryName) {
    extra.push(
      geo.countryName,
      `agency ${geo.countryName}`,
      `digital agency ${geo.countryName}`,
      `custom software ${geo.countryName}`,
      `SEO agency ${geo.countryName}`
    );
  }

  // City keywords — only when geo was actually detected
  if (geo.detected && geo.city) {
    extra.push(
      geo.city,
      `${geo.city} agency`,
      `agency in ${geo.city}`,
      `custom software ${geo.city}`,
      `SEO agency ${geo.city}`,
      `digital agency ${geo.city}`
    );
  }

  // State only when present
  if (geo.detected && geo.state && geo.state !== geo.city) {
    extra.push(geo.state);
  }

  for (const e of extra) parts.add(e);
  return Array.from(parts).join(", ");
}

/* -------------------------------------------------------------------------- */
/*                             buildPageMetadata                              */
/* -------------------------------------------------------------------------- */

/**
 * Build a fully-populated `Metadata` object for a given page + locale + country.
 *
 * Automatically personalizes title/description/keywords with the visitor's
 * detected city, state, and country (from IP) for SEO boost.
 */
export async function buildPageMetadata({
  page,
  country,
  locale,
}: BuildMetadataArgs): Promise<Metadata> {
  const t = getTranslation(locale);
  const meta = t.pages[page];
  const subPath = PAGE_PATHS[page];
  const alternates = buildAlternates({ country, locale, subPath });
  const fullUrl = `${BASE_URL}${alternates.canonical}`;

  // Personalize with geo. `getGeo` always returns a country name derived from
  // the URL slug (not the visitor IP), so the page is deterministic per URL —
  // Googlebot sees the same country-specific title/description on every crawl.
  const geo = await getGeo(country, locale);
  const geoize = GEO_PERSONALIZED.includes(page);

  const title = geoize ? geoifyTitle(meta.metaTitle, geo) : meta.metaTitle;
  const description = geoize
    ? geoifyDescription(meta.metaDescription, geo)
    : meta.metaDescription;
  const keywords = geoize
    ? geoifyKeywords(meta.metaKeywords, geo)
    : meta.metaKeywords;

  const ogTitleBase =
    (meta as { ogTitle?: string }).ogTitle ?? meta.metaTitle;
  const ogDescriptionBase =
    (meta as { ogDescription?: string }).ogDescription ?? meta.metaDescription;

  const ogTitle = geoize ? geoifyTitle(ogTitleBase, geo) : ogTitleBase;
  const ogDescription = geoize
    ? geoifyDescription(ogDescriptionBase, geo)
    : ogDescriptionBase;

  // Extra `<meta name="geo.*">` tags that SEO tools like GeoTarget, Yoast,
  // and Bing Places still read for local relevance signals. Country always
  // emitted; city/coords only when actually detected.
  const otherMeta: Record<string, string> = {
    "geo.country": geo.countryCode.toUpperCase(),
    "geo.region": geo.state
      ? `${geo.countryCode.toUpperCase()}-${geo.state}`
      : geo.countryCode.toUpperCase(),
  };
  if (geo.detected && geo.city) {
    otherMeta["geo.placename"] = geo.city;
  }
  if (geo.detected && geo.latitude && geo.longitude) {
    otherMeta["geo.position"] = `${geo.latitude};${geo.longitude}`;
    otherMeta["ICBM"] = `${geo.latitude}, ${geo.longitude}`;
  }

  // Breadcrumb — auto-generated for every page except home
  const breadcrumbItems = [
    { name: "Home", url: `${BASE_URL}/${country}/${locale}` },
  ];
  if (page !== "home") {
    const pageName = meta.metaTitle.split("—")[0]?.split("|")[0]?.trim() ?? page;
    breadcrumbItems.push({ name: pageName, url: fullUrl });
  }

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: fullUrl,
      siteName: t.brand.name,
      locale: `${locale}_${country.toUpperCase()}`,
      type: page === "home" ? "website" : "article",
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: t.brand.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [`${BASE_URL}/og.png`],
    },
    // Only INDEXABLE country+locale combinations are indexed (currently
    // /in/en and /in/hi). Other URLs still render but ship `noindex,follow`
    // so Google doesn't fold near-duplicate translation fallbacks back into
    // the canonical EN/HI pages — this is the indexability lever, keep tight.
    robots: isIndexable(country, locale)
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    authors: [{ name: t.brand.name }],
    creator: t.brand.name,
    publisher: t.brand.name,
    other: otherMeta,
  };
}

/* -------------------------------------------------------------------------- */
/*                              JSON-LD builders                              */
/* -------------------------------------------------------------------------- */

export function buildOrganizationJsonLd(t: Messages) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t.brand.name,
    url: BASE_URL,
    logo: `${BASE_URL}/og.png`,
    description: t.seo.description,
    // sameAs intentionally omitted until real social profiles exist. Including
    // placeholder URLs like `https://linkedin.com/` (no company slug) is worse
    // than no sameAs — Google uses this for entity verification and rejects
    // unverifiable claims. Add real profile URLs here when they're live.
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: t.contact.details.emailHref,
        telephone: t.contact.details.phone,
        contactType: "sales",
        availableLanguage: LOCALE_CODES.map((c) => LOCALES[c].name),
        areaServed: validCountryISOs.map((c) => c.toUpperCase()),
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
  };
}

/**
 * `LocalBusiness` JSON-LD keyed to the visitor's detected city/state/country.
 * This is what tells Google "this page is relevant for [city] searches".
 */
export function buildLocalBusinessJsonLd(t: Messages, geo: GeoInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${t.brand.name} — ${geo.city}`,
    url: BASE_URL,
    image: `${BASE_URL}/og.png`,
    description: t.seo.description,
    priceRange: "₹₹₹",
    telephone: t.contact.details.phone,
    email: t.contact.details.emailHref,
    address: {
      "@type": "PostalAddress",
      addressLocality: geo.city,
      addressRegion: geo.state,
      addressCountry: geo.countryCode.toUpperCase(),
    },
    ...(geo.latitude && geo.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
        }
      : {}),
    areaServed: {
      "@type": "City",
      name: geo.city,
    },
  };
}

export function buildWebsiteJsonLd(t: Messages, locale: Locale, country: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t.brand.name,
    url: `${BASE_URL}/${country}/${locale}`,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: t.brand.name },
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/${country}/${locale}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Build breadcrumb JSON-LD for a page. Call from page components.
 */
export function buildPageBreadcrumbJsonLd(
  page: PageKey,
  locale: Locale,
  country: string,
): object {
  const t = getTranslation(locale);
  const subPath = PAGE_PATHS[page];
  const homeUrl = `${BASE_URL}/${country}/${locale}`;
  const items = [{ name: t.nav.home, url: homeUrl }];

  if (page !== "home") {
    const pageUrl = `${homeUrl}/${subPath}`;
    const label =
      page === "caseStudies" ? t.nav.work :
      page === "about" ? t.nav.about :
      page === "services" ? t.nav.services :
      page === "industries" ? t.nav.industries :
      page === "pricing" ? t.nav.pricing :
      page === "contact" ? t.nav.contact :
      page;
    items.push({ name: label, url: pageUrl });
  }

  return buildBreadcrumbJsonLd(items);
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildFaqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*                       Industry slug page metadata                          */
/* -------------------------------------------------------------------------- */

import type { IndustrySeoData } from "@/lib/industry-data";

/**
 * Build Metadata for `/{country}/{locale}/industries/{slug}` from a static
 * `IndustrySeoData` entry. Mirrors `buildPageMetadata` — per-slug canonical,
 * hreflang cluster pinned to /in/*, and the same geoify treatment applied to
 * title / description / keywords so the page personalizes by visitor country.
 */
export async function buildIndustryPageMetadata({
  industry,
  country,
  locale,
}: {
  industry: IndustrySeoData;
  country: string;
  locale: Locale;
}): Promise<Metadata> {
  const subPath = `industries/${industry.slug}`;
  const alternates = buildAlternates({ country, locale, subPath });
  const fullUrl = `${BASE_URL}${alternates.canonical}`;

  const geo = await getGeo(country, locale);

  const title = geoifyTitle(industry.metaTitle, geo);
  const description = geoifyDescription(industry.metaDescription, geo);
  const keywords = geoifyKeywords(industry.metaKeywords, geo);

  const ogTitle = geoifyTitle(industry.ogTitle, geo);
  const ogDescription = geoifyDescription(industry.ogDescription, geo);

  const otherMeta: Record<string, string> = {
    "geo.country": geo.countryCode.toUpperCase(),
    "geo.region": geo.state
      ? `${geo.countryCode.toUpperCase()}-${geo.state}`
      : geo.countryCode.toUpperCase(),
  };
  if (geo.detected && geo.city) {
    otherMeta["geo.placename"] = geo.city;
  }
  if (geo.detected && geo.latitude && geo.longitude) {
    otherMeta["geo.position"] = `${geo.latitude};${geo.longitude}`;
    otherMeta["ICBM"] = `${geo.latitude}, ${geo.longitude}`;
  }

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: fullUrl,
      siteName: "Sanat Dynamo",
      locale: `${locale}_${country.toUpperCase()}`,
      type: "article",
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: "Sanat Dynamo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [`${BASE_URL}/og.png`],
    },
    robots: isIndexable(country, locale)
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    authors: [{ name: "Sanat Dynamo" }],
    creator: "Sanat Dynamo",
    publisher: "Sanat Dynamo",
    other: otherMeta,
  };
}

/**
 * `Service` JSON-LD for an industry page — pins the page as a Service offering
 * with `areaServed` set to the country and `provider` set to the org.
 */
export function buildIndustryServiceJsonLd(
  industry: IndustrySeoData,
  locale: Locale,
  country: string,
) {
  const url = `${BASE_URL}/${country}/${locale}/industries/${industry.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: industry.metaTitle.split("|")[0]?.trim() ?? industry.serviceType,
    serviceType: industry.serviceType,
    description: industry.metaDescription,
    provider: {
      "@type": "Organization",
      name: "Sanat Dynamo",
      url: BASE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: country.toUpperCase() === "IN" ? "India" : country.toUpperCase(),
    },
    url,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        description: "Custom-priced from a 1-week paid discovery",
      },
    },
  };
}

export function buildServiceJsonLd(
  service: Messages["services"]["items"][number],
  locale: Locale,
  country: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.kicker,
    description: service.summary,
    provider: { "@type": "Organization", name: "Sanat Dynamo" },
    url: `${BASE_URL}/${country}/${locale}/services#${service.id}`,
    areaServed: "Worldwide",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        description: service.investment,
      },
    },
  };
}
