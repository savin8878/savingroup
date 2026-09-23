"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./IndustrialHome.module.css";

/** Motion enhances complete server HTML; it never gates access to content. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [background, setBackground] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduced(preference.matches);
    const syncVisibility = () => setBackground(document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
      });
    }, { rootMargin: "100px" });
    root.current?.querySelectorAll("[data-home-scene]").forEach((scene) => observer.observe(scene));
    return () => {
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={root} className={styles.root} data-motion={paused || reduced || background ? "paused" : "running"}>
      <a href="#operations-story" className={styles.skipLink}>Skip to the operations story</a>
      {children}
      <button
        type="button"
        className={styles.motionControl}
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused || reduced}
        aria-label={reduced ? "Motion reduced by your device preference" : paused ? "Resume diagram motion" : "Pause diagram motion"}
        disabled={reduced}
      >
        {paused || reduced ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        <span>{reduced ? "Reduced motion" : paused ? "Motion paused" : "Pause motion"}</span>
      </button>
    </div>
  );
}
