"use client";

import { motion } from "framer-motion";

/**
 * Contextual blueprint sketches for each of Savin Group's 6 service packages.
 * Each illustration tells the specific story of that service — not generic icons.
 *
 * Uses consistent "dark blueprint" visual language:
 * - Thin stroke lines with brand colors
 * - Dashed construction lines
 * - Blueprint corner markers
 * - Annotation labels
 */

const draw = (i: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1, delay: i * 0.12, ease: "easeInOut" as const }, opacity: { duration: 0.2, delay: i * 0.12 } },
  },
});

const pop = (i: number) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.2 + i * 0.08, type: "spring" as const, stiffness: 170, damping: 14 },
  },
});

/* S01: RevSite Pro — High-conversion website with live metrics */
export function SketchWebsite({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Browser chrome */}
      <motion.rect x="10" y="10" width="88" height="65" rx="6" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.8" variants={draw(0)} />
      <motion.line x1="10" y1="22" x2="98" y2="22" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.5" variants={draw(1)} />
      <motion.circle cx="18" cy="16" r="1.5" fill="oklch(0.65 0.22 25 / 0.4)" variants={pop(0)} />
      <motion.circle cx="24" cy="16" r="1.5" fill="oklch(0.78 0.165 70 / 0.4)" variants={pop(0)} />
      <motion.circle cx="30" cy="16" r="1.5" fill="oklch(0.74 0.16 155 / 0.4)" variants={pop(0)} />
      {/* Content skeleton */}
      <motion.rect x="18" y="28" width="35" height="3" rx="1.5" fill="oklch(0.78 0.165 70 / 0.4)" variants={pop(1)} />
      <motion.rect x="18" y="36" width="68" height="2" rx="1" fill="var(--svg-line-faint)" variants={pop(2)} />
      <motion.rect x="18" y="42" width="52" height="2" rx="1" fill="var(--svg-grid-line)" variants={pop(2)} />
      {/* CTA */}
      <motion.rect x="18" y="52" width="28" height="10" rx="5" fill="oklch(0.78 0.165 70 / 0.22)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.6" variants={pop(3)} />
      {/* Conversion annotation */}
      <motion.g variants={pop(4)}>
        <line x1="98" y1="40" x2="110" y2="35" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="112" y="38" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.5)">2.1%</text>
        <text x="112" y="45" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.5)">CVR</text>
      </motion.g>
      {/* Speed indicator */}
      <motion.g variants={pop(5)}>
        <text x="112" y="60" fontFamily="var(--font-mono)" fontSize="5.5" fill="oklch(0.74 0.16 155 / 0.5)">&lt;2s</text>
        <text x="112" y="67" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.74 0.16 155 / 0.5)">LOAD</text>
      </motion.g>
    </motion.svg>
  );
}

/* S02: AutoSell Engine — WhatsApp + CRM automation pipeline */
export function SketchSeo({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Three-stage pipeline */}
      <motion.rect x="8" y="28" width="34" height="30" rx="6" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.8" fill="oklch(0.66 0.18 295 / 0.02)" variants={draw(0)} />
      <motion.rect x="53" y="28" width="34" height="30" rx="6" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" fill="oklch(0.78 0.165 70 / 0.02)" variants={draw(1)} />
      <motion.rect x="98" y="28" width="34" height="30" rx="6" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="0.8" fill="oklch(0.74 0.16 155 / 0.02)" variants={draw(2)} />
      {/* Arrows */}
      <motion.path d="M 42 43 L 53 43" stroke="var(--svg-line-faint)" strokeWidth="0.6" variants={draw(2)} />
      <motion.path d="M 87 43 L 98 43" stroke="var(--svg-line-faint)" strokeWidth="0.6" variants={draw(3)} />
      {/* Icons: chat bubble, gear, check */}
      <motion.g variants={pop(1)}>
        <rect x="18" y="37" width="12" height="9" rx="2" fill="none" stroke="oklch(0.66 0.18 295 / 0.4)" strokeWidth="0.6" />
        <path d="M 18 38 L 24 42 L 30 38" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.4" fill="none" />
      </motion.g>
      <motion.g variants={pop(2)} style={{ transformOrigin: "70px 43px" }}>
        <circle cx="70" cy="43" r="5" fill="none" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.6" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "70px 43px" }}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={a} x1="70" y1={43 - 6.5} x2="70" y2={43 - 8} stroke="oklch(0.78 0.165 70 / 0.45)" strokeWidth="1" strokeLinecap="round" transform={`rotate(${a} 70 43)`} />
          ))}
        </motion.g>
      </motion.g>
      <motion.path d="M 111 41 L 114 44 L 120 37" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={draw(3)} />
      {/* Labels */}
      <motion.text x="25" y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.4)" variants={pop(3)}>CAPTURE</motion.text>
      <motion.text x="70" y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.4)" variants={pop(3)}>NURTURE</motion.text>
      <motion.text x="115" y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.74 0.16 155 / 0.4)" variants={pop(3)}>CLOSE</motion.text>
      {/* Conversion annotation */}
      <motion.g variants={pop(5)}>
        <text x="115" y="84" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.74 0.16 155 / 0.5)">28%</text>
        <text x="115" y="91" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4.5" fill="oklch(0.74 0.16 155 / 0.5)">RECOVERY</text>
      </motion.g>
      {/* Flowing particle */}
      <motion.circle r="2" fill="oklch(0.78 0.165 70)" animate={{ cx: [25, 70, 115], opacity: [1, 0.7, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" as const, delay: 1 }} cy="43" />
    </motion.svg>
  );
}

/* S03: LocalDom SEO — Search ranking domination */
export function SketchAutomation({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Search bar */}
      <motion.rect x="15" y="15" width="90" height="18" rx="9" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="0.8" fill="none" variants={draw(0)} />
      <motion.circle cx="28" cy="24" r="4" fill="none" stroke="oklch(0.74 0.16 155 / 0.45)" strokeWidth="0.6" variants={draw(1)} />
      <motion.line x1="31" y1="27" x2="34" y2="30" stroke="oklch(0.74 0.16 155 / 0.45)" strokeWidth="0.6" variants={draw(1)} />
      <motion.rect x="38" y="22" width="40" height="3" rx="1.5" fill="oklch(0.74 0.16 155 / 0.4)" variants={pop(1)} />
      {/* Ranking results — rising to #1 */}
      {[
        { y: 42, w: 80, accent: false },
        { y: 54, w: 70, accent: false },
        { y: 66, w: 75, accent: true },
      ].map((row, i) => (
        <motion.g key={i} variants={pop(i + 2)}>
          <rect x="15" y={row.y} width={row.w} height="8" rx="3" fill={row.accent ? "oklch(0.74 0.16 155 / 0.35)" : "var(--svg-grid-line)"} stroke={row.accent ? "oklch(0.74 0.16 155 / 0.45)" : "var(--svg-line-faint)"} strokeWidth="0.5" />
          <text x="20" y={row.y + 6} fontFamily="var(--font-mono)" fontSize="5" fill={row.accent ? "oklch(0.74 0.16 155 / 0.6)" : "oklch(0.7 0.015 260 / 0.5)"}>{row.accent ? "YOUR BUSINESS — #1" : `Result ${i + 1}`}</text>
        </motion.g>
      ))}
      {/* Growth chart annotation */}
      <motion.polyline points="108,70 114,58 120,62 126,48 132,36" stroke="oklch(0.74 0.16 155 / 0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={draw(4)} />
      <motion.circle cx="132" cy="36" r="2.5" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(5)} />
      <motion.text x="120" y="82" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(5)}>+80%</motion.text>
      <motion.text x="120" y="89" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4.5" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(5)}>ORGANIC</motion.text>
    </motion.svg>
  );
}

/* S04: GlobalScale Suite — Multi-language global system */
export function SketchAI({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Globe */}
      <motion.circle cx="55" cy="50" r="28" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" variants={draw(0)} />
      <motion.ellipse cx="55" cy="50" rx="12" ry="28" stroke="oklch(0.66 0.18 295 / 0.22)" strokeWidth="0.5" variants={draw(1)} />
      <motion.ellipse cx="55" cy="50" rx="28" ry="10" stroke="oklch(0.66 0.18 295 / 0.22)" strokeWidth="0.5" variants={draw(1)} />
      {/* Language markers on globe */}
      {[
        { x: 40, y: 38, label: "EN" },
        { x: 68, y: 42, label: "हि" },
        { x: 48, y: 62, label: "ES" },
        { x: 66, y: 58, label: "中" },
      ].map((lang, i) => (
        <motion.g key={lang.label} variants={pop(i + 1)}>
          <circle cx={lang.x} cy={lang.y} r="6" fill="var(--svg-node-fill)" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.5" />
          <text x={lang.x} y={lang.y + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.5)">{lang.label}</text>
        </motion.g>
      ))}
      {/* Orbiting dot */}
      <motion.circle cx="83" cy="50" r="2" fill="oklch(0.78 0.165 70 / 0.5)" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "55px 50px" }} />
      {/* Multi-currency annotation */}
      <motion.g variants={pop(5)}>
        <text x="100" y="30" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.4)">₹ $ €</text>
        <text x="100" y="40" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.5)">MULTI</text>
        <text x="100" y="47" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.5)">CURRENCY</text>
      </motion.g>
      {/* NRI annotation */}
      <motion.g variants={pop(6)}>
        <text x="100" y="65" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.66 0.18 295 / 0.4)">3-5x</text>
        <text x="100" y="72" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.5)">HIGHER AOV</text>
      </motion.g>
    </motion.svg>
  );
}

/* S05: OperateOS — Custom ERP dashboard */
export function SketchDashboard({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Dashboard frame */}
      <motion.rect x="8" y="8" width="104" height="72" rx="6" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" variants={draw(0)} />
      {/* Sidebar */}
      <motion.line x1="30" y1="8" x2="30" y2="80" stroke="var(--svg-line-faint)" strokeWidth="0.5" variants={draw(1)} />
      {/* Sidebar modules */}
      {["INV", "FIN", "HR", "CRM"].map((label, i) => (
        <motion.g key={label} variants={pop(i)}>
          <rect x="12" y={16 + i * 14} width="14" height="10" rx="2" fill={i === 0 ? "oklch(0.78 0.165 70 / 0.4)" : "var(--svg-grid-line)"} stroke={i === 0 ? "oklch(0.78 0.165 70 / 0.4)" : "var(--svg-line-faint)"} strokeWidth="0.4" />
          <text x="19" y={23 + i * 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4" fill={i === 0 ? "oklch(0.78 0.165 70 / 0.5)" : "oklch(0.7 0.015 260 / 0.5)"}>{label}</text>
        </motion.g>
      ))}
      {/* KPI cards */}
      <motion.rect x="36" y="14" width="32" height="18" rx="3" fill="oklch(0.78 0.165 70 / 0.05)" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.4" variants={pop(2)} />
      <motion.text x="52" y="25" textAnchor="middle" fontFamily="var(--font-display)" fontSize="8" fontWeight="700" fill="oklch(0.78 0.165 70 / 0.5)" variants={pop(3)}>P&L</motion.text>
      <motion.text x="52" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4" fill="oklch(0.78 0.165 70 / 0.5)" variants={pop(3)}>DAILY</motion.text>
      <motion.rect x="74" y="14" width="32" height="18" rx="3" fill="oklch(0.74 0.16 155 / 0.05)" stroke="oklch(0.74 0.16 155 / 0.35)" strokeWidth="0.4" variants={pop(2)} />
      <motion.text x="90" y="25" textAnchor="middle" fontFamily="var(--font-display)" fontSize="8" fontWeight="700" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(3)}>-80%</motion.text>
      <motion.text x="90" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(3)}>MANUAL</motion.text>
      {/* Chart area */}
      {[
        { x: 40, h: 10 }, { x: 50, h: 18 }, { x: 60, h: 14 },
        { x: 70, h: 24 }, { x: 80, h: 20 }, { x: 90, h: 30 },
      ].map((bar, i) => (
        <motion.rect
          key={i} x={bar.x} y={72 - bar.h} width="7" height={bar.h} rx="1.5"
          fill={i === 5 ? "oklch(0.78 0.165 70 / 0.4)" : "oklch(0.78 0.165 70 / 0.35)"}
          initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.08, ease: "easeOut" as const }}
          style={{ transformOrigin: `${bar.x + 3.5}px 72px` }}
        />
      ))}
      {/* Annotation */}
      <motion.g variants={pop(6)}>
        <text x="120" y="50" fontFamily="var(--font-mono)" fontSize="5.5" fill="oklch(0.78 0.165 70 / 0.4)">REAL</text>
        <text x="120" y="57" fontFamily="var(--font-mono)" fontSize="5.5" fill="oklch(0.78 0.165 70 / 0.4)">TIME</text>
      </motion.g>
    </motion.svg>
  );
}

/* S06: GrowthOS Retainer — Compounding growth partner */
export function SketchMobile({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 140 100" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* Compounding growth curve */}
      <motion.path
        d="M 15 80 C 30 78, 50 72, 65 60 C 80 48, 90 35, 105 22 C 115 14, 120 10, 128 8"
        stroke="oklch(0.78 0.165 70 / 0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        variants={draw(0)}
      />
      {/* Area fill */}
      <motion.path
        d="M 15 80 C 30 78, 50 72, 65 60 C 80 48, 90 35, 105 22 C 115 14, 120 10, 128 8 L 128 80 Z"
        fill="oklch(0.78 0.165 70 / 0.03)"
        variants={pop(2)}
      />
      {/* Milestone dots */}
      {[
        { cx: 35, cy: 76, m: "M1" },
        { cx: 65, cy: 60, m: "M3" },
        { cx: 95, cy: 32, m: "M6" },
        { cx: 128, cy: 8, m: "M12" },
      ].map((pt, i) => (
        <motion.g key={pt.m} variants={pop(i + 1)}>
          <circle cx={pt.cx} cy={pt.cy} r="3" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.8" />
          <text x={pt.cx} y={pt.cy - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.4)">{pt.m}</text>
        </motion.g>
      ))}
      {/* "Each month builds" annotation */}
      <motion.g variants={pop(5)}>
        <text x="70" y="94" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="0.1em" fill="oklch(0.78 0.165 70 / 0.35)">COMPOUNDING — EACH MONTH BUILDS</text>
      </motion.g>
      {/* Endpoint marker */}
      <motion.circle cx="128" cy="8" r="4" fill="oklch(0.78 0.165 70 / 0.5)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" variants={pop(4)} />
      <motion.text x="128" y="5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.6)" variants={pop(5)}>3-5x</motion.text>
    </motion.svg>
  );
}

export const serviceIllustrations = [
  SketchWebsite,     // S01: RevSite Pro
  SketchSeo,         // S02: AutoSell Engine
  SketchAutomation,  // S03: LocalDom SEO
  SketchAI,          // S04: GlobalScale Suite
  SketchDashboard,   // S05: OperateOS
  SketchMobile,      // S06: GrowthOS Retainer
];
