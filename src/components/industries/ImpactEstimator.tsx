"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import { ArrowUpRight, Info, RotateCcw } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import type { IndustryKey } from "@/lib/country-content";
import { AUDIT } from "@/lib/offer";
import { INDUSTRY_ESTIMATORS, formatInr, type EstimatorInput } from "./workflows";
import { getKitCopy } from "./copy/kit-copy";
import s from "./ImpactEstimator.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const decimalsOf = (step: number) => (String(step).split(".")[1]?.length ?? 0);
const isMoney = (input: EstimatorInput) => input.unit.startsWith("₹");
const toNumberText = (input: EstimatorInput, value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: Math.max(decimalsOf(input.step), 0) });

/** "6 people", "2.5 h / day", "15%", "₹25,000", "₹75 L". */
function formatValue(input: EstimatorInput, value: number) {
  if (isMoney(input)) return formatInr(value);
  const text = toNumberText(input, value);
  return input.unit === "%" ? `${text}%` : `${text} ${input.unit}`;
}
/** Screen-reader value: full rupee amounts, "per" instead of "/". */
function spokenValue(input: EstimatorInput, value: number) {
  if (isMoney(input)) return `₹${Math.round(value).toLocaleString("en-IN")}`;
  const text = toNumberText(input, value);
  return input.unit === "%" ? `${text}%` : `${text} ${input.unit.replace(/\s*\/\s*/g, " per ")}`;
}
/** Slider ends: "₹15,000", "40", "40%". */
function formatBound(input: EstimatorInput, value: number) {
  if (isMoney(input)) return formatInr(value);
  const text = toNumberText(input, value);
  return input.unit === "%" ? `${text}%` : text;
}
/** "₹4.3 L / mo" → ["₹4.3 L", "/ mo"]; "9 days" → ["9", "days"]; "Under 5 min" stays whole. */
function splitValue(value: string): [string, string] {
  const match = value.match(/^(₹?[\d.,]+(?:\s?(?:L|Cr))?)\s*(.*)$/);
  return match ? [match[1], match[2]] : [value, ""];
}

function useMotion(ref: RefObject<HTMLElement | null>) {
  const [still, setStill] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = element.closest("[data-motion]");
    const sync = () => setStill(preference.matches || container?.getAttribute("data-motion") === "paused");
    sync();
    preference.addEventListener("change", sync);
    const observer = new MutationObserver(sync);
    if (container) observer.observe(container, { attributes: true, attributeFilter: ["data-motion"] });
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); };
  }, [ref]);
  return still;
}

/** Eases displayed inputs toward their targets; outputs are recomputed from the eased inputs, so formatting stays exact. */
function useTweened(target: Record<string, number>, enabled: boolean, duration = 460) {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    const keys = Object.keys(target);
    if (!enabled || keys.every((key) => from[key] === target[key])) {
      current.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next: Record<string, number> = {};
      keys.forEach((key) => { next[key] = t === 1 ? target[key] : from[key] + (target[key] - from[key]) * eased; });
      current.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, duration]);
  return enabled ? shown : target;
}

export interface ImpactEstimatorProps {
  industry: IndustryKey;
  /** Route locale — picks the UI copy (labels, disclaimer, CTA). */
  locale: string;
  className?: string;
  id?: string;
}

/**
 * "Estimate your impact" — sliders (plus exact number fields) for an
 * industry's own numbers, with live results as large numerals.
 *
 * - Server HTML: the default inputs and their computed outputs.
 * - Results ease between values (no layout shift; tabular numerals); instant under reduced motion or paused page motion.
 * - Screen readers: each slider has aria-valuetext with its unit; a polite status line summarises the results after changes settle.
 * - Narrow containers: a sticky one-line live result follows the sliders.
 */
export function ImpactEstimator({ industry, locale, className = "", id }: ImpactEstimatorProps) {
  const estimator = INDUSTRY_ESTIMATORS[industry] ?? INDUSTRY_ESTIMATORS.manufacturing;
  const copy = getKitCopy(locale).est;
  const root = useRef<HTMLElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const resultsId = `${uid}-results`;

  const defaults = useMemo(() => Object.fromEntries(estimator.inputs.map((input) => [input.id, input.default])), [estimator]);
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState("");
  const still = useMotion(root);

  const shown = useTweened(values, !still);
  const live = useMemo(() => estimator.compute(shown), [estimator, shown]);
  const final = useMemo(() => estimator.compute(values), [estimator, values]);
  const primary = Math.max(0, final.findIndex((output) => output.value.includes("₹")));
  const isDefault = estimator.inputs.every((input) => values[input.id] === input.default);

  // One polite summary once the numbers settle — never on every slider tick.
  const announced = useRef(JSON.stringify(defaults));
  useEffect(() => {
    const key = JSON.stringify(values);
    if (key === announced.current) return;
    const timer = window.setTimeout(() => {
      announced.current = key;
      setAnnouncement(`${copy.updated}: ${final.map((output) => `${output.label}, ${output.value}`).join("; ")}.`);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [values, final, copy.updated]);

  const setValue = useCallback((key: string, value: number) => {
    setValues((previous) => (previous[key] === value ? previous : { ...previous, [key]: value }));
  }, []);
  const clearDraft = (key: string) => setDrafts((previous) => {
    if (!(key in previous)) return previous;
    const next = { ...previous };
    delete next[key];
    return next;
  });

  const onNumberChange = (input: EstimatorInput, text: string) => {
    setDrafts((previous) => ({ ...previous, [input.id]: text }));
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n) && n >= input.min && n <= input.max) setValue(input.id, n);
  };
  const commitNumber = (input: EstimatorInput) => {
    const text = drafts[input.id];
    if (text === undefined) return;
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n)) setValue(input.id, Math.round(clamp(n, input.min, input.max) * 100) / 100);
    clearDraft(input.id);
  };
  const onNumberKey = (event: KeyboardEvent<HTMLInputElement>, input: EstimatorInput) => {
    if (event.key === "Enter") { event.preventDefault(); commitNumber(input); }
    if (event.key === "Escape") clearDraft(input.id);
  };
  const reset = () => { setValues(defaults); setDrafts({}); };

  const [peekMain, peekSuffix] = splitValue(live[primary]?.value ?? "");

  return (
    <section ref={root} id={id} className={`${s.est} ${className}`} aria-labelledby={titleId} data-embed="" data-industry={industry}>
      <div className={s.frame}>
        <header className={s.head}>
          <div>
            <span className={s.eyebrow}><i aria-hidden="true" />{copy.eyebrow}</span>
            <h3 id={titleId} className={s.title}>{estimator.title}</h3>
          </div>
          <p className={s.intro}>{estimator.intro}</p>
        </header>

        <div className={s.body}>
          <form className={s.inputs} aria-label={copy.inputsLabel} onSubmit={(event) => event.preventDefault()} noValidate>
            <div className={s.colHead}>
              <span>{copy.inputsLabel}</span>
              <button type="button" className={s.reset} onClick={reset} disabled={isDefault}>
                <RotateCcw size={13} aria-hidden="true" /><span>{copy.reset}</span>
              </button>
            </div>

            <div className={s.peek} aria-hidden="true">
              <span className={s.peekLabel}><i />{copy.peek}</span>
              <span className={s.peekName}>{final[primary]?.label}</span>
              <strong className={s.peekValue}><span>{peekMain}</span>{peekSuffix && <small>{peekSuffix}</small>}</strong>
            </div>

            {estimator.inputs.map((input, index) => {
              const value = values[input.id];
              const rangeId = `${uid}-${input.id}`;
              const hintId = `${rangeId}-hint`;
              const span = input.max - input.min || 1;
              const style = { "--pct": clamp((value - input.min) / span, 0, 1), "--typ": clamp((input.default - input.min) / span, 0, 1) } as CSSProperties;
              return (
                <div key={input.id} className={s.field} style={style}>
                  <div className={s.fieldHead}>
                    <span className={s.fieldIndex} aria-hidden="true">{pad(index + 1)}</span>
                    <label htmlFor={rangeId}>{input.label}</label>
                    <output htmlFor={rangeId} className={s.readout} aria-hidden="true">{formatValue(input, value)}</output>
                  </div>
                  <div className={s.control}>
                    <div className={s.rangeWrap}>
                      <span className={s.typicalTick} aria-hidden="true" />
                      <input
                        id={rangeId}
                        className={s.range}
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={value}
                        aria-valuetext={spokenValue(input, value)}
                        aria-describedby={hintId}
                        onChange={(event) => { setValue(input.id, Number(event.target.value)); clearDraft(input.id); }}
                      />
                      <div className={s.scale} aria-hidden="true">
                        <span>{formatBound(input, input.min)}</span>
                        <span className={s.scaleTypical}>{copy.typical} · <span dir="ltr">{formatBound(input, input.default)}</span></span>
                        <span>{formatBound(input, input.max)}</span>
                      </div>
                      <span id={hintId} className={s.srOnly}>{copy.range(spokenValue(input, input.min), spokenValue(input, input.max))}. {copy.typical}: {spokenValue(input, input.default)}.</span>
                    </div>
                    <input
                      className={s.number}
                      type="number"
                      inputMode="decimal"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={drafts[input.id] ?? String(value)}
                      aria-label={copy.exact(input.label)}
                      onChange={(event) => onNumberChange(input, event.target.value)}
                      onBlur={() => commitNumber(input)}
                      onKeyDown={(event) => onNumberKey(event, input)}
                    />
                  </div>
                </div>
              );
            })}
          </form>

          <div className={s.results} id={resultsId} role="group" aria-labelledby={`${resultsId}-label`}>
            <div className={s.colHead}>
              <span id={`${resultsId}-label`}><i className={s.liveDot} aria-hidden="true" />{copy.resultsLabel}</span>
            </div>
            <ul className={s.outputs}>
              {final.map((output, index) => {
                const [main, suffix] = splitValue(live[index]?.value ?? output.value);
                return (
                  <li key={output.label} className={s.output} data-primary={index === primary}>
                    <span className={s.outLabel}><span aria-hidden="true">R{index + 1}</span>{output.label}</span>
                    <strong className={s.outValue} aria-hidden="true"><span>{main}</span>{suffix && <small>{suffix}</small>}</strong>
                    <span className={s.srOnly}>{output.value}</span>
                    <span className={s.outNote}>{output.note}</span>
                  </li>
                );
              })}
            </ul>
            <p className={s.disclaimer}><Info size={15} strokeWidth={1.6} aria-hidden="true" /><span>{copy.disclaimer}</span></p>
            <div className={s.cta}>
              <LocalizedLink href="/contact" className={`${home.primaryButton} ${s.ctaButton}`}>
                <span>{copy.cta}</span><ArrowUpRight size={16} aria-hidden="true" />
              </LocalizedLink>
              <p>{copy.ctaNote(AUDIT.minutes)}</p>
            </div>
          </div>
        </div>

        <div className={s.assumptions}>
          <span className={s.assumptionsLabel}>{copy.assumptions}</span>
          <ol>
            {estimator.assumptions.map((item, index) => <li key={item}><span aria-hidden="true">A{index + 1}</span><span>{item}</span></li>)}
          </ol>
        </div>
        <p className={s.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </div>
    </section>
  );
}

export default ImpactEstimator;
