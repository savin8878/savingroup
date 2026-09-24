"use client";

import { motion } from "framer-motion";

/**
 * Contextual capability sketches for FeatureGrid.
 * Each maps to specific Savin Group capabilities, not generic icons.
 * Blueprint-style with brand colors.
 */

const draw = (i: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.8, delay: i * 0.1, ease: "easeInOut" as const }, opacity: { duration: 0.2, delay: i * 0.1 } },
  },
});

const pop = (i: number) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.15 + i * 0.06, type: "spring" as const, stiffness: 170, damping: 14 },
  },
});

/* Speed — Page load under 2s */
export function FeatSpeed({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.path d="M 38 10 L 28 28 L 36 28 L 33 46 L 48 24 L 40 24 Z" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="1" strokeLinejoin="round" fill="oklch(0.78 0.165 70 / 0.05)" variants={draw(0)} />
      <motion.text x="58" y="22" fontFamily="var(--font-mono)" fontSize="6" fill="oklch(0.78 0.165 70 / 0.35)" variants={pop(2)}>&lt;2s</motion.text>
      <motion.text x="58" y="30" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.45)" variants={pop(2)}>LOAD</motion.text>
    </motion.svg>
  );
}

/* SEO — Search ranking */
export function FeatSearch({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.circle cx="30" cy="26" r="14" stroke="oklch(0.74 0.16 155 / 0.45)" strokeWidth="0.8" variants={draw(0)} />
      <motion.line x1="40" y1="36" x2="50" y2="46" stroke="oklch(0.74 0.16 155 / 0.45)" strokeWidth="2" strokeLinecap="round" variants={draw(1)} />
      <motion.text x="30" y="30" textAnchor="middle" fontFamily="var(--font-display)" fontSize="9" fontWeight="700" fill="oklch(0.74 0.16 155 / 0.4)" variants={pop(2)}>#1</motion.text>
      <motion.polyline points="56,42 62,34 68,38 74,26" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={draw(2)} />
    </motion.svg>
  );
}

/* Global — Multi-region delivery */
export function FeatGlobe({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.circle cx="35" cy="28" r="16" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" variants={draw(0)} />
      <motion.ellipse cx="35" cy="28" rx="8" ry="16" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.4" variants={draw(1)} />
      <motion.line x1="19" y1="28" x2="51" y2="28" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.4" variants={draw(1)} />
      <motion.text x="62" y="24" fontFamily="var(--font-mono)" fontSize="5.5" fill="oklch(0.66 0.18 295 / 0.35)" variants={pop(2)}>190+</motion.text>
      <motion.text x="62" y="32" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.45)" variants={pop(2)}>COUNTRIES</motion.text>
    </motion.svg>
  );
}

/* Shield — Security + compliance */
export function FeatShield({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.path d="M 35 6 L 52 14 L 52 28 C 52 38, 44 45, 35 48 C 26 45, 18 38, 18 28 L 18 14 Z" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" fill="oklch(0.78 0.165 70 / 0.03)" variants={draw(0)} />
      <motion.path d="M 29 28 L 33 32 L 42 22" stroke="oklch(0.74 0.16 155 / 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={draw(2)} />
      <motion.text x="62" y="28" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.74 0.16 155 / 0.5)" variants={pop(3)}>GDPR</motion.text>
    </motion.svg>
  );
}

/* Mobile-first — Responsive design */
export function FeatMobile({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.rect x="28" y="4" width="22" height="40" rx="4" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" variants={draw(0)} />
      <motion.line x1="28" y1="12" x2="50" y2="12" stroke="oklch(0.78 0.165 70 / 0.28)" strokeWidth="0.4" variants={draw(1)} />
      <motion.line x1="28" y1="36" x2="50" y2="36" stroke="oklch(0.78 0.165 70 / 0.28)" strokeWidth="0.4" variants={draw(1)} />
      <motion.rect x="33" y="18" width="12" height="3" rx="1" fill="oklch(0.78 0.165 70 / 0.45)" variants={pop(2)} />
      <motion.rect x="33" y="24" width="8" height="2" rx="1" fill="var(--svg-grid-line)" variants={pop(2)} />
      <motion.rect x="33" y="29" width="12" height="4" rx="2" fill="oklch(0.78 0.165 70 / 0.4)" stroke="oklch(0.78 0.165 70 / 0.4)" strokeWidth="0.3" variants={pop(3)} />
      <motion.text x="62" y="22" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.35)" variants={pop(3)}>MOBILE</motion.text>
      <motion.text x="62" y="30" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.45)" variants={pop(3)}>FIRST</motion.text>
    </motion.svg>
  );
}

/* Database — Real-time data */
export function FeatDatabase({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.ellipse cx="35" cy="14" rx="16" ry="5" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.8" fill="oklch(0.66 0.18 295 / 0.03)" variants={draw(0)} />
      <motion.path d="M 19 14 L 19 38 C 19 41, 26 44, 35 44 C 44 44, 51 41, 51 38 L 51 14" stroke="oklch(0.66 0.18 295 / 0.5)" strokeWidth="0.8" variants={draw(1)} />
      <motion.ellipse cx="35" cy="26" rx="16" ry="4" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.4" variants={draw(2)} />
      {/* Blinking indicator */}
      <motion.circle cx="35" cy="26" r="1.5" fill="oklch(0.78 0.165 70 / 0.4)" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.text x="62" y="28" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.5)" variants={pop(3)}>REAL</motion.text>
      <motion.text x="62" y="36" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.66 0.18 295 / 0.5)" variants={pop(3)}>TIME</motion.text>
    </motion.svg>
  );
}

/* CI/CD — Continuous deployment */
export function FeatBranch({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.line x1="25" y1="8" x2="25" y2="48" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1" variants={draw(0)} />
      <motion.path d="M 25 20 C 35 20, 45 16, 45 24 C 45 32, 35 32, 25 32" stroke="oklch(0.66 0.18 295 / 0.45)" strokeWidth="0.8" fill="none" variants={draw(1)} />
      {[12, 20, 28, 36, 44].map((y, i) => (
        <motion.circle key={y} cx="25" cy={y} r="2.5" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.35)" strokeWidth="0.6" variants={pop(i)} />
      ))}
      <motion.circle cx="45" cy="24" r="2.5" fill="var(--svg-node-fill)" stroke="oklch(0.66 0.18 295 / 0.35)" strokeWidth="0.6" variants={pop(4)} />
      <motion.text x="58" y="24" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.5)" variants={pop(5)}>WEEKLY</motion.text>
      <motion.text x="58" y="32" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.5)" variants={pop(5)}>DEMOS</motion.text>
    </motion.svg>
  );
}

/* Support — Dedicated team */
export function FeatSupport({ className = "" }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 80 56" fill="none" className={className} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.path d="M 20 30 C 20 18, 28 10, 36 10 C 44 10, 52 18, 52 30" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" strokeLinecap="round" fill="none" variants={draw(0)} />
      <motion.rect x="14" y="28" width="10" height="14" rx="4" fill="oklch(0.78 0.165 70 / 0.05)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" variants={pop(1)} />
      <motion.rect x="48" y="28" width="10" height="14" rx="4" fill="oklch(0.78 0.165 70 / 0.05)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" variants={pop(1)} />
      <motion.text x="62" y="20" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.35)" variants={pop(2)}>4HR</motion.text>
      <motion.text x="62" y="28" fontFamily="var(--font-mono)" fontSize="5" fill="oklch(0.78 0.165 70 / 0.45)" variants={pop(2)}>SLA</motion.text>
    </motion.svg>
  );
}

export const featureIllustrationMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: FeatSpeed,
  search: FeatSearch,
  globe: FeatGlobe,
  shield: FeatShield,
  smartphone: FeatMobile,
  database: FeatDatabase,
  "git-branch": FeatBranch,
  headphones: FeatSupport,
};
