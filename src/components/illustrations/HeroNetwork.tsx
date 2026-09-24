"use client";

import { motion } from "framer-motion";

/**
 * "Revenue Engine Blueprint" — Savin Group's signature hero visual.
 *
 * Not a generic network diagram. This is an **architectural schematic**
 * of the exact system Savin Group builds for every client:
 *
 *   Traffic → Website → Automation → CRM → Revenue (compounding)
 *
 * Styled as a dark engineering blueprint with amber-glow annotations,
 * dashed construction lines, and flowing data particles that show
 * the "system that works while you sleep" promise.
 */
export function HeroNetwork({ className = "" }: { className?: string }) {
  const drawLine = (i: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.6, delay: i * 0.12, ease: "easeInOut" as const },
        opacity: { duration: 0.3, delay: i * 0.12 },
      },
    },
  });

  const popIn = (i: number) => ({
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.5 + i * 0.1, type: "spring" as const, stiffness: 180, damping: 15 },
    },
  });

  return (
    <motion.svg
      viewBox="0 0 960 340"
      fill="none"
      className={`w-full h-auto ${className}`}
      initial="hidden"
      animate="visible"
    >
      <defs>
        {/* Brand gradients */}
        <linearGradient id="bp-amber" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 72)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="bp-violet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="bp-green" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.74 0.16 155)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 155)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="bp-flow" x1="0" y1="170" x2="960" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.6" />
          <stop offset="40%" stopColor="oklch(0.66 0.18 295)" stopOpacity="0.5" />
          <stop offset="70%" stopColor="oklch(0.74 0.16 155)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70)" stopOpacity="0.8" />
        </linearGradient>
        <filter id="bp-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bp-soft">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* === BACKGROUND: Blueprint grid (faint) === */}
      <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--svg-grid-line)" strokeWidth="0.5" />
      </pattern>
      <rect width="960" height="340" fill="url(#bp-grid)" />

      {/* Faint center construction line */}
      <line x1="0" y1="170" x2="960" y2="170" stroke="var(--svg-grid-line)" strokeWidth="0.5" strokeDasharray="8 8" />

      {/* === MAIN FLOW PIPELINE — the horizontal spine === */}
      <motion.path
        d="M 60 170 L 900 170"
        stroke="url(#bp-flow)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        variants={drawLine(0)}
      />

      {/* === PHASE 1: TRAFFIC (left) === */}
      {/* Incoming arrows — representing traffic sources */}
      <motion.path d="M 20 100 L 80 150 L 80 170" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" strokeDasharray="4 4" variants={drawLine(1)} />
      <motion.path d="M 20 240 L 80 190 L 80 170" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" strokeDasharray="4 4" variants={drawLine(1)} />
      <motion.path d="M 20 170 L 80 170" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="1" strokeDasharray="4 4" variants={drawLine(0)} />

      {/* Traffic labels */}
      <motion.g variants={popIn(0)}>
        <text x="12" y="97" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.5)">ADS</text>
      </motion.g>
      <motion.g variants={popIn(0)}>
        <text x="12" y="173" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.5)">SEO</text>
      </motion.g>
      <motion.g variants={popIn(0)}>
        <text x="12" y="244" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.7 0.015 260 / 0.5)">SOCIAL</text>
      </motion.g>

      {/* === PHASE 2: WEBSITE MODULE (RevSite Pro) === */}
      <motion.g variants={popIn(1)}>
        {/* Module box */}
        <rect x="120" y="120" width="140" height="100" rx="16" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="1.2" />
        {/* Blueprint corner markers */}
        <line x1="120" y1="128" x2="128" y2="120" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.8" />
        <line x1="252" y1="120" x2="260" y2="128" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.8" />

        {/* Browser sketch inside */}
        <rect x="140" y="138" width="100" height="60" rx="6" fill="none" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.8" />
        <line x1="140" y1="148" x2="240" y2="148" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.5" />
        {/* Browser dots */}
        <circle cx="148" cy="143" r="1.5" fill="oklch(0.65 0.22 25 / 0.4)" />
        <circle cx="154" cy="143" r="1.5" fill="oklch(0.78 0.165 70 / 0.4)" />
        <circle cx="160" cy="143" r="1.5" fill="oklch(0.74 0.16 155 / 0.4)" />
        {/* Content lines */}
        <rect x="150" y="156" width="40" height="3" rx="1.5" fill="oklch(0.78 0.165 70 / 0.35)" />
        <rect x="150" y="163" width="70" height="2" rx="1" fill="var(--svg-grid-line)" />
        <rect x="150" y="169" width="55" height="2" rx="1" fill="var(--svg-grid-line)" />
        {/* CTA button */}
        <rect x="150" y="178" width="30" height="10" rx="5" fill="oklch(0.78 0.165 70 / 0.12)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.6" />
        {/* Conversion rate annotation */}
        <line x1="260" y1="145" x2="280" y2="145" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="283" y="148" fontFamily="var(--font-mono)" fontSize="7" fill="oklch(0.78 0.165 70 / 0.5)">2.1% CVR</text>
      </motion.g>

      {/* Module label */}
      <motion.text variants={popIn(1)} x="190" y="236" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.78 0.165 70 / 0.6)">REVSITE PRO</motion.text>

      {/* Connection arrow to next module */}
      <motion.path d="M 260 170 L 340 170" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" variants={drawLine(2)} />
      <motion.polygon points="336,166 344,170 336,174" fill="oklch(0.78 0.165 70 / 0.4)" variants={popIn(2)} />

      {/* === PHASE 3: AUTOMATION MODULE (AutoSell Engine) === */}
      <motion.g variants={popIn(2)}>
        <rect x="350" y="120" width="140" height="100" rx="16" fill="var(--svg-node-fill)" stroke="oklch(0.66 0.18 295 / 0.35)" strokeWidth="1.2" />
        <line x1="350" y1="128" x2="358" y2="120" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.8" />
        <line x1="482" y1="120" x2="490" y2="128" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.8" />

        {/* Automation flow sketch inside */}
        {/* Three stages */}
        <rect x="370" y="145" width="28" height="22" rx="5" fill="none" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" />
        <rect x="406" y="145" width="28" height="22" rx="5" fill="none" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" />
        <rect x="442" y="145" width="28" height="22" rx="5" fill="none" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" />
        {/* Arrows */}
        <path d="M 398 156 L 406 156" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.8" />
        <path d="M 434 156 L 442 156" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.8" />
        {/* Icons inside: envelope, gear, check */}
        <rect x="379" y="152" width="10" height="7" rx="1.5" fill="none" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.6" />
        <path d="M 379 152 L 384 156 L 389 152" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.5" fill="none" />
        {/* Gear */}
        <circle cx="420" cy="156" r="4" fill="none" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.6" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "420px 156px" }}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={a} x1="420" y1={156 - 5.5} x2="420" y2={156 - 7} stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="1" strokeLinecap="round" transform={`rotate(${a} 420 156)`} />
          ))}
        </motion.g>
        {/* Check */}
        <path d="M 452 155 L 455 158 L 461 151" stroke="oklch(0.74 0.16 155 / 0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* WhatsApp annotation */}
        <path d="M 384 180 L 384 192" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="384" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.74 0.16 155 / 0.5)">WHATSAPP</text>
        <text x="420" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.66 0.18 295 / 0.5)">DRIP SEQ</text>
        <text x="456" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.74 0.16 155 / 0.5)">CLOSE</text>
      </motion.g>

      <motion.text variants={popIn(2)} x="420" y="236" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.66 0.18 295 / 0.6)">AUTOSELL ENGINE</motion.text>

      {/* Connection arrow */}
      <motion.path d="M 490 170 L 570 170" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="1" variants={drawLine(3)} />
      <motion.polygon points="566,166 574,170 566,174" fill="oklch(0.66 0.18 295 / 0.4)" variants={popIn(3)} />

      {/* === PHASE 4: SEO MODULE (LocalDom SEO) === */}
      <motion.g variants={popIn(3)}>
        <rect x="580" y="120" width="140" height="100" rx="16" fill="var(--svg-node-fill)" stroke="oklch(0.74 0.16 155 / 0.35)" strokeWidth="1.2" />
        <line x1="580" y1="128" x2="588" y2="120" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="0.8" />
        <line x1="712" y1="120" x2="720" y2="128" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="0.8" />

        {/* Search/ranking visualization inside */}
        {/* Search bar */}
        <rect x="600" y="140" width="100" height="14" rx="7" fill="none" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="0.8" />
        <circle cx="612" cy="147" r="3.5" fill="none" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="0.6" />
        <line x1="615" y1="150" x2="618" y2="153" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="0.6" />
        <rect x="622" y="145" width="40" height="3" rx="1.5" fill="oklch(0.74 0.16 155 / 0.1)" />

        {/* Ranking bars — rising */}
        {[
          { x: 608, h: 14 }, { x: 620, h: 20 }, { x: 632, h: 28 },
          { x: 644, h: 24 }, { x: 656, h: 34 }, { x: 668, h: 30 },
          { x: 680, h: 40 },
        ].map((bar, bi) => (
          <motion.rect
            key={bi}
            x={bar.x}
            y={198 - bar.h}
            width="8"
            height={bar.h}
            rx="2"
            fill={bi === 6 ? "oklch(0.74 0.16 155 / 0.45)" : "oklch(0.74 0.16 155 / 0.1)"}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 1.5 + bi * 0.08, ease: "easeOut" as const }}
            style={{ transformOrigin: `${bar.x + 4}px 198px` }}
          />
        ))}
        {/* #1 annotation on tallest bar */}
        <motion.g variants={popIn(5)}>
          <circle cx="684" cy="150" r="8" fill="oklch(0.74 0.16 155 / 0.1)" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="0.6" />
          <text x="684" y="153" textAnchor="middle" fontFamily="var(--font-display)" fontSize="8" fontWeight="700" fill="oklch(0.74 0.16 155 / 0.7)">#1</text>
        </motion.g>
      </motion.g>

      <motion.text variants={popIn(3)} x="650" y="236" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.74 0.16 155 / 0.6)">LOCALDOM SEO</motion.text>

      {/* Connection arrow to revenue */}
      <motion.path d="M 720 170 L 790 170" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="1" variants={drawLine(4)} />
      <motion.polygon points="786,166 794,170 786,174" fill="oklch(0.74 0.16 155 / 0.4)" variants={popIn(4)} />

      {/* === PHASE 5: REVENUE OUTPUT — the compounding result === */}
      <motion.g variants={popIn(5)}>
        {/* Revenue container — bigger, glowing */}
        <rect x="800" y="110" width="130" height="120" rx="20" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1.5" />
        {/* Glow behind */}
        <motion.rect x="800" y="110" width="130" height="120" rx="20" fill="none" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="8" filter="url(#bp-soft)" animate={{ strokeOpacity: [0.1, 0.25, 0.1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }} />

        {/* Revenue graph inside — compound curve */}
        <motion.path
          d="M 820 200 C 830 198, 840 192, 850 185 C 860 175, 870 160, 880 148 C 888 140, 895 130, 905 125"
          stroke="oklch(0.78 0.165 70 / 0.6)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.2, ease: "easeInOut" as const }}
        />
        {/* Area fill under curve */}
        <motion.path
          d="M 820 200 C 830 198, 840 192, 850 185 C 860 175, 870 160, 880 148 C 888 140, 895 130, 905 125 L 905 200 Z"
          fill="oklch(0.78 0.165 70 / 0.05)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        />
        {/* Endpoint dot */}
        <motion.circle cx="905" cy="125" r="4" fill="oklch(0.78 0.165 70)" filter="url(#bp-glow)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5, type: "spring" as const, stiffness: 200 }} />

        {/* Revenue value */}
        <motion.text x="865" y="155" textAnchor="middle" fontFamily="var(--font-display)" fontSize="14" fontWeight="700" fill="oklch(0.78 0.165 70 / 0.8)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>���40Cr+</motion.text>

        {/* "Compounding" annotation */}
        <motion.text x="865" y="216" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.4)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>COMPOUNDING</motion.text>
      </motion.g>

      <motion.text variants={popIn(5)} x="865" y="248" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.78 0.165 70 / 0.7)">REVENUE</motion.text>

      {/* === FLOWING DATA PARTICLES along the pipeline === */}
      {/* Amber particle — full journey */}
      <motion.circle r="3" fill="oklch(0.78 0.165 70)"
        animate={{ cx: [60, 190, 420, 650, 865], cy: [170, 170, 170, 170, 170], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" as const, delay: 4 }}
      />
      {/* Violet particle */}
      <motion.circle r="2.5" fill="oklch(0.66 0.18 295)"
        animate={{ cx: [60, 190, 420, 650, 865], cy: [170, 170, 170, 170, 170], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "linear" as const, delay: 6 }}
      />
      {/* Green particle */}
      <motion.circle r="2" fill="oklch(0.74 0.16 155)"
        animate={{ cx: [60, 190, 420, 650, 865], cy: [170, 170, 170, 170, 170], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear" as const, delay: 5 }}
      />

      {/* === TOP ANNOTATION LINE — "The Revenue Engine" === */}
      <motion.g initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.8 }}>
        <line x1="120" y1="90" x2="720" y2="90" stroke="var(--svg-line-faint)" strokeWidth="0.5" strokeDasharray="4 6" />
        <line x1="120" y1="90" x2="120" y2="110" stroke="var(--svg-line-faint)" strokeWidth="0.5" />
        <line x1="720" y1="90" x2="720" y2="110" stroke="var(--svg-line-faint)" strokeWidth="0.5" />
        <text x="420" y="86" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.2em" fill="oklch(0.78 0.165 70 / 0.5)">THE REVENUE ENGINE — SYSTEMS · AUTOMATION · SCALE</text>
      </motion.g>

      {/* === BOTTOM: Feedback loop (compounding) === */}
      <motion.path
        d="M 865 240 C 865 280, 750 300, 420 300 C 200 300, 120 280, 80 260"
        stroke="oklch(0.78 0.165 70 / 0.3)"
        strokeWidth="1"
        strokeDasharray="6 6"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, delay: 3.5, ease: "easeInOut" as const }}
      />
      <motion.text x="420" y="310" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.15em" fill="oklch(0.78 0.165 70 / 0.4)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}>FEEDBACK LOOP — OPTIMIZE · COMPOUND · REPEAT</motion.text>
      {/* Loopback arrow */}
      <motion.polygon points="80,256 72,260 80,264" fill="oklch(0.78 0.165 70 / 0.4)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5 }} />
    </motion.svg>
  );
}
