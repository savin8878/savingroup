"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, FileText, PackageCheck, Pause, Plane, Play, RotateCcw, Ship, Truck, X } from "lucide-react";
import { PROCUREMENT_STAGES as stages, TRANSPORT, type TransportMode } from "./procurement-data";
import { ProcurementScene } from "./ProcurementScene";
import styles from "./Procurement.module.css";

function PurchaseDocument({ step, mode }: { step: number; mode: TransportMode }) {
  const stage = stages[step];
  const transport = TRANSPORT[mode];
  return <aside className={styles.documentPanel} aria-label={stage.document}>
    <div className={styles.paperHeader}><FileText size={17} strokeWidth={1.3} aria-hidden="true" /><span>{stage.document}</span><span>{stage.code}</span></div>
    <div className={styles.paperStatus}><i /><span>{stage.status}</span></div>
    {step === 3 ? <>
      <div className={styles.quoteHeader}><span>Supplier</span><span>Unit rate</span><span>Lead time</span></div>
      {[["A", "₹6,500", "6 days"], ["B", "₹6,750", "9 days"], ["C", "₹6,900", "4 days"]].map(([name, cost, lead], i) => <div key={name} className={styles.quoteRow} data-chosen={i===0}><span>Supplier {name}{i===0&&<Check size={13} aria-label="Selected" />}</span><strong>{cost}</strong><span>{lead}</span></div>)}
      <p className={styles.quoteNote}>All three meet the specification. Supplier A offers the lowest rate within the required delivery window.</p>
    </> : <dl className={styles.documentFields}>
      <div><dt>{step >= 5 ? "Linked order" : "Item"}</dt><dd>{step >= 5 ? "PO-0089" : "Drive assembly"}</dd></div>
      <div><dt>{step >= 5 ? "Transport" : "SKU"}</dt><dd>{step >= 5 ? transport.vehicle : "DRV-240"}</dd></div>
      <div><dt>Quantity</dt><dd>24 units</dd></div>
      {step === 0 && <><div><dt>Available stock</dt><dd>6 units</dd></div><div><dt>Production need</dt><dd>30 units</dd></div></>}
      {step === 1 && <><div><dt>Budget</dt><dd>Within allocation</dd></div><div><dt>Approved by</dt><dd>Department lead</dd></div></>}
      {step === 2 && <><div><dt>Suppliers invited</dt><dd>3 qualified suppliers</dd></div><div><dt>Required delivery</dt><dd>Within 7 days</dd></div></>}
      {step === 4 && <><div><dt>Supplier</dt><dd>Supplier A</dd></div><div><dt>Unit rate</dt><dd>₹6,500</dd></div></>}
      {(step===5||step===6) && <><div><dt>Load allocation</dt><dd>{transport.load}</dd></div><div><dt>Booking reference</dt><dd>{transport.booking}</dd></div></>}
      {step===7 && <><div><dt>Received / accepted</dt><dd>24 / 24 units</dd></div><div><dt>Inventory balance</dt><dd>30 units</dd></div></>}
    </dl>}
    {step===4 ? <div className={styles.orderTotal}><span>Order subtotal · excluding tax</span><strong>₹1,56,000</strong><span>24 units × ₹6,500</span></div> : step>=5&&step<7 ? <div className={styles.documentRoute}><span>Planned route</span><strong>{transport.route}</strong><span>{transport.document}</span></div> : <div className={styles.documentLink}><span>Connected record</span><strong>{step===7?"PR-0241 → PO-0089 → GRN-0058":"Production requirement / MRP-0032"}</strong></div>}
    <div className={styles.documentFooter}><CheckCheck size={15} aria-hidden="true" /><span>{step===7?"Receipt linked. Inventory reconciled.":"One record trail. Every handoff connected."}</span></div>
  </aside>;
}

export default function ProcurementExperience({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollBody = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const titleId = useId();
  const descriptionId = useId();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<TransportMode>("road");
  const [playing, setPlaying] = useState(true);
  const [replay, setReplay] = useState(0);
  const [motion, setMotion] = useState({ reduced: false, paused: false });
  const [complete, setComplete] = useState(false);
  const running = playing && !motion.reduced && !motion.paused && !complete;
  const stage = stages[step];

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
      const portion = Math.min(1, elapsed.current / stage.duration);
      progress.current?.style.setProperty("--progress", String(portion));
      if (portion === 1) {
        elapsed.current = 0;
        if (step === stages.length - 1) { setComplete(true); setPlaying(false); }
        else { progress.current?.style.setProperty("--progress", "0"); setStep(step + 1); }
      } else frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step, stage.duration, mode, replay]);

  const goTo = useCallback((next: number) => {
    elapsed.current = 0;
    progress.current?.style.setProperty("--progress", "0");
    scrollBody.current?.scrollTo({ top: 0, behavior: "instant" });
    setStep(next);
    setComplete(false);
    setReplay((value) => value + 1);
  }, []);

  function selectMode(next: TransportMode) {
    setMode(next);
    elapsed.current = 0;
    progress.current?.style.setProperty("--progress", "0");
    setReplay((value) => value + 1);
  }
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

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={keepFocusInside} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.shell} data-running={running} data-reduced={motion.reduced}>
      <header className={styles.header}><div><span className={styles.eyebrow}>ERP / Procurement in motion</span><h2 id={titleId}>From a request to the receiving gate.</h2><p id={descriptionId}>Follow one purchase through a connected ERP. Interactive example · sample data.</p></div><button type="button" onClick={onClose} className={styles.close} aria-label="Close procurement walkthrough" autoFocus><X size={21} aria-hidden="true" /></button></header>
      <div className={styles.timeline} aria-label="Procurement stages">{stages.map((item, index) => <button type="button" key={item.label} className={styles.stageButton} aria-current={step===index?"step":undefined} aria-label={`Stage ${index+1}: ${item.label}`} onClick={() => { goTo(index); setPlaying(true); }}><span>{index<step?<Check size={12} aria-hidden="true"/>:`0${index+1}`}</span><strong>{item.label}</strong><i aria-hidden="true" /></button>)}</div>
      <div className={styles.scrollBody} ref={scrollBody}>
        <div className={styles.stageIntro}><div><span className={styles.eyebrow}>0{step+1} / {stage.label}</span><h3>{stage.title}</h3></div><p>{stage.detail}</p></div>
        <div className={styles.workspace}>
          <div className={styles.scenePanel}>
            <div className={styles.sceneBar}><span><i />{step<5?"Connected purchasing":step===7?"Receiving & inventory":"Connected logistics"}</span><span>PR-0241 / 24 UNITS</span></div>
            <div key={`${step}-${mode}-${replay}`} className={styles.scene} style={{"--stage-duration":`${stage.duration}ms`} as CSSProperties}><ProcurementScene step={step} mode={mode}/></div>
            <div className={styles.sceneCaption}><span>{stage.owner}</span><span className={styles.sceneCaptionArrow} aria-hidden="true">↗</span></div>
            {step>=5&&step<=6 ? <div className={styles.transportBar}><span>Transport mode</span><div role="group" aria-label="Choose transport mode">{(["road","sea","air"] as const).map((option) => { const Icon = option==="road"?Truck:option==="sea"?Ship:Plane; return <button key={option} type="button" aria-pressed={mode===option} onClick={() => selectMode(option)}><Icon size={16} aria-hidden="true" />{TRANSPORT[option].label}</button>; })}</div><p>{TRANSPORT[mode].milestone}</p></div> : <div className={styles.recordTrail}><span>Linked records</span><div><span data-done={step>=0}>PR</span><ChevronRight size={12} aria-hidden="true"/><span data-done={step>=2}>RFQ</span><ChevronRight size={12} aria-hidden="true"/><span data-done={step>=4}>PO</span><ChevronRight size={12} aria-hidden="true"/><span data-done={step>=7}>GRN</span></div></div>}
          </div>
          <PurchaseDocument step={step} mode={mode}/>
        </div>
        <div className={styles.eventLog} role="status" aria-live="polite" aria-atomic="true"><span className={styles.eventIcon}>{step===7?<PackageCheck size={17} aria-hidden="true"/>:<Check size={15} aria-hidden="true"/>}</span><span>{stage.event}</span><span className={styles.eventTag}>ERP RECORD UPDATED</span></div>
      </div>
      <footer className={styles.controls}>
        <div className={styles.playback}><button type="button" className={styles.playButton} onClick={() => { if (complete) restart(); else setPlaying(value=>!value); }} disabled={motion.reduced || motion.paused} aria-label={complete?"Replay procurement walkthrough":playing?"Pause procurement walkthrough":"Play procurement walkthrough"}>{running?<Pause size={16} aria-hidden="true"/>:<Play size={16} aria-hidden="true"/>}<span>{motion.reduced?"Reduced motion":motion.paused?"Motion paused":complete?"Replay":running?"Pause":"Play"}</span></button><button type="button" className={styles.restart} onClick={restart} aria-label="Restart procurement walkthrough"><RotateCcw size={16} aria-hidden="true"/></button></div>
        <div className={styles.progressWrap}><div className={styles.progressTrack} ref={progress} role="img" aria-label={`Stage ${step+1} of ${stages.length}`}><span /></div><span>{complete?"Workflow complete":`Stage ${step+1} of ${stages.length}`}</span></div>
        <div className={styles.stepControls}><button type="button" disabled={step===0} onClick={() => { goTo(step-1); setPlaying(true); }} aria-label="Previous procurement stage"><ArrowLeft size={17} aria-hidden="true"/></button><button type="button" disabled={step===stages.length-1} onClick={() => { goTo(step+1); setPlaying(true); }} aria-label="Next procurement stage"><span>Next</span><ArrowRight size={17} aria-hidden="true"/></button></div>
      </footer>
    </div>
  </dialog>;
}
