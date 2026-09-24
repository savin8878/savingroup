/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import { Check, X, Shield } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { ApproachDuality } from "../illustrations";
import type { Messages } from "@/lib/i18n";

export function Approach({ t, noPadding }: { t: Messages; noPadding?: boolean }) {
  const count = t.approach.comparison.length;

  return (
    <Section id="approach" noPadding={noPadding}>
      <SectionHeader
        eyebrow={t.approach.eyebrow}
        title={t.approach.title}
        subtitle={t.approach.subtitle}
        meta={`${count} differences`}
      />

      <Reveal
        className="border-grad mt-16 overflow-hidden rounded-3xl shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Headers */}
          <div className="hidden border-b border-border bg-surface/40 p-6 md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                <X size={14} className="text-muted-foreground" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Typical agency
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Output-focused
                </div>
              </div>
            </div>
          </div>
          <div className="hidden border-b border-l border-border bg-accent-soft p-6 md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-strong text-accent-foreground">
                <Shield size={14} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  Savin Group
                </div>
                <div className="text-sm font-semibold text-foreground">
                  Outcome-focused
                </div>
              </div>
            </div>
          </div>

          {/* Rows */}
          {t.approach.comparison.map((row, i) => (
            <div key={i} className="contents">
              <div
                className={`flex items-center gap-3 border-t border-border p-4 sm:p-6 ${
                  i % 2 === 0 ? "bg-surface/20" : "bg-surface/40"
                }`}
              >
                <X size={14} className="shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground line-through decoration-border decoration-1 underline-offset-4">
                  {row.typical}
                </span>
              </div>
              <div
                className={`flex items-center gap-3 border-t border-l border-border p-6 ${
                  i % 2 === 0 ? "bg-surface/40" : "bg-surface/60"
                }`}
              >
                <Check
                  size={16}
                  strokeWidth={3}
                  className="shrink-0 text-accent"
                />
                <span className="text-sm font-semibold text-foreground">
                  {row.us}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Visual duality: Chaos vs System */}
      <div className="mt-12 hidden lg:block">
        <ApproachDuality className="mx-auto max-w-4xl" />
      </div>

      {/* Pull-quote summary */}
      <div className="mx-auto mt-12 max-w-3xl text-center">
        <p className="font-display text-lg italic text-muted-foreground sm:text-xl">
          &ldquo;We measure ourselves by your revenue — not by hours billed,
          screens shipped, or invoices sent.&rdquo;
        </p>
      </div>
    </Section>
  );
}
