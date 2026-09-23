/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import {
  Zap,
  Search,
  Globe,
  Shield,
  Smartphone,
  Database,
  GitBranch,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { SnapRowHint } from "../primitives/snap-row-hint";
import { featureIllustrationMap } from "../illustrations";
import type { Messages } from "@/lib/i18n";

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  search: Search,
  globe: Globe,
  shield: Shield,
  smartphone: Smartphone,
  database: Database,
  "git-branch": GitBranch,
  headphones: Headphones,
};

export function FeatureGrid({ t, noPadding }: { t: Messages; noPadding?: boolean }) {
  const fg = t.featureGrid;
  return (
    <Section id="capabilities" noPadding={noPadding} className="bg-surface/20">
      <SectionHeader
        eyebrow={fg.eyebrow}
        title={fg.title}
        subtitle={fg.subtitle}
        meta={`${fg.items.length} capabilities`}
      />

      {/* Mobile: snap-x carousel. sm+: original grid. */}
      <div className="mt-10 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-16 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {fg.items.map((item, i) => {
          const Icon = iconMap[item.icon] ?? Zap;
          return (
            <Reveal
              delay={(i % 4) * 0.06}
              key={item.title}
              className="group relative w-[78vw] max-w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-6"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 hidden h-32 w-32 rounded-full bg-accent/5 blur-2xl transition-opacity group-hover:bg-accent/15 sm:block" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-accent transition-colors group-hover:border-accent/40">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                {/* Animated sketch illustration */}
                {(() => {
                  const FeatIllust = featureIllustrationMap[item.icon];
                  return FeatIllust ? (
                    <div className="pointer-events-none h-14 w-20 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                      <FeatIllust className="h-full w-full" />
                    </div>
                  ) : null;
                })()}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Capability · 0{i + 1}
              </div>
            </Reveal>
          );
        })}
      </div>
      <SnapRowHint count={fg.items.length} />
    </Section>
  );
}
