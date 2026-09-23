import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { Problem } from "./Problem";
import { Approach } from "./Approach";
import { Services } from "./Services";
import { FeatureGrid } from "./FeatureGrid";
import { Industries } from "./Industries";
import { BigNumbers } from "./BigNumbers";
import { CaseStudies } from "./CaseStudies";
import type { Messages } from "@/lib/i18n";
import { Search, Map, Hammer, TrendingUp } from "lucide-react";

/* ==================================================================
   WHY THE STICKY SHELL IS GONE

   Both hubs used to wrap their content in `StickyScrollLayout`: a
   5/7 split with a sticky left rail. Two things broke.

   1. INVISIBLE CONTENT. Each pane on the right was wrapped in
      `<motion.div initial={{opacity:0}} whileInView={{opacity:1}}
      viewport={{amount:0.5}}>`. `amount: 0.5` requires half the
      element to be on screen simultaneously; those panes are taller
      than the viewport, so the condition was never satisfiable and
      the wrapper never left `opacity: 0`. The services block simply
      never appeared — the single worst bug on the page.

   2. A 517px COLUMN. The right pane was 7 of 12 columns inside a
      max-w-7xl container, minus a 3rem gap and `p-12` card padding.
      At a 1363px viewport that left roughly 517px of usable width —
      into which `Services` still rendered `lg:grid-cols-3`, because
      Tailwind breakpoints read the VIEWPORT, not the container. Three
      cards at ~150px each is where the one-word lines came from.

   Both problems are structural, not cosmetic, so the fix is
   structural: the sections now run full width in normal document
   flow. `Reveal` supplies the entrance, and it is built so that a
   threshold that never fires leaves the content visible rather than
   hidden.
   ================================================================== */

export function StrategyHub({ t }: { t: Messages }) {
  return (
    <Section id="strategy-hub" className="bg-surface/10">
      <Reveal>
        <Problem t={t} noPadding />
      </Reveal>
      <Reveal className="mt-20 sm:mt-28">
        <Approach t={t} noPadding />
      </Reveal>
      <Reveal className="mt-20 sm:mt-28">
        <FeatureGrid t={t} noPadding />
      </Reveal>
    </Section>
  );
}

/** Services on its own, at full width — it is the page's main commercial block. */
export function ServicesBlock({ t, country }: { t: Messages; country?: string }) {
  return (
    <Section id="services-block" className="border-t border-border">
      <Reveal>
        <Services t={t} country={country} noPadding />
      </Reveal>
    </Section>
  );
}

export function ImpactHub({ t, country }: { t: Messages; country?: string }) {
  return (
    <Section id="impact-hub" className="border-t border-border">
      <Reveal>
        <CaseStudies t={t} country={country} noPadding />
      </Reveal>
      <Reveal className="mt-20 sm:mt-28">
        <BigNumbers t={t} noPadding />
      </Reveal>
      <Reveal className="mt-20 sm:mt-28">
        <Industries t={t} country={country} noPadding />
      </Reveal>
    </Section>
  );
}

export function ProcessStepper({ t }: { t: Messages }) {
  const stepIcons = [Search, Map, Hammer, TrendingUp];
  return (
    <Section id="process-stepper" className="bg-surface/5">
      <SectionHeader
        eyebrow={t.process.eyebrow}
        title={t.process.title}
        subtitle={t.process.subtitle}
        align="center"
        className="mb-16"
      />

      <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Horizontal rule on desktop, behind the step markers. */}
        <div className="absolute left-0 right-0 top-[38px] hidden h-px bg-border lg:block" />

        {t.process.steps.map((step, i) => {
          const Icon = stepIcons[i] ?? Search;
          return (
            <Reveal key={step.number} delay={i * 0.06}>
              <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-border bg-background">
                  <Icon size={22} strokeWidth={1.6} className="text-accent-strong" />
                </div>

                <div className="space-y-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong">
                    {step.number} · {step.duration}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {step.name}
                  </h3>
                  <p className="mx-auto max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground lg:mx-0">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
