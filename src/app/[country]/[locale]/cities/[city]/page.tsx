import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Landmark,
  MapPin,
  Sparkles,
  Star,
  Building2,
  Users,
  Plus,
} from "lucide-react";
import {
  getTranslation,
  type Locale,
  LOCALE_CODES,
} from "@/lib/i18n";
import {
  BASE_URL,
} from "@/lib/constants";
import {
  INDIA_CITIES,
  getCityBySlug,
  isCityIndexable,
  localizeCity,
  type CityContent,
} from "@/lib/cities";
import { getCityExtras } from "@/lib/city-extras";
import { getCityIdentity } from "@/lib/city-identity";
import { getCityPosts } from "@/lib/city-blog";
import { getCityOrganization } from "@/lib/city-organization";
import {
  buildBreadcrumbJsonLd,
  buildCityAlternates,
  buildFaqJsonLd,
} from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeader, Eyebrow } from "@/components/primitives/section";
import { SnapRowHint } from "@/components/primitives/snap-row-hint";
import { Cta } from "@/components/sections/Cta";
import { CityStickyShell, type CityTocItem } from "@/components/sections/CityStickyShell";
import {
  CityHiddenGem,
  CityGlobalPeersCard,
  CityContextMap,
} from "@/components/illustrations/CityPageVisuals";
import { CityPageNav } from "@/components/sections/CityPageNav";
import {
  PresenceOrbit,
  EngagementJourney,
  StackBlueprint,
  CadenceClock,
  ProofGrid,
  CommercialPosture,
} from "@/components/illustrations/CityOrganizationVisuals";
import { cityIdentityVisuals } from "@/components/illustrations/CityIdentityVisuals";
import LocalizedLink from "@/components/LocalizedLink";

const CITIES_PATH = "cities";

/* -------------------------------------------------------------------------- */
/*                       generateStaticParams + Metadata                      */
/* -------------------------------------------------------------------------- */

/**
 * Pre-render every city × en/hi at build time. Other locales render on-demand
 * via the parent dynamic segments and inherit the same content via i18n
 * fallback. Building only en+hi keeps the static surface focused on the two
 * locales Indian search traffic actually uses.
 */
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
  // Apply per-locale body translation (no-op for EN; swaps body fields for
  // HI when `translations.hi` exists on the city).
  const city = localizeCity(baseCity, lc);

  // Per-city indexability: /in/en is always indexable, /in/hi only when this
  // specific city has a complete Hindi body block (overrides global
  // INDEXABLE_LOCALES which is "en"-only since 2026-05-09).
  const indexable = isCityIndexable(baseCity, country, lc);

  // Hreflang cluster is built in `buildCityAlternates` using
  // `getCityIndexableLocales(baseCity)`. The cluster only includes locales
  // this specific city has body translations for, and the languages map is
  // omitted entirely on noindex locale variants (so a /in/zh/cities/mumbai
  // doesn't try to fake-cluster with the EN/HI pages).
  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: city.slug,
  });

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    keywords: city.metaKeywords,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: `Sanat Dynamo — ${city.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: city.metaTitle,
      description: city.metaDescription,
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
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    other: {
      "geo.country": "IN",
      "geo.region": `IN-${city.stateCode}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
      ICBM: `${city.geo.lat}, ${city.geo.lng}`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              Page component                                */
/* -------------------------------------------------------------------------- */

export default async function CityPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}) {
  const { country, locale, city: citySlug } = await params;
  const baseCity = getCityBySlug(citySlug);

  // An unknown slug is still a hard 404. The country gate was dropped on
  // 2026-09-09 — city pages now render (and index) in every market, so the
  // hreflang cluster and the per-country sitemaps don't point at 404s.
  if (!baseCity) {
    notFound();
  }

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  // Body localization (no-op for EN; swaps localContext, whyHire, faq, etc.
  // for HI when this city has a `translations.hi` block).
  const city = localizeCity(baseCity, lc);
  const t = getTranslation(lc);
  const extras = getCityExtras(city.slug);
  const identity = getCityIdentity(city.slug);
  const Identity = cityIdentityVisuals[city.slug];
  const posts = getCityPosts(city.slug);
  const org = getCityOrganization(city.slug);

  const phoneDisplay = t.contact.details.phone;
  const whatsappE164 = phoneDisplay.replace(/[^\d]/g, "");

  // Table of contents for the sticky scroll-spy. Each id matches a section
  // in the right column. Order = scroll order. SEO: each one is an in-page
  // anchor Google can crawl.
  const toc: CityTocItem[] = [
    { id: "context", label: "Local context", eyebrow: "01" },
    ...(identity
      ? [{ id: "places-heritage", label: "Places & heritage", eyebrow: "02" }]
      : []),
    ...(extras
      ? [{ id: "hidden-gem", label: "Hidden gem", eyebrow: "03" }]
      : []),
    ...(org
      ? [
          { id: "operating-model", label: `How we operate in ${city.name}`, eyebrow: "04" },
          { id: "engagement", label: "Engagement journey", eyebrow: "05" },
          { id: "stack", label: "Local stack signature", eyebrow: "06" },
          { id: "cadence", label: "Weekly cadence", eyebrow: "07" },
          { id: "proof", label: "Proof in this city", eyebrow: "08" },
        ]
      : []),
    { id: "why-hire", label: "Why hire us here", eyebrow: "09" },
    { id: "neighborhoods", label: "Neighborhoods we serve", eyebrow: "10" },
    { id: "industries-angle", label: "Industries angle", eyebrow: "11" },
    ...(extras
      ? [{ id: "global-peers", label: "Global peers", eyebrow: "12" }]
      : []),
    { id: "case-study", label: "Case study", eyebrow: "13" },
    { id: "testimonials", label: "Client voices", eyebrow: "14" },
    { id: "faq", label: "Common questions", eyebrow: "15" },
  ];

  return (
    <>
      <CityJsonLd city={city} country={country} locale={lc} t={t} />
      <CityHero city={city} t={t} />

      {/* Sub-page nav — chip strip linking the 7 city sub-pages together */}
      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active=""
        />
      </div>

      {/* Interactive India map — current city highlighted in the network of
          all metros we ship into. Click any other pin to navigate to that
          city's playbook. Renders full-width above the deep-dive sticky shell. */}
      <section className="relative px-3 pt-6 sm:px-6 sm:pt-10 lg:px-10 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <CityContextMap
            city={city}
            themeColor={identity?.themeColor}
            themeColorAccent={identity?.themeColorAccent}
            prefix={`/${country.toLowerCase()}/${lc}`}
          />
        </div>
      </section>

      <section className="relative scroll-mt-24 py-8 sm:py-12 lg:py-20">
        <CityStickyShell
          city={city}
          identity={identity}
          org={org}
          posts={posts.length}
          whatsappNumber={whatsappE164}
          phoneNumber={phoneDisplay}
          toc={toc}
        >
          {/* ===== 01 — Local context ===== */}
          <article id="context" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="01">
              Local context
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              How {city.name} actually buys.
            </h2>
            <div className="mt-5 space-y-4">
              {city.localContext.map((p, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          </article>

          {/* ===== 02 — Places & heritage ===== */}
          {identity && (
            <article id="places-heritage" className="scroll-mt-32">
              <SectionEyebrow color={identity.themeColor} index="02">
                Places &amp; heritage · {identity.nickname}
              </SectionEyebrow>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                The history that shapes how {city.name} buys today.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                We&apos;re not a tourism guide — but we treat {city.name}&apos;s
                commercial DNA as load-bearing. The clusters, neighbourhoods,
                and buyer instincts you&apos;ll meet in this city all trace
                back to a specific era. Reading that lineage is how our work
                outperforms templates.
              </p>

              {/* Mobile: snap-x carousel. lg+: 3-col grid. */}
              <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-col sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid lg:grid-cols-3">
                {identity.history.map((para, i) => (
                  <article
                    key={i}
                    className="w-[82vw] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface/40 p-5 sm:w-auto sm:max-w-none sm:flex-shrink"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="font-mono text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: identity.themeColor }}
                      >
                        Era · 0{i + 1}
                      </div>
                      {i === 0 && identity.foundedYear && (
                        <span
                          className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]"
                          style={{
                            borderColor: identity.themeColor.replace(")", " / 0.4)"),
                            color: identity.themeColor,
                          }}
                        >
                          Founded {identity.foundedYear}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">
                      {para}
                    </p>
                  </article>
                ))}
              </div>
              <SnapRowHint count={identity.history.length} />

              <div className="mt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Places that anchor {city.name}.
                  </h3>
                  <LocalizedLink
                    href={`/cities/${city.slug}/about`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-foreground"
                  >
                    Full {city.name} heritage page
                    <ArrowUpRight size={12} />
                  </LocalizedLink>
                </div>
                {/* Mobile: snap-x carousel. sm+: 2/3-col grid */}
                <div className="mt-5 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                  {identity.landmarks.slice(0, 6).map((l, i) => (
                    <article
                      key={l.name}
                      className="group relative w-[78vw] max-w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 sm:w-auto sm:max-w-none sm:flex-shrink"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-0.5"
                        style={{
                          background: `linear-gradient(180deg, ${identity.themeColor}, transparent)`,
                        }}
                      />
                      <div className="flex items-start gap-3 pl-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-[10px] font-bold"
                          style={{
                            borderColor: identity.themeColor.replace(")", " / 0.4)"),
                            background: identity.themeColor.replace(")", " / 0.08)"),
                            color: identity.themeColor,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display text-base font-semibold tracking-tight text-foreground">
                            {l.name}
                          </h4>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {l.meaning}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <SnapRowHint count={Math.min(identity.landmarks.length, 6)} />
              </div>
            </article>
          )}

          {/* ===== 03 — Hidden gem ===== */}
          {extras && (
            <article id="hidden-gem" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="03">
                Hidden gem
              </SectionEyebrow>
              <div className="mt-3">
                <CityHiddenGem extras={extras} cityName={city.name} />
              </div>
            </article>
          )}

          {/* ===== 04 — Operating model · presence orbit ===== */}
          {org && (
            <article id="operating-model" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="04">
                How we operate in {city.name}
              </SectionEyebrow>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                The operating model — visualized.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Our presence model in {city.name}, the languages we work in,
                the cadence of our on-site visits, and the local stack we
                deploy.
              </p>
              <div className="mt-6">
                <PresenceOrbit org={org} identity={identity} cityName={city.name} />
              </div>
            </article>
          )}

          {/* ===== 05 — Engagement journey ===== */}
          {org && (
            <article id="engagement" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="05">
                Engagement journey
              </SectionEyebrow>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                4 phases — discovery to compounding.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Every {city.name} engagement runs the same arc: paid
                discovery in week 1, scope locked in weeks 2–3, build in
                weeks 4–14, then a compounding monthly retainer.
              </p>
              <div className="mt-8">
                <EngagementJourney org={org} identity={identity} />
              </div>
            </article>
          )}

          {/* ===== 06 — Local stack ===== */}
          {org && (
            <article id="stack" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="06">
                Local stack signature
              </SectionEyebrow>
              <div className="mt-3">
                <StackBlueprint org={org} identity={identity} />
              </div>
            </article>
          )}

          {/* ===== 07 — Weekly cadence ===== */}
          {org && (
            <article id="cadence" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="07">
                Weekly cadence
              </SectionEyebrow>
              <div className="mt-3">
                <CadenceClock org={org} identity={identity} />
              </div>
            </article>
          )}

          {/* ===== 08 — Proof + commercial ===== */}
          {org && (
            <article id="proof" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="08">
                Proof in this city
              </SectionEyebrow>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                What we&apos;ve actually shipped here.
              </h2>
              <div className="mt-6">
                <ProofGrid org={org} identity={identity} />
              </div>
              <div className="mt-5">
                <CommercialPosture org={org} identity={identity} />
              </div>
            </article>
          )}

          {/* ===== 09 — Why hire us here ===== */}
          <article id="why-hire" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="09">
              Why hire us here
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Three things we do that {city.name} agencies don&apos;t.
            </h2>
            {/* Mobile: snap-x carousel. sm+: 3-col grid */}
            <div className="mt-6 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {city.whyHire.map((item, i) => (
                <div
                  key={item.title}
                  className="w-[82vw] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface/40 p-5 transition-colors hover:border-accent/40 sm:w-auto sm:max-w-none sm:flex-shrink"
                >
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: identity?.themeColor }}
                  >
                    Reason · 0{i + 1}
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <SnapRowHint count={city.whyHire.length} />
          </article>

          {/* ===== 10 — Neighborhoods ===== */}
          <article id="neighborhoods" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="10">
              Areas we serve
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Across {city.name}&apos;s commercial belts — no zone untouched.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Each area has its own buyer pattern. We tailor the build to the
              neighborhood, not the city average.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {city.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: identity?.themeColor ?? "var(--accent)" }}
                  />
                  {n}
                </span>
              ))}
            </div>
          </article>

          {/* ===== 11 — Industries angle ===== */}
          <article id="industries-angle" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="11">
              Industries · {city.name}
            </SectionEyebrow>
            <div
              className="mt-3 rounded-3xl border p-5 sm:p-7"
              style={{
                borderColor: identity?.themeColor.replace(")", " / 0.3)") ?? "var(--border)",
                background: identity
                  ? `linear-gradient(140deg, ${identity.themeColor.replace(")", " / 0.06)")}, transparent 70%)`
                  : undefined,
              }}
            >
              <p className="text-base leading-relaxed text-foreground sm:text-lg">
                {city.industriesAngle}
              </p>
            </div>
          </article>

          {/* ===== 12 — Global peers ===== */}
          {extras && (
            <article id="global-peers" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="12">
                Global peers
              </SectionEyebrow>
              <div className="mt-3">
                <CityGlobalPeersCard city={city} extras={extras} />
              </div>
            </article>
          )}

          {/* ===== 13 — Case study ===== */}
          <article id="case-study" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="13">
              {city.name} case study
            </SectionEyebrow>
            <div
              className="mt-3 rounded-3xl border p-6 sm:p-8"
              style={{
                borderColor: identity?.themeColor.replace(")", " / 0.3)") ?? "var(--border)",
              }}
            >
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                What a {city.name} engagement actually ships.
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {city.caseStudyCallout}
              </p>
              <LocalizedLink
                href="/case-studies"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent"
              >
                See more case studies
                <ArrowUpRight size={13} />
              </LocalizedLink>
            </div>
          </article>

          {/* ===== 14 — Testimonials ===== */}
          {city.testimonials.length > 0 && (
            <article id="testimonials" className="scroll-mt-32">
              <SectionEyebrow color={identity?.themeColor} index="14">
                Client voices
              </SectionEyebrow>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                Operators in {city.name} who&apos;ve shipped with us.
              </h2>
              {/* Mobile: snap-x carousel. sm+: 2-col grid */}
              <div className="mt-6 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
                {city.testimonials.map((tm, i) => (
                  <figure
                    key={i}
                    className="w-[85vw] max-w-[340px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface/40 p-5 sm:w-auto sm:max-w-none sm:flex-shrink"
                  >
                    <div
                      className="flex items-center gap-1"
                      style={{ color: identity?.themeColor ?? "var(--accent)" }}
                    >
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} size={12} fill="currentColor" />
                      ))}
                    </div>
                    <blockquote className="mt-3 text-base leading-relaxed text-foreground">
                      &ldquo;{tm.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 border-t border-border pt-4">
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
            </article>
          )}

          {/* ===== 15 — FAQ ===== */}
          <article id="faq" className="scroll-mt-32">
            <SectionEyebrow color={identity?.themeColor} index="15">
              Common questions
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Direct answers about working with us in {city.name}.
            </h2>
            <div className="mt-6 grid gap-3">
              {city.faq.map((item, idx) => (
                <details
                  key={item.q}
                  open={idx === 0}
                  className="group rounded-2xl border border-border bg-surface/40 p-5 transition-colors open:border-accent/40 open:bg-surface [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-foreground">
                    <span>{item.q}</span>
                    <Plus
                      size={18}
                      className="mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                      style={{ color: identity?.themeColor ?? "var(--accent)" }}
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </article>

          {/* ===== Related cities ===== */}
          <CityRelatedCities city={city} />
        </CityStickyShell>
      </section>

      <Cta t={t} country={country} />
    </>
  );
}

/** Shared eyebrow for in-section labels — keeps the layout consistent. */
function SectionEyebrow({
  color,
  index,
  children,
}: {
  color?: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
      style={{
        borderColor: color?.replace(")", " / 0.4)") ?? "var(--border)",
        background: color?.replace(")", " / 0.08)") ?? "var(--surface)",
        color: color ?? "var(--accent)",
      }}
    >
      <span
        className="font-bold"
        style={{ opacity: 0.7 }}
      >
        §{index}
      </span>
      <span>{children}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            JSON-LD (per-city)                              */
/* -------------------------------------------------------------------------- */

function CityJsonLd({
  city,
  country,
  locale,
  t,
}: {
  city: CityContent;
  country: string;
  locale: Locale;
  t: ReturnType<typeof getTranslation>;
}) {
  const url = `${BASE_URL}/${country}/${locale}/${CITIES_PATH}/${city.slug}`;
  const aboutUrl = `${url}/about`;
  const org = getCityOrganization(city.slug);
  const identity = getCityIdentity(city.slug);

  // Breadcrumb: Home → Cities → {City}
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: `${BASE_URL}/${country}/${locale}` },
    { name: "Cities", url: `${BASE_URL}/${country}/${locale}/${CITIES_PATH}` },
    { name: city.name, url },
  ]);

  // LocalBusiness — the single most important schema for ranking on
  // "best [service] in [city]" intent. Enriched with the operational
  // layer (languages, local stack categories, on-site cadence) so the
  // operating-model content has structured-data parity with the UI.
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#business`,
    name: `${t.brand.name} — ${city.name}`,
    url,
    image: `${BASE_URL}/og.png`,
    description: city.metaDescription,
    priceRange: "₹₹₹",
    telephone: t.contact.details.phone,
    email: t.contact.details.emailHref,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.geo.lat,
      longitude: city.geo.lng,
    },
    areaServed: [
      { "@type": "City", name: city.name },
      ...city.neighborhoods.map((n) => ({ "@type": "Place", name: n })),
    ],
    // Languages we operate in here — surfaces in Google's localBusiness
    // rich result + helps multi-lingual intent searches anchor correctly.
    ...(org && {
      availableLanguage: org.languages.map((l) => ({
        "@type": "Language",
        name: l,
      })),
    }),
    // Hours of operation — required for many local rich-result eligibility.
    ...(org && {
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
        validFrom: "2024-01-01",
      },
    }),
    knowsAbout: [
      "Website Development",
      "WhatsApp Automation",
      "SEO",
      "Custom Software",
      "ERP Integration",
      "D2C Commerce",
      "Lead Generation",
      // Pull the city-specific stack categories into knowsAbout — these are
      // the long-tail intents we genuinely cover in this metro.
      ...(org?.stack.map((l) => l.category) ?? []),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services offered in ${city.name}`,
      itemListElement: [
        ...t.services.items.map((s, i) => ({
          "@type": "Offer",
          position: i + 1,
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.summary,
          },
        })),
        // The local-stack layers as catalog entries — extends the offer
        // surface with city-specific service variants.
        ...(org?.stack.map((layer, i) => ({
          "@type": "Offer",
          position: t.services.items.length + i + 1,
          itemOffered: {
            "@type": "Service",
            name: `${layer.category} — ${city.name}`,
            description: layer.cityNote,
            serviceType: layer.category,
            provider: { "@id": `${url}#business` },
          },
        })) ?? []),
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      ratingCount: "50",
      reviewCount: String(city.testimonials.length),
    },
    review: city.testimonials.map((tm) => ({
      "@type": "Review",
      author: { "@type": "Person", name: tm.author },
      reviewBody: tm.quote,
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    })),
  };

  // HowTo — the engagement journey rendered as a HowTo so Google can
  // surface it for "how to work with {agency} in {city}" intent searches.
  // Each step has a city-specific note so it isn't templated.
  const howToLd = org && {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#engagement`,
    name: `How to engage Sanat Dynamo in ${city.name}`,
    description: `The 4-phase engagement journey for revenue-system builds in ${city.name}, from paid discovery to compounding monthly retainer.`,
    totalTime: "PT3M",
    inLanguage: locale,
    step: org.engagement.map((phase, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: phase.name,
      text: `${phase.mission} ${phase.cityNote}`.trim(),
      url: `${url}#engagement`,
      itemListElement: phase.artefacts.map((a, j) => ({
        "@type": "HowToDirection",
        position: j + 1,
        text: a,
      })),
    })),
  };

  // FAQ — city-specific FAQs go into Google's FAQ rich result for the page
  const faqLd = buildFaqJsonLd(city.faq);

  // TouristDestination — surfaces the city's landmarks as structured data
  // so the page is eligible for Google's place / knowledge-panel features.
  // Each landmark uses LandmarksOrHistoricalBuildings (subtype of Place)
  // and references the canonical /about Place node so the schemas link up
  // instead of duplicating across the two URLs.
  const placesLd = identity && {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": `${url}#destination`,
    name: `${city.name} — ${identity.nickname}`,
    alternateName: identity.nicknameRegional,
    description: identity.tagline,
    url,
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.geo.lat,
      longitude: city.geo.lng,
    },
    touristType: identity.economy.map((e) => e.cluster),
    includesAttraction: identity.landmarks.map((l) => ({
      "@type": "LandmarksOrHistoricalBuildings",
      name: l.name,
      description: l.meaning,
      containedInPlace: { "@type": "City", name: city.name },
    })),
  };

  // ItemList — a parallel signal that the page indexes a finite, ordered
  // list of named landmarks. ItemList is what powers Google's "carousel"
  // rich result for places.
  const landmarksItemListLd = identity && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#landmarks`,
    name: `Landmarks of ${city.name}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: identity.landmarks.length,
    itemListElement: identity.landmarks.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LandmarksOrHistoricalBuildings",
        name: l.name,
        description: l.meaning,
        url: `${aboutUrl}#${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      },
    })),
  };

  // City-anchored web page node — ties the URL itself to the locality
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: city.metaTitle,
    description: city.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${BASE_URL}/${country}/${locale}#website` },
    about: { "@id": `${url}#business` },
    breadcrumb: breadcrumbLd,
    // Anchor the WebPage to the engagement HowTo so the relationship
    // is explicit to Google's knowledge graph.
    ...(howToLd && { mainEntity: { "@id": `${url}#engagement` } }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {placesLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placesLd) }}
        />
      )}
      {landmarksItemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(landmarksItemListLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Sections (city)                                */
/* -------------------------------------------------------------------------- */

function CityHero({
  city,
  t,
}: {
  city: CityContent;
  t: ReturnType<typeof getTranslation>;
}) {
  const identity = getCityIdentity(city.slug);
  const Identity = cityIdentityVisuals[city.slug];
  const accentBorder = identity?.themeColor.replace(")", " / 0.3)") ?? "var(--border)";
  return (
    <>
      <PageHero
        eyebrow={`${city.name} · ${city.state}${
          identity ? ` · ${identity.nickname}` : ""
        }`}
        title={
          <>
            The best website development & revenue-system company in{" "}
            <span
              className={identity ? "bg-clip-text text-transparent" : "text-accent"}
              style={
                identity
                  ? {
                      backgroundImage: `linear-gradient(120deg, ${identity.themeColor}, ${identity.themeColorAccent})`,
                    }
                  : undefined
              }
            >
              {city.name}
            </span>
            .
          </>
        }
        subtitle={city.heroSubheadline}
        breadcrumb={city.name}
      />

      {Identity && identity && (
        <div className="container-px mx-auto mt-8 max-w-7xl sm:mt-10 lg:mt-12">
          <figure
            className="relative overflow-hidden rounded-3xl border bg-surface/30 p-2 sm:p-4"
            style={{ borderColor: accentBorder }}
          >
            <Identity className="block h-auto w-full rounded-2xl" />
            <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 sm:inset-x-5 sm:bottom-5">
              <span
                className="rounded-full border bg-background/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground backdrop-blur"
                style={{ borderColor: identity.themeColor.replace(")", " / 0.4)") }}
              >
                {identity.nickname}
              </span>
              <span className="hidden rounded-full bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur sm:inline">
                Hand-drawn blueprint · {city.name}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function CityRelatedCities({ city }: { city: CityContent }) {
  const related = city.relatedCities
    .map((slug) => INDIA_CITIES.find((c) => c.slug === slug))
    .filter((c): c is CityContent => Boolean(c));
  if (!related.length) return null;
  return (
    <article id="related-cities" className="scroll-mt-32">
      <div className="rounded-3xl border border-border bg-surface/30 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              Other Indian metros
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Looking somewhere else?
            </h3>
          </div>
          <LocalizedLink
            href="/cities"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:border-accent/50 hover:text-accent sm:inline-flex"
          >
            All cities
            <ArrowUpRight size={11} />
          </LocalizedLink>
        </div>

        {/* Mobile: snap-x carousel. sm+: 2/3-col grid */}
        <div className="mt-6 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {related.map((r) => (
            <LocalizedLink
              key={r.slug}
              href={`/cities/${r.slug}`}
              className="group flex w-[70vw] max-w-[260px] flex-shrink-0 snap-start items-center justify-between rounded-2xl border border-border bg-background px-5 py-4 transition-all hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink"
            >
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {r.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {r.state}
                </div>
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              />
            </LocalizedLink>
          ))}
        </div>
        <SnapRowHint count={related.length} />
      </div>
    </article>
  );
}
