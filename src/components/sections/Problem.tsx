/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import { TrendingDown, AlertTriangle } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { ButtonLink } from "../primitives/button";
import { SnapRowHint } from "../primitives/snap-row-hint";
import { LeakFunnel } from "../illustrations";
import type { Messages } from "@/lib/i18n";

export function Problem({ t, noPadding }: { t: Messages; noPadding?: boolean }) {
  return (
    <Section id="problem" noPadding={noPadding}>
      {/* Decorative backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-danger/5 to-transparent"
      />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeader
            eyebrow={t.problem.eyebrow}
            title={t.problem.title}
            subtitle={t.problem.subtitle}
          />
        </div>
        <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center">
          <LeakFunnel className="max-w-[280px]" />
        </div>
      </div>

      {/* Mobile: snap-x carousel (4 stat-rich cards). sm+: grid. */}
      <div className="mt-10 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-16 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {t.problem.points.map((p, i) => (
          <Reveal
            key={p.label}
            delay={i * 0.06}
            className="group relative flex w-[82vw] max-w-[320px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-danger/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-7 sm:backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 hidden h-40 w-40 rounded-full bg-danger/5 blur-2xl transition-opacity duration-500 group-hover:bg-danger/15 sm:block" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Leak · 0{i + 1}
              </span>
              <TrendingDown size={16} className="text-danger/70" />
            </div>

            <div className="font-editorial mt-6 text-[2.5rem] font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
              {p.stat}
            </div>
            <div className="mt-3 text-sm font-semibold text-foreground">
              {p.label}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {p.detail}
            </p>

            {/* Mini meter */}
            <div className="mt-6">
              <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full bg-gradient-to-r from-danger/70 to-accent"
                  style={{ width: `${[55, 70, 100, 80][i] || 60}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Severity</span>
                <span className="text-danger/80">High</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <SnapRowHint count={t.problem.points.length} />

      {/* Bottom CTA strip */}
      <div className="mt-10 sm:mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl sm:rounded-3xl border border-border bg-surface/40 p-5 sm:p-8 backdrop-blur-sm sm:flex-row lg:p-10">
        <div className="flex items-start gap-4 sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 text-danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              Every week of inaction compounds the cost.
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Most leaks are fixed in a single 90-day sprint. Let&apos;s start with the audit.
            </p>
          </div>
        </div>
        <ButtonLink href="/services">{t.problem.cta}</ButtonLink>
      </div>
    </Section>
  );
}
