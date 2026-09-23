/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import {
  ShoppingBag,
  Building2,
  GraduationCap,
  Stethoscope,
  Factory,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { SnapRowHint } from "../primitives/snap-row-hint";
import LocalizedLink from "../LocalizedLink";
import { industryIllustrations } from "../illustrations";
import type { Messages } from "@/lib/i18n";
import {
  getCountryContent,
  type IndustryKey,
} from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";

const iconMap = {
  manufacturing: Factory,
  "real-estate": Building2,
  healthcare: Stethoscope,
  ecommerce: ShoppingBag,
  edtech: GraduationCap,
} as const;

export function Industries({
  t,
  country,
  noPadding,
}: {
  t: Messages;
  country?: string;
  noPadding?: boolean;
}) {
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  // Reorder the translation industry items by the country-specific priority.
  // The country-priority list references real industry ids; any id not in
  // the priority list falls back to its original translation order.
  const items = (() => {
    if (!countryContent) return t.industries.items;
    const order = countryContent.industries.order;
    const byId = new Map(t.industries.items.map((it) => [it.id, it]));
    const ordered = order.flatMap((id) => {
      const it = byId.get(id);
      return it ? [it] : [];
    });
    const remaining = t.industries.items.filter(
      (it) => !order.includes(it.id as IndustryKey),
    );
    return [...ordered, ...remaining];
  })();

  return (
    <Section id="industries" className="bg-surface/20">
      <SectionHeader
        eyebrow={t.industries.eyebrow}
        title={t.industries.title}
        subtitle={t.industries.subtitle}
        meta="5 sectors"
      />

      {/* Mobile (<sm): snap-x carousel. sm/md: stacked. lg: bento (col-span 7 + 5).
          Negative margin lets cards bleed to viewport edges on phone. */}
      <div className="mt-10 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-16 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid lg:grid-cols-12">
        {items.map((ind, i) => {
          const Icon = iconMap[ind.id as keyof typeof iconMap];
          const isFeatured = i === 0;
          return (
            <Reveal
              delay={i * 0.05}
              key={ind.id}
              id={ind.id}
              className={`group relative flex w-[82vw] max-w-[320px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all duration-500 hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-7 ${
                isFeatured ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"
              }`}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 hidden h-56 w-56 rounded-full bg-accent/5 blur-3xl transition-opacity duration-500 group-hover:bg-accent/15 sm:block" />
              {isFeatured && (
                <div className="absolute right-6 top-6 z-10 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                  Largest segment
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-accent transition-colors group-hover:border-accent/40">
                  {Icon && <Icon size={20} strokeWidth={1.75} />}
                </div>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {ind.tag}
                </span>
              </div>

              <h3
                className={`mt-6 font-display font-semibold tracking-tight text-foreground ${
                  isFeatured ? "text-3xl sm:text-4xl" : "text-2xl"
                }`}
              >
                {ind.name}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {ind.description}
              </p>

              {/* Country-specific angle — renders under the generic description
                  so the card reads differently on /us/en vs /de/en. */}
              {countryContent?.industries.angle[ind.id as IndustryKey] && (
                <p className="mt-3 rounded-xl border-l-2 border-accent/60 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-foreground">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                    {countryContent.countryName}
                  </span>{" "}
                  {countryContent.industries.angle[ind.id as IndustryKey]}
                </p>
              )}

              {/* Industry sketch illustration */}
              {(() => {
                const Illust = industryIllustrations[ind.id];
                return Illust ? (
                  <div className={`pointer-events-none mt-4 ${isFeatured ? "h-28 w-full" : "h-20 w-full"}`}>
                    <Illust className="h-full w-auto" />
                  </div>
                ) : null;
              })()}

              {isFeatured && (
                <>
                  <div className="mt-6">
                    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-danger/80">
                      <AlertTriangle size={11} />
                      Common pain
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ind.painPoints.map((pp) => (
                        <span
                          key={pp}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
                        >
                          {pp}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                    <Sparkles size={10} />
                    Outcome
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-accent-strong">
                    {ind.outcome}
                  </div>
                </div>
                <LocalizedLink
                  href={`/industries/${ind.id}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all hover:border-accent hover:text-accent"
                  aria-label={`Learn more about ${ind.name}`}
                >
                  <ArrowUpRight size={14} />
                </LocalizedLink>
              </div>
            </Reveal>
          );
        })}
      </div>
      <SnapRowHint count={items.length} />
    </Section>
  );
}
