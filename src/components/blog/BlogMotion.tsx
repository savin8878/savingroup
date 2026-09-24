"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import home from "@/components/home/IndustrialHome.module.css";
import styles from "./Blog.module.css";

export interface BlogMotionLabels {
  pause?: string;
  paused?: string;
  reduced?: string;
  pauseAria?: string;
  resumeAria?: string;
  reducedAria?: string;
}

export interface BlogMotionProps {
  children: ReactNode;
  /** Accent reading-progress hairline under the site header. Measures `[data-blog-article]` (falls back to the whole page). */
  progress?: boolean;
  /** In-page target for the skip link, e.g. "#article-body". Omit for no skip link. */
  skipTo?: string;
  skipLabel?: string;
  labels?: BlogMotionLabels;
  className?: string;
  id?: string;
}

const DEFAULT_LABELS: Required<BlogMotionLabels> = {
  pause: "Pause motion",
  paused: "Motion paused",
  reduced: "Reduced motion",
  pauseAria: "Pause diagram motion",
  resumeAria: "Resume diagram motion",
  reducedAria: "Motion reduced by your device preference",
};

/**
 * Motion enhances complete server HTML; it never gates access to content.
 *
 * - `data-motion="running|paused"` on the root (user pause, reduced motion, hidden tab).
 * - `[data-blog-scene]` → `data-in-view="true|false"` (pauses off-screen animation)
 *   and a one-time `data-seen` (drives draw-on strokes).
 * - `[data-blog-reveal]` → one-time `data-seen`. Hidden states only apply once the
 *   root carries `data-js`, which is never set under reduced motion.
 * - `[data-blog-toc] a[href^="#"]` → `data-active` + `aria-current` for the section in view.
 * - `[data-blog-progress]` elements receive `--blog-progress` (0–1) while `progress` is on.
 */
export function BlogMotion({ children, progress = false, skipTo, skipLabel = "Skip to content", labels, className = "", id }: BlogMotionProps) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [background, setBackground] = useState(false);
  const text = { ...DEFAULT_LABELS, ...labels };

  // Device preference + tab visibility.
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduced(preference.matches);
    const syncVisibility = () => setBackground(document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  // Scenes (pause off-screen) and one-shot reveals.
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracked = new WeakSet<Element>();

    const inViewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.setAttribute("data-in-view", String(entry.isIntersecting)));
    }, { rootMargin: "100px" });
    const seenObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!entry.target.hasAttribute("data-seen")) entry.target.setAttribute("data-seen", "true");
        seenObserver.unobserve(entry.target);
      });
    // threshold 0 (not a ratio) so very tall elements still trigger.
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });

    const scan = () => {
      const fold = window.innerHeight;
      element.querySelectorAll("[data-blog-scene], [data-blog-reveal]").forEach((node) => {
        if (tracked.has(node)) return;
        tracked.add(node);
        // Anything already on (or above) the screen stays exactly as rendered.
        if (!node.hasAttribute("data-seen") && node.getBoundingClientRect().top < fold) node.setAttribute("data-seen", "static");
        if (node.hasAttribute("data-blog-scene")) inViewObserver.observe(node);
        if (!node.hasAttribute("data-seen")) seenObserver.observe(node);
      });
    };

    scan();
    if (!reduce) element.setAttribute("data-js", "true");

    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => { frame = 0; scan(); });
    });
    mutations.observe(element, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      inViewObserver.disconnect();
      seenObserver.disconnect();
    };
  }, [pathname]);

  // Reading progress + table-of-contents scroll spy.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("[data-blog-toc] a[href^='#']"));
    const targets = links.map((link) => {
      const raw = link.getAttribute("href")?.slice(1) ?? "";
      let decoded = raw;
      try { decoded = decodeURIComponent(raw); } catch { /* keep the raw id */ }
      return document.getElementById(decoded);
    });
    if (!progress && links.length === 0) return;

    let frame = 0;
    let active = -2;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      if (progress) {
        const article = element.querySelector<HTMLElement>("[data-blog-article]");
        let value: number;
        if (article) {
          // 0 when the article top meets the header, 1 when its end reaches the bottom of the viewport.
          const rect = article.getBoundingClientRect();
          const start = 96;
          const distance = rect.height - viewport + start;
          value = distance <= 0 ? (rect.top <= start ? 1 : 0) : (start - rect.top) / distance;
        } else {
          const scrollable = document.documentElement.scrollHeight - viewport;
          value = scrollable > 0 ? window.scrollY / scrollable : 0;
        }
        value = Math.min(1, Math.max(0, value));
        const serialized = value.toFixed(4);
        bar.current?.style.setProperty("--blog-progress", serialized);
        element.querySelectorAll<HTMLElement>("[data-blog-progress]").forEach((node) => node.style.setProperty("--blog-progress", serialized));
      }
      if (links.length) {
        let current = -1;
        targets.forEach((target, index) => {
          if (target && target.getBoundingClientRect().top <= viewport * 0.32) current = index;
        });
        if (current === -1 && targets[0]) current = 0;
        if (current !== active) {
          active = current;
          links.forEach((link, index) => {
            if (index === current) { link.setAttribute("data-active", "true"); link.setAttribute("aria-current", "location"); }
            else { link.removeAttribute("data-active"); link.removeAttribute("aria-current"); }
          });
        }
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [progress, pathname]);

  const stopped = paused || reduced;

  return (
    <div ref={root} id={id} className={`${home.root} ${styles.root} ${className}`} data-motion={paused || reduced || background ? "paused" : "running"} data-blog-root="">
      {skipTo && <a href={skipTo} className={styles.skipLink}>{skipLabel}</a>}
      {progress && <div className={styles.progressBar} aria-hidden="true"><span ref={bar} /></div>}
      {children}
      <button
        type="button"
        className={`${home.motionControl} ${styles.motionControl}`}
        onClick={() => setPaused((value) => !value)}
        aria-pressed={stopped}
        aria-label={reduced ? text.reducedAria : paused ? text.resumeAria : text.pauseAria}
        disabled={reduced}
      >
        {stopped ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        <span>{reduced ? text.reduced : paused ? text.paused : text.pause}</span>
      </button>
    </div>
  );
}
