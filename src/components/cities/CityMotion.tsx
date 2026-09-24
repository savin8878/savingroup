"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import home from "../home/IndustrialHome.module.css";
import styles from "./Cities.module.css";

const ProcurementExperience = dynamic(() => import("../home/ProcurementExperience"), { ssr: false, loading: () => <div role="status" className={styles.loading}>Loading procurement…</div> });
const ProcurementContext = createContext<() => void>(() => {});

export function ProcurementTrigger({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const open = useContext(ProcurementContext);
  return <button type="button" className={className} onClick={open} aria-haspopup="dialog" aria-label={label}>{children}</button>;
}

export function CityMotion({ children, labels }: { children: ReactNode; labels: { pause: string; resume: string; reduced: string } }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [background, setBackground] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(preference.matches);
    const visibility = () => setBackground(document.hidden);
    sync(); visibility();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => target.setAttribute("data-in-view", String(isIntersecting))), { rootMargin: "80px" });
    root.current?.querySelectorAll("[data-city-scene]").forEach(node => observer.observe(node));
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <ProcurementContext.Provider value={() => setOpen(true)}><div ref={root} className={`${home.root} ${styles.root}`} data-city-page data-dialog-open={open} data-motion={paused || reduced || background ? "paused" : "running"}>
    {children}
    <button type="button" className={home.motionControl} onClick={() => setPaused(value => !value)} aria-pressed={paused || reduced} disabled={reduced}>{paused || reduced ? <Play size={12} aria-hidden="true"/> : <Pause size={12} aria-hidden="true"/>}<span>{reduced ? labels.reduced : paused ? labels.resume : labels.pause}</span></button>
    {/* Keep the shared walkthrough's own playback controls independent of background scenes. */}
    <div data-motion={paused || reduced || background ? "paused" : "running"} lang="en" dir="ltr">{open && <ProcurementExperience onClose={() => setOpen(false)}/>}</div>
  </div></ProcurementContext.Provider>;
}
