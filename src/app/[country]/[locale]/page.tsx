import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildFaqJsonLd } from "@/lib/seo";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";
import { Hero } from "@/components/sections/Hero";
import { LogosMarquee } from "@/components/sections/LogosMarquee";
import { CountryTrustBlock } from "@/components/sections/CountryTrustBlock";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { Cta } from "@/components/sections/Cta";
import { IndustrialHome } from "@/components/home/IndustrialHome";
import { OPERATIONS_FAQ } from "@/components/home/home-content";
import {
  StrategyHub,
  ServicesBlock,
  ImpactHub,
  ProcessStepper,
} from "@/components/sections/CompressedHomeSections";

/** How many FAQ entries the homepage shows. See the note on ordering below. */
const HOME_FAQ_LIMIT = 6;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  const metadata = await buildPageMetadata({
    page: "home",
    country,
    locale: locale as Locale,
  });
  if (locale !== "en") return metadata;
  const title = "Industrial Automation, AI & Connected Business Systems";
  const description = "Sanat Dynamo connects custom software, AI, ERP and industrial systems to reduce manual work and give growing businesses clearer, faster operations.";
  return {
    ...metadata,
    title,
    description,
    keywords: "industrial automation, AI agents, IoT, ERP, custom software, workflow automation, business intelligence, systems integration, digital transformation",
    openGraph: { ...metadata.openGraph, title: `${title} · Sanat Dynamo`, description },
    twitter: { ...metadata.twitter, title: `${title} · Sanat Dynamo`, description },
  };
}

/* ==================================================================
   EXISTING TRANSLATED HOMEPAGE ORDER (English uses IndustrialHome below)

   One argument, told once, in the order a buyer actually needs it:

     1. the offer            Hero
     2. credible proof       LogosMarquee + CountryTrustBlock
     3. the problem we fix   StrategyHub (problem → approach → what we do)
     4. what you can buy     ServicesBlock — full width, its own section
     5. evidence it worked   ImpactHub (case studies → numbers → industries)
     6. how it runs          ProcessStepper
     7. in their words       Testimonials
     8. objections           Faq (trimmed — see HOME_FAQ_LIMIT)
     9. where we work        IndiaGeoFooter, compact
    10. one ask              Cta

   WHAT CAME OFF THIS PAGE, and where it went:

     CityBanner, CountryMarketContext  — three separate location pitches ran
       BEFORE the services block, so a first-time visitor read about Indore
       before learning what we sell. The city pages and /cities already carry
       this material properly; the homepage keeps one compact directory at
       step 9 for the internal links.
     KnowMore  — a link farm of guides. It belongs on the pages it links to.
     TechStack — a tool logo wall that proved nothing a buyer was asking.

   The page measured roughly 30,555px tall at a 1363px viewport before this.
   Every block above earns its height or it does not belong here.
   ================================================================== */

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);

  // Keep existing translated homepages intact until the new narrative has
  // translated copy. Shared sections, navigation and other routes are untouched.
  if (locale === "en") {
    const faqItems = [...OPERATIONS_FAQ];
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqItems)) }} />
        <IndustrialHome t={t} country={country} faqItems={faqItems} />
      </>
    );
  }

  // The FAQ rich result must match what is rendered on-page — Google treats a
  // mismatch as markup for content the visitor cannot see. So the JSON-LD is
  // built from exactly the array the <Faq> component receives, cap included.
  const countryContent = isResolvableCountry(country)
    ? getCountryContent(country)
    : null;
  const faqItems = (
    countryContent ? [...t.faq.items, ...countryContent.faqAdditions] : t.faq.items
  ).slice(0, HOME_FAQ_LIMIT);
  const faqLd = buildFaqJsonLd(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* 1 — the offer */}
      <Hero t={t} country={country} />

      {/* 2 — proof */}
      <LogosMarquee t={t} country={country} locale={locale as Locale} />
      <CountryTrustBlock t={t} country={country} />

      {/* 3 — the problem, our approach, what we actually do */}
      <StrategyHub t={t} />

      {/* 4 — what you can buy */}
      <ServicesBlock t={t} country={country} />

      {/* 5 — evidence */}
      <ImpactHub t={t} country={country} />

      {/* 6 — how the engagement runs */}
      <ProcessStepper t={t} />

      {/* 7 — in their words */}
      <Testimonials t={t} country={country} />

      {/* 8 — objections */}
      <Faq t={t} country={country} limit={HOME_FAQ_LIMIT} />

      {/* 9 — where we work (compact: links + schema, no prose) */}
      <IndiaGeoFooter
        country={country}
        locale={locale}
        pageKey="home"
        variant="compact"
      />

      {/* 10 — one ask */}
      <Cta t={t} country={country} />
    </>
  );
}
