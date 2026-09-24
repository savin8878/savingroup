"use client";

import { motion } from "framer-motion";

const draw = (i: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.2, delay: i * 0.15, ease: "easeInOut" as const }, opacity: { duration: 0.2, delay: i * 0.15 } },
  },
});
const pop = (i: number) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.3 + i * 0.1, type: "spring" as const, stiffness: 160, damping: 14 } },
});

/**
 * Animated horizontal timeline for About page — 2022 → 2023 → 2024
 * Shows the company journey from first audit to ₹40Cr impact.
 */
export function TimelineSVG({ className = "" }: { className?: string }) {
  const milestones = [
    { x: 80, year: "2022", label: "First audit", color: "oklch(0.66 0.18 295 / 0.5)" },
    { x: 320, year: "2023", label: "6 systems", color: "oklch(var(--accent) / 1)" },
    { x: 560, year: "2024", label: "₹40Cr+", color: "oklch(0.74 0.16 155 / 0.6)" },
  ];

  return (
    <motion.svg viewBox="0 0 640 160" fill="none" className={`w-full h-auto ${className}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
      {/* Main timeline spine */}
      <motion.line x1="40" y1="80" x2="600" y2="80" stroke="var(--border-strong)" strokeWidth="1.5" variants={draw(0)} />

      {/* Growth area fill under timeline */}
      <motion.path d="M 80 80 C 150 78, 200 65, 320 55 C 400 48, 480 35, 560 25 L 560 80 Z" fill="var(--accent-soft)" variants={pop(3)} />

      {/* Growth line */}
      <motion.path d="M 80 80 C 150 78, 200 65, 320 55 C 400 48, 480 35, 560 25" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" fill="none" variants={draw(2)} />

      {/* Milestone nodes */}
      {milestones.map((m, i) => (
        <motion.g key={m.year} variants={pop(i + 1)}>
          {/* Vertical tick */}
          <line x1={m.x} y1="65" x2={m.x} y2="95" stroke="var(--border-strong)" strokeWidth="1" />
          {/* Node circle */}
          <circle cx={m.x} cy="80" r="14" fill="var(--svg-node-fill)" stroke={m.color} strokeWidth="1.5" />
          <circle cx={m.x} cy="80" r="6" fill={m.color} />
          {/* Year */}
          <text x={m.x} y="120" textAnchor="middle" fontFamily="var(--font-display)" fontSize="16" fontWeight="700" fill="var(--foreground)" opacity="0.7">{m.year}</text>
          {/* Label */}
          <text x={m.x} y="138" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.12em" fill="var(--muted-foreground)">{m.label.toUpperCase()}</text>
        </motion.g>
      ))}

      {/* Connecting dotted segments */}
      <motion.line x1="94" y1="80" x2="306" y2="80" stroke="var(--accent-soft)" strokeWidth="3" strokeLinecap="round" variants={draw(1)} />
      <motion.line x1="334" y1="80" x2="546" y2="80" stroke="var(--accent-soft)" strokeWidth="3" strokeLinecap="round" variants={draw(1)} />

      {/* Pulse ring on latest milestone */}
      <motion.circle cx="560" cy="80" r="14" fill="none" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="1" animate={{ r: [14, 24, 14], opacity: [0.2, 0, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />

      {/* Arrow tip at end */}
      <motion.polygon points="596,76 604,80 596,84" fill="var(--muted-foreground)" opacity="0.3" variants={pop(4)} />
    </motion.svg>
  );
}

/**
 * Interactive values constellation — 4 principles orbiting a core.
 * Used in the About page principles section.
 */
export function ValuesConstellation({ className = "" }: { className?: string }) {
  const values = [
    { angle: -45, label: "OUTCOMES", short: "ROI", color: "var(--accent)" },
    { angle: 45, label: "EMBEDDED", short: "IN", color: "oklch(0.66 0.18 295 / 0.5)" },
    { angle: 135, label: "COMPOUND", short: "∞", color: "oklch(0.74 0.16 155 / 0.5)" },
    { angle: 225, label: "HONEST", short: "₹", color: "var(--accent)" },
  ];
  const r = 90;

  return (
    <motion.svg viewBox="0 0 300 300" fill="none" className={`w-full h-auto ${className}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
      {/* Orbit ring */}
      <motion.circle cx="150" cy="150" r={r} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 6" fill="none" variants={draw(0)} />

      {/* Core */}
      <motion.circle cx="150" cy="150" r="30" fill="var(--svg-node-fill)" stroke="var(--accent)" strokeWidth="1.5" variants={pop(0)} />
      <motion.text x="150" y="147" textAnchor="middle" fontFamily="var(--font-display)" fontSize="10" fontWeight="700" fill="var(--accent)" variants={pop(1)}>SAVIN</motion.text>
      <motion.text x="150" y="159" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="var(--muted-foreground)" variants={pop(1)}>GROUP</motion.text>

      {/* Value nodes */}
      {values.map((v, i) => {
        const rad = (v.angle * Math.PI) / 180;
        const cx = 150 + r * Math.cos(rad);
        const cy = 150 + r * Math.sin(rad);
        return (
          <motion.g key={v.label} variants={pop(i + 1)}>
            {/* Connection to core */}
            <line x1="150" y1="150" x2={cx} y2={cy} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 4" />
            {/* Node */}
            <circle cx={cx} cy={cy} r="22" fill="var(--svg-node-fill)" stroke={v.color} strokeWidth="1" />
            <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fontWeight="700" fill={v.color}>{v.short}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="0.1em" fill="var(--muted-foreground)">{v.label}</text>
          </motion.g>
        );
      })}

      {/* Animated pulse on core */}
      <motion.circle cx="150" cy="150" r="30" fill="none" stroke="var(--accent)" strokeWidth="0.5" animate={{ r: [30, 42, 30], opacity: [0.3, 0, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
    </motion.svg>
  );
}

/**
 * "Embedded, not external" — visual metaphor.
 * Shows a team node INSIDE a company boundary vs outside.
 */
export function EmbeddedTeamVisual({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 400 180" fill="none" className={`w-full h-auto ${className}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
      {/* Your business boundary */}
      <motion.rect x="40" y="20" width="320" height="140" rx="24" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="8 6" fill="var(--accent-soft)" variants={draw(0)} />
      <motion.text x="60" y="44" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="var(--muted-foreground)" variants={pop(0)}>YOUR BUSINESS</motion.text>

      {/* Internal team nodes */}
      {[
        { cx: 100, cy: 90, label: "CEO" },
        { cx: 180, cy: 80, label: "OPS" },
        { cx: 260, cy: 90, label: "SALES" },
      ].map((n, i) => (
        <motion.g key={n.label} variants={pop(i + 1)}>
          <circle cx={n.cx} cy={n.cy} r="18" fill="var(--svg-node-fill)" stroke="var(--border-strong)" strokeWidth="1" />
          <text x={n.cx} y={n.cy + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="var(--muted-foreground)">{n.label}</text>
        </motion.g>
      ))}

      {/* Savin Group — embedded INSIDE the boundary */}
      <motion.g variants={pop(4)}>
        <rect x="190" y="115" width="100" height="34" rx="10" fill="var(--svg-node-fill)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="240" y="133" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.1em" fill="var(--accent)">Savin Group</text>
        <text x="240" y="143" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="var(--muted-foreground)">EMBEDDED TEAM</text>
      </motion.g>

      {/* Connection lines from Savin to internal team */}
      <motion.path d="M 220 115 C 200 105, 180 100, 180 98" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.3" variants={draw(3)} />
      <motion.path d="M 240 115 C 250 105, 260 100, 260 108" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.3" variants={draw(3)} />
      <motion.path d="M 210 120 C 160 110, 120 100, 100 108" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.3" variants={draw(3)} />

      {/* Weekly demo annotation */}
      <motion.g variants={pop(5)}>
        <text x="320" y="70" fontFamily="var(--font-mono)" fontSize="6" fill="var(--accent)">WEEKLY DEMOS</text>
        <text x="320" y="80" fontFamily="var(--font-mono)" fontSize="6" fill="var(--accent)">DIRECT SLACK</text>
        <text x="320" y="90" fontFamily="var(--font-mono)" fontSize="6" fill="var(--accent)">NO MIDDLEMEN</text>
      </motion.g>
    </motion.svg>
  );
}
