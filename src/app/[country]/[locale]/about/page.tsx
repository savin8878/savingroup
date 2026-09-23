import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeader } from "@/components/primitives/section";
import { TeamBlock } from "@/components/sections/TeamBlock";
import { Cta } from "@/components/sections/Cta";
import { Testimonials } from "@/components/sections/Testimonials";
import { CityBanner } from "@/components/sections/CityBanner";
import { CountryMarketContext } from "@/components/sections/CountryMarketContext";
import { BigNumbers } from "@/components/sections/BigNumbers";
import { KnowMore } from "@/components/sections/KnowMore";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import {
  Compass,
  Layers,
  Repeat,
  Calculator,
  Search,
  Hammer,
  Rocket,
} from "lucide-react";
import { TimelineSVG, ValuesConstellation, EmbeddedTeamVisual } from "@/components/illustrations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "about",
    country,
    locale: locale as Locale,
  });
}

const valueIcons = [Compass, Layers, Repeat, Calculator] as const;

const timeline = [
  {
    year: "2022",
    title: "First revenue audit",
    body: "Started as a 2-person team obsessed with one question: why do agencies sell 'websites' instead of revenue?",
    icon: Search,
  },
  {
    year: "2023",
    title: "Productized 6 systems",
    body: "Stopped selling hours. Built repeatable systems — RevSite, AutoSell, LocalDom, GlobalScale, OperateOS, GrowthOS.",
    icon: Hammer,
  },
  {
    year: "2024",
    title: "Crossed ₹40Cr revenue impact",
    body: "50+ engagements across 5 industries. The math worked. Clients renewed. Word spread.",
    icon: Rocket,
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);
  const breadcrumbLd = buildPageBreadcrumbJsonLd("about", locale as Locale, country);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <PageHero
        eyebrow={t.about.eyebrow}
        title={
          <>
            We are a{" "}
            <span className="text-accent">revenue-focused</span> systems
            partner.
          </>
        }
        subtitle={t.about.lead}
        breadcrumb="About"
      />

      <CityBanner t={t} country={country} locale={locale as Locale} />
      <CountryMarketContext t={t} country={country} locale={locale as Locale} pageKey="about" />

      <Section className="pt-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              {t.about.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Inline pull quote */}
            <blockquote className="mt-10 rounded-3xl border-l-2 border-accent bg-surface/40 px-7 py-6">
              <p className="font-display text-xl italic leading-relaxed text-foreground sm:text-2xl">
                &ldquo;The best agencies feel less like vendors and more like a
                quiet, ruthless growth team that lives inside your business.&rdquo;
              </p>
              <footer className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                — How we run every engagement
              </footer>
            </blockquote>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl sm:rounded-3xl border border-border bg-surface/60 p-5 sm:p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                By the numbers
              </div>
              <div className="mt-6 space-y-6">
                {t.socialProof.stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-end justify-between border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {s.label}
                    </span>
                    <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl border border-accent/30 bg-accent/5 p-5 sm:p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                What you can expect
              </div>
              <ul className="mt-5 space-y-3 text-sm text-foreground">
                <li>→ Senior engineers on every call — not account managers.</li>
                <li>→ Weekly demo + written changelog. No black box.</li>
                <li>→ Fixed scope, fixed price, fixed go-live date.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      {/* Embedded Team Visual */}
      <Section className="pt-0">
        <div className="hidden lg:block">
          <EmbeddedTeamVisual className="mx-auto max-w-2xl" />
        </div>
      </Section>

      {/* Timeline */}
      <Section className="pt-0">
        <SectionHeader
          eyebrow="Our story"
          title="A short history of how we got here."
        />
        {/* Animated timeline diagram */}
        <div className="mt-8 hidden sm:block">
          <TimelineSVG className="mx-auto max-w-3xl opacity-80" />
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {timeline.map((tl, i) => {
            const Icon = tl.icon;
            return (
              <div
                key={tl.year}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface/60 p-5 sm:p-7 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-opacity group-hover:bg-accent/15" />
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-accent">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="font-display text-3xl font-semibold tracking-tight text-accent/40">
                    {tl.year}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {tl.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tl.body}
                </p>
                <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Chapter · 0{i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <TeamBlock />

      {/* Principles */}
      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="Our principles"
              title="Four rules we run by."
            />
          </div>
          <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center">
            <ValuesConstellation className="max-w-[240px]" />
          </div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {t.about.values.map((v, i) => {
            const Icon = valueIcons[i] ?? Compass;
            return (
              <div
                key={v.title}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface/60 p-5 sm:p-8 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-opacity group-hover:bg-accent/15" />
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-accent">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent-strong">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      <BigNumbers t={t} />
      <Testimonials t={t} />
      <KnowMore t={t} pageKey="about" pageLabel="About" />
      <IndiaGeoFooter country={country} locale={locale} pageKey="about" />
      <Cta t={t} />
    </>
  );
}
