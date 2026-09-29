"use client";

// components/operator/views/SimulationTimeline.tsx
//
// An illustrative run of a workflow, step by step, always under a SIMULATION
// stamp and a no-live-system disclaimer. The part that matters is the
// approval gate: playback STOPS at every approval step until the visitor
// presses "Approve (simulated)" — the Operator's human-in-the-loop rule made
// tangible — and the server guarantees consequential steps sit behind one.
//
// - Resting render (server HTML, first client render, reduced motion): the
//   whole ordered list is readable; the current-step highlight, the gate and
//   the outcome are progressive enhancement on top.
// - Autoplay advances every 1.6s only while motion is allowed (no reduced
//   motion, tab visible, page motion not paused) and the view is on screen.
//   Any manual step pauses it, as on the industries WorkflowSimulator.
// - Screen readers hear manual step changes, the gate and completion — not
//   every autoplay tick.
// - Keyboard focus is never dropped. Controls that stop applying (Previous
//   on the first step, Next at a gate or the end, Play under reduced motion)
//   are aria-disabled, not disabled: a disabled button under focus sends
//   focus to <body>, and the next Tab restarts from the top of the panel.
//   A step the visitor moves onto that is a gate focuses its Approve button;
//   approving (which removes that button) focuses Next.

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  CircleCheck,
  Factory,
  FileText,
  Info,
  Pause,
  Play,
  RotateCcw,
  User,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { SimActorKind, Simulation } from "@/lib/operator/protocol";
import { textAttrs } from "./text-attrs";
import { useMotionAllowed } from "./useMotionAllowed";
import { fill, getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

const STEP_MS = 1600;
const pad = (n: number) => String(n).padStart(2, "0");

const ACTOR_ICONS: Record<SimActorKind, LucideIcon> = {
  person: User,
  system: AppWindow,
  ai: BrainCircuit,
  machine: Factory,
  external: Building2,
};

export interface SimulationTimelineProps {
  simulation: Simulation;
  locale: Locale;
}

export function SimulationTimeline({ simulation, locale }: SimulationTimelineProps) {
  const copy = getViewsCopy(locale);
  const c = copy.sim;
  const { steps } = simulation;
  const total = steps.length;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `op-${uid}-title`;
  const rootRef = useRef<HTMLElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const approveRef = useRef<HTMLButtonElement>(null);
  /** Set by a visitor's action, applied after that action's render commits. */
  const focusAfter = useRef<"gate" | "next" | null>(null);
  const motion = useMotionAllowed(rootRef);

  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [approved, setApproved] = useState<ReadonlySet<number>>(() => new Set());
  const [inView, setInView] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const step = steps[Math.min(current, Math.max(0, total - 1))];
  const gated = mounted && !finished && step?.kind === "approval" && !approved.has(current);
  const running = mounted && playing && motion && inView && !gated && !finished && total > 0;
  const atStart = current === 0;
  const nextOff = gated || finished;
  const playOff = !motion && !finished;

  useEffect(() => setMounted(true), []);

  // Only run while a useful part is on screen (IntersectionObserver clips to the panel's scroll box too).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // The clock: one step per tick; reaching the end marks the run finished.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (current >= total - 1) {
        setFinished(true);
        setPlaying(false);
        setAnnouncement(`${c.complete}. ${simulation.outcome}`);
      } else {
        setCurrent(current + 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, current, total, c.complete, simulation.outcome]);

  // Say so when the run stops at a gate, however it got there.
  useEffect(() => {
    if (gated && step) setAnnouncement(`${c.gateTitle}: ${step.label}`);
  }, [gated, step, c.gateTitle]);

  // Visitor-initiated moves only: autoplay reaching a gate must not pull focus out of wherever the visitor is.
  // "gate": focus Approve if the move landed on one, else leave focus where it is. "next": focus Approve or Next.
  useEffect(() => {
    const want = focusAfter.current;
    if (!want) return;
    focusAfter.current = null;
    if (gated) approveRef.current?.focus();
    else if (want === "next") nextRef.current?.focus();
  });

  const announceStep = useCallback((index: number) => {
    const target = steps[index];
    if (target) setAnnouncement(`${fill(c.stepOf, { n: index + 1, total })}: ${target.label}`);
  }, [steps, c.stepOf, total]);

  const go = (index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    setPlaying(false);
    setFinished(false);
    setCurrent(next);
    announceStep(next);
    focusAfter.current = "gate";
  };
  const back = () => {
    if (atStart) return;
    go(current - 1);
  };
  const forward = () => {
    if (nextOff) return;
    setPlaying(false);
    if (current >= total - 1) {
      setFinished(true);
      setAnnouncement(`${c.complete}. ${simulation.outcome}`);
    } else go(current + 1);
  };
  const restart = () => {
    setApproved(new Set());
    setFinished(false);
    setCurrent(0);
    setPlaying(true);
    announceStep(0);
    focusAfter.current = "gate";
  };
  const togglePlay = () => {
    if (playOff) return;
    if (finished) {
      restart();
      // Under reduced motion Play turns inert once the run restarts: hand the visitor the control that steps it.
      if (!motion) focusAfter.current = "next";
    } else setPlaying((value) => !value);
  };
  const approve = () => {
    setApproved((previous) => new Set(previous).add(current));
    setAnnouncement(c.approved);
    // The Approve button unmounts with the gate.
    focusAfter.current = "next";
  };

  const stateOf = (index: number) => {
    if (!mounted) return undefined;
    if (finished || index < current) return "done";
    return index === current ? "current" : "pending";
  };
  const progress = !mounted || total === 0 ? 0 : finished ? 1 : (current + 1) / total;
  const PlayIcon = finished ? RotateCcw : playing && motion ? Pause : Play;
  const playLabel = finished ? c.restart : playing && motion ? c.pause : c.play;

  return (
    <figure ref={rootRef} className={s.view} aria-labelledby={titleId}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.stamp}>{copy.eyebrows.simulation}</span>
        </div>
        <p className={s.simNote}>
          <Info size={14} strokeWidth={1.6} aria-hidden="true" />
          <span>{c.disclaimer}</span>
        </p>
        <h3 id={titleId} className={s.title} {...textAttrs(simulation.title, locale)}>{simulation.title}</h3>
        <p className={s.lede} {...textAttrs(simulation.scenario, locale)}>{simulation.scenario}</p>
      </header>

      {total > 0 && (
        <div className={s.controls}>
          <div className={s.ctrlGroup}>
            <button type="button" className={s.ctrl} data-primary="" onClick={togglePlay} disabled={!mounted} aria-disabled={playOff || undefined} aria-label={playLabel} title={playLabel}>
              <PlayIcon size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button type="button" className={s.ctrl} onClick={restart} disabled={!mounted} aria-label={c.restart} title={c.restart}>
              <RotateCcw size={15} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
          <div className={s.progress}>
            <span className={s.progressText}>{finished ? c.complete : fill(c.stepOf, { n: current + 1, total })}</span>
            <span className={s.progressBar} aria-hidden="true" style={{ "--p": progress } as CSSProperties}><i /></span>
          </div>
          <div className={s.ctrlGroup}>
            <button type="button" className={s.ctrl} onClick={back} disabled={!mounted} aria-disabled={atStart || undefined} aria-label={c.previous} title={c.previous}>
              <ArrowLeft size={16} strokeWidth={1.6} className={s.dirIcon} aria-hidden="true" />
            </button>
            <button ref={nextRef} type="button" className={s.ctrl} onClick={forward} disabled={!mounted} aria-disabled={nextOff || undefined} aria-label={c.next} title={c.next}>
              <ArrowRight size={16} strokeWidth={1.6} className={s.dirIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {mounted && !motion && !finished && total > 0 && <p className={s.hint}>{c.manualHint}</p>}

      <div className={s.simBody}>
        <ol className={s.steps} aria-label={c.steps}>
          {steps.map((item, index) => {
            const Icon = ACTOR_ICONS[item.actorKind] ?? User;
            const state = stateOf(index);
            const isCurrent = state === "current";
            const meta = [item.actor, item.system].filter(Boolean).join(" · ");
            return (
              <li key={index} className={s.step} data-state={state} aria-current={isCurrent ? "step" : undefined}>
                <span className={s.stepIcon} aria-hidden="true">
                  <Icon size={15} strokeWidth={1.4} />
                  <span className={s.stepNum}>{pad(index + 1)}</span>
                </span>
                <div className={s.stepMain}>
                  <div className={s.stepHead}>
                    <span className={s.stepLabel} {...textAttrs(item.label, locale)}>{item.label}</span>
                    <span className={s.tag} data-tone={item.kind === "approval" ? "accent" : undefined}>{c.stepKinds[item.kind] ?? item.kind}</span>
                    {item.consequential && <span className={s.tag} data-tone="accent">{c.consequential}</span>}
                    {item.kind === "approval" && approved.has(index) && (
                      <span className={s.tag} data-tone="ok"><Check size={11} strokeWidth={2.2} aria-hidden="true" />{c.approved}</span>
                    )}
                  </div>
                  {/* Our actor-kind word leads, so the line reads in the page direction; the model's names are isolated. */}
                  {meta && <p className={s.stepMeta}>{c.actorKinds[item.actorKind] ?? item.actorKind} · <span {...textAttrs(meta, locale)}>{meta}</span></p>}
                  {item.detail && <p className={s.stepDetail} {...textAttrs(item.detail, locale)}>{item.detail}</p>}
                  {isCurrent && gated && (
                    <div className={s.gate}>
                      <p className={s.gateTitle}><UserCheck size={16} strokeWidth={1.6} aria-hidden="true" />{c.gateTitle}</p>
                      <p>{c.gateBody}</p>
                      <button ref={approveRef} type="button" className={s.approve} onClick={approve}>
                        <Check size={15} strokeWidth={2} aria-hidden="true" />
                        {c.approve}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className={s.simAside}>
          {step && (
            <div className={s.record}>
              <div className={s.recordHead}>
                <span className={s.micro}><FileText size={13} strokeWidth={1.6} aria-hidden="true" />{c.record}</span>
                <span className={`${s.micro} ${s.ltr}`} dir="ltr">{pad(Math.min(current, total - 1) + 1)} / {pad(total)}</span>
              </div>
              {step.sample?.length ? (
                <dl className={s.recordFields}>
                  {step.sample.map((field, index) => (
                    <div key={`${field.key}:${index}`}>
                      <dt {...textAttrs(field.key, locale)}>{field.key}</dt>
                      {/* Mostly codes and quantities ("SO-1028", "1,200"): LTR unless the value is words in a right-to-left script. */}
                      <dd {...textAttrs(field.value, locale, "ltr")}>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={s.recordEmpty}>{c.noRecord}</p>
              )}
            </div>
          )}
          {finished && (
            <div className={s.outcome}>
              <CircleCheck size={16} strokeWidth={1.6} aria-hidden="true" />
              <span className={s.micro}>{c.outcome}</span>
              <p {...textAttrs(simulation.outcome, locale)}>{simulation.outcome}</p>
            </div>
          )}
        </div>
      </div>
      <p className={s.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </figure>
  );
}

export default SimulationTimeline;
