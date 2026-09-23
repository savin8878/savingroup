"use client";

import {
  ArrowUpRight,
  Check,
  Download,
  Gift,
  Headphones,
  Layers,
  Minus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { SnapRowHint } from "../primitives/snap-row-hint";
import LocalizedLink from "../LocalizedLink";
import { tierGlyphs, PricingValueViz } from "../illustrations";
import type { Messages } from "@/lib/i18n";

/* --- Local types: the pricing JSON is heterogeneous (some tiers carry a
   badge / featured flag), so we describe its shape explicitly rather than
   leaning on the inferred union from the messages dictionary. --- */
interface TierFeature {
  label: string;
  on: boolean;
}
interface TierGroup {
  heading: string;
  items: TierFeature[];
}
interface CostRow {
  label: string;
  value: string;
}
interface Tier {
  id: string;
  glyph: string;
  badge?: string;
  featured?: boolean;
  name: string;
  tagline: string;
  priceLabel: string;
  priceRange: string;
  priceInfo: string;
  scope: string;
  reqTag: string;
  costRows: CostRow[];
  extras: string[];
  groups: TierGroup[];
  ctaStyle: "solid" | "outline";
}
interface CompCard {
  title: string;
  price: string;
  scale: string;
  highlight: boolean;
  badge?: string;
  features: TierFeature[];
}
interface Advantage {
  icon: string;
  title: string;
  body: string;
}
interface TableRow {
  feature: string;
  others: string;
  values: string[];
  on: boolean[];
}
interface PricingContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  note: string;
  ctaPrimary: string;
  ctaEnterprise: string;
  tiers: Tier[];
  comparison: { eyebrow: string; title: string; intro: string; cards: CompCard[] };
  advantages: { title: string; items: Advantage[] };
  table: {
    title: string;
    featureLabel: string;
    othersLabel: string;
    tierLabels: string[];
    rows: TableRow[];
  };
  highlight: { title: string; lineA: string; lineB: string };
}

const ADVANTAGE_ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  sliders: SlidersHorizontal,
  gift: Gift,
  zap: Zap,
  search: Search,
  smartphone: Smartphone,
  shield: ShieldCheck,
  headphones: Headphones,
};

function FeatureRow({ label, on }: TierFeature) {
  return (
    <li
      className={`flex items-start gap-2.5 py-1 text-[13px] ${
        on ? "text-foreground" : "text-muted-foreground/55"
      }`}
    >
      {on ? (
        <Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-accent" />
      ) : (
        <Minus size={13} strokeWidth={2.5} className="mt-0.5 shrink-0 text-muted-foreground/40" />
      )}
      <span className={on ? "" : "line-through decoration-muted-foreground/30"}>{label}</span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Pricing cards                                 */
/* -------------------------------------------------------------------------- */

function PricingCards({ p, downloadHref }: { p: PricingContent; downloadHref?: string }) {
  return (
    <Section id="plans" className="pt-0">
      {/* Requirement-based banner + PDF download */}
      <Reveal
        className="mx-auto mb-10 flex max-w-3xl flex-col gap-4 rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:gap-5"
      >
        <Sparkles size={16} className="hidden shrink-0 text-accent sm:mt-0.5 sm:block sm:self-start" />
        <span className="flex-1">{p.note}</span>
        {downloadHref && (
          <a
            href={downloadHref}
            // Native anchor (not a router Link): the route returns a PDF
            // attachment, so we want a full request the browser downloads
            // directly rather than a client-side navigation.
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-accent/50 bg-background px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-all hover:border-accent hover:bg-accent/5"
          >
            <Download size={13} className="text-accent transition-transform group-hover:translate-y-0.5" />
            Download PDF
          </a>
        )}
      </Reveal>

      {/* Mobile: snap carousel. md: 2-col. xl: 4-col. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible xl:grid-cols-4">
        {p.tiers.map((tier, i) => {
          const Glyph = tierGlyphs[tier.glyph];
          return (
            <Reveal
              as="article"
              delay={(i % 4) * 0.07}
              key={tier.id}
              className={`group relative flex w-[84vw] max-w-[340px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-3xl border bg-surface/60 p-6 transition-all duration-500 hover:-translate-y-1 sm:w-auto sm:max-w-none sm:flex-shrink ${
                tier.featured
                  ? "border-accent/60 bg-gradient-to-b from-accent/[0.06] to-transparent shadow-[0_24px_60px_-30px_oklch(0.78_0.165_70/0.55)] xl:scale-[1.03]"
                  : "border-border hover:border-accent/40"
              }`}
            >
              {tier.badge && (
                <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-accent-strong px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                  <Star size={9} className="fill-current" />
                  {tier.badge}
                </div>
              )}

              {/* Glyph */}
              <div className="h-10 w-10 text-accent">{Glyph && <Glyph />}</div>

              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                {tier.name}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {tier.tagline}
              </p>

              {/* Price box */}
              <div className="mt-5 rounded-2xl border-l-2 border-accent bg-accent/5 px-4 py-3.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {tier.priceLabel}
                </div>
                <div className="mt-1 font-display text-[1.6rem] font-semibold leading-none tracking-tight text-accent">
                  {tier.priceRange}
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">{tier.priceInfo}</div>
              </div>

              {/* Scope badge */}
              <div className="mt-4 rounded-xl bg-foreground/[0.04] py-2.5 text-center text-sm font-semibold text-foreground">
                {tier.scope}
              </div>
              <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-strong">
                <SlidersHorizontal size={9} />
                {tier.reqTag}
              </div>

              {/* Cost breakdown */}
              <dl className="mt-5 space-y-0 rounded-2xl border border-border bg-background/50 px-4 py-1">
                {tier.costRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-[12.5px] last:border-none"
                  >
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="shrink-0 font-medium italic text-foreground/80">{row.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Free extras */}
              <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/[0.04] p-4">
                <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-accent-strong">
                  <Gift size={11} />
                  Free extras
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {tier.extras.map((extra) => (
                    <li key={extra} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                      <Check size={12} strokeWidth={3} className="mt-0.5 shrink-0 text-success" />
                      {extra}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feature groups */}
              {tier.groups.map((group) => (
                <div key={group.heading} className="mt-5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
                    {group.heading}
                  </div>
                  <ul className="mt-2 border-t border-border pt-2">
                    {group.items.map((item) => (
                      <FeatureRow key={item.label} {...item} />
                    ))}
                  </ul>
                </div>
              ))}

              {/* CTA */}
              <LocalizedLink
                href="/contact"
                className={`group/btn mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  tier.ctaStyle === "solid"
                    ? "bg-accent-strong text-accent-foreground shadow-[0_10px_30px_-12px_oklch(0.78_0.165_70/0.6)] hover:-translate-y-0.5"
                    : "border border-accent/40 text-foreground hover:border-accent hover:bg-accent/5"
                }`}
              >
                {tier.id === "enterprise" ? p.ctaEnterprise : p.ctaPrimary}
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                />
              </LocalizedLink>
            </Reveal>
          );
        })}
      </div>
      <SnapRowHint count={p.tiers.length} />
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*                        How we're different + table                         */
/* -------------------------------------------------------------------------- */

function Differentiators({ p }: { p: PricingContent }) {
  const c = p.comparison;
  return (
    <Section id="how-different" className="bg-surface/20">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} subtitle={c.intro} align="center" />

      {/* Animated value-stack visual */}
      <Reveal
        className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-background/40 p-5 sm:p-8"
      >
        <PricingValueViz />
      </Reveal>

      {/* Comparison cards */}
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {c.cards.map((card, i) => (
          <Reveal
            delay={i * 0.08}
            key={card.title}
            className={`relative flex flex-col rounded-3xl border p-6 text-center ${
              card.highlight
                ? "border-accent/60 bg-gradient-to-b from-accent/[0.07] to-transparent shadow-[0_24px_60px_-32px_oklch(0.78_0.165_70/0.5)] md:-translate-y-3"
                : "border-border bg-surface/40"
            }`}
          >
            {card.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                {card.badge}
              </div>
            )}
            <h3 className="font-display text-lg font-semibold text-foreground">{card.title}</h3>
            <div
              className={`mt-3 font-display text-3xl font-semibold tracking-tight ${
                card.highlight ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {card.price}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{card.scale}</div>
            <ul className="mt-5 space-y-2 text-left">
              {card.features.map((f) => (
                <li
                  key={f.label}
                  className={`flex items-start gap-2 text-[13px] ${
                    f.on ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {f.on ? (
                    <Check size={13} strokeWidth={3} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Minus size={13} strokeWidth={2.5} className="mt-0.5 shrink-0 text-muted-foreground/40" />
                  )}
                  {f.label}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mt-16">
        <h3 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground">
          {p.table.title}
        </h3>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-border [scrollbar-width:thin]">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface/60">
                <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                  {p.table.featureLabel}
                </th>
                <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.table.othersLabel}
                </th>
                {p.table.tierLabels.map((label, i) => (
                  <th
                    key={label}
                    className={`px-4 py-4 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      i === 1 ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.table.rows.map((row) => (
                <tr key={row.feature} className="border-t border-border transition-colors hover:bg-surface/30">
                  <td className="px-4 py-3.5 font-semibold text-foreground">{row.feature}</td>
                  <td className="px-4 py-3.5 text-muted-foreground/70">{row.others}</td>
                  {row.values.map((value, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3.5 ${i === 1 ? "bg-accent/[0.04]" : ""}`}
                    >
                      {row.on[i] ? (
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Check size={13} strokeWidth={3} className="shrink-0 text-success" />
                          {value}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground/45">
                          <Minus size={13} strokeWidth={2.5} className="shrink-0" />
                          {value}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Highlight box */}
      <Reveal
        className="mt-12 rounded-3xl border border-success/40 bg-gradient-to-br from-success/[0.08] to-accent/[0.06] p-7 text-center"
      >
        <h3 className="font-display text-xl font-semibold text-foreground">{p.highlight.title}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {p.highlight.lineA}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {p.highlight.lineB}
        </p>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Advantages grid                               */
/* -------------------------------------------------------------------------- */

function Advantages({ p }: { p: PricingContent }) {
  return (
    <Section id="advantages" className="pt-0">
      <h3 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {p.advantages.title}
      </h3>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {p.advantages.items.map((adv, i) => {
          const Icon = ADVANTAGE_ICONS[adv.icon] ?? Sparkles;
          return (
            <Reveal
              delay={(i % 4) * 0.06}
              key={adv.title}
              className="group rounded-2xl border-l-2 border-accent/40 bg-surface/40 p-5 transition-all hover:border-accent hover:bg-surface"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                <Icon size={17} />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-foreground">{adv.title}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{adv.body}</p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Section                                   */
/* -------------------------------------------------------------------------- */

export function Pricing({ t, downloadHref }: { t: Messages; downloadHref?: string }) {
  const p = t.pricing as unknown as PricingContent;
  return (
    <>
      <PricingCards p={p} downloadHref={downloadHref} />
      <Differentiators p={p} />
      <Advantages p={p} />
    </>
  );
}
