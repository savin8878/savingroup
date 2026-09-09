import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Languages,
  MapPin,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import {
  getTranslation,
  type Locale,
  LOCALE_CODES,
} from "@/lib/i18n";
import { BASE_URL } from "@/lib/constants";
import {
  INDIA_CITIES,
  getCityBySlug,
  localizeCity,
  isCityIndexable,
} from "@/lib/cities";
import { getCityIdentity } from "@/lib/city-identity";
import { getCityOrganization } from "@/lib/city-organization";
import { buildBreadcrumbJsonLd, buildCityAlternates } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { ContactForm } from "@/components/sections/ContactForm";
import { CityPageNav } from "@/components/sections/CityPageNav";
import {
  CityLeadCTA,
  CityContextMap,
} from "@/components/illustrations/CityPageVisuals";
import LocalizedLink from "@/components/LocalizedLink";

const SUB_PATH = "contact";

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "hi"];
  const country = "in";
  const params: Array<{ country: string; locale: string; city: string }> = [];
  for (const city of INDIA_CITIES) {
    for (const locale of locales) {
      params.push({ country, locale, city: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}): Promise<Metadata> {
  const { country, locale, city: citySlug } = await params;
  const baseCity = getCityBySlug(citySlug);
  if (!baseCity) return { title: "Not found" };

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const city = localizeCity(baseCity, lc);
  // EN-only for now (see services/page.tsx for rationale).
  // Robots MUST come from the same predicate that builds the hreflang
  // cluster below (`buildCityAlternates` -> `isCityIndexable`). If these two
  // disagree, the page ships `noindex` next to a full alternates cluster and
  // Google discards the cluster for every member, including the indexable one.
  const indexable = isCityIndexable(baseCity, country, lc);

  const title = `Contact Sanat Dynamo in ${city.name} — Book a Revenue Audit`;
  const description = `Book a 45-minute revenue audit for your ${city.name} business. WhatsApp, phone, or written request — IST hours, INR + GST invoicing, response within one business day.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city: baseCity,
    cityPath: `${city.slug}/${SUB_PATH}`,
  });

  return {
    title,
    description,
    keywords: `${city.name} contact, ${city.name} revenue audit, ${city.name} agency contact, book audit ${city.name}, ${city.name} consultation, ${city.name} WhatsApp agency`,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "website",
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og.png`],
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    other: {
      "geo.country": "IN",
      "geo.region": `IN-${city.stateCode}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
      ICBM: `${city.geo.lat}, ${city.geo.lng}`,
    },
  };
}

export default async function CityContactPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}) {
  const { country, locale, city: citySlug } = await params;
  const baseCity = getCityBySlug(citySlug);
  if (!baseCity) notFound();

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const city = localizeCity(baseCity, lc);
  const t = getTranslation(lc);
  const identity = getCityIdentity(city.slug);
  const org = getCityOrganization(city.slug);
  const prefix = `/${country.toLowerCase()}/${lc}`;

  const phoneDisplay = t.contact.details.phone;
  const whatsappE164 = phoneDisplay.replace(/[^\d]/g, "");

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", url: `${BASE_URL}${prefix}` },
    { name: "Cities", url: `${BASE_URL}${prefix}/cities` },
    { name: city.name, url: `${BASE_URL}${prefix}/cities/${city.slug}` },
    {
      name: "Contact",
      url: `${BASE_URL}${prefix}/cities/${city.slug}/${SUB_PATH}`,
    },
  ]);

  // ContactPage + LocalBusiness JSON-LD — tells Google this is the local
  // contact endpoint for {city} and surfaces phone/WhatsApp/areaServed in
  // local-business rich results.
  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact Sanat Dynamo in ${city.name}`,
    url: `${BASE_URL}${prefix}/cities/${city.slug}/${SUB_PATH}`,
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}${prefix}/cities/${city.slug}#business`,
      name: `Sanat Dynamo · ${city.name}`,
      url: `${BASE_URL}${prefix}/cities/${city.slug}`,
      telephone: phoneDisplay,
      email: t.contact.details.email,
      areaServed: {
        "@type": "City",
        name: city.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.stateCode,
          addressCountry: "IN",
        },
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.geo.lat,
        longitude: city.geo.lng,
      },
      openingHoursSpecification: org && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        description: org.hours,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: phoneDisplay,
          areaServed: "IN",
          availableLanguage: org?.languages ?? ["English", "Hindi"],
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          url: `https://wa.me/${whatsappE164}`,
          areaServed: "IN",
          availableLanguage: org?.languages ?? ["English", "Hindi"],
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />

      <PageHero
        eyebrow={`Contact · ${city.name}`}
        title={
          <>
            Book a 45-minute revenue audit in{" "}
            <span className="text-accent">{city.name}</span>.
          </>
        }
        subtitle={`The fastest path is WhatsApp. Reply within one business day. ${city.name} promoters: we run on IST hours, bill INR + GST, and ship written audit reports within 5 working days of the call.`}
        breadcrumb={`${city.name} · Contact`}
      />

      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active="contact"
        />
      </div>

      {/* ========== Triple lead CTA (WhatsApp / Phone / Audit) ========== */}
      <Section className="pt-8 sm:pt-10">
        <CityLeadCTA
          city={city}
          whatsappNumber={whatsappE164}
          phoneNumber={phoneDisplay}
        />
      </Section>

      {/* ========== Operating context (hours + languages + presence) ========== */}
      {org && (
        <Section className="pt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
              <Clock size={14} className="text-accent" />
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Working hours
              </div>
              <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {org.hours}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
              <Languages size={14} className="text-accent" />
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Languages
              </div>
              <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {org.languages.join(" · ")}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
              <MapPin size={14} className="text-accent" />
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                On-site
              </div>
              <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {org.onSiteCadence}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
              <Calendar size={14} className="text-accent" />
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Response SLA
              </div>
              <div className="mt-1.5 font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                &lt;1 business day
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ========== What happens after you reach out ========== */}
      <Section className="bg-surface/20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>What happens next</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              From WhatsApp message to written audit in 7 days.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your time is the most expensive thing in this engagement. Here&apos;s
              the exact timeline so you know what to commit and when to expect
              a deliverable.
            </p>
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {[
              {
                step: "01",
                title: "WhatsApp / phone within 1 business day",
                body: "We confirm fit, scope a 45-minute discovery call, and share a calendar invite for that week.",
              },
              {
                step: "02",
                title: "45-minute discovery call (paid · ₹15,000)",
                body: `We map your funnel end-to-end on a live call. Identify the top 3 revenue leaks. The fee is fully credited if you proceed.`,
              },
              {
                step: "03",
                title: "Written audit report within 5 working days",
                body: "12-20 pages: ranked leak analysis, fixed-price phased proposal, named tools and integrations.",
              },
              {
                step: "04",
                title: "Decision call — go / no-go",
                body: `If yes: we lock scope and start. If no: you keep the audit. No retainer pressure, no follow-up calls.`,
              },
            ].map((s) => (
              <article
                key={s.step}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface/40 p-5 sm:p-6"
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-semibold"
                  style={{
                    borderColor: identity?.themeColor.replace(")", " / 0.4)") ?? "var(--border)",
                    color: identity?.themeColor ?? "var(--accent)",
                  }}
                >
                  {s.step}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== Neighborhoods served ========== */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>{city.name} service area</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Where we ship across {city.name}.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We&apos;ve shipped engagements across {city.name}&apos;s major
              commercial clusters. {city.industriesAngle.split(".")[0]}.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {city.neighborhoods.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground"
                >
                  <MapPin size={10} className="text-accent" />
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ========== Quick FAQ from city.faq ========== */}
      <Section className="bg-surface/20 pt-0">
        <div className="max-w-3xl">
          <Eyebrow>Quick answers</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Common questions from {city.name} promoters.
          </h2>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-10">
          {city.faq.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className="group rounded-2xl border border-border bg-surface/40 p-5 transition-colors open:border-accent/40 open:bg-surface [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-foreground">
                <span>{item.q}</span>
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-accent transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* ========== Written request form ========== */}
      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Or write to us</Eyebrow>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Prefer email? Fill the form.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              We read every submission. Mention &quot;{city.name}&quot; in the
              challenge field and we&apos;ll route it directly to the
              {" "}{org?.leadRole?.toLowerCase() ?? "engagement lead"} who
              handles {city.name} engagements.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              <Sparkles size={11} />
              Audit slots: 3 open this week
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactForm t={t} />
          </div>
        </div>
      </Section>

      {/* ========== Map ========== */}
      <section className="relative px-3 pt-6 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <CityContextMap
            city={city}
            themeColor={identity?.themeColor}
            themeColorAccent={identity?.themeColorAccent}
            prefix={prefix}
          />
        </div>
      </section>

      {/* ========== Related sub-pages ========== */}
      <Section className="pt-10 sm:pt-14 lg:pt-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: `/cities/${city.slug}/services`,
              label: city.name + " services",
              desc: "6 productized revenue systems framed for " + city.name + ".",
              Icon: Briefcase,
            },
            {
              href: `/cities/${city.slug}/process`,
              label: "How we deliver",
              desc: "Engagement journey, weekly cadence, the tools we deploy.",
              Icon: Star,
            },
            {
              href: `/cities/${city.slug}/case-studies`,
              label: city.name + " case studies",
              desc: "Real numbers, named industries, measured outcomes.",
              Icon: ArrowRight,
            },
          ].map(({ href, label, desc, Icon }) => (
            <LocalizedLink
              key={href}
              href={href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  Next page
                </span>
              </div>
              <div className="mt-3 font-display text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-lg">
                {label}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground">
                Open
                <ArrowUpRight
                  size={11}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </LocalizedLink>
          ))}
        </div>
      </Section>
    </>
  );
}
