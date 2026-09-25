// TEMPORARY preview for IndustryFigures — delete before shipping.
import type { Metadata } from "next";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogSection } from "@/components/blog/BlogPrimitives";
import { IndustryFigure, IndustryArt, FIGURE_LEGENDS, type IndustryFigureKey } from "@/components/industries/IndustryFigures";

export const metadata: Metadata = { title: "Figures preview", robots: { index: false, follow: false } };

const KEYS: IndustryFigureKey[] = ["hub", "manufacturing", "real-estate", "healthcare", "ecommerce", "edtech"];

export default async function Page({ searchParams }: { searchParams: Promise<{ only?: string; band?: string }> }) {
  const { only, band } = await searchParams;
  const keys = only ? KEYS.filter((k) => k === only) : KEYS;
  return (
    <BlogMotion>
      <BlogSection tone={band === "dark" ? "dark" : "paper"} flush>
        <div style={{ paddingTop: 120 }}>
          {keys.map((key, i) => (
            <div key={key} id={`fig-${key}`} style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start", padding: "24px 0", borderTop: "1px solid var(--home-line)" }}>
              <div id={`full-${key}`} style={{ flex: "0 1 640px", minWidth: 0, width: "100%" }}>
                <IndustryFigure industry={key} number={i + 1} legend={FIGURE_LEGENDS[key]} />
              </div>
              <div id={`small-${key}`} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div id={`thumb-${key}`} data-figure-hover="" style={{ position: "relative", width: 320, height: 200, border: "1px solid var(--home-line)", background: "var(--home-paper)" }}>
                <IndustryArt industry={key} compact className="" />
              </div>
              <div id={`narrow-${key}`} style={{ width: 358 }}>
                <IndustryFigure industry={key} number={i + 1} legend={FIGURE_LEGENDS[key]} />
              </div>
              </div>
            </div>
          ))}
        </div>
      </BlogSection>
    </BlogMotion>
  );
}
