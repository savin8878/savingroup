import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslation, type Locale, LOCALE_CODES } from "@/lib/i18n";
import { BASE_URL } from "@/lib/constants";
import { INDIA_CITIES, getCityBySlug, isCityIndexable, localizeCity, type CityContent } from "@/lib/cities";
import { getCityExtras } from "@/lib/city-extras";
import { getCityIdentity } from "@/lib/city-identity";
import { getCityOrganization } from "@/lib/city-organization";
import { buildBreadcrumbJsonLd, buildCityAlternates, buildFaqJsonLd } from "@/lib/seo";
import { CityExperience } from "@/components/cities/CityExperience";

const CITIES_PATH = "cities";

/* -------------------------------------------------------------------------- */
/*                       generateStaticParams + Metadata                      */
/* -------------------------------------------------------------------------- */

/**
 * Pre-render every city × en/hi at build time. Other locales render on-demand
 * via the parent dynamic segments and inherit the same content via i18n
 * fallback. Building only en+hi keeps the static surface focused on the two
 * locales Indian search traffic actually uses.
 */
export async function generateStaticParams() {
  const locales: Locale[] = ["en", "hi"];
  const country = "in";
  const params: Array<{ country: string; locale: string; city: string }> = [];
  for (const city of INDIA_CITIES) {
    for (const locale of locales) {
      params.push({ country, locale, city: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}): Promise<Metadata> {
  const { country, locale, city: citySlug } = await params;
  const baseCity = getCityBySlug(citySlug);
  if (!baseCity) return { title: "Not found" };

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  // Apply per-locale body translation (no-op for EN; swaps body fields for
  // HI when `translations.hi` exists on the city).
  const city = localizeCity(baseCity, lc);

  // Per-city indexability: /in/en is always indexable, /in/hi only when this
  // specific city has a complete Hindi body block (overrides global
  // INDEXABLE_LOCALES which is "en"-only since 2026-05-09).
  const indexable = isCityIndexable(baseCity, country, lc);

  // Hreflang cluster is built in `buildCityAlternates` using
  // `getCityIndexableLocales(baseCity)`. The cluster only includes locales
  // this specific city has body translations for, and the languages map is
  // omitted entirely on noindex locale variants (so a /in/zh/cities/mumbai
  // doesn't try to fake-cluster with the EN/HI pages).
  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: city.slug,
  });

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    keywords: city.metaKeywords,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Savin Group",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: `Savin Group — ${city.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: city.metaTitle,
      description: city.metaDescription,
      images: [`${BASE_URL}/og.png`],
    },
    robots: indexable
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
    other: {
      "geo.country": "IN",
      "geo.region": `IN-${city.stateCode}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
      ICBM: `${city.geo.lat}, ${city.geo.lng}`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              Page component                                */
/* -------------------------------------------------------------------------- */

export default async function CityPage({ params }: { params: Promise<{ country: string; locale: string; city: string }> }) {
  const { country, locale, city: slug } = await params;
  const baseCity = getCityBySlug(slug);
  if (!baseCity) notFound();
  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const city = localizeCity(baseCity, lc);
  const t = getTranslation(lc);
  return <>
    <CityJsonLd city={city} country={country} locale={lc} t={t}/>
    <CityExperience city={city} identity={getCityIdentity(slug)} org={getCityOrganization(slug)} extras={getCityExtras(slug)} t={t} country={country} locale={lc}/>
  </>;
}

function CityJsonLd({
  city,
  country,
  locale,
  t,
}: {
  city: CityContent;
  country: string;
  locale: Locale;
  t: ReturnType<typeof getTranslation>;
}) {
  const url = `${BASE_URL}/${country}/${locale}/${CITIES_PATH}/${city.slug}`;
  const aboutUrl = `${url}/about`;
  const org = getCityOrganization(city.slug);
  const identity = getCityIdentity(city.slug);

  // Breadcrumb: Home → Cities → {City}
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: `${BASE_URL}/${country}/${locale}` },
    { name: "Cities", url: `${BASE_URL}/${country}/${locale}/${CITIES_PATH}` },
    { name: city.name, url },
  ]);

  // Service, scoped to this city — coverage, not premises.
  //
  // This was a `ProfessionalService` (a LocalBusiness subtype) asserting a
  // `PostalAddress` in the city, `GeoCoordinates` at the city centre, and
  // opening hours of Mon–Sat 10:00–19:00 "validFrom 2024-01-01" — on all 11
  // cities. The business occupies none of them, and this page's own FAQ says
  // so in visible copy ("Do you have a presence in {city}?" → "We're
  // remote-first… we travel for kickoff"). The markup contradicted the page.
  //
  // Three further reasons the old shape was wrong even setting truth aside:
  // `hoursAvailable` is scoped by schema.org to ContactPoint /
  // LocationFeatureSpecification / Service, not LocalBusiness (which uses
  // `openingHoursSpecification`), so the hours were inert; `availableLanguage`
  // is likewise out of domain on LocalBusiness; and simply deleting `address`
  // would have left a LocalBusiness missing a required property.
  //
  // `Service` + `areaServed` is the schema.org-sanctioned model for a
  // business that serves a place without occupying it. `areaServed` was
  // already here — it is the true half of what the node was saying.
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#business`,
    name: `${t.brand.name} — ${city.name}`,
    serviceType: "Website development, SEO and revenue automation",
    url,
    image: `${BASE_URL}/og.png`,
    description: city.metaDescription,
    provider: {
      "@type": "Organization",
      name: t.brand.name,
      url: BASE_URL,
      telephone: t.contact.details.phone,
      email: t.contact.details.email,
    },
    areaServed: [
      { "@type": "City", name: city.name },
      ...city.neighborhoods.map((n) => ({ "@type": "Place", name: n })),
    ],
    // Valid on Service (unlike on LocalBusiness, where it is out of domain).
    ...(org && {
      availableLanguage: org.languages.map((l) => ({
        "@type": "Language",
        name: l,
      })),
    }),
    knowsAbout: [
      "Website Development",
      "WhatsApp Automation",
      "SEO",
      "Custom Software",
      "ERP Integration",
      "D2C Commerce",
      "Lead Generation",
      // Pull the city-specific stack categories into knowsAbout — these are
      // the long-tail intents we genuinely cover in this metro.
      ...(org?.stack.map((l) => l.category) ?? []),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services offered in ${city.name}`,
      itemListElement: [
        ...t.services.items.map((s, i) => ({
          "@type": "Offer",
          position: i + 1,
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.summary,
          },
        })),
        // The local-stack layers as catalog entries — extends the offer
        // surface with city-specific service variants.
        ...(org?.stack.map((layer, i) => ({
          "@type": "Offer",
          position: t.services.items.length + i + 1,
          itemOffered: {
            "@type": "Service",
            name: `${layer.category} — ${city.name}`,
            description: layer.cityNote,
            serviceType: layer.category,
            provider: { "@id": `${url}#business` },
          },
        })) ?? []),
      ],
    },
    // No `aggregateRating` / `review`. The removed block hardcoded the same
    // 4.9 / ratingCount "50" on all 11 cities, with an invented 5-star rating
    // attached to each testimonial (the source testimonials carry no rating
    // at all) and `author` set to a job title — "Director", "Founder",
    // "प्रमोटर" — typed as schema.org/Person.
    //
    // Self-reviewed LocalBusiness/Organization pages are ineligible for the
    // star review feature anyway, so this was never going to render; and the
    // figures were shown to users as fact. Real reviews belong on a Google
    // Business Profile. See the matching note in the root layout.
  };

  // HowTo — the engagement journey rendered as a HowTo so Google can
  // surface it for "how to work with {agency} in {city}" intent searches.
  // Each step has a city-specific note so it isn't templated.
  const howToLd = org && {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#engagement`,
    name: `How to engage Savin Group in ${city.name}`,
    description: `The 4-phase engagement journey for revenue-system builds in ${city.name}, from paid discovery to compounding monthly retainer.`,
    totalTime: "PT3M",
    inLanguage: locale,
    step: org.engagement.map((phase, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: phase.name,
      text: `${phase.mission} ${phase.cityNote}`.trim(),
      url: `${url}#engagement`,
      itemListElement: phase.artefacts.map((a, j) => ({
        "@type": "HowToDirection",
        position: j + 1,
        text: a,
      })),
    })),
  };

  // FAQ — city-specific FAQs go into Google's FAQ rich result for the page
  const faqLd = buildFaqJsonLd(city.faq);

  // TouristDestination — surfaces the city's landmarks as structured data
  // so the page is eligible for Google's place / knowledge-panel features.
  // Each landmark uses LandmarksOrHistoricalBuildings (subtype of Place)
  // and references the canonical /about Place node so the schemas link up
  // instead of duplicating across the two URLs.
  const placesLd = identity && {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": `${url}#destination`,
    name: `${city.name} — ${identity.nickname}`,
    alternateName: identity.nicknameRegional,
    description: identity.tagline,
    url,
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.geo.lat,
      longitude: city.geo.lng,
    },
    touristType: identity.economy.map((e) => e.cluster),
    includesAttraction: identity.landmarks.map((l) => ({
      "@type": "LandmarksOrHistoricalBuildings",
      name: l.name,
      description: l.meaning,
      containedInPlace: { "@type": "City", name: city.name },
    })),
  };

  // ItemList — a parallel signal that the page indexes a finite, ordered
  // list of named landmarks. ItemList is what powers Google's "carousel"
  // rich result for places.
  const landmarksItemListLd = identity && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#landmarks`,
    name: `Landmarks of ${city.name}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: identity.landmarks.length,
    itemListElement: identity.landmarks.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LandmarksOrHistoricalBuildings",
        name: l.name,
        description: l.meaning,
        url: `${aboutUrl}#${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      },
    })),
  };

  // City-anchored web page node — ties the URL itself to the locality
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: city.metaTitle,
    description: city.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${BASE_URL}/${country}/${locale}#website` },
    about: { "@id": `${url}#business` },
    breadcrumb: breadcrumbLd,
    // Anchor the WebPage to the engagement HowTo so the relationship
    // is explicit to Google's knowledge graph.
    ...(howToLd && { mainEntity: { "@id": `${url}#engagement` } }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {placesLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placesLd) }}
        />
      )}
      {landmarksItemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(landmarksItemListLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
    </>
  );
}

