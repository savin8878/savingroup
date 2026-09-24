"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowDownRight, Check, Search, Network, Workflow, BrainCircuit, ChartNoAxesCombined } from "lucide-react";
import type { AboutCopy } from "./about-copy";
import styles from "./About.module.css";

const icons = [Search, Network, Workflow, BrainCircuit, ChartNoAxesCombined];

export function ProcessExplorer({ steps, hint, output }: Pick<AboutCopy, "steps" | "output"> & { hint: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = document.documentElement.dir === "rtl";
    let next = index;
    if (event.key === "ArrowRight") next = (index + (rtl ? 4 : 1)) % 5;
    else if (event.key === "ArrowLeft") next = (index + (rtl ? 1 : 4)) % 5;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 4;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return <div className={styles.process}>
    <div className={styles.processHint}><span>{hint}</span><span aria-hidden="true">01 — 05</span></div>
    <div className={styles.processTabs} role="tablist" aria-label={hint}>
      {steps.map((step, i) => <button key={step.title} ref={(node) => { tabs.current[i] = node; }} type="button" role="tab" id={`process-tab-${i}`} aria-controls={`process-panel-${i}`} aria-selected={active === i} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(event) => navigate(event, i)}>
        <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span><span>{step.title}</span><ArrowDownRight size={16} aria-hidden="true" />
      </button>)}
    </div>
    {steps.map((step, i) => {
      const Icon = icons[i];
      return <div key={step.title} id={`process-panel-${i}`} className={styles.processPanel} role="tabpanel" aria-labelledby={`process-tab-${i}`} hidden={active !== i} tabIndex={0}>
        <div className={styles.processDrawing} aria-hidden="true">
          <div className={styles.processOrbit}><span /><span /><span /><span /><Icon size={55} strokeWidth={1} /></div>
          <div className={styles.processProgress}>{steps.map((_, dot) => <i key={dot} data-complete={dot <= i} />)}</div>
          <span className={styles.processCount}>0{i + 1} / 05</span>
        </div>
        <div className={styles.processBody}><h3>{step.short}</h3><p>{step.body}</p><div className={styles.processOutput}><span><Check size={14} aria-hidden="true" />{output}</span><p>{step.output}</p></div></div>
      </div>;
    })}
    <noscript><ol className={styles.noScriptSteps}>{steps.slice(1).map((step) => <li key={step.title}><h3>{step.title}: {step.short}</h3><p>{step.body}</p><p>{step.output}</p></li>)}</ol></noscript>
  </div>;
}
