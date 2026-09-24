import type { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { AboutExperience } from "@/components/about/AboutExperience";
import { resolveAboutLocale } from "@/components/about/about-copy";
import { getAboutCopy } from "@/components/about/about-translations";

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string }> }): Promise<Metadata> {
  const { country, locale } = await params;
  const language = resolveAboutLocale(locale);
  const metadata = await buildPageMetadata({ page: "about", country, locale: language });
  const description = getAboutCopy(language).meta;
  const title = `${getTranslation(language).nav.about} | Sanat Dynamo`;
  return { ...metadata, title, description, openGraph: { ...metadata.openGraph, title, description }, twitter: { ...metadata.twitter, title, description } };
}

export default async function AboutPage({ params }: { params: Promise<{ country: string; locale: string }> }) {
  const { country, locale } = await params;
  const language = resolveAboutLocale(locale);
  const t = getTranslation(language);
  const breadcrumbLd = buildPageBreadcrumbJsonLd("about", language, country);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
    <AboutExperience copy={getAboutCopy(language)} base={`/${country}/${language}`} ctaLabel={t.nav.cta} aboutLabel={t.nav.about} />
  </>;
}
