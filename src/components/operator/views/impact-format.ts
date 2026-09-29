// components/operator/views/impact-format.ts
//
// Number formatting and localized assumption lines for <ImpactCard>. Pure
// (type imports and views-copy only), so node --test checks the exact
// strings the card shows.
//
// - Digits are always Latin (numberingSystem "latn"). Intl picks
//   Arabic-Indic digits for ar-SA, ar-EG, ar-QA and most other Arabic
//   markets, while the site, the panel and the model's own sentences write
//   "126.5". The card has to quote the same figures the conversation does.
// - Staff-hours are shown exactly as the server rounded them (one decimal),
//   in the big figures and in the table alike. The old "whole numbers above
//   100" rule turned a 126.5 total into 127 under rows reading 82.5 + 44.
// - The visitor's own inputs are echoed at up to two decimals, as the server
//   used them, so €22.50 an hour never reads "€23" and 0.04 a day never "0".
// - Tags try the route's language AND country first, so en + IN groups in
//   lakhs (1,23,456); a tag Intl rejects falls back to the bare language,
//   then English.

import type { ImpactActivity, ImpactField, ImpactInput, ImpactResult } from "@/lib/operator/protocol";
import { localeDir, textDir } from "../text-dir";
import { fill, type ViewsCopy } from "./views-copy";

/** An activity's three numbers, in the order the server lists them. */
export const IMPACT_FIELDS: readonly ImpactField[] = ["people", "minutesPerOccurrence", "occurrences"];

/**
 * The numbers of an activity the visitor did not state. `assumed` names
 * them one by one (a visitor rarely gives all three, and their own figures
 * must never be labelled as assumed). A transcript stored before that field
 * existed only has `source`, which then means all three.
 */
export function assumedFields(activity: Pick<ImpactActivity, "assumed" | "source">): ReadonlySet<ImpactField> {
  if (Array.isArray(activity.assumed)) return new Set(IMPACT_FIELDS.filter((field) => activity.assumed.includes(field)));
  return new Set(activity.source === "assumption" ? IMPACT_FIELDS : []);
}

export function numberFormat(locale: string, country: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const latn: Intl.NumberFormatOptions = { ...options, numberingSystem: "latn" };
  const tags = [country ? `${locale}-${country.toUpperCase()}` : "", locale, "en"].filter(Boolean);
  for (const tag of tags) {
    try {
      return new Intl.NumberFormat(tag, latn);
    } catch {}
  }
  return new Intl.NumberFormat(undefined, latn);
}

export interface ImpactFormat {
  /** Staff-hours, at the server's one decimal. */
  hours(n: number): string;
  /** An input: people, minutes, occurrences, percent, working days. */
  input(n: number): string;
  /** A monthly money figure; the server rounds those to whole units. */
  money(amount: number, currency: string): string;
  /** The hourly rate: whole when whole, else two decimals (22.5 → €22.50). */
  rate(amount: number, currency: string): string;
}

export function impactFormat(locale: string, country: string): ImpactFormat {
  const whole = numberFormat(locale, country, { maximumFractionDigits: 0 });
  const hours = numberFormat(locale, country, { maximumFractionDigits: 1 });
  const input = numberFormat(locale, country, { maximumFractionDigits: 2 });
  // Currency when the code is one Intl accepts (INR → ₹), else "CODE 1,234".
  const currency = (amount: number, code: string, digits: 0 | 2) => {
    try {
      return numberFormat(locale, country, { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
    } catch {
      return `${code} ${(digits ? input : whole).format(amount)}`;
    }
  };
  return {
    hours: (n) => hours.format(n),
    input: (n) => input.format(n),
    money: (amount, code) => currency(amount, code, 0),
    rate: (amount, code) => currency(amount, code, Number.isInteger(amount) ? 0 : 2),
  };
}

/** "5 people" in the locale's plural form; a category the copy leaves out uses `other`. */
export function peopleText(n: number, templates: ViewsCopy["impact"]["peopleCount"], locale: string, format: (n: number) => string): string {
  let category: Intl.LDMLPluralRule = "other";
  try {
    category = new Intl.PluralRules(locale).select(n);
  } catch {}
  return fill(templates[category] ?? templates.other, { n: format(n) });
}

// A model-written label (often English) must not flip the direction of the
// line around it on an Arabic page, so it goes inside a bidi isolate. LRI or
// RLI chosen from its letters, not FSI: FSI is first-strong, which lays out
// an Arabic label that opens with "Tally" left-to-right.
const LRI = "\u2066";
const RLI = "\u2067";
const PDI = "\u2069";
const isolate = (text: string, locale: string) => `${textDir(text, localeDir(locale)) === "rtl" ? RLI : LRI}${text}${PDI}`;

/**
 * The assumption list in the visitor's language, derived from the same flags
 * (`assumed` per activity, `source` on the rest), in the same order, that the
 * server's English `assumptions` are built from (lib/operator/impact.ts). An
 * activity line names only its assumed numbers. The server strings stay in
 * the artifact for the model; the card shows these.
 *
 * Returns null when the counts disagree: a server that learns a new kind of
 * assumption must not have it silently dropped from view by a client that
 * cannot phrase it, so the card then falls back to the server's own lines.
 */
export function assumptionLines(impact: Pick<ImpactResult, "input" | "assumptions">, c: ViewsCopy["impact"], f: ImpactFormat, locale: string): string[] | null {
  const input: ImpactInput = impact.input;
  const lines: string[] = [];
  for (const activity of input.activities) {
    const assumed = assumedFields(activity);
    if (!assumed.size) continue;
    const parts = IMPACT_FIELDS.filter((field) => assumed.has(field)).map((field) => {
      if (field === "people") return peopleText(activity.people, c.peopleCount, locale, f.input);
      if (field === "minutesPerOccurrence") return fill(c.assumedMinutes, { n: f.input(activity.minutesPerOccurrence) });
      return fill(c.per[activity.per] ?? c.per.month, { n: f.input(activity.occurrences) });
    });
    lines.push(fill(c.assumedActivity, { label: isolate(activity.label, locale), parts: parts.join(c.listSeparator) }));
  }
  if (input.workingDaysPerMonth.source === "assumption") lines.push(fill(c.workingDays, { n: f.input(input.workingDaysPerMonth.value) }));
  if (input.reductionPercent?.source === "assumption") lines.push(fill(c.assumedReduction, { pct: f.input(input.reductionPercent.value) }));
  if (input.hourlyCost?.source === "assumption") lines.push(fill(c.assumedCost, { amount: f.rate(input.hourlyCost.amount, input.hourlyCost.currency) }));
  return lines.length === impact.assumptions.length ? lines : null;
}

/**
 * Whether the rounded rows, as displayed, fail to add up to the total. The
 * server now sums the total from its rounded rows, so this is false for
 * anything it computes today; an estimate stored in a transcript before that
 * change rounded the rows and the total separately (10.04 + 10.04 → rows 10
 * and 10, total 20.1). The card never recomputes a figure, so it says so.
 */
export function rowsDisagreeWithTotal(impact: Pick<ImpactResult, "rows" | "totalHoursPerMonth">): boolean {
  const sum = impact.rows.reduce((total, row) => total + row.hoursPerMonth, 0);
  return Math.abs(sum - impact.totalHoursPerMonth) >= 0.05;
}
