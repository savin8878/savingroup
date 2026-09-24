"use client";

import { motion } from "framer-motion";

/**
 * Animated visuals for the Pricing page.
 *
 * - `tierGlyphs`   — one small line-art glyph per plan tier (rocket / bolt /
 *                    chart / crown). Drawn with `currentColor` so they inherit
 *                    the card's text colour and adapt to light/dark.
 * - `PricingValueViz` — the "How we're different" hero visual: a value-stack
 *                    comparison. The competitor stack is short; the Savin Group
 *                    stack grows tall with the components that ship for free
 *                    (design, SEO, CDN, automation, support) — all on the SAME
 *                    price baseline. Visually: "more system, same budget".
 */

/* -------------------------------------------------------------------------- */
/*                               Tier glyphs                                  */
/* -------------------------------------------------------------------------- */

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.9, ease: "easeInOut" as const }, opacity: { duration: 0.2 } },
  },
};

function GlyphShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-full w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </motion.svg>
  );
}

function RocketGlyph() {
  return (
    <GlyphShell>
      <motion.path d="M24 5c6 4 9 10 9 18 0 4-1 7-2 9H17c-1-2-2-5-2-9 0-8 3-14 9-18Z" variants={draw} />
      <motion.circle cx="24" cy="19" r="3.4" variants={draw} />
      <motion.path d="M17 32c-3 1-5 3-5 8 3-1 5-1 6-2M31 32c3 1 5 3 5 8-3-1-5-1-6-2" variants={draw} />
      <motion.path d="M21 41c1 2 2 3 3 4 1-1 2-2 3-4" variants={draw} />
    </GlyphShell>
  );
}

function BoltGlyph() {
  return (
    <GlyphShell>
      <motion.path d="M27 4 11 27h10l-3 17 19-25H26l4-15Z" variants={draw} />
    </GlyphShell>
  );
}

function ChartGlyph() {
  return (
    <GlyphShell>
      <motion.path d="M7 41h34" variants={draw} />
      <motion.path d="M13 41V28M22 41V20M31 41V25M40 41V14" variants={draw} strokeWidth={3} />
      <motion.path d="M9 24l8-8 7 5 13-13" variants={draw} />
      <motion.path d="M31 8h6v6" variants={draw} />
    </GlyphShell>
  );
}

function CrownGlyph() {
  return (
    <GlyphShell>
      <motion.path d="M7 16l6 7 11-13 11 13 6-7-3 23H10L7 16Z" variants={draw} />
      <motion.path d="M10 39h28" variants={draw} />
      <motion.circle cx="7" cy="16" r="2.2" variants={draw} />
      <motion.circle cx="41" cy="16" r="2.2" variants={draw} />
      <motion.circle cx="24" cy="10" r="2.2" variants={draw} />
    </GlyphShell>
  );
}

export const tierGlyphs: Record<string, () => React.JSX.Element> = {
  rocket: RocketGlyph,
  bolt: BoltGlyph,
  chart: ChartGlyph,
  crown: CrownGlyph,
};

/* -------------------------------------------------------------------------- */
/*                    "How we're different" value-stack viz                   */
/* -------------------------------------------------------------------------- */

const ACCENT = "oklch(0.78 0.165 70";
const NEUTRAL = "oklch(0.62 0.02 260";

export function PricingValueViz({ className = "" }: { className?: string }) {
  // Stacked value blocks for the Savin Group column — bottom to top.
  const ourBlocks = [
    { label: "DESIGN", c: ACCENT },
    { label: "HOSTING", c: ACCENT },
    { label: "SEO", c: "oklch(0.74 0.16 155" },
    { label: "CDN + SPEED", c: "oklch(0.66 0.18 295" },
    { label: "AUTOMATION", c: "oklch(0.7 0.17 35" },
    { label: "SUPPORT", c: ACCENT },
  ];
  const otherBlocks = [
    { label: "DESIGN", c: NEUTRAL },
    { label: "HOSTING", c: NEUTRAL },
  ];

  const blockH = 22;
  const gap = 6;
  const baseY = 250;
  const colW = 150;
  const otherX = 70;
  const ourX = 410;

  const stackY = (i: number) => baseY - (i + 1) * blockH - i * gap;

  const block = (
    x: number,
    i: number,
    label: string,
    c: string,
    delay: number,
    faint = false,
  ) => (
    <motion.g
      key={`${x}-${label}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, type: "spring" as const, stiffness: 150, damping: 16 }}
    >
      <rect
        x={x}
        y={stackY(i)}
        width={colW}
        height={blockH}
        rx="5"
        fill={`${c} / ${faint ? 0.08 : 0.16})`}
        stroke={`${c} / ${faint ? 0.3 : 0.55})`}
        strokeWidth="1"
      />
      <text
        x={x + colW / 2}
        y={stackY(i) + blockH / 2 + 3}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8.5"
        letterSpacing="0.08em"
        fill={`${c} / ${faint ? 0.5 : 0.85})`}
      >
        {label}
      </text>
    </motion.g>
  );

  return (
    <motion.svg viewBox="0 0 630 300" fill="none" className={`h-auto w-full ${className}`}>
      <defs>
        <filter id="pv-glow">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shared "same budget" baseline */}
      <motion.line
        x1="40"
        y1={baseY}
        x2="590"
        y2={baseY}
        stroke="var(--svg-line-faint)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <motion.text
        x="315"
        y={baseY + 22}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="0.22em"
        fill={`${NEUTRAL} / 0.7)`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        SAME BUDGET · ₹25,000+
      </motion.text>

      {/* Column labels */}
      <motion.text
        x={otherX + colW / 2}
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        letterSpacing="0.18em"
        fill={`${NEUTRAL} / 0.75)`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        OTHER AGENCIES
      </motion.text>
      <motion.text
        x={ourX + colW / 2}
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        letterSpacing="0.18em"
        fill={`${ACCENT} / 0.85)`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Savin Group
      </motion.text>

      {/* Other agencies — short stack + "what's missing" ghosts */}
      {otherBlocks.map((b, i) => block(otherX, i, b.label, b.c, 0.3 + i * 0.1))}
      {["SEO", "CDN", "AUTOMATION", "SUPPORT"].map((label, i) => (
        <motion.text
          key={label}
          x={otherX + colW / 2}
          y={stackY(otherBlocks.length + i) + blockH / 2 + 3}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="8"
          letterSpacing="0.06em"
          fill={`${NEUTRAL} / 0.32)`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 + i * 0.08 }}
        >
          + {label} (extra ₹)
        </motion.text>
      ))}

      {/* Savin Group — tall value stack */}
      {ourBlocks.map((b, i) => block(ourX, i, b.label, b.c, 0.3 + i * 0.1))}

      {/* "more value" bracket between the two stack tops */}
      <motion.path
        d={`M ${otherX + colW + 14} ${stackY(otherBlocks.length - 1)} C 300 ${stackY(otherBlocks.length - 1)}, 300 ${stackY(ourBlocks.length - 1)}, ${ourX - 14} ${stackY(ourBlocks.length - 1)}`}
        stroke={`${ACCENT} / 0.45)`}
        strokeWidth="1.3"
        strokeDasharray="4 4"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1 }}
      />
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4, type: "spring" as const, stiffness: 160 }}
      >
        <rect x="262" y="78" width="106" height="26" rx="13" fill={`${ACCENT} / 0.12)`} stroke={`${ACCENT} / 0.5)`} strokeWidth="1" />
        <text x="315" y="95" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.12em" fill={`${ACCENT} / 0.9)`}>
          3× MORE VALUE
        </text>
      </motion.g>

      {/* Glow dot on top of our stack */}
      <motion.circle
        cx={ourX + colW / 2}
        cy={stackY(ourBlocks.length - 1)}
        r="3.5"
        fill="oklch(0.78 0.165 70)"
        filter="url(#pv-glow)"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5, type: "spring" as const, stiffness: 200 }}
      />
    </motion.svg>
  );
}
