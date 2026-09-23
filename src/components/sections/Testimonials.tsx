/*
 * Server component. It carried "use client" only for the framer-motion
 * entrance wrapper; that is now <Reveal>, a small client island of its own,
 * so none of this markup ships to the browser as JavaScript any more.
 */
import { Quote, Star } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { SnapRowHint } from "../primitives/snap-row-hint";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";

export function Testimonials({
  t,
  country,
}: {
  t: Messages;
  country?: string;
}) {
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  // Lift any testimonial whose author/role matches a country priority hint
  // to the top of the list. Priority matching is a case-insensitive substring
  // search so the country-content file doesn't have to know testimonial IDs.
  const items = (() => {
    const priority = countryContent?.testimonialsPriority ?? [];
    if (priority.length === 0) return t.testimonials.items;
    const matches = new Set<number>();
    const scored = t.testimonials.items.map((tm, idx) => {
      const hay = `${tm.author} ${tm.role}`.toLowerCase();
      const hit = priority.some((p) => hay.includes(p.toLowerCase()));
      if (hit) matches.add(idx);
      return { tm, idx, hit };
    });
    return [
      ...scored.filter((s) => s.hit).map((s) => s.tm),
      ...scored.filter((s) => !s.hit).map((s) => s.tm),
    ];
  })();

  return (
    <Section id="testimonials">
      <SectionHeader
        eyebrow={t.testimonials.eyebrow}
        title={t.testimonials.title}
        align="center"
      />

      {/* Average rating bar */}
      <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-border bg-surface/60 px-5 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className="text-accent"
              fill="currentColor"
            />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          4.9 / 5 · 50+ engagements
        </span>
      </div>

      {/* Mobile: snap-x carousel. sm+: 2-col grid. */}
      <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-12 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {items.map((tm, i) => (
          <Reveal
            as="figure"
            delay={(i % 2) * 0.08}
            key={i}
            className="group relative w-[84vw] max-w-[340px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 transition-all hover:border-accent/30 hover:bg-surface sm:w-auto sm:max-w-none sm:flex-shrink sm:rounded-3xl sm:bg-surface/60 sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 hidden h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-opacity duration-500 group-hover:bg-accent/15 sm:block"
            />
            <div className="flex items-center justify-between">
              <Quote
                size={36}
                strokeWidth={1}
                className="text-accent/30"
                aria-hidden
              />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    size={12}
                    className="text-accent"
                    fill="currentColor"
                  />
                ))}
              </div>
            </div>
            <blockquote className="mt-4 text-balance text-base sm:text-lg leading-relaxed text-foreground">
              {tm.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 font-display text-base font-semibold text-accent-strong ring-1 ring-accent/30">
                {tm.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {tm.author}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {tm.role}
                </div>
              </div>
            </figcaption>
          </Reveal>
        ))}
      </div>
      <SnapRowHint count={items.length} />
    </Section>
  );
}
