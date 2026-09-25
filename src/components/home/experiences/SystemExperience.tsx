"use client";

import { useCallback, useEffect, useId, useRef, useState, type ComponentType, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, FileText, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import type { Experience } from "./experience-data";
import styles from "./SystemExperience.module.css";

export type SceneProps = { step: number };

type Props = { experience: Experience; Scene: ComponentType<SceneProps>; onClose: () => void };

function RecordPanel({ experience, step }: { experience: Experience; step: number }) {
  const { record } = experience.stages[step];
  return <aside className={styles.recordPanel} aria-label={record.doc}>
    <div className={styles.paperHeader}><FileText size={17} strokeWidth={1.3} aria-hidden="true" /><span>{record.doc}</span><span>{record.code}</span></div>
    <div className={styles.paperStatus}><i /><span>{record.status}</span></div>
    <dl className={styles.recordFields}>{record.fields.map(([label, value]) => <div key={label + value}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {record.link && <div className={styles.recordLink}><span>Connected record</span><strong>{record.link}</strong></div>}
    <div className={styles.recordFooter}><CheckCheck size={15} aria-hidden="true" /><span>{record.note ?? "One record trail. Every handoff connected."}</span></div>
  </aside>;
}

/**
 * The generic walkthrough dialog used by every non-ERP node of the connected
 * journey. Same anatomy as ProcurementExperience: timeline, animated scene,
 * record panel, event log and playback controls, with the same motion rules.
 */
export default function SystemExperience({ experience, Scene, onClose }: Props) {
  const stages = experience.stages;
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollBody = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const titleId = useId();
  const descriptionId = useId();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [replay, setReplay] = useState(0);
  const [motion, setMotion] = useState({ reduced: false, paused: false });
  const [complete, setComplete] = useState(false);
  const running = playing && !motion.reduced && !motion.paused && !complete;
  const stage = stages[step];
  const last = stages.length - 1;
  const name = experience.eyebrow.split(" / ")[0];

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = element.closest("[data-motion]");
    const sync = () => setMotion({ reduced: preference.matches, paused: document.hidden || container?.getAttribute("data-motion") === "paused" });
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const observer = new MutationObserver(sync);
    if (container) observer.observe(container, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = performance.now();
    function tick(now: number) {
      elapsed.current += Math.min(now - previous, 100);
      previous = now;
      const portion = Math.min(1, elapsed.current / stage.durationMs);
      progress.current?.style.setProperty("--progress", String(portion));
      if (portion === 1) {
        elapsed.current = 0;
        if (step === last) { setComplete(true); setPlaying(false); }
        else { progress.current?.style.setProperty("--progress", "0"); setStep(step + 1); }
      } else frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step, stage.durationMs, last, replay]);

  const goTo = useCallback((next: number) => {
    elapsed.current = 0;
    progress.current?.style.setProperty("--progress", "0");
    scrollBody.current?.scrollTo({ top: 0, behavior: "instant" });
    setStep(next);
    setComplete(false);
    setReplay((value) => value + 1);
  }, []);

  function restart() { goTo(0); setPlaying(true); }

  function keepFocusInside(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])")).filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /** Arrow keys move focus between stage buttons; Home / End jump to the ends. */
  function moveAlongTimeline(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const buttons = Array.from(timeline.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    let next = current;
    if (event.key in keys) next = (current + keys[event.key] + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={keepFocusInside} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.shell} data-running={running} data-reduced={motion.reduced} data-experience={experience.key} style={{ "--stages": stages.length, "--mobile-columns": stages.length > 6 ? 4 : 3 } as CSSProperties}>
      <header className={styles.header}><div><span className={styles.eyebrow}>{experience.eyebrow}</span><h2 id={titleId}>{experience.title}</h2><p id={descriptionId}>{experience.description}</p></div><button type="button" onClick={onClose} className={styles.close} aria-label={`Close ${name} walkthrough`} autoFocus><X size={21} aria-hidden="true" /></button></header>
      <div className={styles.timeline} aria-label={`${name} stages`} ref={timeline} onKeyDown={moveAlongTimeline}>{stages.map((item, index) => <button type="button" key={item.label} className={styles.stageButton} aria-current={step === index ? "step" : undefined} aria-label={`Stage ${index + 1}: ${item.label}`} tabIndex={step === index ? 0 : -1} onClick={() => { goTo(index); setPlaying(true); }}><span>{index < step ? <Check size={12} aria-hidden="true" /> : `0${index + 1}`}</span><strong>{item.label}</strong><i aria-hidden="true" /></button>)}</div>
      <div className={styles.scrollBody} ref={scrollBody}>
        <div className={styles.stageIntro}><div><span className={styles.eyebrow}>0{step + 1} / {stage.label}</span><h3>{stage.title}</h3></div><p>{stage.detail}</p></div>
        <div className={styles.workspace}>
          <div className={styles.scenePanel}>
            <div className={styles.sceneBar}><span><i />{stage.scene ?? stage.label}</span><span>{experience.sample}</span></div>
            <div key={`${step}-${replay}`} className={styles.scene} style={{ "--stage-duration": `${stage.durationMs}ms` } as CSSProperties}><Scene step={step} /></div>
            <div className={styles.sceneCaption}><span>{stage.owner}</span><span className={styles.sceneCaptionArrow} aria-hidden="true">↗</span></div>
            <div className={styles.recordTrail}><span>{experience.trail.label}</span><div>{experience.trail.items.map((item, index) => <span key={item.code} className={styles.trailItem}>{index > 0 && <ChevronRight size={12} aria-hidden="true" />}<span data-done={step >= item.from}>{item.code}</span></span>)}</div></div>
          </div>
          <RecordPanel experience={experience} step={step} />
        </div>
        <div className={styles.eventLog} role="status" aria-live="polite" aria-atomic="true"><span className={styles.eventIcon}>{step === last ? <Sparkles size={16} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}</span><span>{stage.event}</span><span className={styles.eventTag}>{experience.eventTag}</span></div>
      </div>
      <footer className={styles.controls}>
        <div className={styles.playback}><button type="button" className={styles.playButton} onClick={() => { if (complete) restart(); else setPlaying((value) => !value); }} disabled={motion.reduced || motion.paused} aria-label={complete ? `Replay ${name} walkthrough` : playing ? `Pause ${name} walkthrough` : `Play ${name} walkthrough`}>{running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}<span>{motion.reduced ? "Reduced motion" : motion.paused ? "Motion paused" : complete ? "Replay" : running ? "Pause" : "Play"}</span></button><button type="button" className={styles.restart} onClick={restart} aria-label={`Restart ${name} walkthrough`}><RotateCcw size={16} aria-hidden="true" /></button></div>
        <div className={styles.progressWrap}><div className={styles.progressTrack} ref={progress} role="img" aria-label={`Stage ${step + 1} of ${stages.length}`}><span /></div><span>{complete ? "Walkthrough complete" : `Stage ${step + 1} of ${stages.length}`}</span></div>
        <div className={styles.stepControls}><button type="button" disabled={step === 0} onClick={() => { goTo(step - 1); setPlaying(true); }} aria-label={`Previous ${name} stage`}><ArrowLeft size={17} aria-hidden="true" /></button><button type="button" disabled={step === last} onClick={() => { goTo(step + 1); setPlaying(true); }} aria-label={`Next ${name} stage`}><span>Next</span><ArrowRight size={17} aria-hidden="true" /></button></div>
      </footer>
    </div>
  </dialog>;
}
