"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, Boxes, Cable, Check, FileText, Plane, Ship, Truck } from "lucide-react";
import type { CityCopy } from "./city-copy";
import { ProcurementTrigger } from "./CityMotion";
import home from "../home/IndustrialHome.module.css";
import styles from "./Cities.module.css";

export function CitySystems({ copy: c, cityName }: { copy: CityCopy; cityName: string }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next = index;
    if (event.key === "ArrowRight") next = (index + (rtl ? 2 : 1)) % 3;
    else if (event.key === "ArrowLeft") next = (index + (rtl ? 1 : 2)) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  }
  return <div className={styles.systemExperience}>
    <div className={styles.systemTabs} role="tablist" aria-label={c.systemLabel}>{c.tabs.map((label, i) => <button key={label} type="button" ref={node => { tabs.current[i] = node; }} role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => navigate(event, i)}><span>0{i+1}</span>{label}<ArrowUpRight size={15} aria-hidden="true"/></button>)}</div>
    {c.workflows.map((workflow, i) => <div key={i} id={`${id}-panel-${i}`} role="tabpanel" tabIndex={0} aria-labelledby={`${id}-tab-${i}`} hidden={selected !== i} className={styles.systemPanel}>
      <div className={styles.systemOverview}><span className={styles.mono}>{c.demo} / {cityName}</span><h3>{workflow.title}</h3><p>{workflow.body}</p>{i === 0 ? <><ProcurementTrigger className={home.primaryButton} label={c.erp}>{c.procurement}<ArrowUpRight size={17} aria-hidden="true"/></ProcurementTrigger><span className={styles.languageNote}>{c.sampleLanguage}</span></> : <Cable size={34} strokeWidth={1} aria-hidden="true"/>}</div>
      <div className={styles.workflowVisual}>
        <div className={styles.systemNetwork}>
          <svg className={styles.systemWires} viewBox="0 0 600 280" preserveAspectRatio="none" fill="none" aria-hidden="true"><g stroke="var(--home-line)"><path d="M140 48H218V140H382V48H460M140 140H460M140 232H218V140H382V232H460"/></g><g className={styles.signalFlow} stroke="var(--home-accent)" strokeDasharray="5 68"><path d="M140 48H218V140H382V48H460M140 140H460M140 232H218V140H382V232H460"/></g></svg>
          <ul className={styles.inputNodes}>{workflow.inputs.map(label => <li key={label}><FileText size={16} strokeWidth={1.2} aria-hidden="true"/><span>{label}</span></li>)}</ul>
          <ProcurementTrigger className={styles.systemErp} label={c.erp}><Boxes size={29} strokeWidth={1} aria-hidden="true"/><strong>ERP</strong><span><ArrowUpRight size={16} aria-hidden="true"/></span></ProcurementTrigger>
          <ul className={styles.outputNodes}>{workflow.outputs.map(label => <li key={label}><Check size={15} strokeWidth={1.4} aria-hidden="true"/><span>{label}</span></li>)}</ul>
        </div>
        <ol className={styles.workflowSteps}>{workflow.flow.map((step, index) => <li key={step}><span>0{index+1}</span>{step}{index < 3 && <ArrowRight size={13} aria-hidden="true"/>}</li>)}</ol>
      </div>
      <div className={styles.workflowFoot}>{i === 0 && <div className={styles.transportPreview} aria-hidden="true"><FileText size={16}/><span/><Truck size={26} strokeWidth={1.15}/><Ship size={26} strokeWidth={1.15}/><Plane size={25} strokeWidth={1.15}/></div>}<p>{workflow.note}</p></div>
    </div>)}
    <noscript><div className={styles.noScript}>{c.workflows.slice(1).map(workflow => <div key={workflow.title}><h3>{workflow.title}</h3><p>{workflow.body}</p></div>)}</div></noscript>
  </div>;
}
