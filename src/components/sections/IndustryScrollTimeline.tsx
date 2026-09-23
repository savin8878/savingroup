"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Factory,
  Building2,
  Stethoscope,
  ShoppingBag,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import { Section, Eyebrow } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { industryIllustrations } from "../illustrations";
import { SECTOR_THEMES } from "../illustrations/IndustrySegmentVisuals";
import type { IndustryKey } from "@/lib/country-content";

const iconMap: Record<IndustryKey, LucideIcon> = {
  manufacturing: Factory,
  "real-estate": Building2,
  healthcare: Stethoscope,
  ecommerce: ShoppingBag,
  edtech: GraduationCap,
};

type IndustryRow = {
  id: IndustryKey;
  name: string;
  tag: string;
  description: string;
  outcome: string;
  painPoints: string[];
};

/**
 * Vertical scroll-driven timeline of all 5 industries. Left rail is a
 * progress line that fills as the reader scrolls. Each sector row has its
 * own animated illustration on a sticky panel, plus a stuck-state →
 * outcome flow on the right.
 */
export function IndustryScrollTimeline({
  rows,
  primaryId,
  primaryBadge,
}: {
  rows: IndustryRow[];
  primaryId: IndustryKey;
  primaryBadge?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const railProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });
  const railHeight = useTransform(railProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section className="pt-0">
      <div className="max-w-3xl">
        <Eyebrow>5-sector deep dive</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[3rem]">
          Each sector is a different game.
          <span className="bg-gradient-to-br from-foreground via-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
            {" "}We play them differently.
          </span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Scroll through to see the specific stuck-state, the build, and the
          outcomes by sector. Tap any row to jump to its full page.
        </p>
      </div>

      <div ref={sectionRef} className="relative mt-16">
        {/* Vertical progress rail */}
        <div
          aria-hidden
          className="absolute left-5 top-0 hidden h-full w-px bg-border lg:block"
        />
        <motion.div
          aria-hidden
          style={{ height: railHeight }}
          className="absolute left-5 top-0 hidden w-px bg-gradient-to-b from-accent via-[oklch(0.66_0.18_295)] to-accent lg:block"
        />

        <div className="space-y-16 sm:space-y-24 lg:pl-16">
          {rows.map((row, i) => (
            <TimelineRow
              key={row.id}
              row={row}
              index={i}
              isPrimary={row.id === primaryId}
              primaryBadge={primaryBadge}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

function TimelineRow({
  row,
  index,
  isPrimary,
  primaryBadge,
}: {
  row: IndustryRow;
  index: number;
  isPrimary: boolean;
  primaryBadge?: string;
}) {
  const Icon = iconMap[row.id];
  const Illust = industryIllustrations[row.id];
  const theme = SECTOR_THEMES[row.id];
  const accent = theme?.primary ?? "oklch(0.78 0.165 70)";

  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 80%", "end 30%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0.55, 1, 1, 0.7]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.97, 1, 0.98]);

  return (
    <motion.article
      ref={rowRef}
      id={row.id}
      style={{ opacity, scale }}
      className="relative scroll-mt-32"
    >
      {/* Index dot on the rail */}
      <div className="absolute -left-[60px] top-2 hidden lg:block">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-background font-mono text-xs font-bold"
          style={{ borderColor: accent.replace(")", " / 0.5)"), color: accent }}
        >
          0{index + 1}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-2xl border-2"
            style={{ borderColor: accent }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          />
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT — illustration + identity (sticky on lg) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div
              className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
              style={{
                borderColor: accent.replace(")", " / 0.3)"),
                background: `linear-gradient(160deg, ${accent.replace(")", " / 0.07)")}, ${accent.replace(")", " / 0.01)")})`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                style={{ background: accent.replace(")", " / 0.2)") }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-background"
                    style={{ borderColor: accent.replace(")", " / 0.4)"), color: accent }}
                  >
                    {Icon && <Icon size={22} strokeWidth={1.75} />}
                  </div>
                  <span
                    className="rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em]"
                    style={{
                      borderColor: accent.replace(")", " / 0.4)"),
                      color: accent,
                    }}
                  >
                    {row.tag}
                  </span>
                </div>

                <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Sector · 0{index + 1}
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                  <LocalizedLink
                    href={`/industries/${row.id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {row.name}
                  </LocalizedLink>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {row.description}
                </p>

                {Illust && (
                  <div className="mt-6 hidden border-t border-border pt-6 sm:block">
                    <Illust className="h-32 w-full" />
                  </div>
                )}

                {isPrimary && primaryBadge && (
                  <div
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em]"
                    style={{
                      borderColor: accent.replace(")", " / 0.4)"),
                      background: accent.replace(")", " / 0.08)"),
                      color: accent,
                    }}
                  >
                    <Sparkles size={10} />
                    {primaryBadge}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — stuck-state → outcome flow */}
        <div className="lg:col-span-7">
          {/* Pain card */}
          <Reveal className="rounded-2xl border border-danger/25 bg-danger/[0.04] p-5 sm:p-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-danger/80">
              <AlertTriangle size={11} />
              Stuck state
            </div>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {row.painPoints.map((pp) => (
                <li
                  key={pp}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />
                  {pp}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Vertical migration connector */}
          <div className="relative my-3 flex items-center justify-center">
            <svg
              viewBox="0 0 60 80"
              className="h-16 w-12"
              fill="none"
              aria-hidden
            >
              <motion.path
                d="M 30 5 L 30 65"
                stroke={accent.replace(")", " / 0.5)")}
                strokeWidth="1.4"
                strokeDasharray="4 3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              />
              <motion.path
                d="M 22 60 L 30 75 L 38 60"
                stroke={accent.replace(")", " / 0.7)")}
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1 }}
              />
              <motion.circle
                r="2.5"
                cx="30"
                fill={accent}
                animate={{ cy: [5, 65], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                r="2"
                cx="30"
                fill={accent.replace(")", " / 0.6)")}
                animate={{ cy: [5, 65], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.8 }}
              />
            </svg>
          </div>

          {/* Outcome card */}
          <Reveal
            delay={0.15}
            className="rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: accent.replace(")", " / 0.4)"),
              background: accent.replace(")", " / 0.05)"),
            }}
          >
            <div
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              <Sparkles size={11} />
              After we ship
            </div>
            <p className="mt-3 font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
              {row.outcome}
            </p>

            {/* outcome metric chips */}
            {theme && (
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {theme.outcomeMetrics.slice(0, 4).map((m, idx) => (
                  <Reveal
                    key={m.label}
                    delay={0.05 * idx}
                    className="rounded-xl border border-border bg-background/70 p-3"
                  >
                    <div
                      className="font-display text-base font-semibold tracking-tight"
                      style={{ color: accent }}
                    >
                      {m.value}
                    </div>
                    <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
                      {m.label}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            <LocalizedLink
              href={`/industries/${row.id}`}
              className="group mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{
                borderColor: accent.replace(")", " / 0.5)"),
                background: accent.replace(")", " / 0.08)"),
                color: accent,
              }}
            >
              Open the {row.name.toLowerCase()} build
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </LocalizedLink>
          </Reveal>
        </div>
      </div>
    </motion.article>
  );
}
