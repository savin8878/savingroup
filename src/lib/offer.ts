/**
 * THE OFFER — one source of truth for every commercial number on the site.
 *
 * WHY THIS FILE EXISTS.
 *
 * The same offer was written out by hand in a dozen places and had drifted
 * apart in three separate ways, all of them visible to a prospect comparing
 * two pages in two tabs:
 *
 *   - Entry price. The homepage FAQ and `country-meta.ts` said engagements
 *     start at ₹60,000. The Pricing page's cheapest tier said ₹25,000. Both
 *     were true of different things — ₹25,000 buys a scoped website, ₹60,000
 *     buys the full RevSite Pro system — but nothing on the site said so, so
 *     it read as one of the two numbers being a bait price.
 *   - Audit length. "45 minutes" in `country-content.ts` (eleven markets),
 *     every city page, the blog author card and an indexed blog post whose
 *     slug IS the number; "30 minutes" on the contact page, the footer and
 *     the home FAQ. See the note on AUDIT below for why 45 won.
 *   - Free vs paid. The CTA promised a free audit; the Terms page said "every
 *     project starts with a paid discovery"; a city page billed a "45-minute
 *     discovery call (paid · ₹15,000)". Three different first steps.
 *
 * WHAT IT NOW SAYS. Two distinct steps, never conflated:
 *
 *   1. FREE 45-MINUTE REVENUE AUDIT — the no-risk first conversation. This is
 *      what every CTA on the site offers.
 *   2. PAID DISCOVERY SPRINT — a 3-hour working session, ₹15,000, credited in
 *      full against the build. This is what `terms.tsx` means by "paid
 *      discovery". It happens AFTER the free audit, never instead of it.
 *
 * CHANGING THE OFFER. Edit the constant, not the copy. Every surface reads
 * from here, so a change lands everywhere at once and cannot drift again.
 * `AUDIT.minutes` is the one field to edit if the offer itself changes; note
 * that it is also a published URL slug, so a change there needs a redirect.
 */

/* -------------------------------------------------------------------------- */
/*                          Step 1 — the free audit                           */
/* -------------------------------------------------------------------------- */

/**
 * 45, not 30.
 *
 * Both numbers were on the site. 45 is the real one, and the evidence is not
 * a preference — it is load-bearing:
 *
 *   - `/blogs/revenue-audit-45-minutes` is a published, indexed URL with a
 *     whole article arguing the number ("a focused inspection takes 45
 *     minutes; anything longer is a consulting pitch").
 *   - ~30 further references across `blogs.ts` cite it by name, several as
 *     internal links using it as the anchor text.
 *   - All eleven markets in `country-content.ts`, every city page, and the
 *     blog author card say 45.
 *
 * "30 minutes" appeared in exactly four places — the footer chip, the contact
 * page, the home FAQ card and the enquiry checklist — and those are the ones
 * that were wrong. Changing the constant to 30 would have contradicted a page
 * Google has indexed under the number.
 */
export const AUDIT = {
  minutes: 45,
  /** "45-minute" — for use mid-sentence, e.g. "a free 45-minute audit". */
  duration: "45-minute",
  /** "45 minutes" — for use as a standalone fact. */
  durationLong: "45 minutes",
  /** The canonical name of the thing. Title case, used in CTAs. */
  name: "Revenue Audit",
  /** Full CTA label. See CTA_LABEL below for the verb-accurate variant. */
  label: "Free 45-minute Revenue Audit",
  /** One-line support text under a CTA. */
  supportLine:
    "Free 45-minute revenue audit. No pitch — you leave with a written diagnosis.",
} as const;

/**
 * The button verb.
 *
 * "Book" promises a calendar. The contact form does not open one: it takes a
 * request and a human replies within a business day. Until real scheduling is
 * wired up, the button says what actually happens. Swap this to
 * "Book your free 45-minute audit" the day `/contact` embeds a scheduler.
 */
export const CTA_LABEL = "Request your free audit" as const;

/** What the visitor should expect after submitting, in order. */
export const AFTER_ENQUIRY = [
  "We reply within one business day.",
  `Free ${AUDIT.duration} audit — no pitch, just diagnosis.`,
  "You leave with a written revenue diagnosis.",
] as const;

/* -------------------------------------------------------------------------- */
/*                       Step 2 — the paid discovery                          */
/* -------------------------------------------------------------------------- */

export const DISCOVERY = {
  name: "Discovery Sprint",
  duration: "3-hour",
  priceInr: 15000,
  price: "₹15,000",
  /** Always state the credit — it is what makes the paid step an easy yes. */
  note: "Credited in full against the build.",
  summary:
    "A paid 3-hour working session (₹15,000, credited against the build). We map your funnel, quantify the leaks, and hand over a written blueprint with scope, timeline and projected outcomes.",
} as const;

/* -------------------------------------------------------------------------- */
/*                              Entry pricing                                 */
/* -------------------------------------------------------------------------- */

/**
 * The two real entry points, kept separate because they buy different things.
 * Any copy quoting "we start at X" must say WHICH of these it means.
 */
export const ENTRY = {
  /** Cheapest scoped website build — the `Launch` tier on /pricing. */
  site: { amountInr: 25000, display: "₹25,000", tier: "Launch" },
  /** Cheapest complete revenue system — `RevSite Pro` on /services. */
  system: { amountInr: 60000, display: "₹60,000", service: "RevSite Pro" },
  /** Cheapest ongoing retainer. */
  retainer: { amountInr: 30000, display: "₹30,000", per: "month" },
} as const;

/**
 * How the four /pricing tiers map onto the six /services systems.
 *
 * This mapping is the actual fix for the "₹25,000 or ₹60,000?" problem: the
 * two price lists were never in conflict, they were just never connected.
 * Rendered on /pricing so a visitor can see where a tier lands.
 */
export const TIER_TO_SYSTEM: Record<
  string,
  { systems: string[]; note: string }
> = {
  Launch: {
    systems: ["Website only"],
    note: "A scoped, conversion-tuned site. No automation or SEO retainer — add either later without a rebuild.",
  },
  Growth: {
    systems: ["RevSite Pro"],
    note: "The full RevSite Pro system: the site plus WhatsApp lead capture, on-page SEO and analytics.",
  },
  Scale: {
    systems: ["RevSite Pro", "AutoSell Engine", "LocalDom SEO"],
    note: "RevSite Pro with automation and local SEO layered on — the usual shape for multi-location and e-commerce.",
  },
  Enterprise: {
    systems: ["OperateOS", "GlobalScale Suite"],
    note: "Custom platforms, ERP and multi-market builds. Always scoped from a Discovery Sprint first.",
  },
};
