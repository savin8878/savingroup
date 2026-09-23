"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance that CANNOT hide content permanently.
 *
 * WHAT WENT WRONG BEFORE. Sections were wrapped in
 * `<motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{amount:0.5}}>`.
 * `amount: 0.5` asks for half the element to be inside the viewport at once —
 * which for a section taller than the viewport is never true, so the element
 * sat at the serialised `opacity: 0` forever and the section rendered blank.
 * The same markup also went out in the SSR HTML, so a crawler or a visitor
 * whose JS had not run yet saw an empty page.
 *
 * THE INVERSION. Here the un-JavaScripted state is the VISIBLE state:
 *
 *   - Server output carries no opacity at all.
 *   - On mount we set `data-revealed="false"`, which is the only thing that
 *     hides it — and the same effect owns the observer that clears it.
 *   - The observer uses a pixel `rootMargin`, never a percentage of the
 *     element, so element height is irrelevant.
 *   - It self-destructs after firing once, and it never un-reveals.
 *   - `prefers-reduced-motion` skips the hidden state entirely.
 *
 * If any of that fails, the failure mode is "the animation didn't play",
 * not "the content is gone".
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  /** Distance above the viewport bottom at which the element starts animating. */
  rootMargin = "0px 0px -12% 0px",
  /** Stagger offset in seconds, for a row of sibling cards. */
  delay = 0,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  rootMargin?: string;
  delay?: number;
  /** Anything else (id, aria-*, data-*) is forwarded to the rendered element. */
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // stay "idle" → no data-revealed attribute → fully visible
    }

    // Already on screen at mount (hero-adjacent content, a deep link, a
    // restored scroll position): reveal without ever hiding it, so we never
    // flash content out and back in.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    setState("hidden");

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);

    // Belt and braces: if the observer somehow never fires (an ancestor with
    // `content-visibility`, a browser quirk, a tab restored in the background),
    // show the content anyway rather than leaving a blank band on the page.
    const failsafe = window.setTimeout(() => {
      setState("shown");
      io.disconnect();
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [rootMargin]);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      data-revealed={state === "idle" ? undefined : state === "shown"}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
