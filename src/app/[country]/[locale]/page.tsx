import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildFaqJsonLd } from "@/lib/seo";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";
import { Hero } from "@/components/sections/Hero";
import { LogosMarquee } from "@/components/sections/LogosMarquee";
import { CityBanner } from "@/components/sections/CityBanner";
import { CountryMarketContext } from "@/components/sections/CountryMarketContext";
import { CountryTrustBlock } from "@/components/sections/CountryTrustBlock";
import { TechStack } from "@/components/sections/TechStack";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { KnowMore } from "@/components/sections/KnowMore";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { Cta } from "@/components/sections/Cta";
import { StrategyHub, ImpactHub, ProcessStepper } from "@/components/sections/CompressedHomeSections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "home",
    country,
    locale: locale as Locale,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);

  // Build FAQ JSON-LD including country-specific additions so the
  // FAQ rich result matches what's rendered on-page for this market.
  const countryContent = isResolvableCountry(country)
    ? getCountryContent(country)
    : null;
  const faqLd = buildFaqJsonLd(
    countryContent
      ? [...t.faq.items, ...countryContent.faqAdditions]
      : t.faq.items,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Hero t={t} country={country} />
      <LogosMarquee t={t} country={country} locale={locale as Locale} />
      <CityBanner t={t} country={country} locale={locale as Locale} />
      <CountryMarketContext t={t} country={country} locale={locale as Locale} pageKey="home" />
      <CountryTrustBlock t={t} country={country} />
      
      {/* Consolidated Strategy Section */}
      <StrategyHub t={t} country={country} />

      {/* Consolidated Impact Section */}
      <ImpactHub t={t} country={country} />

      {/* Simplified Process Section */}
      <ProcessStepper t={t} />

      <TechStack t={t} />
      <Testimonials t={t} country={country} />
      <Faq t={t} country={country} />
      <KnowMore t={t} pageKey="home" pageLabel="home" />
      <IndiaGeoFooter country={country} locale={locale} pageKey="home" />
      <Cta t={t} country={country} />
    </>
  );
}
