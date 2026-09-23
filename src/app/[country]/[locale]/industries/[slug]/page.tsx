import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowUpRight, MapPin, CheckCircle2, Plus } from "lucide-react";
import {
  ShoppingBag,
  Building2,
  GraduationCap,
  Stethoscope,
  Factory,
} from "lucide-react";

import { getTranslation, type Locale } from "@/lib/i18n";
import {
  buildIndustryPageMetadata,
  buildIndustryServiceJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo";
import {
  INDUSTRY_DATA,
  INDUSTRY_SLUGS,
  getIndustryData,
} from "@/lib/industry-data";
import type { IndustryKey } from "@/lib/country-content";
import { BASE_URL } from "@/lib/constants";
import { getCityBySlug } from "@/lib/cities";

import { Section, Eyebrow } from "@/components/primitives/section";
import { PageHero } from "@/components/sections/PageHero";
import { Cta } from "@/components/sections/Cta";
import { CountryMarketContext } from "@/components/sections/CountryMarketContext";
import { CityBanner } from "@/components/sections/CityBanner";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { industryIllustrations } from "@/components/illustrations";
import {
  StuckStateFlow,
  DeliverableStack,
  MetricRadialGrid,
  PainConnectionWeb,
} from "@/components/illustrations/IndustrySegmentVisuals";
import LocalizedLink from "@/components/LocalizedLink";

export const dynamic = "force-dynamic";

const iconMap: Record<IndustryKey, typeof Factory> = {
  manufacturing: Factory,
  "real-estate": Building2,
  healthcare: Stethoscope,
  ecommerce: ShoppingBag,
  edtech: GraduationCap,
};

type RouteParams = { country: string; locale: string; slug: string };

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { country, locale, slug } = await params;
  const industry = getIndustryData(slug);
  if (!industry) return {};
  return buildIndustryPageMetadata({
    industry,
    country,
    locale: locale as Locale,
  });
}

export default async function IndustrySlugPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { country, locale, slug } = await params;
  const industry = getIndustryData(slug);
  if (!industry) notFound();

  const t = getTranslation(locale as Locale);
  const Icon = iconMap[industry.slug];
  const Illust = industryIllustrations[industry.slug];

  const homeUrl = `${BASE_URL}/${country}/${locale}`;
  const hubUrl = `${homeUrl}/industries`;
  const pageUrl = `${hubUrl}/${industry.slug}`;
  const industryDisplayName =
    t.industries.items.find((it) => it.id === industry.slug)?.name ??
    industry.serviceType;

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: homeUrl },
    { name: t.nav.industries, url: hubUrl },
    { name: industryDisplayName, url: pageUrl },
  ]);
  const serviceLd = buildIndustryServiceJsonLd(
    industry,
    locale as Locale,
    country,
  );
  const faqLd = buildFaqJsonLd(industry.faq);

  const linkedCaseStudies = industry.caseStudyIds
    .map((id) => t.caseStudies.items.find((cs) => cs.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const linkedServices = industry.serviceIds
    .map((id) => t.services.items.find((s) => s.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const cities = industry.cityFocus.cities
    .map((s) => getCityBySlug(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <PageHero
        eyebrow={industry.hero.eyebrow}
        breadcrumb={industryDisplayName}
        title={
          <>
            {industry.hero.h1Lead}{" "}
            <span className="text-accent">{industry.hero.h1Accent}</span>
          </>
        }
        subtitle={industry.hero.subtitle}
      />

      <CityBanner t={t} country={country} locale={locale as Locale} />
      <CountryMarketContext
        t={t}
        country={country}
        locale={locale as Locale}
        pageKey="industries"
      />

      {/* Intro paragraphs — keyword-dense, indexable body copy */}
      <Section className="pt-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {industry.intro.map((para, i) => (
                <p key={i} className="text-pretty">
                  {para}
                </p>
              ))}
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-accent">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {industry.audience.title}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {industryDisplayName}
                  </div>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {industry.audience.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {Illust && (
                <div className="mt-6 hidden border-t border-border pt-6 sm:block">
                  <Illust className="max-w-[280px]" />
                </div>
              )}
            </div>
          </aside>
        </div>
      </Section>

      {/* Stuck-state → migration → after diagram (per-sector themed) */}
      <Section className="pt-0">
        <StuckStateFlow slug={industry.slug} />
      </Section>

      {/* Pain points — connected web visualization */}
      <Section className="pt-0">
        <PainConnectionWeb
          pains={industry.pains.items}
          title={industry.pains.title}
        />
      </Section>

      {/* What we ship — layered build stack */}
      <Section className="pt-0">
        <div className="max-w-3xl">
          <Eyebrow>What we ship</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {industry.build.title}
          </h2>
        </div>
        <div className="mt-12">
          <DeliverableStack
            slug={industry.slug}
            deliverables={industry.build.deliverables}
          />
        </div>
      </Section>

      {/* Outcome metrics — animated radial dials */}
      <Section className="pt-0">
        <MetricRadialGrid
          slug={industry.slug}
          title={industry.outcome.title}
          summary={industry.outcome.summary}
          metrics={industry.outcome.metrics}
        />
      </Section>

      {/* Industry-specific FAQ — drives FAQPage rich-result eligibility */}
      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Questions Indian {industryDisplayName.toLowerCase()} buyers actually ask before signing.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Real questions we&apos;ve been asked across discovery calls. If your
              question isn&apos;t here, ask us on the audit.
            </p>
            <LocalizedLink
              href="/contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent-strong transition-all hover:border-accent/70 hover:bg-accent/15"
            >
              Ask on a free audit
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </LocalizedLink>
          </div>
          <div className="lg:col-span-7">
            <div className="divide-y divide-border rounded-3xl border border-border bg-surface/40">
              {industry.faq.map((qa, i) => (
                <details
                  key={qa.q}
                  className="group p-6 [&_summary::-webkit-details-marker]:hidden"
                  open={i === 0}
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-left">
                    <span className="font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {qa.q}
                    </span>
                    <Plus
                      size={18}
                      className="mt-0.5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {qa.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* City crosslinks — wires the industry × city graph for long-tail SEO */}
      {cities.length > 0 && (
        <Section className="pt-0">
          <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  <MapPin size={12} />
                  Cities we ship in
                </div>
                <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {industryDisplayName} — built on the ground.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {industry.cityFocus.callout}
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  {cities.map((city) => {
                    const isPrimary =
                      city.slug === industry.cityFocus.primaryCitySlug;
                    return (
                      <LocalizedLink
                        key={city.slug}
                        href={`/cities/${city.slug}`}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3 transition-all hover:border-accent ${
                          isPrimary
                            ? "border-accent/40 bg-accent/5"
                            : "border-border"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {industryDisplayName} in {city.name}
                          </div>
                          {isPrimary && (
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                              Primary cluster
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </LocalizedLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Linked case studies + services — internal-link the rest of the site */}
      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-12">
          {linkedCaseStudies.length > 0 && (
            <div className="lg:col-span-7">
              <Eyebrow>Proof in this industry</Eyebrow>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Case studies most relevant to {industryDisplayName.toLowerCase()}
              </h2>
              <div className="mt-6 space-y-3">
                {linkedCaseStudies.map((cs) => (
                  <LocalizedLink
                    key={cs.id}
                    href={`/case-studies#${cs.id}`}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {cs.industry} · {cs.location}
                      </div>
                      <div className="mt-1 truncate font-display text-base font-semibold text-foreground">
                        {cs.title}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="mt-1 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </LocalizedLink>
                ))}
              </div>
            </div>
          )}
          {linkedServices.length > 0 && (
            <div className="lg:col-span-5">
              <Eyebrow>Services we use here</Eyebrow>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Building blocks
              </h2>
              <div className="mt-6 space-y-3">
                {linkedServices.map((s) => (
                  <LocalizedLink
                    key={s.id}
                    href={`/services#${s.id}`}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                        {s.kicker}
                      </div>
                      <div className="mt-1 truncate font-display text-base font-semibold text-foreground">
                        {s.name}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="mt-1 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </LocalizedLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Cross-industry navigation — keep the user inside the industries graph */}
      <Section className="pt-0">
        <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <Eyebrow>Other industries we build for</Eyebrow>
            <LocalizedLink
              href="/industries"
              className="hidden text-xs font-semibold text-accent-strong hover:underline sm:inline"
            >
              See all 5 →
            </LocalizedLink>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRY_SLUGS.filter((s) => s !== industry.slug).map((s) => {
              const data = INDUSTRY_DATA[s];
              const NeighborIcon = iconMap[s];
              const label =
                t.industries.items.find((it) => it.id === s)?.name ??
                data.serviceType;
              return (
                <LocalizedLink
                  key={s}
                  href={`/industries/${s}`}
                  className="group flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-all hover:border-accent/40 hover:bg-surface"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                    <NeighborIcon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {label}
                    </div>
                    <div className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {data.hero.subtitle.split(".")[0]}.
                    </div>
                  </div>
                </LocalizedLink>
              );
            })}
          </div>
        </div>
      </Section>

      <IndiaGeoFooter country={country} locale={locale} pageKey="industries" />
      <Cta t={t} country={country} />
    </>
  );
}
