import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/primitives/section";
import {
  FileSignature,
  CreditCard,
  Key,
  Lock,
  LifeBuoy,
  XCircle,
  Scale,
  Gavel,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  return buildPageMetadata({
    page: "terms",
    country,
    locale: locale as Locale,
  });
}

const sections = [
  {
    icon: FileSignature,
    title: "Engagement",
    body: "Every project starts with a free 45-minute revenue audit, then a paid Discovery Sprint and a written scope. The Sprint fee is credited in full against the build. The scope defines deliverables, timeline, success metrics, and commercials. We don't begin development until both sides have signed off.",
  },
  {
    icon: CreditCard,
    title: "Payment",
    body: "One-time projects are billed in milestones (typically 40% on kickoff, 30% mid-build, 30% on go-live). Retainers are billed monthly in advance. Invoices are payable within 7 days.",
  },
  {
    icon: Key,
    title: "Ownership",
    body: "On full payment, you own everything we build for you — code, design files, content, and configuration. We keep the right to reference the work in our portfolio and case studies (with anonymisation if you prefer).",
  },
  {
    icon: Lock,
    title: "Confidentiality",
    body: "Anything you share with us — business data, financials, customer lists, internal documents — stays confidential. We're happy to sign mutual NDAs before discovery if your industry requires it.",
  },
  {
    icon: LifeBuoy,
    title: "Support and warranties",
    body: "Every one-time project includes 90 days of post-launch support for bug fixes and minor changes. After that, ongoing improvements are covered under a retainer. We don't ghost clients.",
  },
  {
    icon: XCircle,
    title: "Termination",
    body: "Retainers can be cancelled with 30 days' notice. For one-time projects, if either party needs to walk away mid-build, the cost is settled pro rata against the work completed.",
  },
  {
    icon: Scale,
    title: "Liability",
    body: "We do our best work and stand behind it. Our total liability under any engagement is capped at the fees paid for that engagement.",
  },
  {
    icon: Gavel,
    title: "Governing law",
    body: "These terms are governed by the laws of India. Any disputes will be resolved in the courts of New Delhi.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Terms of <span className="text-accent">service.</span>
          </>
        }
        subtitle="The rules of the road when you work with Savin Group."
        breadcrumb="Terms"
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
                        Clause · 0{i + 1}
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
