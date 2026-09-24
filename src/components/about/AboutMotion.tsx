"use client";

import { useEffect, useRef, type ReactNode } from "react";
import home from "../home/IndustrialHome.module.css";
import styles from "./About.module.css";

/** Animate only diagram strokes; reading content stays visible without JavaScript. */
export function AboutMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-seen", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .25 });
    root.current.querySelectorAll("[data-about-diagram]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={`${home.root} ${styles.root}`} data-about-page>{children}</div>;
}
