"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Splits a display stat into the piece we can animate and the pieces we
 * must leave alone. Unparseable values render verbatim.
 */
function splitStat(value: string) {
  const m = /^(\D*?)([\d.,]+)(.*)$/.exec(value);
  if (!m) return null;
  const [, prefix, digits, suffix] = m;
  const numeric = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  return { prefix, suffix, numeric, decimals };
}

/**
 * Count-up numeral.
 *
 * Split out of `Hero` so the hero itself can be a server component: this is
 * the only part of it that needed state, and it was dragging framer-motion,
 * the whole hero tree and its client-side hydration cost into the LCP path.
 *
 * It renders the FINAL value on the server and on the first client render, so
 * the number is correct in the HTML, correct for a crawler, and correct if JS
 * never runs. The animation only ever replaces a correct value with another
 * correct value.
 */
export function CountUpStat({ value, delay = 0 }: { value: string; delay?: number }) {
  const parts = splitStat(value);
  // Starts at the true value, not at zero — see above.
  const [shown, setShown] = useState<number | null>(parts ? parts.numeric : null);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const duration = 1400;
    let start: number | null = null;
    const startAt = performance.now() + delay * 1000;
    setShown(0);

    const step = (now: number) => {
      if (now < startAt) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo — quick off the mark, lands exactly on the target
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setShown(parts.numeric * eased);
      if (p < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
    // `parts` is derived from `value`; keying on value/delay is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  if (!parts || shown === null) return <>{value}</>;

  return (
    <>
      {parts.prefix}
      {shown.toFixed(parts.decimals)}
      {parts.suffix}
    </>
  );
}
