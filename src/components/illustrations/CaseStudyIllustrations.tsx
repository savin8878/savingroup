"use client";

import { motion } from "framer-motion";

/**
 * Animated before/after metric visuals for Case Studies page.
 * Each tells the transformation story with animated growth.
 */

/** Revenue growth line chart — shows the compound lift */
export function RevenueGrowthChart({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 480 200" fill="none" className={`w-full h-auto ${className}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
      <defs>
        <linearGradient id="rg-fill" x1="240" y1="40" x2="240" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[50, 90, 130, 170].map((y) => (
        <line key={y} x1="40" y1={y} x2="440" y2={y} stroke="var(--border)" strokeWidth="0.5" />
      ))}

      {/* Y-axis labels */}
      {[
        { y: 50, label: "₹80L" },
        { y: 90, label: "₹60L" },
        { y: 130, label: "₹40L" },
        { y: 170, label: "₹20L" },
      ].map((l) => (
        <text key={l.y} x="35" y={l.y + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="7" fill="var(--muted-foreground)">{l.label}</text>
      ))}

      {/* X-axis month labels */}
      {["M0", "M1", "M2", "M3", "M4", "M5", "M6"].map((m, i) => (
        <text key={m} x={60 + i * 60} y="190" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="var(--muted-foreground)">{m}</text>
      ))}

      {/* Before line (flat/declining) */}
      <motion.path d="M 60 135 L 120 138 L 180 140 L 240 142" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.7 }} viewport={{ once: true }} transition={{ duration: 1 }} />
      <motion.text x="245" y="148" fontFamily="var(--font-mono)" fontSize="6" fill="var(--danger)" opacity="0.7" initial={{ opacity: 0 }} whileInView={{ opacity: 0.7 }} viewport={{ once: true }} transition={{ delay: 1 }}>BEFORE</motion.text>

      {/* After line (growth curve) */}
      <motion.path d="M 60 135 L 120 128 L 180 112 L 240 95 L 300 75 L 360 58 L 420 42" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2, delay: 0.5, ease: "easeOut" as const }} />

      {/* Growth area fill */}
      <motion.path d="M 60 135 L 120 128 L 180 112 L 240 95 L 300 75 L 360 58 L 420 42 L 420 170 L 60 170 Z" fill="url(#rg-fill)"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1.5 }} />

      {/* Endpoint dot */}
      <motion.circle cx="420" cy="42" r="5" fill="var(--accent)" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 2.3, type: "spring" as const }} />

      {/* Result annotation */}
      <motion.g initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 2.5 }}>
        <rect x="375" y="20" width="65" height="22" rx="6" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="0.6" />
        <text x="407" y="34" textAnchor="middle" fontFamily="var(--font-display)" fontSize="10" fontWeight="700" fill="var(--accent)">+127%</text>
      </motion.g>

      {/* "Savin Group starts" annotation */}
      <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
        <line x1="60" y1="135" x2="60" y2="175" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="60" y="183" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5.5" fill="var(--accent)">START</text>
      </motion.g>
    </motion.svg>
  );
}

/** Before/After metric card — animated counter with bar comparison */
export function BeforeAfterMetric({
  before,
  after,
  label,
  delta,
  className = "",
}: {
  before: number;
  after: number;
  label: string;
  delta: string;
  className?: string;
}) {
  const maxVal = Math.max(before, after);
  const beforePct = (before / maxVal) * 100;
  const afterPct = (after / maxVal) * 100;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-5 transition-all hover:border-accent/30 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-3 space-y-2">
        {/* Before bar */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right font-mono text-xs text-muted-foreground">Before</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-danger/30"
              initial={{ width: 0 }}
              whileInView={{ width: `${beforePct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
        {/* After bar */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right font-mono text-xs text-accent-strong">After</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-accent/50"
              initial={{ width: 0 }}
              whileInView={{ width: `${afterPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 text-right font-display text-lg font-semibold text-accent">{delta}</div>
    </motion.div>
  );
}

/** Aggregate proof strip — animated number counters */
export function ProofStripVisual({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 600 80" fill="none" className={`w-full h-auto ${className}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      {/* Connecting line */}
      <motion.line x1="30" y1="40" x2="570" y2="40" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />

      {/* 4 metric nodes */}
      {[
        { x: 75, value: "₹40Cr+", label: "REVENUE" },
        { x: 225, value: "127%", label: "AVG LIFT" },
        { x: 375, value: "65%", label: "CPA CUT" },
        { x: 525, value: "90 days", label: "PAYBACK" },
      ].map((m, i) => (
        <motion.g key={m.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring" as const, stiffness: 160 }}
        >
          <circle cx={m.x} cy="40" r="20" fill="var(--svg-node-fill)" stroke="var(--accent)" strokeWidth="1" />
          <text x={m.x} y="37" textAnchor="middle" fontFamily="var(--font-display)" fontSize="9" fontWeight="700" fill="var(--accent)">{m.value}</text>
          <text x={m.x} y="46" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="var(--muted-foreground)">{m.label}</text>
        </motion.g>
      ))}
    </motion.svg>
  );
}
