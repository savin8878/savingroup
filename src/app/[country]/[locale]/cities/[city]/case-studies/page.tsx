import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Mail,
  MapPin,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  getTranslation,
  type Locale,
  LOCALE_CODES,
} from "@/lib/i18n";
import { BASE_URL } from "@/lib/constants";
import {
  INDIA_CITIES,
  getCityBySlug,
  localizeCity,
  isCityIndexable,
} from "@/lib/cities";
import { getCityIdentity } from "@/lib/city-identity";
import { getCityExtras } from "@/lib/city-extras";
import { buildBreadcrumbJsonLd, buildCityAlternates } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { SnapRowHint } from "@/components/primitives/snap-row-hint";
import { Cta } from "@/components/sections/Cta";
import { CityPageNav } from "@/components/sections/CityPageNav";
import { CityContextMap } from "@/components/illustrations/CityPageVisuals";
import LocalizedLink from "@/components/LocalizedLink";

const SUB_PATH = "case-studies";

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
  const city = localizeCity(baseCity, lc);
  // EN-only for now (see services/page.tsx for rationale).
  // Robots MUST come from the same predicate that builds the hreflang
  // cluster below (`buildCityAlternates` -> `isCityIndexable`). If these two
  // disagree, the page ships `noindex` next to a full alternates cluster and
  // Google discards the cluster for every member, including the indexable one.
  const indexable = isCityIndexable(baseCity, country, lc);

  const title = `${city.name} Case Studies — Revenue Wins, Real Numbers · Sanat Dynamo`;
  const description = `Real ${city.name} engagements with named industries, measured outcomes, and revenue moved. ${city.heroStats[0]?.value ?? ""} ${city.heroStats[0]?.label?.toLowerCase() ?? "impacted"}.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: `${city.slug}/${SUB_PATH}`,
  });

  return {
    title,
    description,
    keywords: `${city.name} case study, ${city.name} client results, ${city.name} agency portfolio, ${city.name} revenue wins, ${city.name} success stories, ${city.name} testimonials`,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "article",
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    other: {
      "geo.country": "IN",
      "geo.region": `IN-${city.stateCode}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
      ICBM: `${city.geo.lat}, ${city.geo.lng}`,
    },
  };
}

export default async function CityCaseStudiesPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}) {
  const { country, locale, city: citySlug } = await params;
  const baseCity = getCityBySlug(citySlug);
  if (!baseCity) notFound();

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const city = localizeCity(baseCity, lc);
  const t = getTranslation(lc);
  const identity = getCityIdentity(city.slug);
  const extras = getCityExtras(city.slug);
  const prefix = `/${country.toLowerCase()}/${lc}`;

  // Filter the global case studies to ones whose location mentions this city.
  // Falls back to industry-match if no location match. Avoids surfacing
  // unrelated case studies on a city page.
  const cityNameLower = city.name.toLowerCase();
  const cityIntents = (extras?.intent ?? []).map((i) => i.toLowerCase());
  const localCaseStudies = t.caseStudies.items.filter((c) =>
    c.location.toLowerCase().includes(cityNameLower)
  );
  const intentMatchedCaseStudies = t.caseStudies.items.filter(
    (c) =>
      !c.location.toLowerCase().includes(cityNameLower) &&
      cityIntents.some((i) => c.industry.toLowerCase().includes(i))
  );
  const featuredCaseStudies = [
    ...localCaseStudies,
    ...intentMatchedCaseStudies,
  ].slice(0, 3);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: `${BASE_URL}${prefix}` },
    { name: "Cities", url: `${BASE_URL}${prefix}/cities` },
    { name: city.name, url: `${BASE_URL}${prefix}/cities/${city.slug}` },
    {
      name: "Case studies",
      url: `${BASE_URL}${prefix}/cities/${city.slug}/${SUB_PATH}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PageHero
        eyebrow={`Proof · ${city.name}`}
        title={
          <>
            <span className="text-accent">{city.name}</span> case studies, real
            numbers.
          </>
        }
        subtitle={`Every win measured the same way — did revenue go up. ${city.heroStats[0]?.value ?? ""} ${city.heroStats[0]?.label?.toLowerCase() ?? ""}.`}
        breadcrumb={`${city.name} · Case studies`}
      />

      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active="case-studies"
        />
      </div>

      {/* ========== City stat strip ========== */}
      <Section className="pt-8 sm:pt-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {city.heroStats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-6"
            >
              <div
                className="font-display text-2xl font-semibold leading-none tracking-tight sm:text-3xl lg:text-[2.6rem]"
                style={{ color: identity?.themeColor ?? "var(--accent)" }}
              >
                {s.value}
              </div>
              <div className="mt-2 text-[11px] leading-tight text-muted-foreground sm:text-xs lg:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ========== Featured case-study spotlight (caseStudyCallout) ========== */}
      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Featured engagement</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              The {city.name} case we tell most often.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {city.industriesAngle}
            </p>
          </div>
          <div className="lg:col-span-7">
            <div
              className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
              style={{
                borderColor: identity?.themeColor.replace(")", " / 0.3)") ?? "var(--border)",
                background: `linear-gradient(140deg, ${identity?.themeColor.replace(")", " / 0.06)") ?? "var(--surface)"}, transparent 70%)`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
                style={{ background: identity?.themeColor.replace(")", " / 0.15)") ?? "transparent" }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{
                    borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--accent)",
                    color: identity?.themeColor ?? "var(--accent)",
                  }}
                >
                  <Sparkles size={11} />
                  {city.name} engagement
                </div>
                <p className="mt-5 text-base leading-relaxed text-foreground sm:text-lg">
                  {city.caseStudyCallout}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ========== Curated case studies (matched to this city) ========== */}
      {featuredCaseStudies.length > 0 && (
        <Section className="bg-surface/20 pt-0">
          <div className="max-w-3xl">
            <Eyebrow>Wins across the {city.name} ecosystem</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Engagements relevant to {city.name} buyers.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Each card below is a real engagement — sometimes from {city.name}{" "}
              directly, sometimes from a city with the same industry mix. The
              playbook transfers.
            </p>
          </div>

          {/* Mobile: snap-x carousel. md+: grid */}
          <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-12 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none md:grid md:grid-cols-3">
            {featuredCaseStudies.map((c) => (
              <article
                key={c.id}
                className="group relative flex w-[84vw] max-w-[340px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-7 md:h-full"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {c.industry}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    <MapPin size={9} />
                    {c.location}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                  {c.title}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {c.summary}
                </p>
                {c.metrics && c.metrics.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    {c.metrics.slice(0, 3).map((m, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="font-display text-base font-semibold leading-none tracking-tight"
                          style={{ color: identity?.themeColor ?? "var(--accent)" }}
                        >
                          {m.delta}
                        </div>
                        <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <LocalizedLink
                  href={`/case-studies#${c.id}`}
                  className="mt-5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent transition-colors hover:text-foreground"
                >
                  Full case study
                  <ArrowUpRight size={11} />
                </LocalizedLink>
              </article>
            ))}
          </div>
          <SnapRowHint count={featuredCaseStudies.length} />
        </Section>
      )}

      {/* ========== Local testimonials ========== */}
      {city.testimonials && city.testimonials.length > 0 && (
        <Section className="pt-0">
          <div className="max-w-3xl">
            <Eyebrow>{city.name} voice</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              What {city.name} promoters tell us.
            </h2>
          </div>
          {/* Mobile: snap-x carousel. sm+: 2-col grid */}
          <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-10 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
            {city.testimonials.map((tm, i) => (
              <figure
                key={i}
                className="relative w-[84vw] max-w-[340px] flex-shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 sm:w-auto sm:max-w-none sm:flex-shrink sm:p-8"
              >
                <Quote
                  size={28}
                  className="text-accent/20"
                  strokeWidth={1.4}
                />
                <blockquote className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
                  &ldquo;{tm.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-5">
                  <div className="text-sm font-semibold text-foreground">
                    {tm.author}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {tm.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <SnapRowHint count={city.testimonials.length} />
        </Section>
      )}

      {/* ========== Why these results in this city ========== */}
      <Section className="bg-surface/20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Why it lands here</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              The {city.name} reasons we win.
            </h2>
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {city.whyHire.map((wh, i) => (
              <article
                key={wh.title}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-surface/40 p-5"
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-semibold"
                  style={{
                    borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--border)",
                    color: identity?.themeColor ?? "var(--accent)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {wh.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {wh.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== Map ========== */}
      <section className="relative px-3 pt-6 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <CityContextMap
            city={city}
            themeColor={identity?.themeColor}
            themeColorAccent={identity?.themeColorAccent}
            prefix={prefix}
          />
        </div>
      </section>

      {/* ========== Related sub-pages ========== */}
      <Section className="pt-10 sm:pt-14 lg:pt-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: `/cities/${city.slug}/services`,
              label: "Services in " + city.name,
              desc: "6 productized revenue systems framed for " + city.name + ".",
              Icon: Briefcase,
            },
            {
              href: `/cities/${city.slug}/process`,
              label: "How we deliver in " + city.name,
              desc: "Engagement journey, weekly cadence, the tools we deploy.",
              Icon: Star,
            },
            {
              href: `/cities/${city.slug}/contact`,
              label: "Book a " + city.name + " audit",
              desc: "WhatsApp · phone · 45-minute revenue audit.",
              Icon: Mail,
            },
          ].map(({ href, label, desc, Icon }) => (
            <LocalizedLink
              key={href}
              href={href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  Next page
                </span>
              </div>
              <div className="mt-3 font-display text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-lg">
                {label}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground">
                Open
                <ArrowUpRight
                  size={11}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </LocalizedLink>
          ))}
        </div>
      </Section>

      <Cta t={t} country={country} />
    </>
  );
}
