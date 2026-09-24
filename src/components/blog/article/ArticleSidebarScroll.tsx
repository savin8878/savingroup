"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The scrollable body of the sticky sidebar (contents, share, CTA) under the
 * pinned progress head. Marks whether there is more content above/below so
 * CSS can fade the edges; page scrolling chains through at either end.
 */
export function ArticleSidebarScroll({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = element.scrollHeight - element.clientHeight;
      element.dataset.more = max > 1 ? "true" : "false";
      element.dataset.atTop = String(element.scrollTop <= 1);
      element.dataset.atEnd = String(element.scrollTop >= max - 1);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    element.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    Array.from(element.children).forEach((child) => resize.observe(child));
    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("scroll", schedule);
      resize.disconnect();
    };
  }, []);

  return <div ref={ref} className={className} data-sidebar-scroll="">{children}</div>;
}
