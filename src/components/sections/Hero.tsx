"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, TrendingUp, Users, IndianRupee, Layers } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import { HeroProductShowcase, HeroAtmosphere } from "../illustrations";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";

const statIcons = [Users, IndianRupee, TrendingUp, Layers] as const;

/** One entrance curve for the whole hero. */
const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: EASE },
});

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

/* ------------------------------------------------------------------ */
/* Count-up                                                            */
/* ------------------------------------------------------------------ */

/**
 * Splits a display stat into the piece we can animate and the pieces we
 * must leave alone. Unparseable values render verbatim.
 */
function splitStat(value: string) {
  const m = /^(\D*?)([\d.,]+)(.*)$/.exec(value);
  if (!m) return null;
  const [, prefix, digits, suffix] = m;
  const numeric = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  return { prefix, suffix, numeric, decimals };
}

function CountUpStat({ value, delay }: { value: string; delay: number }) {
  const parts = splitStat(value);
  const [shown, setShown] = useState(() => (parts ? 0 : null));
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(parts.numeric);
      return;
    }

    const duration = 1400;
    let start: number | null = null;
    const startAt = performance.now() + delay * 1000;

    const step = (now: number) => {
      if (now < startAt) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo — quick off the mark, lands exactly on the target
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setShown(parts.numeric * eased);
      if (p < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
    // `parts` is derived from `value`; keying on value/delay is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  if (!parts || shown === null) return <>{value}</>;

  return (
    <>
      {parts.prefix}
      {shown.toFixed(parts.decimals)}
      {parts.suffix}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero({ t, country }: { t: Messages; country?: string }) {
  // With a target-country slug present, swap the global subtitle and stat
  // grid for country-specific copy; otherwise fall back to translations.
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  const subtitle = countryContent?.hero.subheadline ?? t.hero.subtitle;
  // The site-wide announcement bar already carries the open audit slots, so
  // this row shows the market's call window rather than repeating it.
  const availability =
    countryContent?.timezone.callWindow ?? "3 audit slots open this week";
  const stats = countryContent
    ? countryContent.bigNumbers.map((s) => ({ value: s.value, label: s.label }))
    : t.socialProof.stats;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroAtmosphere />

      <div className="container-px relative mx-auto max-w-7xl pt-24 sm:pt-28 lg:pt-32">
        {/* ---- Top rule: sets the hero's left and right boundaries ---- */}
        <motion.div
          {...rise(0)}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border pb-4"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {t.hero.eyebrow}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            {availability}
          </span>
        </motion.div>

        {/* ---- Two columns, equal halves, 4rem gutter ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="pt-12 lg:pt-16 lg:pe-8">
            <motion.h1
              {...rise(0.06)}
              className="font-display text-[clamp(2.25rem,4.6vw,3.75rem)] font-semibold leading-[1.04] tracking-tight text-foreground"
            >
              {t.hero.title}
              <br />
              <span className="text-accent">{t.hero.titleAccent}</span>
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="text-pretty mt-7 max-w-[34rem] text-base leading-relaxed text-muted-foreground sm:text-lg lg:max-w-none"
            >
              {subtitle}
            </motion.p>

            {/* Both buttons share a height and radius, so their edges align
                with each other and with the text column. */}
            <motion.div
              {...rise(0.18)}
              className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <LocalizedLink
                href="/contact"
                className="group inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[0.9375rem] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                {t.hero.primaryCta}
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </LocalizedLink>

              <LocalizedLink
                href="/case-studies"
                className="group inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 text-[0.9375rem] font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <Play size={11} className="text-accent" fill="currentColor" />
                {t.hero.secondaryCta}
              </LocalizedLink>
            </motion.div>

            <motion.p
              {...rise(0.24)}
              className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t.hero.trustNote}
            </motion.p>
          </div>

          <div className="pt-12 lg:pt-16 lg:ps-8">
            <HeroProductShowcase country={country} className="max-w-[36rem] lg:max-w-none" />
          </div>
        </div>

        {/* ---- Stats band -------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-16 border-t border-border lg:mt-24"
        >
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
                  <span className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-accent">
                    <Icon size={15} strokeWidth={1.75} />
                  </span>

                  {/* dir="ltr" isolates the value: in an RTL document the bidi
                      algorithm otherwise moves a leading "+" to the far end,
                      so "AED 6M+" renders as "+AED 6M". */}
                  <span
                    dir="ltr"
                    className="block font-display text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[2.5rem] rtl:text-right"
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
        </motion.div>
      </div>
    </section>
  );
}
