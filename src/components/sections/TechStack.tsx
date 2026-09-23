"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { OrbitConstellation } from "../illustrations";
import type { Messages } from "@/lib/i18n";

export function TechStack({ t }: { t: Messages }) {
  const ts = t.techStack;
  return (
    <Section id="tech-stack">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow={ts.eyebrow}
            title={ts.title}
            subtitle={ts.subtitle}
            meta={`${ts.items.length} tools`}
          />

          <div className="mt-10 rounded-3xl border border-border bg-surface/40 p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <Layers size={11} />
              Why we choose boring
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every tool on the right is something your team can hire for, your
              investors recognize, and your future self won&apos;t curse. We
              don&apos;t chase trends — we ship systems that compound for years.
            </p>
          </div>

          {/* Orbital tech constellation diagram */}
          <div className="mt-8 hidden lg:block">
            <OrbitConstellation className="mx-auto max-w-[300px]" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ts.items.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: (i % 8) * 0.04 }}
                className="group relative flex h-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface/60 px-3 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 transition-opacity duration-500 group-hover:from-accent/10 group-hover:opacity-100" />
                <span className="relative text-center font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  {name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
