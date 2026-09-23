"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Bookmark,
} from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { Reveal } from "../primitives/reveal";
import LocalizedLink from "../LocalizedLink";
import { interpolate, type Messages } from "@/lib/i18n";

type KnowMorePageKey =
  | "home"
  | "about"
  | "services"
  | "industries"
  | "caseStudies"
  | "contact";

interface KnowMoreProps {
  t: Messages;
  pageKey: KnowMorePageKey;
  pageLabel: string;
}

export function KnowMore({ t, pageKey, pageLabel }: KnowMoreProps) {
  const km = t.knowMore;
  const items = (km.pages[pageKey] ?? []) as Array<{
    id: string;
    category: string;
    readMin: number;
    title: string;
    summary: string;
    body: string[];
    keywords: string[];
  }>;
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  const titleResolved = interpolate(km.title, { page: pageLabel });

  return (
    <Section id="know-more" className="bg-surface/20">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Sticky sidebar with chapter index */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeader
              eyebrow={km.eyebrow}
              title={titleResolved}
              subtitle={km.subtitle}
            />
            <div className="mt-8 rounded-3xl border border-border bg-surface/60 p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="flex items-center gap-2 text-accent">
                  <BookOpen size={11} />
                  {km.badge}
                </span>
                <span className="text-muted-foreground">
                  {items.length} chapters
                </span>
              </div>
              <ul className="mt-5 space-y-1">
                {items.map((it, i) => {
                  const active = open === it.id;
                  return (
                    <li key={it.id}>
                      <button
                        onClick={() => setOpen(active ? null : it.id)}
                        className={`group flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                          active
                            ? "border border-accent/40 bg-accent/10 text-foreground"
                            : "border border-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                        }`}
                      >
                        <span className="flex min-w-0 items-start gap-3">
                          <span
                            className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] ${
                              active ? "text-accent" : "text-muted-foreground"
                            }`}
                          >
                            0{i + 1}
                          </span>
                          <span className="truncate">{it.title}</span>
                        </span>
                        <Clock
                          size={11}
                          className="shrink-0 text-muted-foreground"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-5 rounded-3xl border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                <Sparkles size={11} />
                Want a custom audit?
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The chapters above are general references. A free Revenue Audit
                gives you a written diagnosis specific to your business in 30
                minutes.
              </p>
              <LocalizedLink
                href="/contact"
                className="group mt-5 inline-flex items-center gap-2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-accent-foreground"
              >
                Request audit
                <ArrowUpRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </LocalizedLink>
            </div>
          </div>
        </aside>

        {/* Accordion of chapters */}
        <div className="lg:col-span-8">
          <div className="space-y-5">
            {items.map((it, i) => {
              const active = open === it.id;
              return (
                <Reveal
                  as="article"
                  delay={0.02 * i}
                  key={it.id}
                  id={`know-${it.id}`}
                  className={`group relative scroll-mt-32 overflow-hidden rounded-3xl border transition-all ${
                    active
                      ? "border-accent/40 bg-surface"
                      : "border-border bg-surface/60 hover:border-accent/30 hover:bg-surface"
                  }`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/5 blur-3xl"
                  />

                  <button
                    onClick={() => setOpen(active ? null : it.id)}
                    className="relative flex w-full items-start gap-4 p-5 text-left sm:gap-5 sm:p-8"
                    aria-expanded={active}
                  >
                    {/* Chapter number */}
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border font-display text-lg font-semibold transition-colors ${
                          active
                            ? "border-accent/60 bg-accent-strong text-accent-foreground"
                            : "border-border bg-background text-accent"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -inset-2 -z-10 rounded-3xl bg-accent/20 blur-xl"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                          {it.category}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          <Clock size={11} />
                          {interpolate(km.readingTime, { n: it.readMin })}
                        </span>
                      </div>
                      <h3 className="text-balance mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                        {it.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {it.summary}
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: active ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        active
                          ? "border-accent/60 bg-accent/10 text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/60 bg-background/40 px-7 pb-8 pt-6 sm:px-8">
                          {/* Article body */}
                          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                            {it.body.map((p, k) => (
                              <p
                                key={k}
                                className={
                                  k === 0
                                    ? "text-pretty text-foreground/90"
                                    : "text-pretty"
                                }
                              >
                                {p}
                              </p>
                            ))}
                          </div>

                          {/* SEO keywords as chips */}
                          <div className="mt-6 border-t border-border pt-5">
                            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                              <Bookmark size={10} className="text-accent" />
                              Topics in this chapter
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {it.keywords.map((kw) => (
                                <span
                                  key={kw}
                                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4">
                            <div className="text-sm text-foreground">
                              Want this applied to{" "}
                              <span className="font-semibold text-accent">
                                your business
                              </span>
                              ?
                            </div>
                            <LocalizedLink
                              href="/contact"
                              className="group inline-flex items-center gap-2 rounded-full bg-accent-strong px-5 py-2 text-xs font-semibold text-accent-foreground"
                            >
                              Free Revenue Audit
                              <ArrowUpRight
                                size={12}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />
                            </LocalizedLink>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
