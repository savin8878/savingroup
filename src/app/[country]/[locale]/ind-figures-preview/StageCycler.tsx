"use client";
// TEMPORARY preview helper for IndustryFigures — delete with the preview route.
import { useEffect, useState, type ReactNode } from "react";

export function StageCycler({ stages, fixed, children, id }: { stages: string[]; fixed?: string; children: ReactNode; id?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (fixed) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % stages.length), 1800);
    return () => window.clearInterval(timer);
  }, [fixed, stages.length]);
  const active = fixed ?? stages[index];
  return (
    <div id={id} data-active-stage={active}>
      <p style={{ font: "11px var(--font-mono)", color: "var(--home-muted)", margin: "0 0 8px" }}>data-active-stage = {active}</p>
      {children}
    </div>
  );
}
