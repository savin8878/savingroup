import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
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
import { getCityOrganization } from "@/lib/city-organization";
import { buildBreadcrumbJsonLd, buildCityAlternates } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { Cta } from "@/components/sections/Cta";
import { CityPageNav } from "@/components/sections/CityPageNav";
import { CityContextMap } from "@/components/illustrations/CityPageVisuals";
import {
  PresenceOrbit,
  EngagementJourney,
  StackBlueprint,
  CadenceClock,
  ProofGrid,
  CommercialPosture,
} from "@/components/illustrations/CityOrganizationVisuals";
import LocalizedLink from "@/components/LocalizedLink";

const SUB_PATH = "process";

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

  const title = `How We Work in ${city.name} — Engagement Process, Cadence & Stack · Sanat Dynamo`;
  const description = `The 4-phase engagement journey, weekly cadence, tooling, and commercial terms for Sanat Dynamo builds in ${city.name}. Fixed-price proposals, weekly Friday demos, GST-compliant invoicing.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: `${city.slug}/${SUB_PATH}`,
  });

  return {
    title,
    description,
    keywords: `${city.name} agency engagement process, ${city.name} fixed price web development, ${city.name} weekly demo cadence, ${city.name} development stack, hire web agency ${city.name}, ${city.name} digital agency process`,
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

export default async function CityProcessPage({
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
  const org = getCityOrganization(city.slug);
  const prefix = `/${country.toLowerCase()}/${lc}`;

  // City has rich org data shipped — without it the page would be thin, so
  // we 404 rather than render something boilerplate.
  if (!org) notFound();

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: `${BASE_URL}${prefix}` },
    { name: "Cities", url: `${BASE_URL}${prefix}/cities` },
    { name: city.name, url: `${BASE_URL}${prefix}/cities/${city.slug}` },
    {
      name: "Process",
      url: `${BASE_URL}${prefix}/cities/${city.slug}/${SUB_PATH}`,
    },
  ]);

  // HowTo JSON-LD: each engagement phase becomes a step. Surfaces in
  // "How does an agency work in {city}" rich-result intent queries.
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Engagement process for Sanat Dynamo in ${city.name}`,
    description: org.presenceTagline,
    step: org.engagement.map((phase, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: phase.name,
      text: `${phase.mission} ${phase.cityNote}`,
      timeRequired: phase.duration,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />

      <PageHero
        eyebrow={`Process · ${city.name}`}
        title={
          <>
            How a{" "}
            <span className="text-accent">{city.name}</span> engagement runs.
          </>
        }
        subtitle={org.presenceTagline}
        breadcrumb={`${city.name} · Process`}
      />

      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active="process"
        />
      </div>

      {/* ========== Operating model strip ========== */}
      <Section className="pt-8 sm:pt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
            <Users size={14} className="text-accent" />
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Lead role
            </div>
            <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {org.leadRole}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
            <Clock size={14} className="text-accent" />
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Working hours
            </div>
            <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {org.hours}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
            <MessageCircle size={14} className="text-accent" />
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Languages
            </div>
            <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {org.languages.join(" · ")}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
            <TrendingUp size={14} className="text-accent" />
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              On-site
            </div>
            <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {org.onSiteCadence}
            </div>
          </div>
        </div>
      </Section>

      {/* ========== Presence orbit ========== */}
      <Section className="pt-0">
        <PresenceOrbit org={org} identity={identity} cityName={city.name} />
      </Section>

      {/* ========== Engagement journey ========== */}
      <Section className="pt-0">
        <div className="max-w-3xl">
          <Eyebrow>4-phase engagement</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Discovery → design → build → compound.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The same 4-phase shape every {city.name} engagement follows. Each
            phase ships defined artefacts so the founder always knows what
            comes next and what just got delivered.
          </p>
        </div>
        <div className="mt-8 sm:mt-10">
          <EngagementJourney org={org} identity={identity} />
        </div>
      </Section>

      {/* ========== Stack blueprint ========== */}
      <Section className="bg-surface/20 pt-0">
        <div className="max-w-3xl">
          <Eyebrow>{city.name} default stack</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            The tools we deploy here, and why.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each layer below has a {city.name}-specific reason. Stack choices
            adapt to what local buyers expect, what local payment rails
            support, and what your team can take ownership of post-handover.
          </p>
        </div>
        <div className="mt-8 sm:mt-10">
          <StackBlueprint org={org} identity={identity} />
        </div>
      </Section>

      {/* ========== Cadence clock ========== */}
      <Section className="pt-0">
        <div className="max-w-3xl">
          <Eyebrow>Weekly comm rhythm</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What a week looks like with us in {city.name}.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We default to async-first. The Friday Loom demo is non-negotiable
            and is the moment your founder reviews exactly what shipped.
          </p>
        </div>
        <div className="mt-8 sm:mt-10">
          <CadenceClock org={org} identity={identity} />
        </div>
      </Section>

      {/* ========== Proof grid ========== */}
      <Section className="bg-surface/20 pt-0">
        <div className="max-w-3xl">
          <Eyebrow>Operational fit</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Quantified proof from {city.name} engagements.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            These aren&apos;t outcomes from elsewhere transplanted onto
            {" "}{city.name}. They&apos;re measured here.
          </p>
        </div>
        <div className="mt-8 sm:mt-10">
          <ProofGrid org={org} identity={identity} />
        </div>
      </Section>

      {/* ========== Commercial posture ========== */}
      <Section className="pt-0">
        <div className="max-w-3xl">
          <Eyebrow>Commercials</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How we bill in {city.name}.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Fixed-price by default. INR + GST. NDAs signed before scope.
            Milestone-tied payments — no full upfront, no full hold-back.
          </p>
        </div>
        <div className="mt-8 sm:mt-10">
          <CommercialPosture org={org} identity={identity} />
        </div>
      </Section>

      {/* ========== Comparison: them vs us ========== */}
      <Section className="bg-surface/20">
        <div className="max-w-3xl">
          <Eyebrow>What this means in practice</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Different from a typical {city.name} agency.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
          <article className="rounded-2xl border border-border bg-surface/40 p-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Typical {city.name} agency
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                Hourly retainer, no fixed scope, scope creep eats the budget
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                Monthly status meetings, no shipped artefact between them
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                A separate &quot;account manager&quot; layer between you and builders
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                Vague &quot;branding + digital marketing&quot; deliverables
              </li>
            </ul>
          </article>
          <article
            className="rounded-2xl border p-5 sm:rounded-3xl sm:p-7"
            style={{
              borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--accent)",
              background: identity?.themeColor.replace(")", " / 0.04)") ?? "var(--surface)",
            }}
          >
            <div
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: identity?.themeColor ?? "var(--accent)" }}
            >
              <Sparkles size={11} />
              Sanat Dynamo in {city.name}
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground">
              {[
                "Fixed-price phased proposal, signed before any code is written",
                "Friday Loom demo every week — you see what shipped",
                "Direct Slack with the build team — no account manager layer",
                "Defined artefacts every phase — measured in revenue moved",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: identity?.themeColor ?? "var(--accent)" }}
                  />
                  {line}
                </li>
              ))}
            </ul>
          </article>
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
              label: "Services we ship in " + city.name,
              desc: "6 productized revenue systems framed for " + city.name + ".",
              Icon: Briefcase,
            },
            {
              href: `/cities/${city.slug}/case-studies`,
              label: city.name + " case studies",
              desc: city.caseStudyCallout.split(".")[0] + ".",
              Icon: Sparkles,
            },
            {
              href: `/cities/${city.slug}/contact`,
              label: "Book a " + city.name + " audit",
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
