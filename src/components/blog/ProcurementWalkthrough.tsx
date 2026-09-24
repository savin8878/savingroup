"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, FileText, Maximize2, PackageCheck, Pause, Plane, Play, RotateCcw, Ship, Truck } from "lucide-react";
import { PROCUREMENT_STAGES as stages, TRANSPORT, type TransportMode } from "@/components/home/procurement-data";
import { ProcurementScene } from "@/components/home/ProcurementScene";
import styles from "./ProcurementWalkthrough.module.css";

const ProcurementExperience = dynamic(() => import("@/components/home/ProcurementExperience"), { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");
const QUOTES = [["A", "₹6,500", "6 days"], ["B", "₹6,750", "9 days"], ["C", "₹6,900", "4 days"]] as const;

function DocumentPanel({ step, mode }: { step: number; mode: TransportMode }) {
  const stage = stages[step];
  const transport = TRANSPORT[mode];
  return (
    <aside className={styles.doc} aria-label={`${stage.document} ${stage.code}`}>
      <div className={styles.docHead}><FileText size={16} strokeWidth={1.3} aria-hidden="true" /><span>{stage.document}</span><span>{stage.code}</span></div>
      <div className={styles.docStatus}><i aria-hidden="true" /><span>{stage.status}</span></div>
      {step === 3 ? <>
        <div className={styles.quoteHead}><span>Supplier</span><span>Unit rate</span><span>Lead time</span></div>
        {QUOTES.map(([name, cost, lead], i) => <div key={name} className={styles.quoteRow} data-chosen={i === 0}>
          <span>Supplier {name}{i === 0 && <Check size={12} aria-label="Selected" />}</span><strong>{cost}</strong><span>{lead}</span>
        </div>)}
        <p className={styles.docNote}>All three meet the specification. Supplier A offers the lowest rate within the required delivery window.</p>
      </> : <dl className={styles.fields}>
        <div><dt>{step >= 5 ? "Linked order" : "Item"}</dt><dd>{step >= 5 ? "PO-0089" : "Drive assembly"}</dd></div>
        <div><dt>{step >= 5 ? "Transport" : "SKU"}</dt><dd>{step >= 5 ? transport.vehicle : "DRV-240"}</dd></div>
        <div><dt>Quantity</dt><dd>24 units</dd></div>
        {step === 0 && <><div><dt>Available stock</dt><dd>6 units</dd></div><div><dt>Production need</dt><dd>30 units</dd></div></>}
        {step === 1 && <><div><dt>Budget</dt><dd>Within allocation</dd></div><div><dt>Approved by</dt><dd>Department lead</dd></div></>}
        {step === 2 && <><div><dt>Suppliers invited</dt><dd>3 qualified suppliers</dd></div><div><dt>Required delivery</dt><dd>Within 7 days</dd></div></>}
        {step === 4 && <><div><dt>Supplier</dt><dd>Supplier A</dd></div><div><dt>Unit rate</dt><dd>₹6,500</dd></div></>}
        {(step === 5 || step === 6) && <><div><dt>Load allocation</dt><dd>{transport.load}</dd></div><div><dt>Booking reference</dt><dd>{transport.booking}</dd></div></>}
        {step === 7 && <><div><dt>Received / accepted</dt><dd>24 / 24 units</dd></div><div><dt>Inventory balance</dt><dd>30 units</dd></div></>}
      </dl>}
      {step === 4
        ? <div className={styles.docBlock}><span>Order subtotal · excluding tax</span><strong className={styles.total}>₹1,56,000</strong><span>24 units × ₹6,500</span></div>
        : step >= 5 && step < 7
          ? <div className={styles.docBlock}><span>Planned route</span><strong>{transport.route}</strong><span>{transport.document}</span></div>
          : <div className={styles.docBlock}><span>Connected record</span><strong>{step === 7 ? "PR-0241 → PO-0089 → GRN-0058" : "Production requirement / MRP-0032"}</strong></div>}
      <div className={styles.docFoot}><CheckCheck size={14} aria-hidden="true" /><span>{step === 7 ? "Receipt linked. Inventory reconciled." : "One record trail. Every handoff connected."}</span></div>
    </aside>
  );
}

export interface ProcurementWalkthroughProps {
  /** Caption prefix, e.g. "FIG. 03". */
  figure?: string;
  title?: string;
  description?: string;
  /** Start playing automatically once at least a third of it is on screen (default true). */
  autoplay?: boolean;
  className?: string;
  id?: string;
}

/**
 * Inline, in-article version of the home procurement walkthrough. Same scenes
 * and data; autoplays only while on screen and while page motion is running,
 * never under reduced motion. The full-screen dialog is the home component.
 */
export function ProcurementWalkthrough({
  figure = "FIG.",
  title = "From a request to the receiving gate.",
  description = "Follow one purchase through a connected ERP — eight stages, one record trail. Interactive example · sample data.",
  autoplay = true,
  className = "",
  id,
}: ProcurementWalkthroughProps) {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const elapsed = useRef(0);
  const titleId = useId();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<TransportMode>("road");
  const [playing, setPlaying] = useState(autoplay);
  const [complete, setComplete] = useState(false);
  const [replay, setReplay] = useState(0);
  const [inView, setInView] = useState(false);
  const [motion, setMotion] = useState({ reduced: false, paused: false });
  const [fullOpen, setFullOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const stage = stages[step];
  const running = playing && inView && !motion.reduced && !motion.paused && !complete && !fullOpen;

  const setProgress = useCallback((value: number) => {
    root.current?.querySelectorAll<HTMLElement>("[data-progress]").forEach((node) => node.style.setProperty("--progress", String(value)));
  }, []);

  // Page motion state (BlogMotion's data-motion), device preference, tab visibility.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = element.closest("[data-motion]");
    const sync = () => setMotion({ reduced: preference.matches, paused: document.hidden || container?.getAttribute("data-motion") === "paused" });
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const observer = new MutationObserver(sync);
    if (container) observer.observe(container, { attributes: true, attributeFilter: ["data-motion"] });
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  // Only play while a meaningful part of the walkthrough is visible.
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Auto-advance clock (same pacing as the full-screen version).
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(now - previous, 100);
      previous = now;
      const portion = Math.min(1, elapsed.current / stage.duration);
      setProgress(portion);
      if (portion === 1) {
        elapsed.current = 0;
        if (step === stages.length - 1) { setComplete(true); setPlaying(false); }
        else { setProgress(0); setStep(step + 1); }
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step, stage.duration, mode, replay, setProgress]);

  const goTo = useCallback((next: number, announce = true) => {
    elapsed.current = 0;
    setProgress(0);
    setStep(next);
    setComplete(false);
    setReplay((value) => value + 1);
    if (announce) setAnnouncement(`Stage ${next + 1} of ${stages.length}: ${stages[next].label}. ${stages[next].event}.`);
  }, [setProgress]);

  const selectMode = (next: TransportMode) => {
    setMode(next);
    elapsed.current = 0;
    setProgress(0);
    setReplay((value) => value + 1);
    setAnnouncement(`${TRANSPORT[next].label} transport: ${TRANSPORT[next].milestone}.`);
  };
  const restart = () => { goTo(0); setPlaying(true); };
  const togglePlay = () => {
    if (complete) { restart(); return; }
    setPlaying((value) => !value);
  };

  const onStageKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = document.documentElement.dir === "rtl";
    let next = index;
    if (event.key === "ArrowRight") next = (index + (rtl ? stages.length - 1 : 1)) % stages.length;
    else if (event.key === "ArrowLeft") next = (index + (rtl ? 1 : stages.length - 1)) % stages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stages.length - 1;
    else return;
    event.preventDefault();
    goTo(next);
    tabs.current[next]?.focus();
  };

  const status = motion.reduced ? "Reduced motion" : motion.paused ? "Motion paused" : complete ? "Replay" : running ? "Pause" : "Play";
  const TransportIcon = { road: Truck, sea: Ship, air: Plane } as const;

  return (
    <section ref={root} id={id} className={`${styles.walk} ${className}`} data-embed="" aria-labelledby={titleId} data-running={running} data-reduced={motion.reduced}>
      <div className={styles.frame}>
        <header className={styles.head}>
          <div>
            <span className={styles.eyebrow}><i aria-hidden="true" />{figure} / ERP · Procurement in motion</span>
            <h3 id={titleId} className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
          <button type="button" className={styles.fullButton} onClick={() => setFullOpen(true)} aria-haspopup="dialog">
            <Maximize2 size={15} aria-hidden="true" /><span>Open full-screen walkthrough</span>
          </button>
        </header>

        <div className={styles.timeline} role="group" aria-label="Procurement stages">
          {stages.map((item, index) => <button
            key={item.label}
            ref={(node) => { tabs.current[index] = node; }}
            type="button"
            className={styles.stage}
            aria-current={step === index ? "step" : undefined}
            aria-label={`Stage ${index + 1} of ${stages.length}: ${item.label}`}
            tabIndex={step === index ? 0 : -1}
            data-done={index < step}
            onClick={() => { goTo(index); setPlaying(true); }}
            onKeyDown={(event) => onStageKey(event, index)}
          >
            <span className={styles.stageNumber}>{index < step ? <Check size={11} aria-hidden="true" /> : pad(index + 1)}</span>
            <span className={styles.stageLabel}>{item.label}</span>
            <i className={styles.stageBar} aria-hidden="true" {...(step === index ? { "data-progress": "" } : {})} />
          </button>)}
        </div>

        <div className={styles.intro}>
          <div><span className={styles.eyebrow}>{pad(step + 1)} / {stage.label}</span><h4 className={styles.stageTitle}>{stage.title}</h4></div>
          <p>{stage.detail}</p>
        </div>

        <div className={styles.workspace}>
          <div className={styles.scenePanel}>
            <div className={styles.sceneBar}><span><i aria-hidden="true" />{step < 5 ? "Connected purchasing" : step === 7 ? "Receiving & inventory" : "Connected logistics"}</span><span>PR-0241 / 24 UNITS</span></div>
            <div key={`${step}-${mode}-${replay}`} className={styles.scene} style={{ "--stage-duration": `${stage.duration}ms` } as CSSProperties}>
              <ProcurementScene step={step} mode={mode} />
            </div>
            <div className={styles.sceneCaption}><span>{stage.owner}</span><span aria-hidden="true">↗</span></div>
            {step >= 5 && step <= 6
              ? <div className={styles.transport}>
                  <span>Transport mode</span>
                  <div role="group" aria-label="Choose transport mode">
                    {(["road", "sea", "air"] as const).map((option) => { const Icon = TransportIcon[option]; return <button key={option} type="button" aria-pressed={mode === option} onClick={() => selectMode(option)}><Icon size={15} aria-hidden="true" />{TRANSPORT[option].label}</button>; })}
                  </div>
                  <p>{TRANSPORT[mode].milestone}</p>
                </div>
              : <div className={styles.trail}>
                  <span>Linked records</span>
                  <div><span data-done={step >= 0}>PR</span><ChevronRight size={12} aria-hidden="true" /><span data-done={step >= 2}>RFQ</span><ChevronRight size={12} aria-hidden="true" /><span data-done={step >= 4}>PO</span><ChevronRight size={12} aria-hidden="true" /><span data-done={step >= 7}>GRN</span></div>
                </div>}
          </div>
          <DocumentPanel step={step} mode={mode} />
        </div>

        <div className={styles.event}>
          <span className={styles.eventIcon}>{step === 7 ? <PackageCheck size={16} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}</span>
          <span>{stage.event}</span>
          <span className={styles.eventTag}>ERP record updated</span>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

        <div className={styles.controls}>
          <div className={styles.playback}>
            <button type="button" className={styles.play} onClick={togglePlay} disabled={motion.reduced || motion.paused} aria-label={complete ? "Replay procurement walkthrough" : playing ? "Pause procurement walkthrough" : "Play procurement walkthrough"}>
              {running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}<span>{status}</span>
            </button>
            <button type="button" className={styles.restart} onClick={restart} aria-label="Restart procurement walkthrough"><RotateCcw size={15} aria-hidden="true" /></button>
          </div>
          <div className={styles.progress}>
            <div className={styles.track} data-progress="" aria-hidden="true"><span /></div>
            <span>{complete ? "Workflow complete" : `Stage ${step + 1} of ${stages.length}`}</span>
          </div>
          <div className={styles.steps}>
            <button type="button" disabled={step === 0} onClick={() => { goTo(step - 1); setPlaying(true); }} aria-label="Previous procurement stage"><ArrowLeft size={16} className={styles.dirIcon} aria-hidden="true" /></button>
            <button type="button" disabled={step === stages.length - 1} onClick={() => { goTo(step + 1); setPlaying(true); }} aria-label="Next procurement stage"><span>Next</span><ArrowRight size={16} className={styles.dirIcon} aria-hidden="true" /></button>
          </div>
        </div>
        <p className={styles.disclaimer}>A simulated workflow with sample data. No live system is connected.</p>
      </div>
      {fullOpen && <ProcurementExperience onClose={() => setFullOpen(false)} />}
    </section>
  );
}

export default ProcurementWalkthrough;
