"use client";

import { motion } from "framer-motion";

/**
 * Animated orbital constellation SVG for the TechStack section.
 * Shows tech tools orbiting around a central core — representing
 * the integrated tech ecosystem Savin Group deploys.
 */
export function OrbitConstellation({ className = "" }: { className?: string }) {
  const orbitItems = [
    { label: "React", angle: 0, radius: 110, color: "oklch(0.66 0.18 295)" },
    { label: "Node", angle: 45, radius: 110, color: "oklch(0.74 0.16 155)" },
    { label: "AI", angle: 90, radius: 110, color: "oklch(0.78 0.165 70)" },
    { label: "DB", angle: 135, radius: 110, color: "oklch(0.66 0.18 295)" },
    { label: "CRM", angle: 180, radius: 110, color: "oklch(0.78 0.165 70)" },
    { label: "SEO", angle: 225, radius: 110, color: "oklch(0.74 0.16 155)" },
    { label: "API", angle: 270, radius: 110, color: "oklch(0.66 0.18 295)" },
    { label: "ERP", angle: 315, radius: 110, color: "oklch(0.78 0.165 70)" },
  ];

  const outerItems = [
    { label: "WhatsApp", angle: 20, radius: 165, color: "oklch(0.74 0.16 155 / 0.7)" },
    { label: "Shopify", angle: 70, radius: 165, color: "oklch(0.78 0.165 70 / 0.7)" },
    { label: "HubSpot", angle: 120, radius: 165, color: "oklch(0.66 0.18 295 / 0.7)" },
    { label: "Stripe", angle: 170, radius: 165, color: "oklch(0.78 0.165 70 / 0.7)" },
    { label: "Vercel", angle: 220, radius: 165, color: "oklch(0.7 0.015 260 / 0.6)" },
    { label: "AWS", angle: 290, radius: 165, color: "oklch(0.78 0.165 70 / 0.7)" },
  ];

  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      className={`w-full h-auto ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        <filter id="orbit-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="core-grad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.3)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70 / 0)" />
        </radialGradient>
      </defs>

      {/* Core glow */}
      <motion.circle cx="200" cy="200" r="50" fill="url(#core-grad)" animate={{ r: [50, 60, 50], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

      {/* Orbit rings */}
      <motion.circle cx="200" cy="200" r="110" stroke="var(--svg-line-faint)" strokeWidth="1" strokeDasharray="4 6" fill="none" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} />
      <motion.circle cx="200" cy="200" r="165" stroke="var(--svg-grid-line)" strokeWidth="1" strokeDasharray="3 8" fill="none" animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} />

      {/* Core hub */}
      <circle cx="200" cy="200" r="28" fill="var(--svg-node-fill)" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="1.5" />
      <motion.circle cx="200" cy="200" r="28" fill="none" stroke="oklch(0.78 0.165 70 / 0.3)" strokeWidth="1" animate={{ r: [28, 35, 28], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      {/* Core icon — diamond/gem */}
      <path d="M 192 196 L 200 188 L 208 196 L 200 212 Z" stroke="oklch(0.78 0.165 70)" strokeWidth="1.5" strokeLinejoin="round" fill="oklch(0.78 0.165 70 / 0.35)" />
      <line x1="194" y1="196" x2="206" y2="196" stroke="oklch(0.78 0.165 70 / 0.5)" strokeWidth="0.8" />

      {/* Inner orbit nodes — rotating slowly */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }}>
        {orbitItems.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const cx = 200 + item.radius * Math.cos(rad);
          const cy = 200 + item.radius * Math.sin(rad);
          return (
            <motion.g
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
            >
              {/* Connection line to core */}
              <line x1="200" y1="200" x2={cx} y2={cy} stroke={`${item.color.replace(")", " / 0.25)")}`} strokeWidth="0.5" />
              <circle cx={cx} cy={cy} r="16" fill="var(--svg-node-fill)" stroke={`${item.color.replace(")", " / 0.5)")}`} strokeWidth="1" />
              {/* Counter-rotate text so it stays upright */}
              <motion.g animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${cx}px ${cy}px` }}>
                <text x={cx} y={cy + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" letterSpacing="0.08em" fill={item.color}>{item.label}</text>
              </motion.g>
            </motion.g>
          );
        })}
      </motion.g>

      {/* Outer orbit nodes — rotating opposite direction */}
      <motion.g animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }}>
        {outerItems.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const cx = 200 + item.radius * Math.cos(rad);
          const cy = 200 + item.radius * Math.sin(rad);
          return (
            <motion.g
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 160 }}
            >
              <circle cx={cx} cy={cy} r="4" fill={item.color} />
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: `${cx}px ${cy}px` }}>
                <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" letterSpacing="0.06em" fill={item.color}>{item.label}</text>
              </motion.g>
            </motion.g>
          );
        })}
      </motion.g>

      {/* Animated pulse particles traveling along orbits */}
      <motion.circle cx="310" cy="200" r="2" fill="oklch(0.78 0.165 70)" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} />
      <motion.circle cx="365" cy="200" r="1.5" fill="oklch(0.66 0.18 295)" animate={{ rotate: [0, -360] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} />
    </motion.svg>
  );
}
