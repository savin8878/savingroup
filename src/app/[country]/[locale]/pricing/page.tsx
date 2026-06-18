import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { BASE_URL } from "@/lib/constants";
import { PageHero } from "@/components/sections/PageHero";
import { Pricing } from "@/components/sections/Pricing";
import { CityBanner } from "@/components/sections/CityBanner";
import { CountryMarketContext } from "@/components/sections/CountryMarketContext";
import { Faq } from "@/components/sections/Faq";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { Cta } from "@/components/sections/Cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "pricing",
    country,
    locale: locale as Locale,
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);
  const breadcrumbLd = buildPageBreadcrumbJsonLd("pricing", locale as Locale, country);

  // OfferCatalog JSON-LD — one Offer per plan, currency INR, requirement-based.
  const offerCatalogLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${t.brand.name} — Pricing Plans`,
    url: `${BASE_URL}/${country}/${locale}/pricing`,
    itemListElement: t.pricing.tiers.map((tier, i) => ({
      "@type": "Offer",
      position: i + 1,
      name: tier.name,
      description: tier.tagline,
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        description: tier.priceRange,
      },
      category: tier.scope,
      seller: { "@type": "Organization", name: t.brand.name },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogLd) }}
      />

      <PageHero
        eyebrow={t.pricing.eyebrow}
        title={
          <>
            More system.{" "}
            <span className="text-accent">Same budget.</span>
          </>
        }
        subtitle={t.pricing.subtitle}
        breadcrumb={t.nav.pricing}
      />

      <CityBanner t={t} country={country} locale={locale as Locale} />
      <CountryMarketContext t={t} country={country} locale={locale as Locale} pageKey="services" />

      <Pricing t={t} downloadHref={`/${country}/${locale}/pricing/download`} />

      <Faq t={t} country={country} />
      <IndiaGeoFooter country={country} locale={locale} pageKey="services" />
      <Cta t={t} country={country} />
    </>
  );
}
