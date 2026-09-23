import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Target,
  Wrench,
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

const SUB_PATH = "services";

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
  // Sub-pages stay en-only for now: localizeCity swaps the main-page fields,
  // but the new sub-page templates introduce fresh English copy (step
  // descriptions, section headings) that isn't yet translated. Promoting
  // to /in/hi would reproduce the fake-Hindi problem we just fixed.
  // Robots MUST come from the same predicate that builds the hreflang
  // cluster below (`buildCityAlternates` -> `isCityIndexable`). If these two
  // disagree, the page ships `noindex` next to a full alternates cluster and
  // Google discards the cluster for every member, including the indexable one.
  const indexable = isCityIndexable(baseCity, country, lc);

  const title = `Web Development, SEO & Automation Services in ${city.name} · Sanat Dynamo`;
  const description = `6 productized revenue systems built for ${city.name} businesses — high-conversion websites, WhatsApp & CRM automation, local SEO, multi-language sites, custom ERPs, and growth retainers. Fixed scope, fixed price.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: `${city.slug}/${SUB_PATH}`,
  });

  return {
    title,
    description,
    keywords: `${city.name} web development, ${city.name} website services, ${city.name} SEO agency, ${city.name} WhatsApp automation, ${city.name} ERP development, ${city.name} digital agency, custom software ${city.name}`,
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

export default async function CityServicesPage({
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

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: `${BASE_URL}${prefix}` },
    { name: "Cities", url: `${BASE_URL}${prefix}/cities` },
    { name: city.name, url: `${BASE_URL}${prefix}/cities/${city.slug}` },
    {
      name: "Services",
      url: `${BASE_URL}${prefix}/cities/${city.slug}/services`,
    },
  ]);

  // Service-offer JSON-LD: each productized service surfaced as an Offer
  // tied to this city's LocalBusiness page. Helps Google render service-
  // type rich results for "{service} in {city}" queries.
  const offerCatalogLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `Sanat Dynamo Services in ${city.name}`,
    url: `${BASE_URL}${prefix}/cities/${city.slug}/services`,
    itemListElement: t.services.items.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      name: s.name,
      description: s.summary,
      areaServed: {
        "@type": "City",
        name: city.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.stateCode,
          addressCountry: "IN",
        },
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        description: s.investment,
      },
      url: `${BASE_URL}${prefix}/services#${s.id}`,
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
        eyebrow={`Services · ${city.name}`}
        title={
          <>
            Revenue systems we ship in{" "}
            <span className="text-accent">{city.name}</span>.
          </>
        }
        subtitle={city.heroSubheadline}
        breadcrumb={`${city.name} · Services`}
      />

      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active="services"
        />
      </div>

      {/* ========== Local angle ========== */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Local angle</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.4rem]">
              Why services delivered for {city.name} look different.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {city.industriesAngle}
            </p>
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {city.whyHire.map((wh, i) => (
              <article
                key={wh.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:border-accent/40 hover:bg-surface sm:p-6"
              >
                <div className="flex items-start gap-4">
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
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {wh.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {wh.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== Services × city framing ========== */}
      <Section className="bg-surface/20">
        <div className="max-w-3xl">
          <Eyebrow>{t.services.eyebrow}</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {t.services.items.length} packages, framed for {city.name}.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each system below ships fixed-scope, fixed-price. Click into any
            service to see the full deliverables list and investment range.
          </p>
        </div>

        {/* Mobile: snap-x carousel. md+: 2/3-col grid */}
        <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-12 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none md:grid md:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((s, i) => (
            <article
              key={s.id}
              className="group relative flex w-[82vw] max-w-[320px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-6 md:h-full"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  {s.number}
                </span>
                <span
                  className="rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.22em]"
                  style={{
                    borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--border)",
                    color: identity?.themeColor ?? "var(--accent)",
                  }}
                >
                  {city.name}-tuned
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                {s.name}
              </h3>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                {s.kicker}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {s.summary}
              </p>
              <ul className="mt-5 space-y-2 border-t border-border pt-4">
                {s.deliverables.slice(0, 3).map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2
                      size={12}
                      className="mt-[2px] flex-shrink-0 text-accent"
                    />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Investment
                  </div>
                  <div className="mt-0.5 font-display text-sm font-semibold text-foreground">
                    {s.investment}
                  </div>
                </div>
                <LocalizedLink
                  href={`/services#${s.id}`}
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong transition-colors hover:text-foreground"
                >
                  Details
                  <ArrowUpRight size={11} />
                </LocalizedLink>
              </div>
            </article>
          ))}
        </div>
        <SnapRowHint count={t.services.items.length} />
      </Section>

      {/* ========== Industry × service overlap ========== */}
      {extras?.intent && extras.intent.length > 0 && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>{city.name} industries we lead with</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              The sectors driving demand in {city.name}.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              These are the verticals where we&apos;ve shipped the most
              engagements out of {city.name}. Each one informs the kind of
              services we lead with locally.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {extras.intent.map((tag, i) => (
              <div
                key={tag}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl border font-mono text-[10px] font-semibold"
                    style={{
                      borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--border)",
                      color: identity?.themeColor ?? "var(--accent)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Wrench size={14} className="text-muted-foreground" />
                </div>
                <div className="mt-3 font-display text-sm font-semibold leading-tight text-foreground">
                  {tag}
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {city.name} sector
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ========== Neighborhoods served ========== */}
      <Section className="bg-surface/20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Where we ship</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Service areas across {city.name}.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We service clients across {city.name}&apos;s primary commercial
              and residential business clusters. Most engagements run
              remote-first with on-site visits negotiated per project.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {city.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground"
                >
                  <Target size={10} className="text-accent" />
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ========== City constellation map ========== */}
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

      {/* ========== Sub-page jump links ========== */}
      <Section className="pt-10 sm:pt-14 lg:pt-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: `/cities/${city.slug}/process`,
              label: "How we deliver in " + city.name,
              desc: "Engagement journey, weekly cadence, the tools we deploy locally.",
              Icon: Briefcase,
            },
            {
              href: `/cities/${city.slug}/case-studies`,
              label: city.name + " case studies & proof",
              desc: "Wins shipped in " + city.name + " — measured in revenue moved.",
              Icon: Sparkles,
            },
            {
              href: `/cities/${city.slug}/contact`,
              label: "Request a " + city.name + " audit",
              desc: "WhatsApp · phone · 45-minute revenue audit.",
              Icon: ArrowRight,
            },
          ].map(({ href, label, desc, Icon }) => (
            <LocalizedLink
              key={href}
              href={href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  Next page
                </span>
              </div>
              <div className="mt-3 font-display text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent-strong sm:text-lg">
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
