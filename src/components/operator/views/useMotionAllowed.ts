// components/operator/views/useMotionAllowed.ts
//
// Whether an Operator view may move on its own (autoplay, draw-in). Same
// three signals as the site's other motion hooks (useMotionPreference in
// industries/WorkflowSimulator.tsx): the device's reduced-motion setting, a
// hidden tab, and the page's "Pause motion" control, which sets
// data-motion="paused" on the page's motion root (HomeMotion, AboutMotion,
// BlogMotion, …).
//
// The Operator panel is NOT inside that root: the layout renders it after
// <Footer>, a sibling of <main>, so `closest("[data-motion]")` finds nothing
// there. The hook falls back to the first motion root inside <main>, and
// because the panel outlives the page (soft navigation swaps the page root
// while the panel stays mounted), it re-resolves that root on every route
// change. A view that does sit inside a motion root still uses its own.
//
// Starts false and only turns true after mount, so the server HTML and the
// first client render agree and nothing starts moving before hydration.

import { useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

export function useMotionAllowed(ref: RefObject<HTMLElement | null>): boolean {
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const holder = ref.current?.closest("[data-motion]") ?? document.querySelector("main [data-motion]");
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
  }, [ref, pathname]);

  return allowed;
}
