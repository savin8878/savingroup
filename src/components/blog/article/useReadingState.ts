"use client";

import { useEffect, useState } from "react";

export interface ReadingState {
  /** Index of the section currently being read (-1 before the first). */
  active: number;
  /** 0–1 through the article body. */
  progress: number;
}

/**
 * Scroll spy + reading progress for the article body. One rAF-throttled
 * scroll listener; state only updates when a rounded value changes, so
 * scrolling doesn't re-render on every frame.
 */
export function useReadingState(ids: string[], bodySelector = "[data-article-body]"): ReadingState {
  const [state, setState] = useState<ReadingState>({ active: -1, progress: 0 });
  const key = ids.join("|");

  useEffect(() => {
    const targets = key ? key.split("|").map((id) => document.getElementById(id)) : [];
    const body = document.querySelector<HTMLElement>(bodySelector);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const viewport = window.innerHeight;
      // A heading counts as "being read" once it passes ~30% of the viewport.
      const line = Math.max(140, viewport * 0.3);
      let active = -1;
      targets.forEach((target, index) => {
        if (target && target.getBoundingClientRect().top <= line) active = index;
      });

      let progress = 0;
      if (body) {
        const rect = body.getBoundingClientRect();
        const start = 96;
        const distance = rect.height - viewport + start;
        progress = distance <= 0 ? (rect.top <= start ? 1 : 0) : (start - rect.top) / distance;
        progress = Math.min(1, Math.max(0, progress));
      }
      const rounded = Math.round(progress * 1000) / 1000;
      setState((prev) => (prev.active === active && prev.progress === rounded ? prev : { active, progress: rounded }));
    };

    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key, bodySelector]);

  return state;
}

/** Scroll a section into view (respects reduced motion) and update the hash without a jump. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  // Move focus for keyboard/screen-reader users without scrolling again.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
