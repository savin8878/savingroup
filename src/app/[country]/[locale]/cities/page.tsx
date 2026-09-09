import type { Metadata } from "next";
import { getTranslation, type Locale, LOCALE_CODES } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { INDIA_CITIES } from "@/lib/cities";
import { buildAlternates, buildBreadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { Cta } from "@/components/sections/Cta";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import {
  IndiaMetroMap,
  CitiesScrollTimeline,
  CitiesIntentMatrix,
  GlobalPeersConstellation,
} from "@/components/illustrations/CitiesHubVisuals";

const PAGE_PATH = "cities";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;

  const title =
    country === "in"
      ? "Website Development Company in India · Cities We Serve"
      : "Cities We Serve";
  const description =
    country === "in"
      ? "Hand-built revenue systems and websites for India's 11 largest metros — Mumbai, Delhi NCR, Bengaluru, Pune, Chennai, Hyderabad, Kolkata, Ahmedabad, Jaipur, Indore, and Bhopal. Locally relevant SEO, INR pricing, GST-compliant invoicing."
      : "Cities and regions we serve.";

  const alternates = buildAlternates({ country, locale: lc, subPath: PAGE_PATH });

  return {
    title,
    description,
    keywords:
      "website development company India, cities we serve, web design Mumbai, Delhi NCR, Bengaluru, Pune, Chennai, Hyderabad, Kolkata, Ahmedabad, Jaipur, Indore, Bhopal",
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "website",
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og.png`],
    },
    robots: isIndexable(country, lc)
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
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function CitiesIndexPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const t = getTranslation(lc);


  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: `${BASE_URL}/${country}/${lc}` },
    { name: "Cities", url: `${BASE_URL}/${country}/${lc}/${PAGE_PATH}` },
  ]);

  // ItemList JSON-LD — tells Google this is a curated list of city pages,
  // not a flat directory. Improves the rich-result presentation.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cities served by Sanat Dynamo in India",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: INDIA_CITIES.length,
    itemListElement: INDIA_CITIES.map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/${country}/${lc}/${PAGE_PATH}/${city.slug}`,
      name: `${city.name} — ${t.brand.name}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <PageHero
        eyebrow="11 Indian metros · 1 revenue-system playbook"
        title={
          <>
            We build{" "}
            <span className="text-accent">city-aware revenue systems</span> across
            India.
          </>
        }
        subtitle="Each city below is its own market — different buyer, different stack, different pace. We tailor the build to the metro, not the other way around. Pick yours."
        breadcrumb="Cities"
      />

      {/* Animated India map — every metro plotted on a stylised silhouette */}
      <Section className="pt-8">
        <IndiaMetroMap />
      </Section>

      {/* Scroll-driven city ladder with hidden-gem teaser per row */}
      <Section className="pt-0">
        <div className="max-w-3xl">
          <Eyebrow>11-metro deep dive</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[3rem]">
            Each city is a different game.
            <span className="bg-gradient-to-br from-foreground via-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
              {" "}We play them differently.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Scroll through to see the local stuck-state, the stat that matters
            in this metro, and the hidden-gem insight we build around. Tap any
            row to open the city.
          </p>
        </div>

        <div className="mt-16">
          <CitiesScrollTimeline />
        </div>
      </Section>

      {/* City × intent matrix */}
      <Section className="pt-0">
        <CitiesIntentMatrix />
      </Section>

      {/* Global peer-cities map */}
      <Section className="pt-0">
        <GlobalPeersConstellation />
      </Section>

      <IndiaGeoFooter country={country} locale={locale} pageKey="cities" />
      <Cta t={t} country={country} />
    </>
  );
}
