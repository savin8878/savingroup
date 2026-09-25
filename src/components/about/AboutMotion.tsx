"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import home from "../home/IndustrialHome.module.css";
import styles from "./About.module.css";

/** Motion enhances complete server HTML; reading content never depends on it.
 *  Drawings ([data-about-diagram]) sketch themselves in once, the first time they are seen (data-seen); their live details run
 *  only near the viewport (data-in-view) and stop under the Pause-motion control, reduced motion or a hidden tab (data-motion).
 *  Scroll-linked drawings ([data-about-scrub]) receive --scroll-progress, 0 to 1 over their scroll travel, never going backwards;
 *  when the page cannot scroll far enough to finish them they fall back to the timed sequence (data-scrub="time"). */
export function AboutMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [background, setBackground] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduced(preference.matches);
    const syncVisibility = () => setBackground(document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    const cleanups: Array<() => void> = [
      () => preference.removeEventListener("change", syncPreference),
      () => document.removeEventListener("visibilitychange", syncVisibility),
    ];

    const diagrams = Array.from(node.querySelectorAll<SVGElement>("[data-about-diagram]"));
    if (!window.IntersectionObserver) {
      diagrams.forEach((diagram) => diagram.setAttribute("data-seen", "true"));
    } else {
      const seen = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-seen", "true");
            seen.unobserve(entry.target);
          }
        });
      }, { threshold: .25 });
      const view = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { (entry.target as SVGElement).dataset.inView = String(entry.isIntersecting); });
      }, { rootMargin: "100px" });
      diagrams.forEach((diagram) => { seen.observe(diagram); view.observe(diagram); });
      cleanups.push(() => { seen.disconnect(); view.disconnect(); });
    }

    const scrubs = diagrams.filter((diagram) => diagram.hasAttribute("data-about-scrub"));
    if (scrubs.length) {
      const progress = new Map<SVGElement, number>();
      let frame = 0;
      const update = () => {
        frame = 0;
        const vh = window.innerHeight;
        const travel = vh * .6;
        const slack = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
        scrubs.forEach((figure) => {
          const top = figure.getBoundingClientRect().top;
          const mode = (vh - (top - slack)) / travel >= 1 ? "scroll" : "time";
          if (figure.dataset.scrub !== mode) figure.dataset.scrub = mode;
          if (mode !== "scroll") return;
          const value = Math.min(1, Math.max(progress.get(figure) ?? 0, (vh - top) / travel));
          if (value === progress.get(figure)) return;
          progress.set(figure, value);
          figure.style.setProperty("--scroll-progress", value.toFixed(3));
          if (value >= 1) figure.dataset.scrubDone = "true";
        });
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div ref={root} className={`${home.root} ${styles.root}`} data-about-page data-motion={paused || reduced || background ? "paused" : "running"}>
      {children}
      <button
        type="button"
        className={home.motionControl}
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
