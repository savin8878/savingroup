"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Database,
  Handshake,
  Layers,
  MessageCircle,
  Package,
  Radar,
  Sparkles,
  Target,
  Users,
  Wifi,
} from "lucide-react";
import type { CityOrganization } from "@/lib/city-organization";
import type { CityIdentity } from "@/lib/city-identity";

/**
 * Visualizations of how Savin Group operates inside each metro.
 *
 *   - PresenceOrbit       — animated orbit of remote HQ + on-site visit cadence
 *   - EngagementJourney   — 4-phase animated timeline (discovery → compound)
 *   - StackBlueprint      — architectural diagram of the tools we deploy
 *   - CadenceClock        — weekly comm-rhythm clock (M-T-W-T-F-S-S)
 *   - ProofGrid           — 4 quantified outcomes specific to this metro
 *   - CommercialPosture   — billing / GST / TDS terms surfaced clearly
 *
 * Together these tell the story SEO needs ("how to work with Savin Group
 * in {city}") and conversion needs ("what does delivery actually look like
 * here").
 */

const draw = (delay = 0, duration = 1) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration, delay, ease: "easeInOut" as const },
      opacity: { duration: 0.25, delay },
    },
  },
});

const pop = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay, type: "spring" as const, stiffness: 180, damping: 14 },
  },
});

/* -------------------------------------------------------------------------- */
/*                              PresenceOrbit                                  */
/* -------------------------------------------------------------------------- */

/**
 * Visualises remote HQ + on-site cadence as an orbital diagram. The
 * presenceModel drives the animation tempo — site-visit models orbit
 * faster than remote-first models, signalling the cadence visually.
 */
export function PresenceOrbit({
  org,
  identity,
  cityName,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
  cityName: string;
}) {
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";
  const accent = identity?.themeColorAccent ?? "oklch(0.66 0.18 295)";

  // Orbital tempo by presence model
  const orbitDuration =
    org.presenceModel === "site-visit"
      ? 14
      : org.presenceModel === "hybrid-onsite"
        ? 20
        : 28;

  const modelLabel = {
    "remote-first": "Remote-first delivery",
    "hybrid-onsite": "Hybrid · monthly site-visits",
    "site-visit": "On-site cadence · weekly visits",
  }[org.presenceModel];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
      style={{
        borderColor: themeColor.replace(")", " / 0.3)"),
        background: `linear-gradient(140deg, ${themeColor.replace(")", " / 0.06)")}, transparent 70%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: themeColor.replace(")", " / 0.18)") }}
      />

      <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{
              borderColor: themeColor.replace(")", " / 0.4)"),
              background: themeColor.replace(")", " / 0.08)"),
              color: themeColor,
            }}
          >
            <Radar size={11} />
            Operating model · {cityName}
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            {modelLabel}.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {org.presenceTagline}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <Users size={10} />
                Languages
              </div>
              <div className="mt-1 text-xs font-semibold text-foreground">
                {org.languages.join(" · ")}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <Clock size={10} />
                Hours
              </div>
              <div className="mt-1 text-xs font-semibold text-foreground">
                {org.hours}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              <Building size={10} />
              On-site cadence
            </div>
            <div className="mt-1 text-xs leading-relaxed text-foreground">
              {org.onSiteCadence}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <PresenceOrbitSVG
            cityName={cityName}
            themeColor={themeColor}
            accent={accent}
            orbitDuration={orbitDuration}
          />
        </div>
      </div>
    </div>
  );
}

function PresenceOrbitSVG({
  cityName,
  themeColor,
  accent,
  orbitDuration,
}: {
  cityName: string;
  themeColor: string;
  accent: string;
  orbitDuration: number;
}) {
  const cx = 200;
  const cy = 180;

  // Visit nodes around the orbit — each represents a touch-point
  const visits = [
    { angle: 0, label: "FRI · DEMO", radius: 110 },
    { angle: 60, label: "TUE · SITE", radius: 120 },
    { angle: 120, label: "MON · STANDUP", radius: 110 },
    { angle: 180, label: "WED · QA", radius: 130 },
    { angle: 240, label: "SAT · ON-CALL", radius: 110 },
    { angle: 300, label: "THU · STAGING", radius: 120 },
  ];

  return (
    <motion.svg
      viewBox="0 0 400 360"
      className="h-auto w-full max-w-[520px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <defs>
        <radialGradient id="presence-core" cx="50%" cy="50%">
          <stop offset="0%" stopColor={themeColor.replace(")", " / 0.4)")} />
          <stop offset="100%" stopColor={themeColor.replace(")", " / 0)")} />
        </radialGradient>
      </defs>

      {/* outer & inner orbit rings */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="130"
        stroke={themeColor.replace(")", " / 0.25)")}
        strokeWidth="0.6"
        strokeDasharray="3 6"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: orbitDuration * 1.4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r="110"
        stroke={themeColor.replace(")", " / 0.3)")}
        strokeWidth="0.8"
        strokeDasharray="2 5"
        fill="none"
        animate={{ rotate: -360 }}
        transition={{ duration: orbitDuration, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* core glow */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="55"
        fill="url(#presence-core)"
        animate={{ r: [50, 60, 50], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* core hub — city name */}
      <circle
        cx={cx}
        cy={cy}
        r="38"
        fill="var(--svg-node-fill)"
        stroke={themeColor.replace(")", " / 0.55)")}
        strokeWidth="1.4"
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        letterSpacing="0.18em"
        fill={themeColor}
        fontWeight="700"
      >
        {cityName.toUpperCase()}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6"
        letterSpacing="0.12em"
        fill="var(--muted-foreground)"
      >
        BUILD HUB
      </text>

      {/* visit nodes */}
      {visits.map((v, i) => {
        const rad = (v.angle * Math.PI) / 180;
        const x = cx + v.radius * Math.cos(rad);
        const y = cy + v.radius * Math.sin(rad);
        return (
          <motion.g
            key={`v-${i}`}
            variants={pop(0.4 + i * 0.08)}
          >
            {/* connector */}
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={themeColor.replace(")", " / 0.18)")}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            {/* node */}
            <circle
              cx={x}
              cy={y}
              r="14"
              fill="var(--svg-node-fill)"
              stroke={themeColor.replace(")", " / 0.5)")}
              strokeWidth="1"
            />
            <motion.circle
              cx={x}
              cy={y}
              r="14"
              fill="none"
              stroke={themeColor.replace(")", " / 0.4)")}
              strokeWidth="0.6"
              animate={{ r: [12, 18, 12], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            />
            <text
              x={x}
              y={y + 2}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="5.5"
              fill={themeColor}
              fontWeight="600"
            >
              0{i + 1}
            </text>
            {/* label outside */}
            <text
              x={x + Math.cos(rad) * 24}
              y={y + Math.sin(rad) * 24 + 2}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6.5"
              fill="var(--foreground)"
            >
              {v.label}
            </text>
          </motion.g>
        );
      })}

      {/* travelling delivery particles */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={`p-${i}`}
          r="2.5"
          fill={accent}
          animate={{
            cx: visits.map((v) => cx + v.radius * Math.cos((v.angle * Math.PI) / 180)),
            cy: visits.map((v) => cy + v.radius * Math.sin((v.angle * Math.PI) / 180)),
            opacity: [0, 1, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: orbitDuration / 2,
            repeat: Infinity,
            delay: i * (orbitDuration / 6),
            ease: "linear",
          }}
        />
      ))}
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                            EngagementJourney                                */
/* -------------------------------------------------------------------------- */

/**
 * 4-phase scroll-progressed timeline. Each phase reveals on its own row
 * with the city-specific note as the editorial differentiator.
 */
export function EngagementJourney({
  org,
  identity,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";

  const phaseIcons = [Target, Layers, Briefcase, Sparkles];

  return (
    <div ref={containerRef} className="relative">
      {/* progress rail */}
      <div
        aria-hidden
        className="absolute left-5 top-0 hidden h-full w-px bg-border lg:block"
      />
      <motion.div
        aria-hidden
        style={{ height: railHeight, background: themeColor }}
        className="absolute left-5 top-0 hidden w-px lg:block"
      />

      <div className="space-y-10 sm:space-y-14 lg:pl-16">
        {org.engagement.map((phase, i) => {
          const Icon = phaseIcons[i] ?? Target;
          return (
            <motion.article
              key={phase.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="relative scroll-mt-32"
            >
              {/* rail dot */}
              <div className="absolute -left-[60px] top-2 hidden lg:block">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-background"
                  style={{
                    borderColor: themeColor.replace(")", " / 0.5)"),
                    color: themeColor,
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: themeColor }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  />
                </motion.div>
              </div>

              <div
                className="rounded-3xl border bg-surface/40 p-5 transition-colors hover:border-accent/40 sm:p-6"
                style={{
                  borderColor: themeColor.replace(")", " / 0.2)"),
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <div
                      className="font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: themeColor }}
                    >
                      Phase 0{i + 1} · {phase.duration}
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {phase.name}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
                  {phase.mission}
                </p>

                {/* Artefacts */}
                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {phase.artefacts.map((a) => (
                    <div
                      key={a}
                      className="flex items-start gap-2 rounded-xl border border-border bg-background/70 p-3 text-xs leading-relaxed text-foreground"
                    >
                      <CheckCircle2
                        size={12}
                        className="mt-0.5 shrink-0"
                        style={{ color: themeColor }}
                      />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>

                {/* City-specific note */}
                {phase.cityNote && (
                  <div
                    className="mt-4 rounded-2xl border-l-4 bg-background/40 p-4"
                    style={{ borderColor: themeColor }}
                  >
                    <div
                      className="font-mono text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: themeColor }}
                    >
                      What this looks like here
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      {phase.cityNote}
                    </p>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              StackBlueprint                                 */
/* -------------------------------------------------------------------------- */

/**
 * The tooling we deploy in this metro, rendered as a stacked architectural
 * diagram. Each layer is a category, with the tool list and city-specific
 * note. Layers reveal from the bottom up.
 */
export function StackBlueprint({
  org,
  identity,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
}) {
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";

  const categoryIcons: Record<string, typeof Database> = {
    Communication: MessageCircle,
    Payments: Briefcase,
    "Payments + checkout": Briefcase,
    "CRM + lifecycle": Handshake,
    Compliance: CheckCircle2,
    Analytics: Radar,
    "Lead routing": Target,
    "Portal integration": Wifi,
    "EdTech payments": Briefcase,
    "Channel-partner": Users,
    "Marketing site": Layers,
    "Programmatic SEO": Layers,
    "ERP integration": Database,
    "Dealer portal": Users,
    "GST + e-invoicing": CheckCircle2,
    "Shop-floor mobile": Wifi,
    "Bilingual content": MessageCircle,
    "Healthcare booking": Briefcase,
    "Auto-component portals": Database,
    "Reviews + retention": Sparkles,
    "Compliance + quality": CheckCircle2,
    "Procurement routing": Target,
    "Multilingual datasheets": Layers,
    "Saas / IT corridor": Briefcase,
    "Defence-grade": CheckCircle2,
    "Conversion-first CTAs": Target,
    "Bilingual flows": MessageCircle,
    "Legacy ERP integration": Database,
    "Education + finance": Briefcase,
    "WhatsApp commerce": MessageCircle,
    "Vernacular flows": MessageCircle,
    "Tally migration": Database,
    "Diamonds + GIFT City": Sparkles,
    "Provenance + schema": Sparkles,
    "NRI checkout": Briefcase,
    Storefront: Package,
    "Gem trade ops": Sparkles,
    "Tracker UI": Wifi,
    "Carrier integration": Wifi,
    "Lane content (SEO)": Layers,
    "Manufacturing (Pithampur)": Database,
    "Procurement-ready content": Target,
    Listings: Layers,
    "Bilingual outreach": MessageCircle,
    "Education + research": Briefcase,
    "Heritage-tourism (Sanchi)": Sparkles,
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border bg-surface/40 p-6 sm:p-8"
      style={{ borderColor: themeColor.replace(")", " / 0.25)") }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full blur-3xl"
        style={{ background: themeColor.replace(")", " / 0.12)") }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
             style={{ color: themeColor }}>
          <Layers size={11} />
          Local stack signature
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          The tools we deploy here, ranked.
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each layer maps to a real revenue lever. We keep the stack opinionated
          — every tool earns its place.
        </p>

        <div className="mt-7 grid gap-3 lg:grid-cols-2">
          {org.stack.map((layer, i) => {
            const Icon = categoryIcons[layer.category] ?? Database;
            return (
              <motion.div
                key={layer.category}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 sm:p-5"
              >
                {/* layer index strip */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    background: `linear-gradient(180deg, ${themeColor.replace(")", " / 0.6)")}, ${themeColor.replace(")", " / 0)")})`,
                  }}
                />
                <div className="flex items-start gap-3 pl-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: themeColor.replace(")", " / 0.4)"),
                      background: themeColor.replace(")", " / 0.08)"),
                      color: themeColor,
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-display text-base font-semibold tracking-tight text-foreground">
                        {layer.category}
                      </h4>
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.18em]"
                        style={{ color: themeColor }}
                      >
                        L{String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {layer.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-md border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {layer.cityNote}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CadenceClock                                   */
/* -------------------------------------------------------------------------- */

/**
 * Weekly comm cadence visualised as an arc of days. Each day shows its
 * ritual + channel. The current weekday gets emphasised on the visualization
 * (server-rendered via Date — best-effort, fine for visual accent).
 */
export function CadenceClock({
  org,
  identity,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
}) {
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";

  return (
    <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{
              borderColor: themeColor.replace(")", " / 0.4)"),
              background: themeColor.replace(")", " / 0.08)"),
              color: themeColor,
            }}
          >
            <Clock size={11} />
            Weekly cadence
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            How a typical week runs.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Predictable rhythm with one rule: every Friday demos. Async by
            default; on-site when the city demands it.
          </p>

          <CadenceClockSVG cadence={org.cadence} themeColor={themeColor} />
        </div>

        <div className="lg:col-span-7">
          <ol className="space-y-2">
            {org.cadence.map((c, i) => (
              <motion.li
                key={c.day}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold uppercase"
                  style={{
                    background: themeColor.replace(")", " / 0.1)"),
                    color: themeColor,
                  }}
                >
                  {c.day}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {c.ritual}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {c.channel}
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function CadenceClockSVG({
  cadence,
  themeColor,
}: {
  cadence: CityOrganization["cadence"];
  themeColor: string;
}) {
  const cx = 110;
  const cy = 110;
  const r = 70;
  const N = cadence.length;

  return (
    <svg viewBox="0 0 220 220" className="mt-6 h-auto w-full max-w-[220px]" aria-hidden>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={themeColor.replace(")", " / 0.2)")}
        strokeWidth="0.8"
        strokeDasharray="2 4"
      />
      {cadence.map((c, i) => {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <motion.g
            key={c.day}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 180 }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={themeColor.replace(")", " / 0.18)")}
              strokeWidth="0.5"
            />
            <circle
              cx={x}
              cy={y}
              r="14"
              fill="var(--svg-node-fill)"
              stroke={themeColor.replace(")", " / 0.5)")}
              strokeWidth="1"
            />
            <text
              x={x}
              y={y + 2}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6.5"
              fontWeight="700"
              fill={themeColor}
            >
              {c.day.toUpperCase()}
            </text>
          </motion.g>
        );
      })}
      <circle cx={cx} cy={cy} r="6" fill={themeColor} />
      <motion.circle
        cx={cx}
        cy={cy}
        r="14"
        fill="none"
        stroke={themeColor.replace(")", " / 0.4)")}
        strokeWidth="0.8"
        animate={{ r: [10, 18, 10], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ProofGrid                                    */
/* -------------------------------------------------------------------------- */

export function ProofGrid({
  org,
  identity,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
}) {
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {org.proofPoints.map((p, i) => (
        <motion.div
          key={p.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.07, duration: 0.45 }}
          className="group relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-opacity group-hover:opacity-100"
            style={{ background: themeColor.replace(")", " / 0.1)") }}
          />
          <div className="relative">
            <div
              className="font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{ color: themeColor }}
            >
              Proof · 0{i + 1}
            </div>
            <div
              className="mt-3 font-display text-3xl font-semibold leading-none tracking-tight"
              style={{ color: themeColor }}
            >
              {p.metric}
            </div>
            <div className="mt-2 text-sm leading-snug text-foreground">
              {p.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CommercialPosture                                */
/* -------------------------------------------------------------------------- */

export function CommercialPosture({
  org,
  identity,
}: {
  org: CityOrganization;
  identity: CityIdentity | undefined;
}) {
  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";

  return (
    <div
      className="rounded-3xl border bg-surface/40 p-5 sm:p-6"
      style={{ borderColor: themeColor.replace(")", " / 0.3)") }}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
           style={{ color: themeColor }}>
        <Briefcase size={11} />
        Commercial posture
      </div>
      <ul className="mt-4 space-y-2.5">
        {org.commercialNotes.map((note) => (
          <li
            key={note}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
          >
            <CheckCircle2
              size={13}
              className="mt-0.5 shrink-0"
              style={{ color: themeColor }}
            />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
