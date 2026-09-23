/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { bigNumberCharts } from "../illustrations";
import type { Messages } from "@/lib/i18n";

export function BigNumbers({ t, noPadding }: { t: Messages; noPadding?: boolean }) {
  const bn = t.bigNumbers;
  return (
    <Section id="big-numbers" noPadding={noPadding}>
      <SectionHeader
        eyebrow={bn.eyebrow}
        title={bn.title}
        subtitle={bn.subtitle}
        align="center"
      />

      {/* Mobile: 2-col grid (4 stat cards in a 2x2 instead of stacked). */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:grid-cols-4">
        {bn.items.map((item, i) => (
          <Reveal
            delay={i * 0.08}
            key={item.label}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface/60 p-5 sm:p-8 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-surface"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/5 blur-3xl transition-opacity group-hover:bg-accent/15"
            />
            {/* Animated mini chart SVG */}
            {(() => {
              const Chart = bigNumberCharts[i];
              return Chart ? (
                <div className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-28 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                  <Chart className="h-full w-full" />
                </div>
              ) : null;
            })()}
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Metric · 0{i + 1}
            </div>
            <div className="mt-6 font-display text-[clamp(3rem,7vw,4.5rem)] font-semibold leading-none tracking-tighter">
              <span className="bg-gradient-to-br from-foreground via-foreground to-accent bg-clip-text text-transparent">
                {item.value}
              </span>
            </div>
            <div className="mt-4 text-sm font-semibold text-foreground">
              {item.label}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/40 via-border to-transparent" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
