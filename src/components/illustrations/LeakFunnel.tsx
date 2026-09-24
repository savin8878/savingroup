"use client";

import { motion } from "framer-motion";

/**
 * "Revenue Diagnostic" — A clinical audit-style visualization for the Problem section.
 *
 * Shows a business pipeline with visible cracks at each stage,
 * revenue drops marked with diagnostic annotations,
 * and a severity meter — exactly how Savin Group frames the audit.
 *
 * Matches the content: 7% lost/slow page, 70% leads go cold,
 * 100% ad-dependent, 20+ hrs wasted.
 */
export function LeakFunnel({ className = "" }: { className?: string }) {
  const drawLine = (i: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.2, delay: i * 0.18, ease: "easeInOut" as const },
        opacity: { duration: 0.2, delay: i * 0.18 },
      },
    },
  });

  const popIn = (i: number) => ({
    hidden: { opacity: 0, scale: 0.7 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.4 + i * 0.12, type: "spring" as const, stiffness: 160, damping: 14 },
    },
  });

  return (
    <motion.svg
      viewBox="0 0 380 440"
      fill="none"
      className={`w-full h-auto ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <defs>
        <linearGradient id="lf-pipe" x1="190" y1="30" x2="190" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.4" />
          <stop offset="40%" stopColor="oklch(0.65 0.22 25)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.65 0.22 25)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="lf-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.22 25)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.65 0.22 25)" stopOpacity="0" />
        </linearGradient>
        <filter id="lf-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Blueprint grid background */}
      <pattern id="lf-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--svg-grid-line)" strokeWidth="0.4" />
      </pattern>
      <rect width="380" height="440" fill="url(#lf-grid)" />

      {/* Title annotation */}
      <motion.g variants={popIn(0)}>
        <text x="190" y="22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.18em" fill="oklch(0.65 0.22 25 / 0.5)">REVENUE DIAGNOSTIC</text>
        <line x1="100" y1="28" x2="280" y2="28" stroke="oklch(0.65 0.22 25 / 0.35)" strokeWidth="0.5" />
      </motion.g>

      {/* === FUNNEL PIPELINE — narrowing with cracks === */}
      {/* Left wall */}
      <motion.path
        d="M 70 50 L 70 100 L 100 160 L 120 220 L 150 290 L 165 350 L 165 410"
        stroke="url(#lf-pipe)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        variants={drawLine(0)}
      />
      {/* Right wall */}
      <motion.path
        d="M 310 50 L 310 100 L 280 160 L 260 220 L 230 290 L 215 350 L 215 410"
        stroke="url(#lf-pipe)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        variants={drawLine(0)}
      />
      {/* Funnel fill (very faint) */}
      <motion.path
        d="M 70 50 L 310 50 L 310 100 L 280 160 L 260 220 L 230 290 L 215 350 L 215 410 L 165 410 L 165 350 L 150 290 L 120 220 L 100 160 L 70 100 Z"
        fill="oklch(0.65 0.22 25 / 0.02)"
        variants={popIn(0)}
      />

      {/* === STAGE DIVIDERS with labels === */}
      {/* Stage 1: Traffic */}
      <motion.g variants={popIn(1)}>
        <line x1="70" y1="100" x2="310" y2="100" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="35" y="80" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.78 0.165 70 / 0.5)">TRAFFIC</text>
        <text x="35" y="90" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.7 0.015 260 / 0.5)">100%</text>
      </motion.g>

      {/* Stage 2: Leads — CRACK #1 (slow page = -7%) */}
      <motion.g variants={popIn(2)}>
        <line x1="100" y1="160" x2="280" y2="160" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="35" y="140" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.4)">LEADS</text>
      </motion.g>
      {/* Crack #1 visualization — jagged break in wall */}
      <motion.path d="M 280 150 L 290 148 L 284 155 L 296 153 L 288 162" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={drawLine(2)} />
      {/* Leak annotation */}
      <motion.g variants={popIn(3)}>
        <line x1="296" y1="153" x2="330" y2="140" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <rect x="320" y="128" width="52" height="18" rx="4" fill="oklch(0.65 0.22 25 / 0.08)" stroke="oklch(0.65 0.22 25 / 0.45)" strokeWidth="0.6" />
        <text x="346" y="140" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600" fill="oklch(0.65 0.22 25 / 0.7)">−7%/sec</text>
      </motion.g>

      {/* Leaking drops from crack #1 */}
      <motion.circle r="3" fill="url(#lf-drop)"        animate={{ cx: [290, 305, 315], cy: [155, 185, 220], opacity: [0.7, 0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeIn" as const }}
      />

      {/* Stage 3: Pipeline — CRACK #2 (leads go cold = -70%) */}
      <motion.g variants={popIn(3)}>
        <line x1="120" y1="220" x2="260" y2="220" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="35" y="200" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.4)">PIPELINE</text>
      </motion.g>
      {/* Crack #2 — bigger, more severe */}
      <motion.path d="M 116 210 L 106 208 L 112 215 L 98 214 L 108 225" stroke="oklch(0.65 0.22 25 / 0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={drawLine(3)} />
      <motion.g variants={popIn(4)}>
        <line x1="98" y1="214" x2="50" y2="210" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <rect x="4" y="200" width="52" height="18" rx="4" fill="oklch(0.65 0.22 25 / 0.1)" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="0.6" />
        <text x="30" y="212" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600" fill="oklch(0.65 0.22 25 / 0.8)">70% COLD</text>
      </motion.g>

      {/* Multiple drops from crack #2 */}
      <motion.circle r="3.5" fill="url(#lf-drop)"        animate={{ cx: [100, 85, 70], cy: [215, 250, 290], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeIn" as const, delay: 0.5 }}
      />
      <motion.circle r="2.5" fill="url(#lf-drop)"
        animate={{ cx: [105, 92, 80], cy: [218, 260, 300], opacity: [0.6, 0.3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeIn" as const, delay: 1.2 }}
      />

      {/* Stage 4: Conversion — CRACK #3 (ad-dependent) */}
      <motion.g variants={popIn(4)}>
        <line x1="150" y1="290" x2="230" y2="290" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="35" y="270" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.4)">CONVERT</text>
      </motion.g>
      <motion.g variants={popIn(5)}>
        <line x1="230" y1="290" x2="290" y2="280" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <rect x="280" y="270" width="70" height="18" rx="4" fill="oklch(0.65 0.22 25 / 0.08)" stroke="oklch(0.65 0.22 25 / 0.45)" strokeWidth="0.6" />
        <text x="315" y="282" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fontWeight="600" fill="oklch(0.65 0.22 25 / 0.7)">100% AD-DEP</text>
      </motion.g>

      {/* Stage 5: Close — CRACK #4 (wasted hours) */}
      <motion.g variants={popIn(5)}>
        <line x1="165" y1="350" x2="215" y2="350" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="35" y="340" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.4)">CLOSE</text>
      </motion.g>
      <motion.g variants={popIn(6)}>
        <line x1="155" y1="360" x2="60" y2="370" stroke="oklch(0.65 0.22 25 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <rect x="8" y="362" width="60" height="18" rx="4" fill="oklch(0.65 0.22 25 / 0.08)" stroke="oklch(0.65 0.22 25 / 0.45)" strokeWidth="0.6" />
        <text x="38" y="374" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fontWeight="600" fill="oklch(0.65 0.22 25 / 0.7)">20+ HRS/WK</text>
      </motion.g>

      {/* === OUTPUT TRICKLE — what actually converts === */}
      <motion.g variants={popIn(7)}>
        <rect x="170" y="415" width="40" height="18" rx="6" fill="oklch(0.78 0.165 70 / 0.08)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.6" />
        <text x="190" y="427" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fontWeight="700" fill="oklch(0.78 0.165 70 / 0.6)">≈ 3%</text>
      </motion.g>

      {/* Healthy drops at bottom (what survives) */}
      <motion.circle r="2" fill="oklch(0.78 0.165 70 / 0.4)"
        animate={{ cy: [412, 425, 438], opacity: [0.6, 0.4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn" as const }}
        cx="190"
      />

      {/* Severity annotation at bottom */}
      <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.5 }} viewport={{ once: true }}>
        <line x1="60" y1="430" x2="320" y2="430" stroke="oklch(0.65 0.22 25 / 0.1)" strokeWidth="0.5" />
        <text x="190" y="440" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" letterSpacing="0.15em" fill="oklch(0.65 0.22 25 / 0.35)">DIAGNOSIS: SEVERE REVENUE LEAK — AUDIT REQUIRED</text>
      </motion.g>
    </motion.svg>
  );
}
