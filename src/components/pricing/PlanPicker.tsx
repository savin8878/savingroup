"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import type { PickerQuestion } from "./copy/pricing-copy";
import { TierGlyph } from "./TierGlyph";
import s from "./Pricing.module.css";

export interface PickerTier {
  id: string;
  name: string;
  glyph: string;
  priceRange: string;
  /** Per-tier CTA label (Enterprise talks to a strategist). */
  ctaLabel: string;
  /** One-line reason shown when this tier is suggested. */
  reason: string;
  /** "See the Growth plan" — links to the plan column. */
  seePlan: string;
}

export interface PlanPickerProps {
  questions: PickerQuestion[];
  tiers: PickerTier[];
  /** Suggested before any answer (the featured tier). */
  defaultIndex: number;
  defaultReason: string;
  labels: {
    suggestion: string;
    startingPoint: string;
    /** answered[n] = "n of N answered", for n = 0..N. */
    answered: string[];
    reset: string;
    /** The honesty line (t.pricing.note). */
    note: string;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Guided plan picker. Every question, option and the default suggestion are
 * in the server HTML; choosing answers only swaps the suggested tier. The
 * suggestion is the highest tier any answer points at, so a small site that
 * sells online still lands on Scale, not Launch. Options are real buttons
 * (Tab / Enter / Space) with aria-pressed; the result panel keeps a fixed
 * footprint so nothing below it moves.
 */
export function PlanPicker({ questions, tiers, defaultIndex, defaultReason, labels }: PlanPickerProps) {
  const id = useId();
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const answered = answers.filter((answer) => answer !== null).length;
  let highest = -1;
  answers.forEach((answer, q) => {
    if (answer === null) return;
    const tier = questions[q]?.options[answer]?.tier ?? null;
    if (tier !== null && tier > highest) highest = tier;
  });
  const picked = highest >= 0;
  const tier = tiers[picked ? Math.min(highest, tiers.length - 1) : defaultIndex] ?? tiers[0];
  const reason = picked ? tier.reason : defaultReason;

  const choose = (q: number, o: number) => setAnswers((previous) => previous.map((value, index) => (index === q ? (value === o ? null : o) : value)));
  const reset = () => setAnswers(questions.map(() => null));

  return (
    <div className={s.picker}>
      <div>
        <div className={s.questions}>
          {questions.map((question, q) => {
            const headId = `${id}-q${q}`;
            return (
              <div key={headId} className={s.question} role="group" aria-labelledby={headId}>
                <p id={headId} className={s.questionHead}><span aria-hidden="true">{pad(q + 1)}</span>{question.q}</p>
                <div className={s.options}>
                  {question.options.map((option, o) => (
                    <button key={option.label} type="button" className={s.option} aria-pressed={answers[q] === o} onClick={() => choose(q, o)}>
                      <i className={s.optionMark} aria-hidden="true" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className={s.pickerMeta}>
          <span role="status">{labels.answered[answered] ?? labels.answered[labels.answered.length - 1]}</span>
          <button type="button" className={s.reset} onClick={reset} disabled={answered === 0}>{labels.reset}</button>
        </div>
      </div>

      <aside className={s.result} aria-labelledby={`${id}-result`}>
        <div className={s.resultKicker}>
          <p id={`${id}-result`} className={s.resultLabel}><span className={home.signal} aria-hidden="true" />{labels.suggestion}</p>
          <span>{labels.startingPoint}</span>
        </div>
        <div aria-live="polite" aria-atomic="true">
          <p className={s.resultName}><TierGlyph name={tier.glyph} />{tier.name}</p>
          <span className={s.resultPrice}>{tier.priceRange}</span>
          <p className={s.resultReason}>{reason}</p>
        </div>
        <div className={s.resultActions}>
          <LocalizedLink href="/contact" className={home.primaryButton}>{tier.ctaLabel}<ArrowUpRight size={17} aria-hidden="true" /></LocalizedLink>
          <a href={`#plan-${tier.id}`} className={home.textButton}>{tier.seePlan}<ArrowUpRight size={15} className={blog.arrow} aria-hidden="true" /></a>
        </div>
        <p className={s.resultNote}><Info size={13} aria-hidden="true" />{labels.note}</p>
      </aside>
    </div>
  );
}
