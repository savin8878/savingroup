import { ArrowUpRight, Play, TrendingUp, Users, IndianRupee, Layers } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import { HeroProductShowcase, HeroAtmosphere } from "../illustrations";
import { CountUpStat } from "./CountUpStat";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";
import { AUDIT, CTA_LABEL } from "@/lib/offer";

const statIcons = [Users, IndianRupee, TrendingUp, Layers] as const;

/** Same tints the product mockup uses, so the two columns read as one system. */
const STACK_TINTS = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--success)",
  "var(--accent)",
  "var(--accent-2)",
] as const;

/* ==================================================================
   THE GRID

   Everything below hangs off one 2-column split with a 4rem gutter
   (`lg:pe-8` + `lg:ps-8`), and the stats sit on a 4-column band with
   the same 2rem inset on each side of every rule. That puts four
   edges on exactly the same x:

     copy left edge   = stat 1 left edge   = 0%
     copy right edge  = stat 2 right edge  = 50% - 2rem
     board left edge  = stat 3 left edge   = 50% + 2rem
     board right edge = stat 4 right edge  = 100%

   Change the gutter and it has to change in all three places, or the
   columns stop lining up.
   ================================================================== */

/* ==================================================================
   WHY THIS IS A SERVER COMPONENT

   It used to be a client component in which every element was a
   `motion.*` carrying `initial={{ opacity: 0 }}`. That serialises
   `opacity:0` into the HTML, so the headline, the subtitle and the
   CTA stayed invisible until React had downloaded, parsed and
   hydrated the whole hero tree. That is what put mobile LCP at 4.8s,
   and what made the page look empty to anything not executing JS.

   Now the markup ships visible and complete. The entrance is the
   `.rise` CSS class (see globals.css): it paints off the stylesheet,
   needs no JS, and is dropped under `prefers-reduced-motion`. The
   only client code left in the hero is the `CountUpStat` numeral,
   which renders its true value on the server anyway.
   ================================================================== */

export function Hero({ t, country }: { t: Messages; country?: string }) {
  // With a target-country slug present, swap the global subtitle and stat
  // grid for country-specific copy; otherwise fall back to translations.
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  const subtitle = countryContent?.hero.subheadline ?? t.hero.subtitle;
  // The site-wide announcement bar already carries the open audit slots, so
  // this row shows the market call window rather than repeating it.
  const availability =
    countryContent?.timezone.callWindow ?? "3 audit slots open this week";
  const stats = countryContent
    ? countryContent.bigNumbers.map((s) => ({ value: s.value, label: s.label }))
    : t.socialProof.stats;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroAtmosphere />

      <div className="container-px relative mx-auto max-w-7xl pt-24 sm:pt-28 lg:pt-32">
        {/* ---- Top rule: sets the hero left and right boundaries ---- */}
        <div className="rise flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {t.hero.eyebrow}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            {availability}
          </span>
        </div>

        {/* ---- Two columns, equal halves, 4rem gutter ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="pt-12 lg:pt-16 lg:pe-8">
            {/*
              The one place on the homepage that earns the editorial didone:
              the accent line of the single headline carrying the message.
              The first line stays in the sans, so the two faces read as a
              deliberate pairing rather than a font change mid-sentence.
            */}
            <h1 className="rise rise-1 font-display text-[clamp(2.25rem,4.6vw,3.75rem)] font-semibold leading-[1.04] tracking-tight text-foreground">
              {t.hero.title}
              <span className="font-editorial mt-1 block text-[clamp(2.75rem,5.6vw,4.5rem)] font-semibold text-accent">
                {t.hero.titleAccent}
              </span>
            </h1>

            <p className="rise rise-2 text-pretty mt-7 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-lg lg:max-w-none">
              {subtitle}
            </p>

            {/* Both buttons share a height and radius, so their edges align
                with each other and with the text column. */}
            <div className="rise rise-3 mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <LocalizedLink
                href="/contact"
                className="group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-accent-strong px-6 text-[0.9375rem] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                {CTA_LABEL}
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </LocalizedLink>

              <LocalizedLink
                href="/case-studies"
                className="group inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 text-[0.9375rem] font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <Play size={11} className="text-accent-strong" fill="currentColor" />
                {t.hero.secondaryCta}
              </LocalizedLink>
            </div>

            <p className="rise rise-4 mt-7 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {AUDIT.supportLine}
            </p>

            {/* The stack. Names and label come straight from the services
                translations, so this stays correct in every locale and adds
                no new copy to maintain. The dots use the same tints as the
                mockup beside it, tying the two columns together. */}
            <div className="rise rise-5 mt-10 border-t border-border pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {t.services.eyebrow}
              </span>
              <span className="mt-4 flex flex-wrap gap-2">
                {t.services.items.slice(0, 5).map((svc, i) => (
                  <span
                    key={svc.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[0.8125rem] font-medium text-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: STACK_TINTS[i % STACK_TINTS.length] }}
                    />
                    {svc.name}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className="rise rise-4 pt-12 lg:pt-16 lg:ps-8">
            <HeroProductShowcase country={country} className="max-w-[36rem] lg:max-w-none" />
          </div>
        </div>

        {/* ---- Stats band -------------------------------------------- */}
        <div className="rise rise-6 mt-16 border-t border-border lg:mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = statIcons[i] ?? TrendingUp;

              // Rules and insets are placed per index so the content edges
              // land on the same x as the two columns above. See THE GRID.
              const rules = [
                i % 2 === 1 ? "border-s border-border" : "",
                i >= 2 ? "border-t border-border lg:border-t-0" : "",
                i > 0 ? "lg:border-s lg:border-border" : "lg:border-s-0",
              ].join(" ");

              const inset = [
                i % 2 === 0 ? "pe-5" : "ps-5",
                i === 0 ? "lg:ps-0 lg:pe-8" : i === 3 ? "lg:ps-8 lg:pe-0" : "lg:ps-8 lg:pe-8",
              ].join(" ");

              return (
                <div key={s.label} className={`py-8 lg:py-10 ${rules} ${inset}`}>
                  <span className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-accent-strong">
                    <Icon size={15} strokeWidth={1.75} />
                  </span>

                  {/* dir="ltr" isolates the value: in an RTL document the bidi
                      algorithm otherwise moves a leading "+" to the far end,
                      so "AED 6M+" renders as "+AED 6M". */}
                  <span
                    dir="ltr"
                    className="font-editorial block text-[2.25rem] font-semibold tracking-tight tabular-nums text-foreground sm:text-[2.75rem] rtl:text-right"
                  >
                    <CountUpStat value={s.value} delay={0.5 + i * 0.08} />
                  </span>

                  <span className="mt-4 block text-sm leading-snug text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
