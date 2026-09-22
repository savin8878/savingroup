import { MapPin, ShieldCheck, Clock, Wallet } from "lucide-react";
import { getCountryContent } from "@/lib/country-content";
import { isResolvableCountry, BASE_URL } from "@/lib/constants";
import type { Messages } from "@/lib/i18n";
import { Section } from "../primitives/section";

/**
 * CountryTrustBlock — the single biggest duplicate-content breaker.
 *
 * Renders 2–3 unique paragraphs per country (~100–140 words) plus a row of
 * market-specific facts: currency/VAT, timezone, regulatory compliance,
 * served cities. For countries outside RESOLVABLE_COUNTRIES we render
 * nothing — there is no hand-written copy for them, and shipping a templated
 * stand-in is what makes country trees look like duplicates of each other.
 *
 * This section also emits a country-scoped `Service` JSON-LD whose
 * `areaServed` lists named cities — coverage, not a claimed address.
 */
export function CountryTrustBlock({
  t,
  country,
}: {
  t: Messages;
  country: string;
}) {
  if (!isResolvableCountry(country)) return null;

  const c = getCountryContent(country);

  // Service JSON-LD — country-scoped coverage, NOT a claimed premises.
  //
  // This was a `ProfessionalService` (a LocalBusiness subtype) carrying a
  // `PostalAddress` built from `c.business.addressLocality`, which hardcodes
  // "Bengaluru" for IN, "London" for GB, "Dubai" for AE, "Riyadh" for SA and
  // the literal string "Remote" for the other eight markets. The business
  // occupies none of those, "Remote" is not a locality, and on the homepage
  // it contradicted the second LocalBusiness that CityBanner used to emit.
  //
  // `areaServed` is the schema.org-sanctioned way to say "we serve these
  // places" without asserting premises in them, and it is already populated
  // per country. A `Service` node carries it without inheriting
  // LocalBusiness's required `address`, so this states the same true thing
  // and drops the false one.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${t.brand.name} — ${c.countryName}`,
    serviceType: "Revenue systems, web development and automation",
    url: `${BASE_URL}/${c.code}/en`,
    image: `${BASE_URL}/og.png`,
    description: c.trustBlock.body[0],
    provider: {
      "@type": "Organization",
      name: t.brand.name,
      url: BASE_URL,
    },
    areaServed: [
      { "@type": "Country", name: c.countryName },
      ...c.business.areaServed.map((city) => ({
        "@type": "City",
        name: city,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <Section id="country-trust">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
            <MapPin size={12} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {c.countryName}
            </span>
          </div>

          <h2 className="text-balance mt-6 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {c.trustBlock.title}
          </h2>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {c.trustBlock.body.map((para, i) => (
              <p key={i} className="text-pretty">
                {para}
              </p>
            ))}
          </div>

          {/* Market facts row — currency, timezone, compliance, cities.
              Mobile: 2-col grid (cards are small enough to fit two-up). */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface/60 p-5">
              <Wallet size={16} className="text-accent" strokeWidth={1.75} />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Currency
              </div>
              <div className="mt-2 text-sm text-foreground">
                {c.currencyLine}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/60 p-5">
              <Clock size={16} className="text-accent" strokeWidth={1.75} />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Timezone
              </div>
              <div className="mt-2 text-sm text-foreground">
                {c.timezone.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {c.timezone.callWindow}
              </div>
            </div>
            {c.regulatoryNote && (
              <div className="rounded-2xl border border-border bg-surface/60 p-5">
                <ShieldCheck size={16} className="text-accent" strokeWidth={1.75} />
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Compliance
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {c.regulatoryNote}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-surface/60 p-5">
              <MapPin size={16} className="text-accent" strokeWidth={1.75} />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Serving
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.business.areaServed.slice(0, 6).map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
