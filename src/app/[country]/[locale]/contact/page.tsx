import type { Metadata } from "next";
import { getTranslation, type Locale } from "@/lib/i18n";
import { buildPageMetadata, buildPageBreadcrumbJsonLd } from "@/lib/seo";
import { getGeo } from "@/lib/geo";
import { PageHero } from "@/components/sections/PageHero";
import { AFTER_ENQUIRY, AUDIT, DISCOVERY } from "@/lib/offer";
import { Section } from "@/components/primitives/section";
import { ContactForm } from "@/components/sections/ContactForm";
import { KnowMore } from "@/components/sections/KnowMore";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { GlobalReachMap } from "@/components/illustrations";
import {
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Globe2,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({ page: "contact", country, locale: locale as Locale });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = getTranslation(locale as Locale);
  const breadcrumbLd = buildPageBreadcrumbJsonLd("contact", locale as Locale, country);
  const geo = await getGeo(country, locale as Locale);
  const d = t.contact.details;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <PageHero
        compact
        eyebrow={t.contact.eyebrow}
        title={
          <>
            Request your free{" "}
            <span className="font-editorial text-accent">Revenue Audit.</span>
          </>
        }
        subtitle={t.contact.subtitle}
        breadcrumb="Contact"
      />

      {/* ── FORM + SIDEBAR ── */}
      <Section className="pt-8 sm:pt-10">
        <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm t={t} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:col-span-2">
            {/* Direct contact */}
            <div className="rounded-2xl border-2 border-border bg-surface/50 p-5 sm:p-6">
              <h3 className="font-display text-base font-semibold text-foreground">
                Prefer a conversation?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Skip the form — reach out directly.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href={`https://wa.me/${d.phone.replace(/[^\d]/g, "")}?text=Hi%2C%20I'd%20like%20to%20book%20a%20Revenue%20Audit.`}
                  className="group flex items-center gap-3 rounded-xl border-2 border-success/30 bg-success/5 p-3.5 transition-colors hover:border-success/50 hover:bg-success/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                    <MessageCircle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">WhatsApp</div>
                    <div className="truncate text-xs text-muted-foreground">{d.phone}</div>
                  </div>
                  <ArrowUpRight size={14} className="shrink-0 text-success" />
                </a>

                <a
                  href={`mailto:${d.email}`}
                  className="group flex items-center gap-3 rounded-xl border-2 border-border p-3.5 transition-colors hover:border-accent/40 hover:bg-surface"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">Email</div>
                    <div className="truncate text-xs text-muted-foreground">{d.email}</div>
                  </div>
                  <ArrowUpRight size={14} className="shrink-0 text-muted-foreground group-hover:text-accent" />
                </a>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <Clock size={14} className="text-accent" />
                  <div className="mt-1.5 text-xs font-semibold text-foreground">{d.hours}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{d.hoursLabel}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <MapPin size={14} className="text-accent" />
                  <div className="mt-1.5 text-xs font-semibold text-foreground">{d.location}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{d.locationLabel}</div>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-2xl border-2 border-accent/25 bg-accent-soft p-5 sm:p-6">
              <h4 className="text-sm font-semibold text-accent-strong">What happens next</h4>
              <div className="mt-4 space-y-3">
                {AFTER_ENQUIRY.map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-background text-xs font-semibold text-accent-strong">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm text-foreground/90">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The paid step, stated before anyone can feel ambushed by it. */}
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <div className="text-sm font-semibold text-foreground">
                And if we go further
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                The audit is free and has no next step attached. If you want a
                build scoped, the {DISCOVERY.name} is a paid {DISCOVERY.duration}{" "}
                session ({DISCOVERY.price}) — {DISCOVERY.note.toLowerCase()}
              </p>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/40 p-4">
              <ShieldCheck size={20} className="shrink-0 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">Confidential by default</div>
                <div className="text-xs text-muted-foreground">NDA available on request.</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── GLOBAL MAP ── */}
      <Section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <Globe2 size={12} />
              Where we operate
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              Based in India. Serving globally.
            </h2>
          </div>
          {geo.detected && geo.city && (
            <div className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-success">
                You: {geo.city}, {geo.countryName}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface/30 p-2 sm:p-4">
          <GlobalReachMap userCity={geo.city} userCountry={geo.countryCode} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { value: "190+", label: "Countries" },
            { value: "12", label: "Cities" },
            { value: "5", label: "Industries" },
            { value: "<24hr", label: "Response" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-background p-3 text-center">
              <div className="font-display text-lg font-semibold text-foreground sm:text-xl">{s.value}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PROOF STRIP ── */}
      <Section className="pt-0">
        <div className="rounded-2xl border border-border bg-surface/30 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "50+ businesses scaled",
              "₹40Cr+ revenue impacted",
              "200% average ROI",
              "4.9/5 satisfaction",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 text-accent" />
                <span className="text-sm font-medium text-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <KnowMore t={t} pageKey="contact" pageLabel="Contact" />
      <IndiaGeoFooter country={country} locale={locale} pageKey="contact" />
    </>
  );
}
