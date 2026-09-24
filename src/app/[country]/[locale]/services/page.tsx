import type { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { buildPageMetadata, buildServiceJsonLd, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { ServicesExperience } from "@/components/services/ServicesExperience";
import { resolveServicesLocale } from "@/components/services/services-copy";
import { getServicesCopy } from "@/components/services/services-translations";

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string }> }): Promise<Metadata> {
  const { country, locale } = await params;
  const language = resolveServicesLocale(locale);
  const metadata = await buildPageMetadata({ page: "services", country, locale: language });
  const description = getServicesCopy(language).meta;
  return { ...metadata, description, openGraph: { ...metadata.openGraph, description }, twitter: { ...metadata.twitter, description } };
}

export default async function ServicesPage({ params }: { params: Promise<{ country: string; locale: string }> }) {
  const { country, locale } = await params;
  const language = resolveServicesLocale(locale);
  const t = getTranslation(language);
  const serviceLd = t.services.items.map(service => buildServiceJsonLd(service, language, country));
  const breadcrumbLd = buildPageBreadcrumbJsonLd("services", language, country);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd).replace(/</g, "\\u003c") }} />
    <ServicesExperience copy={getServicesCopy(language)} t={t} base={`/${country}/${language}`} />
  </>;
}
