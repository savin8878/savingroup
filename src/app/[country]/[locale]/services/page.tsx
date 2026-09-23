import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildServiceJsonLd, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Cta } from "@/components/sections/Cta";
import { Faq } from "@/components/sections/Faq";
import { CityBanner } from "@/components/sections/CityBanner";
import { CountryMarketContext } from "@/components/sections/CountryMarketContext";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { TechStack } from "@/components/sections/TechStack";
import { KnowMore } from "@/components/sections/KnowMore";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { Section, SectionHeader } from "@/components/primitives/section";
import { Check, Sparkles, ArrowUpRight, Target } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { serviceIllustrations } from "@/components/illustrations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "services",
    country,
    locale: locale as Locale,
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);
  const serviceLd = t.services.items.map((s) =>
    buildServiceJsonLd(s, locale as Locale, country)
  );
  const breadcrumbLd = buildPageBreadcrumbJsonLd("services", locale as Locale, country);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <PageHero
        eyebrow={t.services.eyebrow}
        title={
          <>
            We don&apos;t sell services.{" "}
            <span className="text-accent">We solve problems.</span>
          </>
        }
        subtitle={t.services.subtitle}
        breadcrumb="Services"
      />

      <CityBanner t={t} country={country} locale={locale as Locale} />
      <CountryMarketContext t={t} country={country} locale={locale as Locale} pageKey="services" />

      {/* Quick navigator */}
      <Section className="pt-8">
        <div className="rounded-3xl border border-border bg-surface/40 p-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.items.map((s) => (
              <LocalizedLink
                key={s.id}
                href={`/services#${s.id}`}
                className="group flex items-center justify-between rounded-2xl border border-border bg-background px-5 py-4 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                    {s.number}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {s.name}
                  </span>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                />
              </LocalizedLink>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-6">
          {t.services.items.map((s, i) => {
            const right = i % 2 === 1;
            const Illust = serviceIllustrations[i];
            return (
              <article
                key={s.id}
                id={s.id}
                className="group relative scroll-mt-32 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface/60 transition-colors hover:border-accent/30"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/5 blur-3xl"
                />
                {/* Service blueprint sketch */}
                {Illust && (
                  <div className="pointer-events-none absolute right-8 top-8 hidden h-32 w-40 opacity-80 transition-opacity duration-500 group-hover:opacity-100 lg:block">
                    <Illust className="h-full w-full" />
                  </div>
                )}

                <div className="grid gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12">
                  {/* Left: name + summary */}
                  <div
                    className={`relative lg:col-span-5 ${right ? "lg:order-2" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-5xl font-semibold leading-none tracking-tight text-accent/30">
                        {s.number}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                        {s.kicker}
                      </span>
                    </div>
                    <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {s.name}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                      {s.summary}
                    </p>

                    <div className="mt-6 rounded-2xl border border-border bg-background p-5">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        <Target size={11} className="text-accent" />
                        Built for
                      </div>
                      <div className="mt-2 text-sm text-foreground">
                        {s.for}
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between rounded-2xl border border-accent/30 bg-accent/5 p-5">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                          Investment
                        </div>
                        <div className="mt-2 font-display text-xl font-semibold text-foreground">
                          {s.investment}
                        </div>
                      </div>
                    </div>

                    <LocalizedLink
                      href="/contact"
                      className="group/btn relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent-strong px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_8px_28px_-10px_oklch(0.78_0.165_70/0.6)] transition-all hover:-translate-y-0.5"
                    >
                      Discuss this system
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      />
                    </LocalizedLink>
                  </div>

                  {/* Right: deliverables + outcomes */}
                  <div
                    className={`lg:col-span-7 ${right ? "lg:order-1" : ""}`}
                  >
                    <div className="rounded-2xl border border-border bg-background/60 p-6">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                          Deliverables
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {s.deliverables.length} items
                        </span>
                      </div>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {s.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <Check
                              size={14}
                              strokeWidth={3}
                              className="mt-1 shrink-0 text-accent"
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft p-6">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                        <Sparkles size={11} />
                        Expected outcomes
                      </div>
                      <ul className="mt-4 space-y-2.5">
                        {s.outcomes.map((o) => (
                          <li
                            key={o}
                            className="flex items-start gap-3 text-base font-semibold text-foreground"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <FeatureGrid t={t} />
      <TechStack t={t} />
      <Faq t={t} />
      <KnowMore t={t} pageKey="services" pageLabel="Services" />
      <IndiaGeoFooter country={country} locale={locale} pageKey="services" />
      <Cta t={t} />
    </>
  );
}
