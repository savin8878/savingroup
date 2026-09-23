"use client";

import { motion } from "framer-motion";

/**
 * Animated decorative SVG for the CTA section.
 * Abstract flowing waves and particles suggesting momentum and growth.
 */
export function CtaWaves({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden
      className={`absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="cta-wave-1" x1="0" y1="200" x2="600" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0" />
          <stop offset="30%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.25" />
          <stop offset="70%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cta-wave-2" x1="0" y1="250" x2="600" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0" />
          <stop offset="40%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0.2" />
          <stop offset="60%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Wave 1 — gentle, slow */}
      <motion.path
        d="M -50 220 C 50 180, 150 260, 250 200 C 350 140, 450 280, 550 200 C 600 170, 620 220, 650 210"
        stroke="url(#cta-wave-1)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      {/* Wave 2 — offset rhythm */}
      <motion.path
        d="M -30 260 C 80 300, 160 200, 280 260 C 400 320, 480 200, 580 270 C 620 290, 640 260, 660 265"
        stroke="url(#cta-wave-2)"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Wave 3 — subtle fill area */}
      <motion.path
        d="M 0 280 C 100 250, 200 310, 300 270 C 400 230, 500 300, 600 260 L 600 400 L 0 400 Z"
        fill="oklch(0.78 0.165 70 / 0.02)"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      {/* Floating particles */}
      {[
        { cx: 80, cy: 180, r: 2, delay: 0, dur: 6, dy: 30 },
        { cx: 200, cy: 300, r: 1.5, delay: 1, dur: 7, dy: 25 },
        { cx: 350, cy: 150, r: 2.5, delay: 2, dur: 5, dy: 35 },
        { cx: 480, cy: 280, r: 1.8, delay: 0.5, dur: 8, dy: 20 },
        { cx: 550, cy: 200, r: 2, delay: 1.5, dur: 6.5, dy: 28 },
        { cx: 130, cy: 350, r: 1.5, delay: 3, dur: 7, dy: 22 },
        { cx: 420, cy: 120, r: 1.8, delay: 2.5, dur: 5.5, dy: 32 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={i % 2 === 0 ? "oklch(0.78 0.165 70 / 0.6)" : "oklch(0.66 0.18 295 / 0.55)"}
          animate={{
            y: [-p.dy / 2, p.dy / 2, -p.dy / 2],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Connecting constellation lines between nearby particles */}
      <motion.line x1="80" y1="180" x2="200" y2="300" stroke="oklch(0.78 0.165 70 / 0.12)" strokeWidth="0.5" animate={{ opacity: [0.04, 0.1, 0.04] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.line x1="350" y1="150" x2="480" y2="280" stroke="oklch(0.66 0.18 295 / 0.12)" strokeWidth="0.5" animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
      <motion.line x1="200" y1="300" x2="350" y2="150" stroke="oklch(0.78 0.165 70 / 0.03)" strokeWidth="0.5" animate={{ opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} />
    </svg>
  );
}
