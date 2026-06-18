"use client";

import React, { useRef, useState } from "react";
import { StickyScrollLayout } from "../primitives/StickyScrollLayout";
import { Section, SectionHeader, Eyebrow } from "../primitives/section";
import { Problem } from "./Problem";
import { Approach } from "./Approach";
import { Services } from "./Services";
import { FeatureGrid } from "./FeatureGrid";
import { Industries } from "./Industries";
import { BigNumbers } from "./BigNumbers";
import { CaseStudies } from "./CaseStudies";
import type { Messages } from "@/lib/i18n";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Search, Map, Hammer, TrendingUp, Check, ArrowDown, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function StrategyHub({ t, country }: { t: Messages; country?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const phases = [
    { label: t.problem.eyebrow, icon: Search },
    { label: t.approach.eyebrow, icon: Sparkles },
    { label: t.featureGrid.eyebrow, icon: Layers },
    { label: t.services.eyebrow, icon: ShieldCheck },
  ];

  return (
    <Section id="strategy-hub" className="bg-surface/10 !py-0 overflow-visible">
      <div ref={containerRef} className="container-px mx-auto max-w-7xl relative">
        <StickyScrollLayout
          className="py-24"
          leftContent={
            <div className="space-y-8 pr-12">
              <div className="space-y-6">
                <Eyebrow variant="accent">The Strategy Hub</Eyebrow>
                <h2 className="text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground lg:text-6xl">
                  Everything you need to <span className="text-accent">scale revenue.</span>
                </h2>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                  We build revenue systems that work while you sleep. Scroll to see the core models behind our success.
                </p>
              </div>

              <div className="relative mt-12 pl-6">
                {/* Progress Line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
                  <motion.div 
                    className="absolute top-0 left-0 w-full bg-accent origin-top"
                    style={{ scaleY }}
                  />
                </div>
                
                <nav className="space-y-8">
                  {phases.map((item, i) => {
                    const isActive = activePhase === i;
                    return (
                      <div key={item.label} className={cn(
                        "group relative flex items-start gap-4 transition-all duration-500",
                        isActive ? "opacity-100 translate-x-2" : "opacity-40 hover:opacity-70"
                      )}>
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-500",
                          isActive ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-muted-foreground"
                        )}>
                          <item.icon size={14} />
                        </div>
                        <div className="pt-1">
                          <div className={cn(
                            "font-mono text-[9px] uppercase tracking-[0.22em] transition-colors",
                            isActive ? "text-accent" : "text-muted-foreground"
                          )}>Phase 0{i + 1}</div>
                          <div className={cn(
                            "text-sm font-bold uppercase tracking-widest transition-colors",
                            isActive ? "text-foreground" : "text-muted-foreground"
                          )}>{item.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </div>
              
              <div className="pt-12">
                <div className="flex items-center gap-3 text-xs font-medium text-accent animate-bounce">
                  <ArrowDown size={14} />
                  <span>Keep scrolling</span>
                </div>
              </div>
            </div>
          }
          rightContent={
            <div className="space-y-24 lg:space-y-48 pb-24">
              {[
                <Problem t={t} noPadding={true} />,
                <Approach t={t} noPadding={true} />,
                <FeatureGrid t={t} noPadding={true} />,
                <Services t={t} country={country} noPadding={true} />
              ].map((comp, i) => (
                <motion.div 
                  key={i}
                  onViewportEnter={() => setActivePhase(i)}
                  viewport={{ amount: 0.5 }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-border bg-background/50 backdrop-blur-md p-6 lg:p-12 shadow-2xl relative"
                >
                  {comp}
                </motion.div>
              ))}
            </div>
          }
        />
      </div>
    </Section>
  );
}

export function ImpactHub({ t, country }: { t: Messages; country?: string }) {
  return (
    <Section id="impact-hub" className="bg-background !py-0 border-t border-border">
      <div className="container-px mx-auto max-w-7xl">
        <StickyScrollLayout
          className="py-24"
          leftContent={
            <div className="space-y-6 pr-12">
              <Eyebrow variant="default">Proof of Impact</Eyebrow>
              <h2 className="text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground lg:text-6xl">
                Real numbers. <span className="text-accent">Real stories.</span>
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                Our track record across industries, quantified by the only metric that matters: revenue growth.
              </p>
              
              <div className="mt-12 p-6 rounded-2xl border border-border bg-surface/50">
                 <div className="flex items-center gap-3 text-accent font-bold text-2xl font-display">
                    <TrendingUp size={24} />
                    <span>₹40Cr+</span>
                 </div>
                 <p className="mt-2 text-sm text-muted-foreground">Client revenue impacted across 5 industries.</p>
              </div>
            </div>
          }
          rightContent={
            <div className="space-y-32">
              <div className="space-y-24">
                <Industries t={t} country={country} noPadding={true} />
                <BigNumbers t={t} noPadding={true} />
              </div>
              <div className="pt-24 border-t border-border">
                <CaseStudies t={t} country={country} noPadding={true} />
              </div>
            </div>
          }
        />
      </div>
    </Section>
  );
}

export function ProcessStepper({ t }: { t: Messages }) {
  const stepIcons = [Search, Map, Hammer, TrendingUp];
  return (
    <Section id="process-stepper" className="bg-surface/5">
      <SectionHeader
        eyebrow={t.process.eyebrow}
        title={t.process.title}
        subtitle={t.process.subtitle}
        align="center"
        className="mb-24"
      />
      
      <div className="grid gap-12 lg:grid-cols-4 relative">
        {/* Horizontal line on desktop */}
        <div className="absolute top-[52px] left-0 right-0 h-px bg-border hidden lg:block" />
        
        {t.process.steps.map((step, i) => {
          const Icon = stepIcons[i] ?? Search;
          return (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-background shadow-lg group-hover:border-accent/40 group-hover:shadow-accent/5 transition-all duration-500 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent font-mono text-xl font-bold">
                    {step.number}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                    {step.duration}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    {step.name}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground max-w-sm mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
