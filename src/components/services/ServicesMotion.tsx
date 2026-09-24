"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import home from "../home/IndustrialHome.module.css";
import styles from "./Services.module.css";

export function ServicesMotion({ children, labels }: { children: ReactNode; labels: { pause: string; resume: string; reduced: string } }) {
  const root = useRef<HTMLDivElement>(null);
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
    const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => target.setAttribute("data-in-view", String(isIntersecting))), { rootMargin: "60px" });
    root.current?.querySelectorAll("[data-services-scene]").forEach((node) => observer.observe(node));
    return () => { observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className={`${home.root} ${styles.root}`} ref={root} data-services-page data-motion={paused || reduced || background ? "paused" : "running"}>
    {children}
    <button type="button" className={home.motionControl} onClick={() => setPaused(value => !value)} disabled={reduced} aria-pressed={paused || reduced}>{paused || reduced ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}<span>{reduced ? labels.reduced : paused ? labels.resume : labels.pause}</span></button>
  </div>;
}
