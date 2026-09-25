import type { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { CaseStudiesExperience } from "@/components/case-studies/CaseStudiesExperience";
import { resolveCaseStudiesLocale } from "@/components/case-studies/case-studies-copy";
import { getCaseStudiesCopy } from "@/components/case-studies/case-studies-translations";

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string }> }): Promise<Metadata> {
  const { country, locale } = await params;
  const language = resolveCaseStudiesLocale(locale);
  const metadata = await buildPageMetadata({ page: "caseStudies", country, locale: language });
  const description = getCaseStudiesCopy(language).meta;
  return { ...metadata, description, openGraph: { ...metadata.openGraph, description }, twitter: { ...metadata.twitter, description } };
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ country: string; locale: string }> }) {
  const { country, locale } = await params;
  const language = resolveCaseStudiesLocale(locale);
  const t = getTranslation(language);
  const breadcrumbLd = buildPageBreadcrumbJsonLd("caseStudies", language, country);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <CaseStudiesExperience copy={getCaseStudiesCopy(language)} t={t} base={`/${country}/${language}`} country={country} />
  </>;
}
