// lib/operator/impact.ts
//
// The arithmetic behind `calculate_operational_impact`. Claude supplies the
// inputs (the visitor's numbers, or assumptions it must label as such); the
// server does every multiplication, so the figures on screen are reproducible
// and never a model's mental maths. Also used to RE-compute impact artifacts
// that come back in client-held history, so a tampered total cannot reach the
// model as if the Operator had said it.
//
// Pure: no imports beyond protocol types.

import type { ImpactActivity, ImpactInput, ImpactResult } from "./protocol";

/** Average weeks per month (52 / 12), the usual conversion for weekly work. */
const WEEKS_PER_MONTH = 52 / 12;

/** One decimal, for hours. Display rounding only — totals use raw values. */
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

function describeActivity(activity: ImpactActivity): string {
  const people = activity.people === 1 ? "1 person" : `${formatNumber(activity.people)} people`;
  const times = activity.occurrences === 1 ? "once" : `${formatNumber(activity.occurrences)} times`;
  return `${activity.label}: ${people} × ${formatNumber(activity.minutesPerOccurrence)} min, ${times} per ${activity.per} each (assumed)`;
}

/**
 * Staff-hours (and, only when an hourly cost was given, money) that an
 * activity set consumes, plus the share a proposed change could release.
 *
 * Canonical check from the persona: 5 people × 45 min × once a day × 22
 * working days = 82.5 h/month ("roughly 82").
 */
export function computeImpact(input: ImpactInput): ImpactResult {
  const workingDays = input.workingDaysPerMonth.value;
  const raw = input.activities.map((activity) => monthlyHours(activity, workingDays));
  const totalMonthly = raw.reduce((sum, hours) => sum + hours, 0);

  const result: ImpactResult = {
    input,
    rows: input.activities.map((activity, index) => ({
      label: activity.label,
      hoursPerMonth: round1(raw[index] ?? 0),
    })),
    totalHoursPerMonth: round1(totalMonthly),
    totalHoursPerYear: round1(totalMonthly * 12),
    assumptions: [],
  };

  const releasedMonthly = input.reductionPercent
    ? (totalMonthly * input.reductionPercent.value) / 100
    : undefined;
  if (releasedMonthly !== undefined) result.releasedHoursPerMonth = round1(releasedMonthly);

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
    if (activity.source === "assumption") result.assumptions.push(describeActivity(activity));
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
