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
// Numbers use Intl with the route's language AND country, so en + IN groups
// in lakhs (1,23,456) as Indian readers expect; a tag Intl rejects falls
// back to the bare language, then to English.

import { useId, useMemo } from "react";
import { Info } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { ImpactActivity, ImpactResult, ValueSource } from "@/lib/operator/protocol";
import { fill, getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

function numberFormat(locale: string, country: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const tags = [country ? `${locale}-${country.toUpperCase()}` : "", locale, "en"].filter(Boolean);
  for (const tag of tags) {
    try {
      return new Intl.NumberFormat(tag, options);
    } catch {}
  }
  return new Intl.NumberFormat(undefined, options);
}

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

  const format = useMemo(() => {
    const whole = numberFormat(locale, country, { maximumFractionDigits: 0 });
    const fine = numberFormat(locale, country, { maximumFractionDigits: 1 });
    return {
      /** Hours: one decimal below 100, whole numbers above. */
      hours: (n: number) => (Math.abs(n) < 100 ? fine : whole).format(n),
      count: (n: number) => fine.format(n),
      /** Currency when the code is one Intl knows (INR → ₹), else "CODE 1,234". */
      money: (amount: number, currency: string) => {
        try {
          return numberFormat(locale, country, { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
        } catch {
          return `${currency} ${whole.format(amount)}`;
        }
      },
    };
  }, [locale, country]);

  const sourceTag = (source: ValueSource) => (
    <span className={s.tag} data-tone={source === "assumption" ? "quiet" : undefined}>{source === "assumption" ? c.assumed : c.yours}</span>
  );
  const frequency = (activity: ImpactActivity) => fill(c.per[activity.per] ?? c.per.month, { n: format.count(activity.occurrences) });
  const rateAssumed = input.hourlyCost?.source === "assumption";

  return (
    <figure className={s.view} aria-labelledby={titleId}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.eyebrow}>{copy.eyebrows.estimate}</span>
        </div>
        <h3 id={titleId} className={s.title} dir="auto">{input.title}</h3>
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
                {fill(c.reduction, { pct: format.count(input.reductionPercent.value) })}
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
                <span>{fill(c.rate, { amount: format.money(input.hourlyCost.amount, input.hourlyCost.currency) })}</span>
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
        {fill(c.workingDays, { n: format.count(input.workingDaysPerMonth.value) })}
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
                const row = impact.rows[index]?.label === activity.label ? impact.rows[index] : impact.rows.find((item) => item.label === activity.label);
                return (
                  <tr key={index}>
                    <td>
                      <span dir="auto">{activity.label}</span>
                      {activity.source === "assumption" && <span className={s.tag} data-tone="quiet">{c.assumed}</span>}
                    </td>
                    <td className={s.num}>{format.count(activity.people)}</td>
                    <td className={s.num}>{fill(c.minutes, { n: format.count(activity.minutesPerOccurrence) })}</td>
                    <td className={s.num}>{frequency(activity)}</td>
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
            </tfoot>
          </table>
        </div>
      )}

      {impact.assumptions.length > 0 && (
        <div className={s.assumptions}>
          <span className={s.micro} id={assumptionsId}>{c.assumptions}</span>
          <ol aria-labelledby={assumptionsId}>
            {impact.assumptions.map((item, index) => (
              <li key={index}><span aria-hidden="true">A{index + 1}</span><span dir="auto">{item}</span></li>
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
