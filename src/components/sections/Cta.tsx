/*
 * Server component. The entrance is <Reveal>; nothing else here needed
 * the client bundle.
 */
import { Star, Quote } from "lucide-react";
import { ButtonLink } from "../primitives/button";
import { Eyebrow } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import { CtaWaves } from "../illustrations";
import type { Messages } from "@/lib/i18n";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry } from "@/lib/constants";
import { AUDIT, CTA_LABEL } from "@/lib/offer";

export function Cta({ t, country }: { t: Messages; country?: string }) {
  const tm = t.testimonials.items[0];
  const countryContent =
    country && isResolvableCountry(country) ? getCountryContent(country) : null;

  // Country content supplies the timezone-aware support line ("…in IST",
  // "…AEST hours"), which is genuinely market-specific and worth keeping.
  //
  // The BUTTON is not market-specific. Every market's `cta.primary` said
  // "Book a discovery call", which is wrong twice over: it is the paid second
  // step, not the free audit, and nothing on the other end books anything —
  // the form takes a request and a human replies. One accurate label,
  // everywhere. See CTA_LABEL in lib/offer.ts.
  const trustNote = countryContent?.cta.supportLine ?? AUDIT.supportLine;
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <Reveal
          className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:rounded-3xl sm:p-12 lg:p-16"
        >
          <div className="bg-grid bg-grid-fade absolute inset-0 opacity-30" />
          <CtaWaves className="pointer-events-none" />

          <div className="relative grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>{t.cta.eyebrow}</Eyebrow>
              <h2 className="text-balance font-editorial mt-5 text-[2rem] font-semibold text-foreground sm:text-[2.75rem] lg:text-[3.25rem]">
                {t.cta.title}
              </h2>
              <p className="text-pretty mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                {t.cta.subtitle}
              </p>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <ButtonLink href="/contact" size="lg">
                  {CTA_LABEL}
                </ButtonLink>
                <ButtonLink href="/case-studies" variant="secondary" size="lg">
                  {t.cta.secondary}
                </ButtonLink>
              </div>

              <p className="mt-6 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {trustNote}
              </p>
            </div>

            {/* Side testimonial card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-border bg-background p-5 sm:p-7">
                <Quote
                  size={28}
                  strokeWidth={1}
                  className="text-accent/40"
                />
                <blockquote className="mt-3 text-base leading-relaxed text-foreground">
                  &ldquo;{tm.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 font-display text-sm font-semibold text-accent-strong ring-1 ring-accent/30">
                    {tm.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">
                      {tm.author}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {tm.role}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        size={11}
                        className="text-accent"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
