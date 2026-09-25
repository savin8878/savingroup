// TEMPORARY preview for the industry kit (WorkflowSimulator + ImpactEstimator) — delete before shipping.
import type { Metadata } from "next";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogSection } from "@/components/blog/BlogPrimitives";
import { WorkflowSimulator } from "@/components/industries/WorkflowSimulator";
import { ImpactEstimator } from "@/components/industries/ImpactEstimator";
import type { IndustryKey } from "@/lib/country-content";

export const metadata: Metadata = { title: "Industry kit preview", robots: { index: false, follow: false } };

const KEYS: IndustryKey[] = ["manufacturing", "real-estate", "healthcare", "ecommerce", "edtech"];

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ only?: string; band?: string; width?: string; part?: string }> }) {
  const { locale } = await params;
  const { only, band, width, part } = await searchParams;
  const keys = only ? KEYS.filter((key) => key === only) : KEYS;
  const max = width ? Number(width) : undefined;
  return (
    <BlogMotion>
      <BlogSection tone={band === "dark" ? "dark" : "paper"} flush>
        <div style={{ paddingTop: 110, display: "grid", gap: 56, maxWidth: max, marginInline: max ? "auto" : undefined }}>
          {keys.map((key, index) => (
            <div key={key} style={{ display: "grid", gap: 40 }}>
              {part !== "est" && <WorkflowSimulator id={`sim-${key}`} industry={key} figure={`FIG. ${String(index + 3).padStart(2, "0")}`} locale={locale} />}
              {part !== "sim" && <ImpactEstimator id={`est-${key}`} industry={key} locale={locale} />}
            </div>
          ))}
        </div>
      </BlogSection>
    </BlogMotion>
  );
}
