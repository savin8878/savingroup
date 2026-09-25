"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The compare header is `position: sticky` in CSS and needs no JS to pin or
 * release: it sticks under the site header while its parent (the comparison
 * block) is in view and lets go at the parent's end. This wrapper only adds
 * `data-stuck` so the pinned state can carry a hairline shadow. Server HTML
 * ships `data-stuck="false"`, so hydration is exact.
 */
export function CompareHeader({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const bounds = parent.getBoundingClientRect();
      // Hidden on phones (display: none → zero height) and static under print.
      const sticky = style.position === "sticky" && rect.height > 0;
      const top = parseFloat(style.top) || 0;
      const stuck = sticky && rect.top <= top + 0.5 && bounds.bottom > rect.top + rect.height + 1;
      const value = String(stuck);
      if (element.dataset.stuck !== value) element.dataset.stuck = value;
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
  }, []);

  return <div ref={ref} className={className} data-stuck="false">{children}</div>;
}
