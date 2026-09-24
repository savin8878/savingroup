"use client";

import { motion } from "framer-motion";

/**
 * "Chaos vs System" — Visual split for the Approach section.
 *
 * Left: scattered, disconnected tools (typical agency output)
 * Right: clean, unified revenue system (Savin Group's approach)
 *
 * Shows the exact comparison from the content:
 * websites vs systems, aesthetics vs ROI, one-off vs compounding.
 */
export function ApproachDuality({ className = "" }: { className?: string }) {
  const drawLine = (i: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1, delay: i * 0.12, ease: "easeInOut" as const },
        opacity: { duration: 0.2, delay: i * 0.12 },
      },
    },
  });

  const popIn = (i: number) => ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3 + i * 0.08, type: "spring" as const, stiffness: 160, damping: 14 },
    },
  });

  return (
    <motion.svg
      viewBox="0 0 640 260"
      fill="none"
      className={`w-full h-auto ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <defs>
        <filter id="ad-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Center divider */}
      <motion.line x1="320" y1="20" x2="320" y2="240" stroke="var(--svg-line-faint)" strokeWidth="1" strokeDasharray="4 4" variants={drawLine(0)} />

      {/* === LEFT SIDE: TYPICAL AGENCY (Chaos) === */}
      <motion.text variants={popIn(0)} x="160" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.7 0.015 260 / 0.4)">TYPICAL AGENCY</motion.text>

      {/* Scattered disconnected boxes — no flow, no system */}
      {[
        { x: 40, y: 50, w: 60, h: 35, label: "WEBSITE", rot: -3 },
        { x: 130, y: 40, w: 55, h: 30, label: "ADS", rot: 5 },
        { x: 230, y: 55, w: 50, h: 32, label: "CRM", rot: -2 },
        { x: 60, y: 110, w: 65, h: 30, label: "SOCIAL", rot: 4 },
        { x: 170, y: 100, w: 55, h: 35, label: "EMAIL", rot: -6 },
        { x: 250, y: 115, w: 45, h: 28, label: "SEO?", rot: 3 },
      ].map((box, i) => (
        <motion.g key={box.label} variants={popIn(i + 1)}>
          <g transform={`rotate(${box.rot} ${box.x + box.w / 2} ${box.y + box.h / 2})`}>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="6" fill="none" stroke="oklch(0.7 0.015 260 / 0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="oklch(0.7 0.015 260 / 0.5)">{box.label}</text>
          </g>
        </motion.g>
      ))}

      {/* Broken disconnected lines — nothing talks to anything */}
      <motion.path d="M 100 72 L 130 60" stroke="oklch(0.65 0.22 25 / 0.35)" strokeWidth="0.6" strokeDasharray="2 4" variants={drawLine(3)} />
      <motion.path d="M 185 67 L 230 70" stroke="oklch(0.65 0.22 25 / 0.35)" strokeWidth="0.6" strokeDasharray="2 4" variants={drawLine(3)} />
      <motion.path d="M 125 125 L 170 115" stroke="oklch(0.65 0.22 25 / 0.35)" strokeWidth="0.6" strokeDasharray="2 4" variants={drawLine(4)} />

      {/* Red X marks — things that don't work */}
      {[
        { x: 115, y: 65 },
        { x: 208, y: 68 },
        { x: 148, y: 118 },
      ].map((p, i) => (
        <motion.g key={i} variants={popIn(i + 4)}>
          <line x1={p.x - 3} y1={p.y - 3} x2={p.x + 3} y2={p.y + 3} stroke="oklch(0.65 0.22 25 / 0.4)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1={p.x + 3} y1={p.y - 3} x2={p.x - 3} y2={p.y + 3} stroke="oklch(0.65 0.22 25 / 0.4)" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>
      ))}

      {/* Chaos annotations */}
      <motion.g variants={popIn(6)}>
        <text x="60" y="175" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.65 0.22 25 / 0.35)">NO AUTOMATION</text>
        <text x="60" y="188" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.65 0.22 25 / 0.35)">NO FOLLOW-UP</text>
        <text x="60" y="201" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.65 0.22 25 / 0.35)">NO MEASUREMENT</text>
      </motion.g>

      {/* Dead end */}
      <motion.g variants={popIn(7)}>
        <rect x="100" y="215" width="120" height="28" rx="8" fill="oklch(0.65 0.22 25 / 0.06)" stroke="oklch(0.65 0.22 25 / 0.4)" strokeWidth="0.8" />
        <text x="160" y="232" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.1em" fill="oklch(0.65 0.22 25 / 0.5)">OUTPUT-FOCUSED</text>
      </motion.g>

      {/* === RIGHT SIDE: Savin Group (System) === */}
      <motion.text variants={popIn(0)} x="480" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.15em" fill="oklch(0.78 0.165 70 / 0.6)">Savin Group</motion.text>

      {/* Clean unified system — connected pipeline */}
      {/* Stage boxes in clean flow */}
      {[
        { x: 350, y: 45, w: 70, h: 38, label: "REVSITE", color: "oklch(0.78 0.165 70 / 0.35)" },
        { x: 440, y: 45, w: 70, h: 38, label: "AUTOSELL", color: "oklch(0.66 0.18 295 / 0.35)" },
        { x: 530, y: 45, w: 70, h: 38, label: "LOCALDOM", color: "oklch(0.74 0.16 155 / 0.35)" },
      ].map((box, i) => (
        <motion.g key={box.label} variants={popIn(i + 1)}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8" fill="var(--svg-node-fill)" stroke={box.color} strokeWidth="1" />
          <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill={box.color}>{box.label}</text>
        </motion.g>
      ))}

      {/* Clean connecting arrows */}
      <motion.path d="M 420 64 L 440 64" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" variants={drawLine(2)} />
      <motion.polygon points="437,61 443,64 437,67" fill="oklch(0.78 0.165 70 / 0.5)" variants={popIn(2)} />
      <motion.path d="M 510 64 L 530 64" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="1" variants={drawLine(3)} />
      <motion.polygon points="527,61 533,64 527,67" fill="oklch(0.66 0.18 295 / 0.5)" variants={popIn(3)} />

      {/* Central hub — unified data layer */}
      <motion.g variants={popIn(4)}>
        <rect x="400" y="105" width="160" height="50" rx="12" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.45)" strokeWidth="1" />
        <text x="480" y="125" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.12em" fill="oklch(0.78 0.165 70 / 0.4)">UNIFIED DATA LAYER</text>
        <text x="480" y="140" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.7 0.015 260 / 0.5)">CRM · ANALYTICS · AUTOMATION</text>
      </motion.g>

      {/* Connections from modules down to data layer */}
      <motion.path d="M 385 83 L 430 105" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.6" strokeDasharray="3 3" variants={drawLine(4)} />
      <motion.path d="M 475 83 L 480 105" stroke="oklch(0.66 0.18 295 / 0.35)" strokeWidth="0.6" strokeDasharray="3 3" variants={drawLine(4)} />
      <motion.path d="M 565 83 L 530 105" stroke="oklch(0.74 0.16 155 / 0.35)" strokeWidth="0.6" strokeDasharray="3 3" variants={drawLine(4)} />

      {/* Revenue output */}
      <motion.g variants={popIn(6)}>
        <path d="M 480 155 L 480 180" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" />
        <polygon points="477,177 480,183 483,177" fill="oklch(0.78 0.165 70 / 0.5)" />
      </motion.g>

      {/* Compound growth curve */}
      <motion.path
        d="M 380 220 C 400 218, 430 210, 460 195 C 480 185, 510 170, 560 168"
        stroke="oklch(0.78 0.165 70 / 0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        variants={drawLine(6)}
      />
      <motion.path
        d="M 380 220 C 400 218, 430 210, 460 195 C 480 185, 510 170, 560 168 L 560 220 L 380 220 Z"
        fill="oklch(0.78 0.165 70 / 0.03)"
        variants={popIn(7)}
      />
      <motion.circle cx="560" cy="168" r="3" fill="oklch(0.78 0.165 70)" filter="url(#ad-glow)" variants={popIn(8)} />

      {/* System annotations */}
      <motion.g variants={popIn(7)}>
        <text x="575" y="170" fontFamily="var(--font-mono)" fontSize="7" fill="oklch(0.78 0.165 70 / 0.5)">+200%</text>
        <text x="575" y="180" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.35)">ROI</text>
      </motion.g>

      {/* Bottom label */}
      <motion.g variants={popIn(8)}>
        <rect x="420" y="228" width="120" height="28" rx="8" fill="oklch(0.78 0.165 70 / 0.06)" stroke="oklch(0.78 0.165 70 / 0.45)" strokeWidth="0.8" />
        <text x="480" y="245" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.1em" fill="oklch(0.78 0.165 70 / 0.6)">OUTCOME-FOCUSED</text>
      </motion.g>

      {/* Flowing particle on right side */}
      <motion.circle r="2" fill="oklch(0.78 0.165 70)"
        animate={{ cx: [385, 475, 565], cy: [64, 64, 64], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" as const, delay: 2 }}
      />
    </motion.svg>
  );
}
