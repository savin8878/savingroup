"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import {
  Factory,
  Building2,
  Stethoscope,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import LocalizedLink from "../LocalizedLink";

/**
 * Visualizations specific to the /industries hub page.
 * Built around the 5-sector pivot (manufacturing, real-estate, healthcare,
 * ecommerce, edtech). Heavy use of framer-motion for scroll-driven animation.
 */

type IndustryNode = {
  slug: string;
  name: string;
  icon: LucideIcon;
  color: string; // oklch base
  angle: number; // degrees
  metric: string;
  metricLabel: string;
};

const HUB_NODES: IndustryNode[] = [
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    color: "oklch(0.78 0.165 70)",
    angle: -90,
    metric: "−80%",
    metricLabel: "manual entry",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: Building2,
    color: "oklch(0.66 0.18 295)",
    angle: -18,
    metric: "3–5x",
    metricLabel: "qualified leads",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    color: "oklch(0.74 0.16 155)",
    angle: 54,
    metric: "−25%",
    metricLabel: "no-show rate",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    icon: ShoppingBag,
    color: "oklch(0.65 0.22 25)",
    angle: 126,
    metric: "+3%",
    metricLabel: "CVR lift",
  },
  {
    slug: "edtech",
    name: "Coaching",
    icon: GraduationCap,
    color: "oklch(0.66 0.18 295)",
    angle: 198,
    metric: "3–4x",
    metricLabel: "enrollments",
  },
];

/* -------------------------------------------------------------------------- */
/*                          IndustryConstellation                              */
/* -------------------------------------------------------------------------- */

/**
 * Interactive hero visualization for the /industries hub.
 * Five sector nodes orbit a central revenue-system core. Hover any node to
 * highlight the data-flow path from core to that sector. Animated dashed
 * orbit + drifting particles signal continuous operations.
 */
export function IndustryConstellation({
  countryHint,
}: {
  countryHint?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  const radius = 150;

  return (
    <div
      ref={containerRef}
      className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface/40"
    >
      {/* faint dotted grid bg */}
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" />
      <motion.div
        aria-hidden
        style={{ y: parallax }}
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: useTransform(scrollYProgress, [0, 1], [40, -40]) }}
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.66_0.18_295/0.15)] blur-3xl"
      />

      <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            5 sectors · live build map
          </div>
          <h2 className="text-balance mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-[3rem]">
            One revenue system,
            <br />
            <span className="bg-gradient-to-br from-foreground via-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
              tuned per industry.
            </span>
          </h2>
          <p className="text-pretty mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every line in the diagram is a data-flow we&apos;ve actually shipped:
            shop-floor production logs into ERP, portal leads into CRM in under
            5 minutes, WhatsApp recall into clinic EMR. Click any sector to see
            what we build there.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {HUB_NODES.map((n, i) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.slug}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <LocalizedLink
                    href={`/industries/${n.slug}`}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background/60 p-2.5 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border"
                      style={{ color: n.color }}
                    >
                      <Icon size={14} strokeWidth={1.75} />
                    </span>
                    <span className="text-center text-[10px] font-semibold leading-tight text-foreground">
                      {n.name}
                    </span>
                  </LocalizedLink>
                </motion.div>
              );
            })}
          </div>

          {countryHint && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
              <Sparkles size={11} />
              {countryHint}
            </div>
          )}
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center lg:col-span-7 lg:min-h-[480px]">
          <ConstellationSVG radius={radius} scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </div>
  );
}

function ConstellationSVG({
  radius,
  scrollYProgress,
}: {
  radius: number;
  scrollYProgress: MotionValue<number>;
}) {
  const cx = 200;
  const cy = 200;

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="h-full w-full max-w-[520px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        <radialGradient id="hub-core-grad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.4)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70 / 0)" />
        </radialGradient>
        <filter id="hub-glow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {HUB_NODES.map((n) => (
          <linearGradient
            key={n.slug}
            id={`flow-${n.slug}`}
            gradientUnits="userSpaceOnUse"
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos((n.angle * Math.PI) / 180)}
            y2={cy + radius * Math.sin((n.angle * Math.PI) / 180)}
          >
            <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.55)" />
            <stop
              offset="100%"
              stopColor={n.color.replace(")", " / 0.45)")}
            />
          </linearGradient>
        ))}
      </defs>

      {/* core radial glow */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="65"
        fill="url(#hub-core-grad)"
        animate={{ r: [60, 75, 60], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* outer rotating orbit ring */}
      <motion.g style={{ rotate, transformOrigin: `${cx}px ${cy}px` }}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="var(--svg-line-faint)"
          strokeWidth="1"
          strokeDasharray="3 7"
          fill="none"
        />
      </motion.g>

      {/* secondary inner orbit */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="95"
        stroke="var(--svg-grid-line)"
        strokeWidth="0.6"
        strokeDasharray="2 5"
        fill="none"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* flow paths from core to each node */}
      {HUB_NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        return (
          <motion.line
            key={n.slug}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={`url(#flow-${n.slug})`}
            strokeWidth="1.2"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.3 + i * 0.12 }}
          />
        );
      })}

      {/* drifting particles along each flow */}
      {HUB_NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        return (
          <motion.circle
            key={`p-${n.slug}`}
            r="2.6"
            fill={n.color}
            filter="url(#hub-glow)"
            animate={{ cx: [cx, x], cy: [cy, y], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* central hub */}
      <circle
        cx={cx}
        cy={cy}
        r="42"
        fill="var(--svg-node-fill)"
        stroke="oklch(0.78 0.165 70 / 0.5)"
        strokeWidth="1.4"
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r="42"
        fill="none"
        stroke="oklch(0.78 0.165 70 / 0.35)"
        strokeWidth="1"
        animate={{ r: [42, 56, 42], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="0.18em"
        fill="oklch(0.78 0.165 70 / 0.7)"
      >
        Savin Group
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6.5"
        letterSpacing="0.12em"
        fill="var(--muted-foreground)"
      >
        REVENUE SYSTEM
      </text>
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="11"
        fontWeight="700"
        fill="oklch(0.78 0.165 70 / 0.85)"
      >
        + WHATSAPP · SEO
      </text>

      {/* sector nodes */}
      {HUB_NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        const labelOffsetX = Math.cos(rad) * 36;
        const labelOffsetY = Math.sin(rad) * 36;
        return (
          <motion.g
            key={n.slug}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.5 + i * 0.12,
              type: "spring",
              stiffness: 180,
              damping: 14,
            }}
          >
            <circle
              cx={x}
              cy={y}
              r="22"
              fill="var(--svg-node-fill)"
              stroke={n.color}
              strokeWidth="1.4"
            />
            <motion.circle
              cx={x}
              cy={y}
              r="22"
              fill="none"
              stroke={n.color.replace(")", " / 0.4)")}
              strokeWidth="0.8"
              animate={{ r: [22, 32, 22], opacity: [0.35, 0, 0.35] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
            <text
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              letterSpacing="0.05em"
              fill={n.color}
            >
              0{i + 1}
            </text>
            {/* sector label outside the node */}
            <text
              x={x + labelOffsetX}
              y={y + labelOffsetY - 2}
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="11"
              fontWeight="600"
              fill="var(--foreground)"
            >
              {n.name}
            </text>
            <text
              x={x + labelOffsetX}
              y={y + labelOffsetY + 9}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6.5"
              fill={n.color}
            >
              {n.metric} · {n.metricLabel}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                          WhyPerIndustryMatrix                              */
/* -------------------------------------------------------------------------- */

type MatrixRow = {
  dimension: string;
  generic: string;
  ours: string;
};

const MATRIX_ROWS: MatrixRow[] = [
  {
    dimension: "Data model",
    generic: "Standard CRM contacts and deals",
    ours: "Multi-level BOM, RERA project, EMR, SKU tree",
  },
  {
    dimension: "Workflow surface",
    generic: "Desktop dashboard, English UI",
    ours: "Phone-first, 2G-friendly, regional language",
  },
  {
    dimension: "Lead-to-revenue",
    generic: "Form fill → CRM → email drip",
    ours: "Portal lead → 5-min routing → WhatsApp Business → site visit",
  },
  {
    dimension: "Compliance built-in",
    generic: "Generic privacy + GDPR toggles",
    ours: "GST e-invoicing, RERA, DPDP Act 2023, KYC",
  },
  {
    dimension: "SEO surface",
    generic: "Blog template, generic keywords",
    ours: "Locality + intent pages: '3BHK in Wakad', 'dentist near me'",
  },
];

export function WhyPerIndustryMatrix() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
      />
      <div className="relative">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <Sparkles size={11} />
              Why per-industry
            </div>
            <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl">
              A generic CRM doesn&apos;t know your{" "}
              <span className="bg-gradient-to-br from-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
                shop floor
              </span>
              . We don&apos;t build generic.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every column on the right is a deliberate trade-off. Where SaaS
              vendors picked a horizontal feature, we picked the way Indian SME
              buyers and operators actually behave.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-border bg-background/60">
              <div className="grid grid-cols-12 border-b border-border bg-surface/60 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:px-5">
                <div className="col-span-4">Dimension</div>
                <div className="col-span-4 flex items-center gap-1.5">
                  <X size={11} className="text-danger" />
                  Generic SaaS
                </div>
                <div className="col-span-4 flex items-center gap-1.5 text-accent">
                  <Check size={11} strokeWidth={3} />
                  Sanat build
                </div>
              </div>
              {MATRIX_ROWS.map((row, i) => (
                <motion.div
                  key={row.dimension}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="grid grid-cols-12 items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:px-5"
                >
                  <div className="col-span-4 text-sm font-semibold text-foreground">
                    {row.dimension}
                  </div>
                  <div className="col-span-4 text-xs leading-relaxed text-muted-foreground line-through decoration-danger/40 sm:text-sm">
                    {row.generic}
                  </div>
                  <div className="col-span-4 text-xs leading-relaxed text-foreground sm:text-sm">
                    <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-accent">
                      {row.ours}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
