// TEMPORARY preview for IndustryFigures — delete before shipping.
import type { Metadata } from "next";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogSection } from "@/components/blog/BlogPrimitives";
import { IndustryFigure, IndustryArt, FIGURE_LEGENDS, type IndustryFigureKey } from "@/components/industries/IndustryFigures";
import { INDUSTRY_WORKFLOWS } from "@/components/industries/workflows";
import { StageCycler } from "./StageCycler";

export const metadata: Metadata = { title: "Figures preview", robots: { index: false, follow: false } };

const KEYS: IndustryFigureKey[] = ["hub", "manufacturing", "real-estate", "healthcare", "ecommerce", "edtech"];

export default async function Page({ searchParams }: { searchParams: Promise<{ only?: string; band?: string; stage?: string }> }) {
  const { only, band, stage } = await searchParams;
  const keys = only ? KEYS.filter((k) => only.split(",").includes(k)) : KEYS;
  return (
    <BlogMotion>
      <BlogSection tone={band === "dark" ? "dark" : "paper"} flush>
        <div style={{ paddingTop: 120 }}>
          {keys.map((key, i) => {
            const stages = key === "hub" ? [] : INDUSTRY_WORKFLOWS[key].stages.map((st) => st.id);
            return (
              <div key={key} id={`fig-${key}`} style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start", padding: "24px 0", borderTop: "1px solid var(--home-line)" }}>
                <div id={`full-${key}`} style={{ flex: "0 0 640px", width: 640 }}>
                  <IndustryFigure industry={key} number={i + 1} legend={FIGURE_LEGENDS[key]} />
                </div>
                {stages.length > 0 && (
                  <div style={{ flex: "0 0 640px", width: 640 }}>
                    <StageCycler id={`stage-${key}`} stages={stages} fixed={stage ?? stages[3]}>
                      <IndustryFigure industry={key} number={i + 1} />
                    </StageCycler>
                  </div>
                )}
                <div id={`small-${key}`} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div id={`thumb-${key}`} data-figure-hover="" style={{ position: "relative", width: 320, height: 200, border: "1px solid var(--home-line)", background: "var(--home-paper)" }}>
                    <IndustryArt industry={key} compact />
                  </div>
                  <div id={`narrow-${key}`} style={{ width: 358 }}>
                    <IndustryFigure industry={key} number={i + 1} legend={FIGURE_LEGENDS[key]} />
                  </div>
                </div>
                {stages.length > 0 && (
                  <div id={`cycle-${key}`} style={{ width: 640 }}>
                    <StageCycler stages={stages}>
                      <IndustryArt industry={key} />
                    </StageCycler>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BlogSection>
    </BlogMotion>
  );
}
