/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import { ArrowUpRight, TrendingUp, Quote } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import LocalizedLink from "../LocalizedLink";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";

export function CaseStudies({
  t,
  expanded = false,
  country,
  noPadding,
}: {
  t: Messages;
  expanded?: boolean;
  country?: string;
  noPadding?: boolean;
}) {
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  // Reorder so the country's featured case studies appear first. Any
  // non-featured items keep their original order behind the featured set.
  const items = (() => {
    if (!countryContent) return t.caseStudies.items;
    const featuredOrder = countryContent.caseStudiesFeatured as readonly string[];
    const byId = new Map(t.caseStudies.items.map((it) => [it.id, it]));
    const featured = featuredOrder.flatMap((id) => {
      const it = byId.get(id);
      return it ? [it] : [];
    });
    const remaining = t.caseStudies.items.filter(
      (it) => !featuredOrder.includes(it.id),
    );
    return [...featured, ...remaining];
  })();

  return (
    <Section id="case-studies">
      <SectionHeader
        eyebrow={t.caseStudies.eyebrow}
        title={t.caseStudies.title}
        subtitle={t.caseStudies.subtitle}
        meta={`${items.length} stories`}
      />

      {/* Top metric strip — aggregate proof */}
      <div className="mt-12 grid gap-3 rounded-3xl border border-border bg-surface/40 p-2 sm:grid-cols-4">
        {[
          { value: "₹40Cr+", label: "Revenue impacted" },
          { value: "127%", label: "Avg revenue lift" },
          { value: "65%", label: "Avg CPA reduction" },
          { value: "90 days", label: "Avg payback" },
        ].map((m, i) => (
          <div
            key={m.label}
            className={`rounded-2xl bg-background p-5 ${
              i === 0 ? "border border-accent/30 bg-accent/5" : ""
            }`}
          >
            <div className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {m.value}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {items.map((cs, i) => (
          <Reveal
            as="article"
            key={cs.id}
            id={cs.id}
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface/60 transition-all hover:border-accent/30 hover:bg-surface"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <div className="grid gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-12 lg:p-10">
              {/* Left: title + meta */}
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-strong">
                    {cs.industry}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {cs.location} · {cs.duration}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <TrendingUp size={12} className="text-accent" />
                  Case · 0{i + 1}
                </div>

                <h3 className="text-balance mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-3xl">
                  {cs.title}
                </h3>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {cs.summary}
                </p>

                {expanded && (
                  <blockquote className="mt-6 rounded-2xl border-l-2 border-accent bg-background/60 px-5 py-4 italic text-foreground/90">
                    <Quote
                      size={20}
                      strokeWidth={1}
                      className="text-accent/40"
                      aria-hidden
                    />
                    <p className="mt-2">&ldquo;{cs.quote}&rdquo;</p>
                    <footer className="mt-3 not-italic font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      — {cs.author}
                    </footer>
                  </blockquote>
                )}
              </div>

              {/* Right: metrics */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  {cs.metrics.map((m, mi) => (
                    <div
                      key={m.label}
                      className={`group/metric relative overflow-hidden rounded-2xl border bg-background p-4 transition-colors ${
                        mi === 0
                          ? "border-accent/30 bg-accent/5"
                          : "border-border"
                      }`}
                    >
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                        {m.label}
                      </div>
                      <div className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground">
                        {m.value}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-accent-strong">
                        {m.delta}
                      </div>
                    </div>
                  ))}
                </div>

                {!expanded && (
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <blockquote className="max-w-md text-sm italic text-muted-foreground">
                      &ldquo;{cs.quote}&rdquo;
                    </blockquote>
                    <LocalizedLink
                      href={`/case-studies#${cs.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground transition-all hover:border-accent hover:text-accent-strong"
                    >
                      Read case
                      <ArrowUpRight size={12} />
                    </LocalizedLink>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
