import type { ReactNode } from "react";

/* Tier glyphs (rocket / bolt / chart / crown): static line art in currentColor,
   shared by the server sections and the client plan picker. */
const GLYPHS: Record<string, ReactNode> = {
  rocket: <><path d="M24 5c6 4 9 10 9 18 0 4-1 7-2 9H17c-1-2-2-5-2-9 0-8 3-14 9-18Z" /><circle cx="24" cy="19" r="3.4" /><path d="M17 32c-3 1-5 3-5 8 3-1 5-1 6-2M31 32c3 1 5 3 5 8-3-1-5-1-6-2" /><path d="M21 41c1 2 2 3 3 4 1-1 2-2 3-4" /></>,
  bolt: <path d="M27 4 11 27h10l-3 17 19-25H26l4-15Z" />,
  chart: <><path d="M7 41h34" /><path d="M13 41V28M22 41V20M31 41V25M40 41V14" strokeWidth={2.6} /><path d="M9 24l8-8 7 5 13-13" /><path d="M31 8h6v6" /></>,
  crown: <><path d="M7 16l6 7 11-13 11 13 6-7-3 23H10L7 16Z" /><path d="M10 39h28" /><circle cx="7" cy="16" r="2.2" /><circle cx="41" cy="16" r="2.2" /><circle cx="24" cy="10" r="2.2" /></>,
};

export function TierGlyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {GLYPHS[name] ?? GLYPHS.rocket}
    </svg>
  );
}
