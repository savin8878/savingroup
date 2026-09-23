import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { INDIA_CITIES, type CityContent } from "@/lib/cities";
import { BASE_URL } from "@/lib/constants";
import { AUDIT, DISCOVERY } from "@/lib/offer";

/**
 * Pages that consume this footer. Each gets its own anchor template + state
 * intro so the rendered block reads as page-specific content, not boilerplate
 * Google will dedupe across the site.
 */
export type IndiaGeoFooterPage =
  | "home"
  | "services"
  | "industries"
  | "about"
  | "contact"
  | "blogs"
  | "case-studies"
  | "cities";

interface PageCopy {
  eyebrow: string;
  headline: string;
  lead: string;
  /** City anchor template — must contain {city} */
  anchor: string;
  /** Per-state intro template — must contain {state} and {cities} */
  stateIntro: string;
}

const PAGE_COPY: Record<IndiaGeoFooterPage, PageCopy> = {
  home: {
    eyebrow: "Across India · State by state",
    headline:
      "Revenue systems for businesses in every major Indian city — engineered for the local market.",
    lead:
      "We work with founders and operators across India — Mumbai to Indore, Bengaluru to Bhopal — and tailor every build to how the local market actually buys. Pick your city below and you'll land on a page hand-written for that specific commercial geography.",
    anchor: "Best web development & revenue agency in {city}",
    stateIntro:
      "{state} businesses operate on a different commercial cadence than the metros — we ship websites, WhatsApp automation, and SEO funnels for the buyers in {cities} and the surrounding belt.",
  },
  services: {
    eyebrow: "Services across India · By state",
    headline:
      "Website development, SEO & revenue automation — engineered for every Indian city.",
    lead:
      "Our services don't change shape city to city — but the playbook does. Mumbai brands compete on a ₹600+ CPC; Indore brands compete on trust signals and offline-to-online handoff. Pick the city below — the page will tell you exactly how we run the build there.",
    anchor: "Website development company in {city}",
    stateIntro:
      "We deliver website development, WhatsApp automation, SEO, and lead-routing systems for businesses across {state} — with on-ground engagement experience in {cities}.",
  },
  industries: {
    eyebrow: "Industry partners across India",
    headline:
      "Manufacturing, real estate, healthcare, e-commerce & edtech — built city by city.",
    lead:
      "Every industry buys differently in every city. Manufacturing in Indore is not the same conversation as manufacturing in Pune. Real estate in Gurugram is a different funnel than real estate in Hyderabad. Pick the city below — each page maps the local industry mix and the funnel patterns that actually convert there.",
    anchor: "Industry partner & revenue agency in {city}",
    stateIntro:
      "Industry-specific revenue systems for {state} — manufacturing belts, real estate corridors, edtech hubs, and D2C clusters across {cities}.",
  },
  about: {
    eyebrow: "Where we work · Across India",
    headline: "Remote-first, India-deep — operators in every major city.",
    lead:
      "We're a remote-first studio with on-ground engagement footprints across India. The page for your city will tell you how we operate there: which neighbourhoods we've delivered into, which local stack we run, and what a typical engagement looks like.",
    anchor: "About our work in {city}",
    stateIntro:
      "Our {state} engagements run across {cities} — see how we partner locally with founders and operators in the state.",
  },
  contact: {
    eyebrow: "Talk to us · Anywhere in India",
    headline: "Local context, India-wide — pick your city.",
    lead:
      "Tell us where you're based — the conversation gets sharper when we already know your buyer's commercial geography. Our city pages cover how we actually deliver in each metro and growth city.",
    anchor: "Contact us for work in {city}",
    stateIntro:
      "We work with teams across {state} — {cities} and the surrounding belt. Reach us via the form above or pick your city for the local playbook.",
  },
  blogs: {
    eyebrow: "Field notes · India-wide",
    headline: "Local lessons from every Indian metro we've shipped into.",
    lead:
      "Every blog post we write is grounded in actual engagements — and most of those engagements are city-specific. Pick a city to see how the patterns we describe play out in your local market.",
    anchor: "Local revenue playbook for {city}",
    stateIntro:
      "Field notes from our {state} work — patterns we've seen across {cities} and what they mean for founders running similar plays.",
  },
  "case-studies": {
    eyebrow: "Proof · City by city",
    headline: "Shipped engagements across India — see the work, by city.",
    lead:
      "Pick a city below and you'll land on the local proof: the kinds of engagements we've shipped there, the buyer profiles we've worked with, and the case-study callouts tied to that specific market.",
    anchor: "Case studies & client work in {city}",
    stateIntro:
      "Real engagements from across {state} — {cities} and the wider commercial belt.",
  },
  cities: {
    eyebrow: "All Indian cities we serve",
    headline: "Pick your city — every page is written for that local market.",
    lead:
      "Below is the full set of city pages we maintain. Each one is a hand-written playbook for how revenue systems work in that specific metro: local neighbourhoods, local industries, local stack patterns, and the specific FAQs operators in that city ask.",
    anchor: "{city} revenue playbook",
    stateIntro:
      "{cities} — the cities we serve in {state}.",
  },
};

/**
 * Tier-2/3 cities we deliver into remotely but don't (yet) have dedicated
 * pages for. Mentioned in plain text so Google sees the long-tail intent
 * surface without us creating internal links to URLs that don't exist.
 * Add cities here as we open them as servable; promote to a real /cities/*
 * page once we have a hand-written body block + at least one local proof.
 */
const TIER_2_3_CITIES = [
  "Surat", "Vadodara", "Rajkot", "Nagpur", "Nashik", "Aurangabad",
  "Lucknow", "Kanpur", "Varanasi", "Patna", "Ranchi", "Bhubaneswar",
  "Coimbatore", "Madurai", "Kochi", "Thiruvananthapuram",
  "Visakhapatnam", "Vijayawada", "Guntur", "Mysuru", "Mangaluru",
  "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar",
  "Dehradun", "Haridwar", "Raipur", "Bilaspur",
  "Rewa", "Jabalpur", "Gwalior", "Sagar", "Ujjain",
  "Udaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner",
  "Faridabad", "Ghaziabad", "Meerut", "Agra", "Allahabad",
  "Guwahati", "Shillong", "Siliguri", "Asansol",
];

interface IndiaGeoFooterProps {
  country: string;
  locale: string;
  pageKey: IndiaGeoFooterPage;
  /**
   * `full` — state cards with a per-state paragraph. The default, and what
   * every city/country page still renders.
   *
   * `compact` — the same links and the same ItemList JSON-LD, without the
   * per-state prose. Built for the homepage: the directory was one of the
   * blocks pushing that page past 30,000px, but simply deleting it would
   * have cut the internal-link path that gets the city pages crawled at all
   * (see the note above). Compact keeps every link and every schema node and
   * drops roughly four-fifths of the height.
   */
  variant?: "full" | "compact";
}

/**
 * India-only "footprint" block for the bottom of every primary page.
 * State-grouped city links with page-aware anchor text, a per-state intro
 * paragraph, and an ItemList JSON-LD payload.
 *
 * Why this exists: /in/en/services and the other primary pages were stuck
 * in Search Console's "Discovered, not indexed" bucket — Google knew the
 * URLs but didn't think they were worth crawling. The fix has two parts:
 *  (1) Internal link weight pointing into the indexable city pages.
 *  (2) Page-unique content at the bottom of every primary page so Google
 *      stops folding /services, /industries, /about etc. as templated
 *      near-duplicates of the home page.
 *
 * Both parts are addressed here. The block is gated on COUNTRY only — the
 * cities are Indian, so it makes no sense under /us/ or /de/, but it must
 * render for every Indian locale. It used to also require `locale === "en"`,
 * justified by a comment saying /in/en was "the only country/locale combo in
 * INDEXABLE_COUNTRIES × INDEXABLE_LOCALES". That stopped being true when
 * constants.ts opened both sets, and the effect was that /in/hi, /in/gu and
 * the other six Indian locale trees shipped indexable pages with no links
 * into any city page at all.
 */
export function IndiaGeoFooter({
  country,
  locale,
  pageKey,
  variant = "full",
}: IndiaGeoFooterProps) {
  if (country.toLowerCase() !== "in") return null;
  const compact = variant === "compact";

  const copy = PAGE_COPY[pageKey];
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;

  // Group cities by state. Sort: states with the most cities first (rough
  // proxy for commercial weight — MH and MP both have 2 cities), then
  // alphabetic for stability across builds.
  const byState = new Map<string, { stateCode: string; cities: CityContent[] }>();
  for (const city of INDIA_CITIES) {
    const cur = byState.get(city.state);
    if (cur) cur.cities.push(city);
    else byState.set(city.state, { stateCode: city.stateCode, cities: [city] });
  }
  const states = Array.from(byState.entries()).sort(
    (a, b) => b[1].cities.length - a[1].cities.length || a[0].localeCompare(b[0]),
  );

  // ItemList JSON-LD — explicit signal that this section indexes a finite,
  // ordered list of city URLs with anchor text scoped to the current page.
  //
  // No `@id`: the previous value was `${BASE_URL}${prefix}#cities-${pageKey}`,
  // where `prefix` is only the country/locale root. Every one of these nodes
  // therefore claimed to be a fragment of the homepage even though six of the
  // seven never appear on it, and /pricing and /services collided on one id
  // (both pass pageKey="services"), as did /industries and /industries/[slug].
  // An ItemList needs no identifier to be valid, and no id beats a wrong one.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Sanat Dynamo — Indian cities (${pageKey})`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: INDIA_CITIES.length,
    itemListElement: INDIA_CITIES.map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: copy.anchor.replace("{city}", city.name),
      url: `${BASE_URL}${prefix}/cities/${city.slug}`,
    })),
  };

  return (
    <Section
      id={`india-${pageKey}-footer`}
      className="border-t border-border bg-surface/20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong">
          <MapPin size={12} />
          {copy.eyebrow}
        </div>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {copy.headline}
        </h2>
        {!compact && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.lead}
          </p>
        )}
      </div>

      <div className={compact ? "mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3" : "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
        {states.map(([stateName, { stateCode, cities }]) => {
          const cityList = cities.map((c) => c.name).join(", ");
          const intro = copy.stateIntro
            .replace("{state}", stateName)
            .replace("{cities}", cityList);
          return (
            <article
              key={stateCode}
              className={
                compact
                  ? "flex flex-col"
                  : "flex flex-col rounded-2xl border border-border bg-background/60 p-6 transition-colors hover:border-accent/30"
              }
            >
              <header className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                  {stateName}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  IN-{stateCode}
                </span>
              </header>
              {!compact && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {intro}
                </p>
              )}
              <ul className="mt-4 space-y-1">
                {cities.map((city) => {
                  const anchor = copy.anchor.replace("{city}", city.name);
                  return (
                    <li key={city.slug}>
                      <Link
                        href={`${prefix}/cities/${city.slug}`}
                        className="group flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface/60 hover:text-accent-strong"
                      >
                        <span className="leading-snug">{anchor}</span>
                        <ArrowUpRight
                          size={12}
                          className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>

      {!compact && (
      <p className="mt-10 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">
          Beyond the cities above,
        </span>{" "}
        we deliver remotely into tier-2 and tier-3 markets across India —
        including {TIER_2_3_CITIES.join(", ")}. The playbook stays the same;
        only the local context changes. If your city isn&apos;t listed, the
        engagement still runs the same way: a free {AUDIT.duration} audit
        first, then a {DISCOVERY.duration} {DISCOVERY.name} in week one,
        scope locked in weeks two and three, build in weeks four to fourteen,
        then a compounding monthly retainer.
      </p>
      )}
    </Section>
  );
}
