"use client";

import { motion } from "framer-motion";
import {
  Search,
  Map,
  Hammer,
  TrendingUp,
  Check,
} from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { ProcessFlowConnector } from "../illustrations";
import type { Messages } from "@/lib/i18n";

const stepIcons = [Search, Map, Hammer, TrendingUp];

const stepArtifacts: Array<{
  label: string;
  items: string[];
}> = [
  {
    label: "You walk away with",
    items: [
      "Written revenue audit (12–20 pages)",
      "Top 3 leaks ranked by impact",
      "Quick wins shippable in week 1",
    ],
  },
  {
    label: "Locked-in scope",
    items: [
      "Phased deliverables + dates",
      "Success metrics agreed upfront",
      "Fixed price · zero scope creep",
    ],
  },
  {
    label: "Weekly demo cadence",
    items: [
      "Live demo every Friday",
      "Async Loom + written changelog",
      "Direct Slack with the build team",
    ],
  },
  {
    label: "Compounding upside",
    items: [
      "Monthly conversion tuning",
      "New automation flows shipped",
      "Quarterly growth review",
    ],
  },
];

export function Process({ t }: { t: Messages }) {
  return (
    <Section id="process" className="bg-surface/30">
      <SectionHeader
        eyebrow={t.process.eyebrow}
        title={t.process.title}
        subtitle={t.process.subtitle}
        meta="4 phases"
      />

      <div className="relative mt-20">
        {/* Vertical connector line */}
        <div
          aria-hidden
          className="absolute left-[27px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent/40 via-border to-border lg:left-1/2 lg:-translate-x-1/2 lg:block"
        />
        {/* Animated flow particles along the connector */}
        <ProcessFlowConnector />

        <div className="space-y-12 lg:space-y-24">
          {t.process.steps.map((step, i) => {
            const right = i % 2 === 1;
            const Icon = stepIcons[i] ?? Search;
            const artifact = stepArtifacts[i];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative grid gap-6 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  className={`relative pl-0 lg:pl-0 ${
                    right ? "lg:order-2 lg:pl-16" : "lg:pr-16 lg:text-right"
                  }`}
                >
                  {/* Number bubble — inline on mobile, absolute on desktop */}
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-background font-mono text-sm font-semibold text-accent-strong lg:absolute lg:left-1/2 lg:top-0 lg:mb-0 lg:h-14 lg:w-14 lg:-translate-x-1/2 lg:shadow-[0_0_0_6px_var(--background)] ${
                      right ? "lg:left-[-44px]" : "lg:left-auto lg:right-[-44px]"
                    }`}
                  >
                    {step.number}
                  </div>

                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {step.duration}
                  </div>
                  <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {step.name}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground lg:max-w-none">
                    {step.description}
                  </p>
                </div>

                <div className={right ? "lg:order-1" : ""}>
                  <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-7">
                    <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/5 blur-3xl"
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
                          <Icon size={18} strokeWidth={1.75} />
                        </div>
                        <span className="font-display text-7xl font-semibold leading-none tracking-tighter text-accent/15">
                          {step.number}
                        </span>
                      </div>

                      {artifact && (
                        <div className="mt-6">
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            {artifact.label}
                          </div>
                          <ul className="mt-4 space-y-2.5">
                            {artifact.items.map((it) => (
                              <li
                                key={it}
                                className="flex items-start gap-2.5 text-sm text-foreground/90"
                              >
                                <Check
                                  size={13}
                                  strokeWidth={3}
                                  className="mt-1 shrink-0 text-accent"
                                />
                                {it}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
