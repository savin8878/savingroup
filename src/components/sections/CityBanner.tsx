import { MapPin, ArrowUpRight, Globe2, Satellite } from "lucide-react";
import { getGeo, INDIAN_TIER1 } from "@/lib/geo";
import { interpolate, type Locale, type Messages } from "@/lib/i18n";
import { getCountryMeta, getRegionLabel } from "@/lib/country-meta";
import LocalizedLink from "../LocalizedLink";
import { PreciseLocationButton } from "./PreciseLocationButton";

interface CityBannerProps {
  t: Messages;
  country: string;
  locale?: Locale;
}

export async function CityBanner({ t, country, locale = "en" }: CityBannerProps) {
  const geo = await getGeo(country, locale);
  const countryMeta = getCountryMeta(country);
  const regionLabel = getRegionLabel(countryMeta.region, locale);
  const isIndia = geo.countryCode === "in";
  const cb = t.cityBanner;

  // Prefer city, state template; fall back to city, country if state is empty
  const title = geo.state
    ? interpolate(cb.titleTemplate, {
        city: geo.city,
        state: geo.state,
        country: geo.countryName,
      })
    : interpolate(cb.titleTemplateCountry ?? cb.titleTemplate, {
        city: geo.city,
        country: geo.countryName,
      });

  const subtitle = interpolate(cb.subtitleTemplate, {
    city: geo.city,
    state: geo.state || geo.countryName,
    country: geo.countryName,
  });
  const ctaLabel = interpolate(cb.ctaLabel, { city: geo.city });

  // NO LocalBusiness JSON-LD here. This used to emit
  // `buildLocalBusinessJsonLd(t, geo)`, whose `address.addressLocality`,
  // `addressRegion` and `geo` coordinates come from `getGeo` — i.e. from the
  // requesting IP. The banner is mounted on seven routes including the
  // homepage, so the machine-readable postal address of the business changed
  // on every request: a fetch from one network published
  // `"Sanat Dynamo — Gādarwāra"` with a Gādarwāra address, another published
  // Jaipur. Structured data has to state a fact about the business, not a fact
  // about the visitor. The visible "now serving <city>" copy below is fine —
  // it reads as personalization, not as a claimed premises.
  const sourceLabel =
    geo.source === "vercel"
      ? cb.sourceLive
      : geo.source === "ipwhois"
      ? cb.sourceApi
      : cb.sourceDefault;

  return (
    <>
      <section className="relative border-y border-border bg-surface/30 py-12 sm:py-16">
        <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="container-px relative mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  <MapPin size={11} />
                  {geo.detected ? cb.eyebrowLocal : cb.eyebrowDefault}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Globe2 size={11} />
                  {cb.badgeLabel}
                </div>
              </div>
              <h2 className="text-balance mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subtitle}
              </p>

              {/* City chips for India — region line for everywhere else */}
              {isIndia ? (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {interpolate(cb.citiesLabel ?? "Cities we serve in {country}:", {
                      country: geo.countryName,
                    })}
                  </span>
                  {INDIAN_TIER1.map((c) => (
                    <span
                      key={c}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        c.toLowerCase() === geo.city.toLowerCase()
                          ? "border-accent/50 bg-accent/10 text-accent"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground">
                  <Globe2 size={12} className="text-accent" />
                  {interpolate(
                    cb.regionLabelTemplate ?? "Serving {country} and the {region} region.",
                    { country: geo.countryName, region: regionLabel },
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-border bg-background/60 p-7 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                    <MapPin size={11} />
                    {cb.detectedLabel}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    <Satellite size={9} />
                    {sourceLabel}
                  </div>
                </div>

                <div className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {geo.city}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {geo.state && (
                    <>
                      {geo.state}
                      <span className="text-border"> · </span>
                    </>
                  )}
                  {geo.countryName}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {geo.countryCode.toUpperCase()}
                  {geo.latitude && geo.longitude && (
                    <>
                      <span className="text-border"> · </span>
                      {Number(geo.latitude).toFixed(2)},{" "}
                      {Number(geo.longitude).toFixed(2)}
                    </>
                  )}
                </div>

                <LocalizedLink
                  href="/contact"
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_8px_28px_-10px_oklch(0.78_0.165_70/0.6)] transition-all hover:-translate-y-0.5"
                >
                  {ctaLabel}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </LocalizedLink>

                <PreciseLocationButton
                  t={t}
                  initialCity={geo.city}
                  initialState={geo.state}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
