"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { SnapRowHint } from "../primitives/snap-row-hint";
import LocalizedLink from "../LocalizedLink";
import { serviceIllustrations } from "../illustrations";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";

interface ServicesProps {
  t: Messages;
  /** When true, render a richer expanded layout (Services page). When false, condensed (Home preview). */
  expanded?: boolean;
  /** Country slug — when supplied for a target country, renders a per-country intro paragraph */
  country?: string;
  noPadding?: boolean;
}

export function Services({ t, expanded = false, country, noPadding }: ServicesProps) {
  const items = expanded ? t.services.items : t.services.items.slice(0, 6);
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  return (
    <Section id="services" noPadding={noPadding}>
      <SectionHeader
        eyebrow={t.services.eyebrow}
        title={t.services.title}
        subtitle={t.services.subtitle}
        meta={`${t.services.items.length} packages`}
      />

      {countryContent && (
        <p className="mx-auto mt-8 max-w-3xl text-balance text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          {countryContent.servicesAngle}
        </p>
      )}

      {/* Mobile: snap-x carousel (each card ~82vw). md+: original 2/3-column grid.
          Negative margin lets cards bleed to viewport edges on phone. */}
      <div className="mt-10 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-16 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none md:grid md:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="group relative flex w-[82vw] max-w-[320px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-7 md:h-full"
          >
            {/* Background decorations — heavy blur kept off mobile so cards stay crisp */}
            <div className="pointer-events-none absolute -right-20 -top-20 hidden h-48 w-48 rounded-full bg-accent/5 blur-3xl transition-opacity duration-500 group-hover:bg-accent/15 sm:block" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            {/* Sketch illustration */}
            {(() => {
              const Illust = serviceIllustrations[i];
              return Illust ? (
                <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                  <Illust className="h-full w-full" />
                </div>
              ) : null;
            })()}

            <div className="flex items-start justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                {s.number}
              </span>
              <ArrowUpRight
                size={18}
                className="text-muted-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>

            <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
              {s.name}
            </h3>
            <p className="mt-1.5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {s.kicker}
            </p>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {s.summary}
            </p>

            {/* Top 3 deliverables */}
            <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
              {s.deliverables.slice(0, 3).map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2.5 text-xs text-muted-foreground"
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                    className="mt-1 shrink-0 text-accent"
                  />
                  {d}
                </li>
              ))}
              {s.deliverables.length > 3 && (
                <li className="pl-5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  +{s.deliverables.length - 3} more
                </li>
              )}
            </ul>

            {/* Outcome highlight */}
            <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/5 p-4">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                <Sparkles size={11} />
                Top outcome
              </div>
              <div className="mt-1.5 text-sm font-semibold text-foreground">
                {s.outcomes[0]}
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  Investment
                </div>
                <div className="mt-1 font-display text-sm font-semibold text-foreground">
                  {s.investment}
                </div>
              </div>
              <LocalizedLink
                href={`/services#${s.id}`}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground hover:text-accent"
              >
                Details →
              </LocalizedLink>
            </div>
          </motion.article>
        ))}
      </div>
      <SnapRowHint count={items.length} />

      {!expanded && (
        <div className="mt-12 flex justify-center">
          <LocalizedLink
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-accent/40 hover:text-accent"
          >
            Compare all packages
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </LocalizedLink>
        </div>
      )}
    </Section>
  );
}
