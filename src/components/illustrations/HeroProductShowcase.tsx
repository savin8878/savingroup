"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

/**
 * HeroProductShowcase — the hero's centrepiece.
 *
 * A browser window containing the revenue console we build for clients:
 * a live pipeline chart that scrolls, a value that ticks up, KPI tiles, a
 * lead table that receives new rows, and a WhatsApp auto-reply toast on a
 * loop. It is a mockup, not a screenshot, so it adapts to theme, locale
 * direction and the visitor's market.
 *
 * Motion budget: two intervals (chart + counter at 900ms, lead rotation at
 * 4.2s) and CSS keyframes for the toast. Everything else is transform-only.
 * All of it stops under `prefers-reduced-motion: reduce`.
 */

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const POINTS = 30; // visible samples; one more is held off-canvas
const CHART_W = 480;
const CHART_H = 96;
const TICK_MS = 900;
const LEAD_MS = 4200;
const ROW_H = 52; // px, must match the row's `h-13`

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Market formatting                                                   */
/* ------------------------------------------------------------------ */

type Money = { symbol: string; style: "in" | "intl"; unit: number };

/** `unit` scales the whole mockup so the figures read plausibly per market. */
const MONEY: Record<string, Money> = {
  in: { symbol: "₹", style: "in", unit: 10000 },
  ae: { symbol: "AED ", style: "intl", unit: 3000 },
  sa: { symbol: "SAR ", style: "intl", unit: 3000 },
  gb: { symbol: "£", style: "intl", unit: 900 },
  de: { symbol: "€", style: "intl", unit: 1000 },
  fr: { symbol: "€", style: "intl", unit: 1000 },
  es: { symbol: "€", style: "intl", unit: 1000 },
  nl: { symbol: "€", style: "intl", unit: 1000 },
  ca: { symbol: "C$", style: "intl", unit: 1300 },
  au: { symbol: "A$", style: "intl", unit: 1500 },
  sg: { symbol: "S$", style: "intl", unit: 1300 },
};
const MONEY_DEFAULT: Money = { symbol: "$", style: "intl", unit: 1000 };

/** Indian digit grouping: last three, then pairs. 4280000 -> 42,80,000 */
function groupIndian(n: number) {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  const head = s.slice(0, -3);
  const tail = s.slice(-3);
  return head.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + tail;
}

function groupIntl(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMoney(n: number, m: Money) {
  return m.symbol + (m.style === "in" ? groupIndian(n) : groupIntl(n));
}

/** Short form for table cells: ₹2.4L / $24k. */
function compactMoney(n: number, m: Money) {
  if (m.style === "in") {
    if (n >= 10000000) return `${m.symbol}${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `${m.symbol}${(n / 100000).toFixed(1)}L`;
    return `${m.symbol}${Math.round(n / 1000)}K`;
  }
  if (n >= 1000000) return `${m.symbol}${(n / 1000000).toFixed(1)}M`;
  return `${m.symbol}${Math.round(n / 1000)}k`;
}

/* ------------------------------------------------------------------ */
/* Deterministic seed data                                             */
/* ------------------------------------------------------------------ */

/**
 * A tiny LCG. The first paint has to be byte-identical on the server and
 * the client, so the seed series cannot come from Math.random().
 */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const clamp01 = (v: number) => Math.min(0.96, Math.max(0.1, v));

function seedSeries(n: number) {
  const rnd = lcg(20260922);
  const out: number[] = [];
  let wander = 0;
  for (let i = 0; i < n; i++) {
    // Bounded wander over a steady climb: volatile enough to look like real
    // data, shaped enough to read as growth at a glance.
    wander = Math.max(-0.17, Math.min(0.17, wander + (rnd() - 0.5) * 0.12));
    const trend = 0.2 + (i / (n - 1)) * 0.5;
    out.push(clamp01(trend + wander + Math.sin(i / 3.4) * 0.05));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Chart geometry                                                      */
/* ------------------------------------------------------------------ */

const STEP = CHART_W / (POINTS - 1);

/**
 * Smooth-step cubics between every pair of samples. The series is drawn one
 * step wider than the viewBox so the group can translate left by exactly one
 * step per tick — that scroll, not a redrawn `d`, is what makes it live.
 */
function buildPaths(values: number[]) {
  const pts = values.map<[number, number]>((v, i) => [
    i * STEP,
    CHART_H - 6 - clamp01(v) * (CHART_H - 16),
  ]);

  let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const mx = (px + x) / 2;
    line += ` C ${mx.toFixed(1)} ${py.toFixed(1)}, ${mx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  const lastX = pts[pts.length - 1][0];
  const area = `${line} L ${lastX.toFixed(1)} ${CHART_H} L ${pts[0][0].toFixed(1)} ${CHART_H} Z`;
  return { line, area };
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

type Lead = {
  id: string;
  name: string;
  initials: string;
  source: "Organic" | "WhatsApp" | "Paid" | "Referral";
  /** Multiples of `Money.unit`, so values scale per market. */
  units: number;
  status: "Hot" | "Warm" | "New";
  tint: string;
};

/** The same placeholder brands the trust marquee uses, so the page agrees. */
const LEADS: readonly Lead[] = [
  { id: "northfield", name: "Northfield Homes", initials: "NH", source: "Organic", units: 51, status: "Hot", tint: "var(--accent)" },
  { id: "clarity", name: "Clarity Dental", initials: "CD", source: "WhatsApp", units: 24, status: "Hot", tint: "var(--success)" },
  { id: "summit", name: "Summit Coaching", initials: "SC", source: "Paid", units: 8, status: "Warm", tint: "var(--accent-2)" },
  { id: "veda", name: "Veda Wellness", initials: "VW", source: "Organic", units: 32, status: "New", tint: "var(--success)" },
  { id: "aurora", name: "Aurora D2C", initials: "AD", source: "Referral", units: 64, status: "Hot", tint: "var(--accent)" },
  { id: "meridian", name: "Meridian Clinics", initials: "MC", source: "WhatsApp", units: 15, status: "Warm", tint: "var(--accent-2)" },
  { id: "prime", name: "Prime Realty", initials: "PR", source: "Paid", units: 43, status: "New", tint: "var(--accent)" },
] as const;

const STATUS_STYLE: Record<Lead["status"], string> = {
  Hot: "border-accent/35 bg-accent/12 text-accent",
  Warm: "border-accent-2/35 bg-accent-2/12 text-accent-2",
  New: "border-success/35 bg-success/12 text-success",
};

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

function KpiTile({
  label,
  value,
  delta,
  up,
  bars,
  color,
  animate,
  delay,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  bars: number[];
  color: string;
  animate: boolean;
  delay: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="font-display text-[1.0625rem] font-semibold leading-none tabular-nums text-foreground">
          {value}
        </span>
        <svg viewBox="0 0 44 16" className="h-4 w-11" fill="none" aria-hidden>
          {bars.map((h, i) => (
            <motion.rect
              key={i}
              x={i * 7}
              y={16 - h}
              width="4.5"
              height={h}
              rx="1"
              fill={color}
              fillOpacity={i === bars.length - 1 ? 0.9 : 0.25}
              initial={animate ? { scaleY: 0 } : false}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: delay + i * 0.05, ease: EASE }}
              style={{ transformOrigin: `${i * 7 + 2.25}px 16px` }}
            />
          ))}
        </svg>
      </div>

      <div
        dir="ltr"
        className={`mt-2 inline-flex items-center gap-1 font-mono text-[9px] tabular-nums rtl:justify-end ${
          up ? "text-success" : "text-accent"
        }`}
      >
        {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {delta}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase                                                            */
/* ------------------------------------------------------------------ */

export function HeroProductShowcase({
  country,
  className = "",
}: {
  country?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const animate = !reduced;

  const money = (country && MONEY[country]) || MONEY_DEFAULT;

  // One extra sample lives off the right edge, waiting to scroll in.
  const [series, setSeries] = useState(() => seedSeries(POINTS + 1));
  const [tick, setTick] = useState(0);
  const [amount, setAmount] = useState(() => money.unit * 428);
  const [leadCursor, setLeadCursor] = useState(0);
  const [leadCount, setLeadCount] = useState(312);
  const drift = useRef(lcg(7));

  // Chart scroll + value ticker
  useEffect(() => {
    if (!animate) return;
    const id = window.setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        const next = clamp01(last + (drift.current() - 0.5) * 0.17 + (0.74 - last) * 0.09);
        return [...prev.slice(1), next];
      });
      setTick((t) => t + 1);
      setAmount((a) => a + Math.round(money.unit * (0.12 + drift.current() * 0.5)));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [animate, money.unit]);

  // New leads arriving
  useEffect(() => {
    if (!animate) return;
    const id = window.setInterval(() => {
      setLeadCursor((c) => (c + 1) % LEADS.length);
      setLeadCount((n) => n + 1);
    }, LEAD_MS);
    return () => window.clearInterval(id);
  }, [animate]);

  // Cheap liveness: reuse the chart tick rather than adding another timer.
  const syncAgo = (tick % 9) + 1;

  const { line, area } = useMemo(() => buildPaths(series), [series]);
  // Four rows rendered into a three-row window. The newest sits above the
  // fold and slides in as the stack settles, pushing the oldest out of the
  // bottom — same trick as the chart: translate, never reflow. `popLayout`
  // was pulling exiting rows out of flow and drawing them over the arrivals.
  const leadWindow = useMemo(
    () =>
      [0, 1, 2, 3].map(
        (i) => LEADS[(((leadCursor - i) % LEADS.length) + LEADS.length) % LEADS.length],
      ),
    [leadCursor],
  );

  const rail = [LayoutDashboard, Users, TrendingUp, MessageCircle, Settings];

  return (
    <figure
      className={`rise m-0 overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-hero-card)] ${className}`}
    >
      {/* ---- Browser chrome ---------------------------------------- */}
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface-2 px-3.5">
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/45" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/45" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/45" />
        </span>

        <span
          dir="ltr"
          className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2.5"
        >
          <Lock size={9} className="shrink-0 text-success" />
          <span className="truncate font-mono text-[10px] text-muted-foreground">
            app.sanatdynamo.com/pipeline
          </span>
        </span>

        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Demo
        </span>
      </div>

      <div className="flex">
        {/* ---- Icon rail ------------------------------------------- */}
        <nav className="hidden w-12 shrink-0 flex-col items-center gap-1 border-e border-border bg-surface py-3 sm:flex">
          {rail.map((Icon, i) => (
            <span
              key={i}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${
                i === 0 ? "bg-accent-soft text-accent" : "text-muted-foreground/75"
              }`}
            >
              {i === 0 && (
                <span className="absolute inset-y-1 -start-2 w-0.5 rounded-full bg-accent" />
              )}
              <Icon size={15} strokeWidth={1.75} />
            </span>
          ))}
        </nav>

        {/* ---- App canvas ------------------------------------------ */}
        <div className="relative min-w-0 flex-1 p-4">
          {/* Toolbar */}
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate font-display text-[0.9375rem] font-semibold leading-none text-foreground">
                Revenue pipeline
              </span>
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Syncing live
                </span>
              </span>
            </span>

            <span className="hidden shrink-0 items-center rounded-md border border-border bg-surface p-0.5 sm:flex">
              {["7d", "30d", "90d"].map((r) => (
                <span
                  key={r}
                  className={`rounded px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${
                    r === "30d"
                      ? "bg-accent-strong text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {r}
                </span>
              ))}
            </span>
          </div>

          {/* Pipeline value + live chart */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Pipeline value
                </span>
                <span
                  dir="ltr"
                  className="mt-1.5 block truncate font-display text-[1.625rem] font-semibold leading-none tabular-nums text-foreground rtl:text-right"
                >
                  {formatMoney(amount, money)}
                </span>
              </span>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-1 font-mono text-[9px] tabular-nums text-success">
                <ArrowUpRight size={10} />
                18.4%
              </span>
            </div>

            <div dir="ltr" className="relative mt-3">
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                className="h-28 w-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="hps-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
                    <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Gridlines stay put while the series scrolls past them */}
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    y1={CHART_H * f}
                    x2={CHART_W}
                    y2={CHART_H * f}
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* One step of travel per tick. Remounting on `tick` restarts
                    the tween at the exact moment the data shifts, so the two
                    cancel out and the line never jumps. */}
                <motion.g
                  key={animate ? tick : "static"}
                  initial={{ x: 0 }}
                  animate={{ x: animate ? -STEP : 0 }}
                  transition={{ duration: TICK_MS / 1000, ease: "linear" }}
                >
                  <path d={area} fill="url(#hps-fill)" />
                  <path
                    d={line}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </motion.g>
              </svg>

              {/* Leading edge — sells "this is the live end of the series" */}
              <span className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-surface to-transparent" />
              <span className="pointer-events-none absolute inset-y-0 end-0 w-px bg-accent/40" />
            </div>
          </div>

          {/* KPI tiles */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <KpiTile
              label="Qualified"
              value={String(leadCount)}
              delta="+312%"
              up
              bars={[5, 7, 6, 10, 13]}
              color="var(--accent)"
              animate={animate}
              delay={0.7}
            />
            <KpiTile
              label="Conversion"
              value="5.4%"
              delta="+2.4pt"
              up
              bars={[4, 6, 9, 8, 12]}
              color="var(--success)"
              animate={animate}
              delay={0.8}
            />
            <KpiTile
              label="Avg reply"
              value="90s"
              delta="−64%"
              up={false}
              bars={[13, 11, 8, 6, 4]}
              color="var(--accent-2)"
              animate={animate}
              delay={0.9}
            />
          </div>

          {/* Lead table */}
          <div className="mt-3">
            <div className="flex items-center gap-3 border-b border-border pb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="flex-1">Lead</span>
              <span className="hidden w-20 sm:block">Source</span>
              <span className="w-20 text-end">Value</span>
              <span className="w-14 text-end">Status</span>
            </div>

            {/* Fixed height + clipping, so a row arriving or leaving can never
                shift the frame's overall height. */}
            <div className="h-[9.75rem] overflow-hidden">
              <motion.div
                key={animate ? leadCursor : "static"}
                initial={animate ? { y: -ROW_H } : false}
                animate={{ y: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {leadWindow.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex h-13 items-center gap-3 border-b border-border/60"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-semibold"
                        style={{ backgroundColor: `color-mix(in oklab, ${lead.tint} 16%, transparent)`, color: lead.tint }}
                      >
                        {lead.initials}
                      </span>
                      <span className="truncate text-[0.8125rem] font-medium text-foreground">
                        {lead.name}
                      </span>
                    </span>

                    <span className="hidden w-20 font-mono text-[10px] text-muted-foreground sm:block">
                      {lead.source}
                    </span>

                    <span
                      dir="ltr"
                      className="w-20 whitespace-nowrap text-end font-display text-[0.8125rem] font-semibold tabular-nums text-foreground rtl:text-right"
                    >
                      {compactMoney(lead.units * money.unit, money)}
                    </span>

                    <span className="flex w-14 justify-end">
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${STATUS_STYLE[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Status strip, with the toast rising over it on a loop. Giving
              the toast its own row rather than floating it over the table
              means it can never cover a lead's value or status. */}
          <div className="relative mt-3 h-13 overflow-hidden rounded-lg border border-border bg-surface">
            <div className="hps-status flex h-full items-center justify-between gap-3 px-3">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Pipeline synced
                </span>
              </span>
              <span
                dir="ltr"
                className="font-mono text-[9px] tabular-nums text-muted-foreground/70"
              >
                {syncAgo}s ago
              </span>
            </div>

            {animate && (
              <div className="hps-toast pointer-events-none absolute inset-0 flex items-center gap-2.5 rounded-lg border border-success/30 bg-surface px-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
                  <MessageCircle size={13} strokeWidth={2} />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-[11px] font-medium text-foreground">
                    WhatsApp auto-reply sent
                  </span>
                  <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    90s after enquiry
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <figcaption className="border-t border-border bg-surface/50 px-3.5 py-2 text-[11px] leading-snug text-muted-foreground">
        Product demo. Company names and figures are illustrative — the measured
        client results are in the case studies below.
      </figcaption>
    </figure>
  );
}

export default HeroProductShowcase;
