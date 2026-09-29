// lib/operator/impact.ts
//
// The arithmetic behind `calculate_operational_impact`. Claude supplies the
// inputs (the visitor's numbers, or assumptions it must label as such); the
// server does every multiplication, so the figures on screen are reproducible
// and never a model's mental maths. Also used to RE-compute impact artifacts
// that come back in client-held history, so a tampered total cannot reach the
// model as if the Operator had said it.
//
// Every figure follows from what the card shows: rows are rounded to one
// decimal, and the totals, the released share and the costs are computed from
// those rounded rows. A visitor checking the card with a calculator gets the
// same numbers (three rows of 0.1 total 0.3, not the 0.2 that their unrounded
// sum rounds to).
//
// Pure: no imports beyond protocol types.

import type { ImpactActivity, ImpactField, ImpactInput, ImpactResult } from "./protocol";

/** An activity's three numbers, in the order they are listed. */
export const IMPACT_FIELDS: readonly ImpactField[] = ["people", "minutesPerOccurrence", "occurrences"];

/** Average weeks per month (52 / 12), the usual conversion for weekly work. */
const WEEKS_PER_MONTH = 52 / 12;

/** One decimal, for hours. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** `5` → "5", `0.5` → "0.5", `4.333…` → "4.33": readable in an assumption line. */
function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

/** Unrounded staff-hours per month for one activity. */
function monthlyHours(activity: ImpactActivity, workingDays: number): number {
  const minutesPerPeriod = activity.people * activity.minutesPerOccurrence * activity.occurrences;
  switch (activity.per) {
    case "day":
      return (minutesPerPeriod * workingDays) / 60;
    case "week":
      return (minutesPerPeriod * WEEKS_PER_MONTH) / 60;
    case "month":
      return minutesPerPeriod / 60;
  }
}

/**
 * Which numbers were assumed. An input built without the per-number flags
 * (older callers) falls back to its single `source`, which covers all three.
 */
function assumedFields(activity: ImpactActivity): readonly ImpactField[] {
  return activity.assumed ?? (activity.source === "assumption" ? IMPACT_FIELDS : []);
}

/** Only the numbers the visitor did not state: their own figures are never labelled as assumed. */
function describeAssumed(activity: ImpactActivity): string | null {
  const assumed = assumedFields(activity);
  if (!assumed.length) return null;
  const parts = assumed.map((field) => {
    switch (field) {
      case "people":
        return activity.people === 1 ? "1 person" : `${formatNumber(activity.people)} people`;
      case "minutesPerOccurrence":
        return `${formatNumber(activity.minutesPerOccurrence)} min each time`;
      case "occurrences": {
        const times = activity.occurrences === 1 ? "once" : `${formatNumber(activity.occurrences)} times`;
        return `${times} per ${activity.per} per person`;
      }
    }
  });
  return `${activity.label}: ${parts.join(", ")} (assumed)`;
}

/**
 * Staff-hours (and, only when an hourly cost was given, money) that an
 * activity set consumes, plus the share a proposed change could release.
 *
 * Canonical check from the persona: 5 people × 45 min × once a day × 22
 * working days = 82.5 h/month ("roughly 82").
 *
 * Rounding each row first can move a total by up to 0.05 h per row against
 * summing raw values; the card's figures adding up is worth more than that.
 */
export function computeImpact(input: ImpactInput): ImpactResult {
  const workingDays = input.workingDaysPerMonth.value;
  const rows = input.activities.map((activity) => ({
    label: activity.label,
    hoursPerMonth: round1(monthlyHours(activity, workingDays)),
  }));
  // Summed from the rounded rows (and re-rounded only to shed float noise).
  const totalMonthly = round1(rows.reduce((sum, row) => sum + row.hoursPerMonth, 0));

  const result: ImpactResult = {
    input,
    rows,
    totalHoursPerMonth: totalMonthly,
    totalHoursPerYear: round1(totalMonthly * 12),
    assumptions: [],
  };

  const releasedMonthly = input.reductionPercent
    ? round1((totalMonthly * input.reductionPercent.value) / 100)
    : undefined;
  if (releasedMonthly !== undefined) result.releasedHoursPerMonth = releasedMonthly;

  if (input.hourlyCost) {
    const { amount, currency } = input.hourlyCost;
    result.monthlyCost = { amount: Math.round(totalMonthly * amount), currency };
    if (releasedMonthly !== undefined) {
      result.releasedMonthlyCost = { amount: Math.round(releasedMonthly * amount), currency };
    }
  }

  // Every assumed input gets a line, so the visitor can see exactly which
  // numbers they did NOT give and correct them.
  for (const activity of input.activities) {
    const line = describeAssumed(activity);
    if (line) result.assumptions.push(line);
  }
  if (input.workingDaysPerMonth.source === "assumption") {
    result.assumptions.push(`${formatNumber(workingDays)} working days per month (assumed)`);
  }
  if (input.reductionPercent?.source === "assumption") {
    result.assumptions.push(
      `${formatNumber(input.reductionPercent.value)}% of this time removed by the proposed change (assumed)`,
    );
  }
  if (input.hourlyCost?.source === "assumption") {
    result.assumptions.push(
      `Hourly cost of ${input.hourlyCost.currency} ${formatNumber(input.hourlyCost.amount)} per staff-hour (assumed)`,
    );
  }

  return result;
}
