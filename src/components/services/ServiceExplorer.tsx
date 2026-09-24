"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { CapabilityDiagram, capabilityIcons } from "./ServiceDiagrams";
import type { ServicesCopy } from "./services-copy";
import styles from "./Services.module.css";

export function ServiceExplorer({ copy: c }: { copy: Pick<ServicesCopy,"capabilities"|"selectHint"|"detailLabels"|"diagramLabel"> }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const rtl = document.documentElement.dir === "rtl";
    let next = index;
    if(event.key === "ArrowRight") next = (index + (rtl ? 7 : 1)) % 8;
    else if(event.key === "ArrowLeft") next = (index + (rtl ? 1 : 7)) % 8;
    else if(event.key === "Home") next = 0;
    else if(event.key === "End") next = 7;
    else return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  }
  const service = c.capabilities[selected];
  return <div className={styles.explorer}>
    <div className={styles.explorerTabs} role="tablist" aria-label={c.selectHint}>{c.capabilities.map((item,index)=>{const Icon=capabilityIcons[item.id];return <button key={item.id} ref={node=>{tabs.current[index]=node;}} role="tab" type="button" id={`capability-tab-${item.id}`} aria-controls={`capability-panel-${item.id}`} aria-selected={index===selected} tabIndex={index===selected?0:-1} onClick={()=>setSelected(index)} onKeyDown={event=>navigate(event,index)}><Icon size={20} strokeWidth={1.3} aria-hidden="true"/><span>{item.name}</span><ArrowUpRight size={14} aria-hidden="true"/></button>;})}</div>
    {c.capabilities.map((item,index)=><div key={item.id} id={`capability-panel-${item.id}`} role="tabpanel" aria-labelledby={`capability-tab-${item.id}`} tabIndex={0} hidden={index!==selected} className={styles.explorerPanel}>
      <dl className={styles.capabilityDetails}>{[item.problem,item.build,item.how,item.outcome].map((text,i)=><div key={c.detailLabels[i]}><dt><span>0{i+1}</span>{c.detailLabels[i]}</dt><dd>{text}</dd></div>)}</dl>
      {index===selected&&<CapabilityDiagram id={service.id} flow={service.flow} label={c.diagramLabel}/>}
    </div>)}
    <noscript><div className={styles.staticCapabilities}>{c.capabilities.slice(1).map(item=><article key={item.id}><h3>{item.name}</h3><p>{item.problem}</p><p>{item.build}</p><p>{item.how}</p><p>{item.outcome}</p></article>)}</div></noscript>
  </div>;
}
