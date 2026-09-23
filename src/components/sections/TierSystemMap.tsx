import { ArrowRight, Check } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import LocalizedLink from "../LocalizedLink";
import { AUDIT, DISCOVERY, ENTRY, TIER_TO_SYSTEM } from "@/lib/offer";
import type { Messages } from "@/lib/i18n";

/**
 * The bridge between the two price lists.
 *
 * /pricing sells four TIERS starting at ₹25,000. /services sells six SYSTEMS
 * starting at ₹60,000. Both numbers were true, neither page acknowledged the
 * other, and the result read as a bait price: a visitor who saw ₹25,000 on one
 * page and "engagements start at ₹60,000" in the homepage FAQ had no way to
 * reconcile them and no reason to assume good faith.
 *
 * They are reconcilable — a tier is a scope of work, a system is a bundle of
 * capability, and the cheapest tier simply does not include the automation and
 * SEO that make up the cheapest system. This block says that out loud, and the
 * mapping itself lives in `lib/offer.ts` so it stays in step with the copy.
 */
export function TierSystemMap({ t }: { t: Messages }) {
  return (
    <Section id="tier-map" className="border-t border-border bg-surface/20">
      <SectionHeader
        eyebrow="How the two price lists fit together"
        title="Which tier gets you which system."
        subtitle={`A tier is a scope of work. A system is what that scope delivers. The cheapest build is ${ENTRY.site.display} (${ENTRY.site.tier}); the cheapest complete system is ${ENTRY.system.display} (${ENTRY.system.service}) — the difference is the automation, SEO and analytics layered on top.`}
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(TIER_TO_SYSTEM).map(([tier, { systems, note }]) => {
          const priced = t.pricing.tiers.find((x) => x.name === tier);
          return (
            <div
              key={tier}
              className="flex flex-col rounded-2xl border border-border bg-background p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {tier}
                </h3>
                {priced && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {priced.priceRange}
                  </span>
                )}
              </div>

              <ul className="mt-5 space-y-2 border-t border-border pt-5">
                {systems.map((sys) => (
                  <li key={sys} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={13} strokeWidth={3} className="mt-1 shrink-0 text-accent-strong" />
                    {sys}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {note}
              </p>
            </div>
          );
        })}
      </div>

      {/* The two-step commercial path, stated once, in order. */}
      <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-background p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong">
            Step 1 · free
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {AUDIT.label}
          </div>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
            No cost and no commitment. You leave with a written diagnosis
            whether or not you hire us.
          </p>
        </div>

        <ArrowRight
          size={18}
          className="hidden shrink-0 text-muted-foreground sm:block"
          aria-hidden
        />

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Step 2 · {DISCOVERY.price}
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {DISCOVERY.duration} {DISCOVERY.name}
          </div>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
            Only if you want a build scoped. {DISCOVERY.note}
          </p>
        </div>
      </div>

      <LocalizedLink
        href="/services"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-strong hover:underline"
      >
        See what each system includes
        <ArrowRight size={14} />
      </LocalizedLink>
    </Section>
  );
}
