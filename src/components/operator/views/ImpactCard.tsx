"use client";

// components/operator/views/ImpactCard.tsx
//
// The Operator's impact estimate: the server's deterministic arithmetic over
// numbers the visitor gave (or the Operator assumed and said so). Nothing is
// recomputed here — every figure on screen is one the server returned, so it
// is reproducible — and every assumed input is labelled where it is used,
// then listed again under the figures, then capped by a disclaimer that this
// is not a quote.
//
// Numbers and the assumption lines come from impact-format.ts: Latin
// digits in every market, hours at the server's one decimal everywhere
// (so the total reads as the sum of its rows), inputs at the precision the
// server used, and assumptions in the visitor's language.

import { useId, useMemo } from "react";
import { Info } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { ImpactActivity, ImpactResult, ValueSource } from "@/lib/operator/protocol";
import { assumedFields, assumptionLines, impactFormat, rowsDisagreeWithTotal } from "./impact-format";
import { textAttrs } from "./text-attrs";
import { fill, getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

export interface ImpactCardProps {
  impact: ImpactResult;
  locale: Locale;
  country: string;
}

export function ImpactCard({ impact, locale, country }: ImpactCardProps) {
  const copy = getViewsCopy(locale);
  const c = copy.impact;
  const { input } = impact;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `op-${uid}-title`;
  const assumptionsId = `op-${uid}-assumptions`;
  const captionId = `op-${uid}-caption`;

  const format = useMemo(() => impactFormat(locale, country), [locale, country]);
  // Localized lines, or the server's English ones when the two lists disagree (see assumptionLines).
  const localized = useMemo(() => assumptionLines(impact, c, format, locale), [impact, c, format, locale]);
  const assumptions = localized ?? impact.assumptions;
  const roundingGap = rowsDisagreeWithTotal(impact);

  const sourceTag = (source: ValueSource) => (
    <span className={s.tag} data-tone={source === "assumption" ? "quiet" : undefined}>{source === "assumption" ? c.assumed : c.yours}</span>
  );
  const frequency = (activity: ImpactActivity) => fill(c.per[activity.per] ?? c.per.month, { n: format.input(activity.occurrences) });
  const rateAssumed = input.hourlyCost?.source === "assumption";
  // An assumed number in the table: dashed underline, like the dashed "Assumed" tags, and said aloud.
  const cell = (text: string, assumed: boolean) => (assumed ? (
    <>
      <span className={s.assumedValue}>{text}</span>
      <span className={s.srOnly}> ({c.assumed})</span>
    </>
  ) : text);

  return (
    <figure className={s.view} aria-labelledby={titleId}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.eyebrow}>{copy.eyebrows.estimate}</span>
        </div>
        <h3 id={titleId} className={s.title} {...textAttrs(input.title, locale)}>{input.title}</h3>
      </header>

      <div className={s.figures}>
        <div className={s.figure}>
          <span className={s.micro}>{c.perMonth}</span>
          <p className={s.figureValue}><span>{format.hours(impact.totalHoursPerMonth)}</span><small>{c.hours}</small></p>
        </div>
        <div className={s.figure}>
          <span className={s.micro}>{c.perYear}</span>
          <p className={s.figureValue}><span>{format.hours(impact.totalHoursPerYear)}</span><small>{c.hours}</small></p>
        </div>
        {impact.releasedHoursPerMonth !== undefined && (
          <div className={s.figure} data-wide="" data-tone="accent">
            <span className={s.micro}>{c.released}</span>
            <p className={s.figureValue}><span>{format.hours(impact.releasedHoursPerMonth)}</span><small>{c.hours}</small></p>
            {input.reductionPercent && (
              <span className={s.figureNote}>
                {fill(c.reduction, { pct: format.input(input.reductionPercent.value) })}
                {sourceTag(input.reductionPercent.source)}
              </span>
            )}
          </div>
        )}
      </div>

      {impact.monthlyCost && (
        <div className={s.costs}>
          <div className={s.figure} data-money="">
            <span className={s.micro}>{c.monthlyCost}</span>
            <p className={s.figureValue}><span>{format.money(impact.monthlyCost.amount, impact.monthlyCost.currency)}</span></p>
            {input.hourlyCost && (
              <span className={s.figureNote}>
                <span>{fill(c.rate, { amount: format.rate(input.hourlyCost.amount, input.hourlyCost.currency) })}</span>
                {rateAssumed ? <span className={s.tag} data-tone="quiet">{c.assumedRate}</span> : sourceTag(input.hourlyCost.source)}
              </span>
            )}
          </div>
          {impact.releasedMonthlyCost && (
            <div className={s.figure} data-money="" data-tone="accent">
              <span className={s.micro}>{c.releasedCost}</span>
              <p className={s.figureValue}><span>{format.money(impact.releasedMonthlyCost.amount, impact.releasedMonthlyCost.currency)}</span></p>
            </div>
          )}
        </div>
      )}

      <p className={s.metaLine}>
        {fill(c.workingDays, { n: format.input(input.workingDaysPerMonth.value) })}
        {sourceTag(input.workingDaysPerMonth.source)}
      </p>

      {input.activities.length > 0 && (
        <div className={s.tableWrap} role="region" aria-labelledby={captionId} tabIndex={0}>
          <table className={s.table}>
            <caption id={captionId} className={s.micro}>{c.breakdown}</caption>
            <thead>
              <tr>
                <th scope="col">{c.activity}</th>
                <th scope="col" className={s.num}>{c.people}</th>
                <th scope="col" className={s.num}>{c.time}</th>
                <th scope="col" className={s.num}>{c.frequency}</th>
                <th scope="col" className={s.num}>{c.hoursPerMonth}</th>
              </tr>
            </thead>
            <tbody>
              {input.activities.map((activity, index) => {
                const assumed = assumedFields(activity);
                const row = impact.rows[index]?.label === activity.label ? impact.rows[index] : impact.rows.find((item) => item.label === activity.label);
                return (
                  <tr key={index}>
                    <td>
                      {/* The cell keeps the page direction (its tag is our copy); the model's label is isolated. */}
                      <span {...textAttrs(activity.label, locale)}>{activity.label}</span>
                      {assumed.size > 0 && <span className={s.tag} data-tone="quiet">{c.assumed}</span>}
                    </td>
                    <td className={s.num}>{cell(format.input(activity.people), assumed.has("people"))}</td>
                    <td className={s.num}>{cell(fill(c.minutes, { n: format.input(activity.minutesPerOccurrence) }), assumed.has("minutesPerOccurrence"))}</td>
                    <td className={s.num}>{cell(frequency(activity), assumed.has("occurrences"))}</td>
                    <td className={s.num}>{row ? format.hours(row.hoursPerMonth) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>{c.total}</td>
                <td className={s.num}>{format.hours(impact.totalHoursPerMonth)}</td>
              </tr>
              {roundingGap && (
                <tr>
                  <td colSpan={5} className={s.tableNote}>{c.roundingNote}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

      {assumptions.length > 0 && (
        <div className={s.assumptions}>
          <span className={s.micro} id={assumptionsId}>{c.assumptions}</span>
          <ol aria-labelledby={assumptionsId}>
            {assumptions.map((item, index) => (
              // Localized lines read in the page's direction (labels inside are isolated); the server's English fallback gets its own.
              <li key={index}><span aria-hidden="true">A{index + 1}</span><span {...(localized ? {} : textAttrs(item, locale))}>{item}</span></li>
            ))}
          </ol>
        </div>
      )}

      <p className={s.disclaimer}>
        <Info size={15} strokeWidth={1.6} aria-hidden="true" />
        <span>{c.disclaimer}</span>
      </p>
    </figure>
  );
}

export default ImpactCard;
