import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/primitives/section";
import { Shield, Database, Cookie, Mail } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "privacy",
    country,
    locale: locale as Locale,
  });
}

const sections = [
  {
    icon: Database,
    title: "What we collect",
    body: "When you contact us through the website or book a Revenue Audit, we collect the information you submit — typically your name, email, company, industry, and a description of the problem you're trying to solve. We also collect basic analytics (page views, referrers, device type) to understand how the site is used.",
  },
  {
    icon: Shield,
    title: "How we use it",
    body: "We use the information you submit to respond to your inquiry, schedule a discovery session, and tailor our recommendations to your business. We do not sell, rent, or share your information with third parties for marketing.",
  },
  {
    icon: Database,
    title: "How long we keep it",
    body: "We retain inquiry data for as long as it's necessary to serve you and to comply with our legal obligations. If you'd like us to delete your data, email savingroup@gmail.com and we'll remove it within 30 days.",
  },
  {
    icon: Cookie,
    title: "Cookies",
    body: "We use minimal first-party cookies for analytics and to remember your locale preference. We do not set tracking cookies for ad networks.",
  },
  {
    icon: Shield,
    title: "Your rights",
    body: "You can request a copy of the data we hold about you, ask us to correct it, or ask us to delete it at any time. Just email the address above.",
  },
  {
    icon: Mail,
    title: "Contact",
    body: "Questions about this policy? Email savingroup@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Privacy <span className="text-accent">policy.</span>
          </>
        }
        subtitle="How Sanat Dynamo collects, uses, and protects your information."
        breadcrumb="Privacy"
      />
      <Section className="pt-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <div className="rounded-3xl border border-border bg-surface/60 p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  Last updated
                </div>
                <div className="mt-2 font-display text-xl font-semibold text-foreground">
                  April 2026
                </div>
                <div className="mt-6 border-t border-border pt-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    On this page
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {sections.map((s, i) => (
                      <li
                        key={s.title}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-strong">
                          0{i + 1}
                        </span>
                        {s.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          <article className="space-y-5 lg:col-span-8">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-3xl border border-border bg-surface/40 p-7 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-accent">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Section · 0{i + 1}
                      </div>
                      <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </article>
        </div>
      </Section>
    </>
  );
}
