import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { BASE_URL, isResolvableCountry } from "@/lib/constants";
import { getCountryContent } from "@/lib/country-content";
import { CTA_LABEL } from "@/lib/offer";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { FinalCta } from "@/components/blog/BlogPrimitives";
import { GeoFooterFrame } from "@/components/blog/index/IndexSections";
import { getPricingCopy } from "@/components/pricing/copy/pricing-copy";
import { getPricingContent, splitHeadline } from "@/components/pricing/pricing-data";
import {
  AdvantagesSection,
  PickerSection,
  PlansSection,
  PricingFaqSection,
  PricingHero,
  QuoteSection,
  SystemSection,
  type PricingContext,
} from "@/components/pricing/PricingSections";
import styles from "@/components/pricing/Pricing.module.css";

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

  const copy = getPricingCopy(locale);
  const ctx: PricingContext = { t, p: getPricingContent(t), copy, country, locale };

  // Exactly the list the shared <Faq> rendered here: the global questions,
  // then the country-specific additions (appended, not prepended).
  const faqItems = isResolvableCountry(country)
    ? [...t.faq.items, ...getCountryContent(country).faqAdditions]
    : t.faq.items;

  const [finalLead, finalAccent] = splitHeadline(t.cta.title);

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

      <BlogMotion labels={copy.motion} className={styles.page}>
        {/* Price list first — it is what the visitor came for. */}
        <PricingHero ctx={ctx} downloadHref={`/${country}/${locale}/pricing/download`} />
        <PlansSection ctx={ctx} />
        <PickerSection ctx={ctx} />
        <QuoteSection ctx={ctx} />
        <AdvantagesSection ctx={ctx} />
        {/* …then the answer to "but the FAQ said ₹60,000". */}
        <SystemSection ctx={ctx} />
        <PricingFaqSection ctx={ctx} items={faqItems} />
        <GeoFooterFrame>
          <IndiaGeoFooter country={country} locale={locale} pageKey="services" />
        </GeoFooterFrame>
        <FinalCta
          className={styles.final}
          id="pricing-final-title"
          eyebrow={t.cta.eyebrow}
          question={t.cta.subtitle}
          lead={finalLead}
          accent={finalAccent}
          ctaLabel={CTA_LABEL}
          note={t.cta.trustNote}
          secondary={{ label: t.cta.secondary, href: "/case-studies" }}
          circuitLabel={copy.circuitLabel}
          footer={{
            left: t.brand.name,
            center: copy.footerCenter,
            backToTop: { label: copy.backToTop, href: "#pricing-title" },
          }}
        />
      </BlogMotion>
    </>
  );
}
