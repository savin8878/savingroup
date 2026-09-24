"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Messages } from "@/lib/i18n";
import home from "../home/IndustrialHome.module.css";
import styles from "./Services.module.css";

export function ServiceCatalog({ items, base, labels }: { items: Messages["services"]["items"]; base: string; labels: { deliverables: string; investment: string; discuss: string } }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const openTarget = () => {
      const id = window.location.hash.slice(1);
      const target = Array.from(root.current?.querySelectorAll("details") ?? []).find(item=>item.id===id);
      if(target){target.open=true;target.scrollIntoView({block:"start",behavior:"instant"});}
    };
    openTarget();window.addEventListener("hashchange",openTarget);
    return()=>window.removeEventListener("hashchange",openTarget);
  },[]);
  return <div className={styles.catalog} ref={root}>{items.map(item=><details key={item.id} id={item.id}>
    <summary><span className={styles.catalogNumber}>{item.number}</span><h3>{item.name}</h3><span className={styles.catalogKicker}>{item.kicker}</span><Plus size={18} strokeWidth={1.4} aria-hidden="true"/></summary>
    <div className={styles.catalogBody}><div><p>{item.summary}</p><div className={styles.investment}><span>{labels.investment}</span><strong>{item.investment}</strong></div><Link className={home.textButton} href={`${base}/contact`}>{labels.discuss}<ArrowUpRight size={15} aria-hidden="true"/></Link></div><div><span className={styles.mono}>{labels.deliverables}</span><ul>{item.deliverables.map(text=><li key={text}>{text}</li>)}</ul></div></div>
  </details>)}</div>;
}
