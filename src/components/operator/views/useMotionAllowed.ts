// components/operator/views/useMotionAllowed.ts
//
// Whether an Operator view may move on its own (autoplay, draw-in). Same
// three signals as the site's other motion hooks (useMotionPreference in
// industries/WorkflowSimulator.tsx): the device's reduced-motion setting, a
// hidden tab, and the page's "Pause motion" control, which sets
// data-motion="paused" on the nearest [data-motion] ancestor.
//
// Starts false and only turns true after mount, so the server HTML and the
// first client render agree and nothing starts moving before hydration.

import { useEffect, useState, type RefObject } from "react";

export function useMotionAllowed(ref: RefObject<HTMLElement | null>): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const holder = ref.current?.closest("[data-motion]") ?? null;
    const sync = () => {
      setAllowed(!preference.matches && !document.hidden && holder?.getAttribute("data-motion") !== "paused");
    };
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const observer = new MutationObserver(sync);
    if (holder) observer.observe(holder, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);

  return allowed;
}
