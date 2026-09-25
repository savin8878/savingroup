import type { Messages } from "@/lib/i18n";
import type { CompareRowKey, PricingCopy } from "./copy/pricing-copy";

/* --- Shape of `t.pricing` (the dictionary is heterogeneous: only some tiers
   carry badge / featured, so the inferred type is a union). --- */
export interface TierFeature { label: string; on: boolean }
export interface TierGroup { heading: string; items: TierFeature[] }
export interface CostRow { label: string; value: string }
export interface Tier {
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
export interface CompCard { title: string; price: string; scale: string; highlight: boolean; badge?: string; features: TierFeature[] }
export interface Advantage { icon: string; title: string; body: string }
export interface TableRow { feature: string; others: string; values: string[]; on: boolean[] }
export interface PricingContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  note: string;
  ctaPrimary: string;
  ctaEnterprise: string;
  tiers: Tier[];
  comparison: { eyebrow: string; title: string; intro: string; cards: CompCard[] };
  advantages: { title: string; items: Advantage[] };
  table: { title: string; featureLabel: string; othersLabel: string; tierLabels: string[]; rows: TableRow[] };
  highlight: { title: string; lineA: string; lineB: string };
}

export function getPricingContent(t: Messages): PricingContent {
  return t.pricing as unknown as PricingContent;
}

/** "₹55,000 – ₹85,000" → ["₹55,000 –", "₹85,000"]; "₹2,00,000+" → ["₹2,00,000+"]. */
export function splitPrice(range: string): string[] {
  const parts = range.split(/\s+[–-]\s+/);
  if (parts.length !== 2) return [range];
  return [`${parts[0]} –`, parts[1]];
}

/* --- Feature comparison, derived from tiers[].groups ------------------------
   The per-tier lists describe the same capability with tier-specific labels
   ("Weekly backups" / "Daily backups" / "Hourly backups"). Each label is folded
   onto a canonical row so the table reads as a comparison; labels no matcher
   recognises get a row of their own, so nothing is dropped. --- */
const MATCHERS: [CompareRowKey, RegExp][] = [
  ["uptime", /uptime/i],
  ["storage", /storage/i],
  ["backups", /backup/i],
  ["email", /email/i],
  ["cdn", /\bcdn\b|ddos|\bwaf\b/i],
  ["support", /support/i],
  ["research", /keyword research|competitor|market analysis/i],
  ["technical", /on-page seo|technical seo/i],
  ["meta", /meta \+ schema|schema setup/i],
  ["local", /local seo|business profile|local \+/i],
  ["content", /content calendar|content marketing/i],
  ["cro", /conversion-rate|conversion rate/i],
  ["links", /link building/i],
  ["consulting", /seo consulting|ongoing seo/i],
  ["reporting", /reporting/i],
];

export interface CompareCell { on: boolean; label: string }
export interface CompareRow { key: string; label: string; cells: (CompareCell | null)[] }
export interface CompareGroup { heading: string; rows: CompareRow[] }

export function buildCompareGroups(tiers: Tier[], copy: PricingCopy): CompareGroup[] {
  const depth = Math.max(...tiers.map((tier) => tier.groups.length));
  const groups: CompareGroup[] = [];
  for (let g = 0; g < depth; g++) {
    const headings = Array.from(new Set(tiers.map((tier) => tier.groups[g]?.heading).filter(Boolean)));
    const order: string[] = [];
    const rows = new Map<string, CompareRow>();
    tiers.forEach((tier, column) => {
      tier.groups[g]?.items.forEach((item) => {
        const match = MATCHERS.find(([, re]) => re.test(item.label));
        const key = match ? match[0] : `label:${item.label}`;
        let row = rows.get(key);
        if (!row) {
          row = { key, label: match ? copy.rowLabels[match[0]] : item.label, cells: tiers.map(() => null) };
          rows.set(key, row);
          order.push(key);
        }
        // Two items of one tier folding onto the same row: keep the "on" one, or the first.
        const current = row.cells[column];
        if (!current || (!current.on && item.on)) row.cells[column] = { on: item.on, label: item.label };
      });
    });
    groups.push({ heading: headings.join(" · "), rows: order.map((key) => rows.get(key)!) });
  }
  return groups;
}

/** Splits a translated headline into lead + accent: the last two words become the accent. */
export function splitHeadline(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return [title, ""];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}
