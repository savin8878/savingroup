"use client";

import { motion } from "framer-motion";

/**
 * Per-city iconic identity SVGs — rendered as dense sketched-blueprint
 * posters of the metro. Each component is a layered hand-drawn-feel
 * composition that does double duty:
 *
 *   1. Tells you what the city *looks like*  (skyline, landmarks)
 *   2. Tells you what the city *ships*       (industry stamps, prosperity)
 *
 * Layout grammar (480 × 420 viewBox):
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ TITLE CARTOUCHE   ·   nickname   ·   est. year   ·   lat/lng │
 *   ├────────────────────────────────────────────────────────────┤
 *   │                                                            │
 *   │   [skyline silhouette]                                     │
 *   │   [LANDMARK 1]   [LANDMARK 2]   [LANDMARK 3]               │
 *   │   ── annotated arrows pointing at features ──              │
 *   │   [industry sketches with stamps]                          │
 *   │   [cultural / geographic element]                          │
 *   │                                                            │
 *   ├────────────────────────────────────────────────────────────┤
 *   │ PROSPERITY RIBBON  ·  4 metrics    │  COMPASS ROSE + pins  │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Animation tempo: pen-draw `pathLength` reveal for landmarks, staggered
 * spring-pop for industry chips, drifting particles for activity, looping
 * dashed orbits / waves for ambient motion.
 */

const VIEWBOX = "0 0 480 420";

const draw = (delay = 0, duration = 1.1) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration, delay, ease: "easeInOut" as const },
      opacity: { duration: 0.25, delay },
    },
  },
});

const pop = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay, type: "spring" as const, stiffness: 180, damping: 14 },
  },
});

const fade = (delay = 0, duration = 0.6) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay, duration } },
});

/* ============================================================================ */
/*                              SKETCH PRIMITIVES                                */
/* ============================================================================ */

/** Faint dotted blueprint grid — gives every poster the "graph paper" feel */
function BlueprintGrid({ color }: { color: string }) {
  return (
    <g aria-hidden>
      {Array.from({ length: 25 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 20}
          y1="0"
          x2={i * 20}
          y2="420"
          stroke={`${color.replace(")", " / 0.05)")}`}
          strokeWidth="0.4"
        />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 20}
          x2="480"
          y2={i * 20}
          stroke={`${color.replace(")", " / 0.05)")}`}
          strokeWidth="0.4"
        />
      ))}
    </g>
  );
}

/** The cartouche / title block that crowns each poster. */
function SketchTitle({
  city,
  nickname,
  est,
  lat,
  lng,
  color,
  accent,
}: {
  city: string;
  nickname: string;
  est: string;
  lat: string;
  lng: string;
  color: string;
  accent: string;
}) {
  return (
    <g>
      {/* corner registration marks (blueprint feel) */}
      {[
        [10, 10],
        [470, 10],
        [10, 60],
        [470, 60],
      ].map(([x, y], i) => (
        <motion.g key={`reg-${i}`} variants={fade(0.05 * i)}>
          <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={color} strokeWidth="0.6" />
          <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={color} strokeWidth="0.6" />
        </motion.g>
      ))}
      {/* title bar */}
      <motion.rect
        x="20"
        y="14"
        width="440"
        height="48"
        rx="2"
        fill="none"
        stroke={`${color.replace(")", " / 0.45)")}`}
        strokeWidth="0.8"
        strokeDasharray="3 2"
        variants={draw(0.05, 0.9)}
      />
      {/* inner ruled lines */}
      <motion.line
        x1="24"
        y1="22"
        x2="456"
        y2="22"
        stroke={`${color.replace(")", " / 0.2)")}`}
        strokeWidth="0.4"
        variants={draw(0.2, 0.6)}
      />
      <motion.line
        x1="24"
        y1="54"
        x2="456"
        y2="54"
        stroke={`${color.replace(")", " / 0.2)")}`}
        strokeWidth="0.4"
        variants={draw(0.25, 0.6)}
      />

      {/* est. year stamp (left) */}
      <motion.g variants={pop(0.3)}>
        <rect
          x="28"
          y="26"
          width="50"
          height="24"
          rx="2"
          fill={`${color.replace(")", " / 0.06)")}`}
          stroke={color}
          strokeWidth="0.6"
        />
        <text
          x="53"
          y="36"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5.5"
          letterSpacing="0.18em"
          fill={`${color.replace(")", " / 0.6)")}`}
        >
          EST.
        </text>
        <text
          x="53"
          y="46"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="9"
          fontWeight="700"
          fill={color}
        >
          {est}
        </text>
      </motion.g>

      {/* city name (centre) */}
      <motion.text
        x="240"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="12"
        fontWeight="700"
        letterSpacing="0.32em"
        fill={color}
        variants={pop(0.4)}
      >
        {city.toUpperCase()}
      </motion.text>
      <motion.text
        x="240"
        y="48"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6.5"
        letterSpacing="0.32em"
        fill={accent}
        variants={pop(0.45)}
      >
        {nickname.toUpperCase()}
      </motion.text>

      {/* lat/lng plate (right) */}
      <motion.g variants={pop(0.5)}>
        <rect
          x="402"
          y="26"
          width="50"
          height="24"
          rx="2"
          fill={`${color.replace(")", " / 0.06)")}`}
          stroke={color}
          strokeWidth="0.6"
        />
        <text
          x="427"
          y="35"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5"
          letterSpacing="0.1em"
          fill={`${color.replace(")", " / 0.6)")}`}
        >
          {lat}°N
        </text>
        <text
          x="427"
          y="44"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5"
          letterSpacing="0.1em"
          fill={`${color.replace(")", " / 0.6)")}`}
        >
          {lng}°E
        </text>
      </motion.g>

      {/* page-corner sheet number */}
      <motion.text
        x="465"
        y="412"
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize="6"
        letterSpacing="0.2em"
        fill={`${color.replace(")", " / 0.4)")}`}
        variants={fade(0.6)}
      >
        SHEET 01 / Savin Group ATLAS
      </motion.text>
    </g>
  );
}

/** Annotated arrow pointing at a feature — the sketched callout primitive. */
function SketchAnnotation({
  x1,
  y1,
  x2,
  y2,
  label,
  sub,
  color,
  delay = 0,
  align = "start",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  sub?: string;
  color: string;
  delay?: number;
  align?: "start" | "end" | "middle";
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // arrowhead at (x2,y2)
  const ax1 = x2 - 5 * ux + 3 * uy;
  const ay1 = y2 - 5 * uy - 3 * ux;
  const ax2 = x2 - 5 * ux - 3 * uy;
  const ay2 = y2 - 5 * uy + 3 * ux;
  return (
    <motion.g initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={color}
        strokeWidth="0.6"
        strokeDasharray="2 2"
        fill="none"
        variants={draw(delay, 0.6)}
      />
      <motion.path
        d={`M ${ax1} ${ay1} L ${x2} ${y2} L ${ax2} ${ay2}`}
        stroke={color}
        strokeWidth="0.6"
        fill="none"
        variants={fade(delay + 0.3)}
      />
      <motion.text
        x={x1}
        y={y1 - 2}
        textAnchor={align}
        fontFamily="var(--font-mono)"
        fontSize="6"
        letterSpacing="0.16em"
        fill={color}
        fontWeight="700"
        variants={fade(delay + 0.4)}
      >
        {label}
      </motion.text>
      {sub && (
        <motion.text
          x={x1}
          y={y1 + 7}
          textAnchor={align}
          fontFamily="var(--font-mono)"
          fontSize="5"
          letterSpacing="0.1em"
          fill={`${color.replace(")", " / 0.6)")}`}
          variants={fade(delay + 0.5)}
        >
          {sub}
        </motion.text>
      )}
    </motion.g>
  );
}

/** Industry stamp — labelled badge with little icon. */
function IndustryStamp({
  x,
  y,
  label,
  sub,
  color,
  delay = 0,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.g
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={pop(delay)}
    >
      <rect
        x={x}
        y={y}
        width="78"
        height="18"
        rx="2"
        fill={`${color.replace(")", " / 0.06)")}`}
        stroke={color}
        strokeWidth="0.6"
      />
      <rect
        x={x + 2}
        y={y + 2}
        width="74"
        height="14"
        rx="1"
        fill="none"
        stroke={`${color.replace(")", " / 0.3)")}`}
        strokeWidth="0.3"
        strokeDasharray="1 1"
      />
      <circle cx={x + 8} cy={y + 9} r="2.5" fill={color} />
      <text
        x={x + 14}
        y={y + 8}
        fontFamily="var(--font-mono)"
        fontSize="6"
        fontWeight="700"
        letterSpacing="0.12em"
        fill={color}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + 14}
          y={y + 14}
          fontFamily="var(--font-mono)"
          fontSize="4.5"
          letterSpacing="0.08em"
          fill={`${color.replace(")", " / 0.6)")}`}
        >
          {sub}
        </text>
      )}
    </motion.g>
  );
}

/** Prosperity ribbon — the bottom strip with 4 economic metrics. */
function ProsperityRibbon({
  metrics,
  color,
  accent,
}: {
  metrics: Array<{ value: string; label: string }>;
  color: string;
  accent: string;
}) {
  return (
    <g>
      {/* container */}
      <motion.rect
        x="20"
        y="328"
        width="280"
        height="58"
        rx="2"
        fill={`${color.replace(")", " / 0.04)")}`}
        stroke={color}
        strokeWidth="0.6"
        strokeDasharray="3 2"
        variants={draw(0.7, 0.8)}
      />
      <motion.text
        x="28"
        y="338"
        fontFamily="var(--font-mono)"
        fontSize="5"
        letterSpacing="0.22em"
        fill={`${color.replace(")", " / 0.5)")}`}
        variants={fade(0.85)}
      >
        PROSPERITY · LIVE INDICATORS
      </motion.text>
      {metrics.slice(0, 4).map((m, i) => {
        const x = 28 + i * 70;
        return (
          <motion.g key={m.label} variants={pop(0.95 + i * 0.06)}>
            <text
              x={x}
              y={358}
              fontFamily="var(--font-display)"
              fontSize="13"
              fontWeight="700"
              fill={i % 2 === 0 ? color : accent}
            >
              {m.value}
            </text>
            <text
              x={x}
              y={372}
              fontFamily="var(--font-mono)"
              fontSize="5"
              letterSpacing="0.1em"
              fill={`${color.replace(")", " / 0.65)")}`}
            >
              {m.label.toUpperCase()}
            </text>
            {i < 3 && (
              <line
                x1={x + 60}
                y1={344}
                x2={x + 60}
                y2={376}
                stroke={`${color.replace(")", " / 0.2)")}`}
                strokeWidth="0.4"
              />
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

/** Compass rose with neighborhood pins — bottom-right of every poster. */
function CompassRose({
  cx,
  cy,
  color,
  accent,
  pins,
}: {
  cx: number;
  cy: number;
  color: string;
  accent: string;
  pins: Array<{ angle: number; label: string }>;
}) {
  const r = 32;
  return (
    <motion.g initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {/* outer ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        strokeDasharray="2 2"
        variants={draw(0.7, 0.6)}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={r - 6}
        fill="none"
        stroke={`${color.replace(")", " / 0.4)")}`}
        strokeWidth="0.4"
        variants={draw(0.78, 0.5)}
      />
      {/* N/E/S/W marks */}
      {[
        { a: -90, l: "N" },
        { a: 0, l: "E" },
        { a: 90, l: "S" },
        { a: 180, l: "W" },
      ].map(({ a, l }, i) => {
        const rad = (a * Math.PI) / 180;
        const x = cx + (r + 4) * Math.cos(rad);
        const y = cy + (r + 4) * Math.sin(rad) + 2;
        return (
          <motion.text
            key={l}
            x={x}
            y={y}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="6"
            fontWeight="700"
            fill={color}
            variants={fade(0.85 + i * 0.04)}
          >
            {l}
          </motion.text>
        );
      })}
      {/* compass needle */}
      <motion.path
        d={`M ${cx} ${cy - r + 6} L ${cx + 4} ${cy} L ${cx} ${cy - 4} L ${cx - 4} ${cy} Z`}
        fill={accent}
        stroke={accent}
        strokeWidth="0.4"
        variants={pop(0.95)}
      />
      <motion.path
        d={`M ${cx} ${cy + r - 6} L ${cx + 4} ${cy} L ${cx} ${cy + 4} L ${cx - 4} ${cy} Z`}
        fill={`${color.replace(")", " / 0.6)")}`}
        stroke={color}
        strokeWidth="0.4"
        variants={pop(1)}
      />
      <motion.circle cx={cx} cy={cy} r="2" fill={color} variants={pop(1.05)} />

      {/* neighborhood pins around compass */}
      {pins.map((pin, i) => {
        const rad = (pin.angle * Math.PI) / 180;
        const px = cx + (r + 26) * Math.cos(rad);
        const py = cy + (r + 26) * Math.sin(rad);
        return (
          <motion.g key={pin.label} variants={pop(1.1 + i * 0.06)}>
            <line
              x1={cx + r * Math.cos(rad)}
              y1={cy + r * Math.sin(rad)}
              x2={px - 4 * Math.cos(rad)}
              y2={py - 4 * Math.sin(rad)}
              stroke={`${color.replace(")", " / 0.3)")}`}
              strokeWidth="0.4"
              strokeDasharray="1 1.5"
            />
            <circle cx={px} cy={py} r="2.2" fill={accent} />
            <text
              x={px + 5 * Math.cos(rad)}
              y={py + 5 * Math.sin(rad) + 2}
              textAnchor={Math.cos(rad) > 0.5 ? "start" : Math.cos(rad) < -0.5 ? "end" : "middle"}
              fontFamily="var(--font-mono)"
              fontSize="5.5"
              fontWeight="600"
              fill={color}
            >
              {pin.label}
            </text>
          </motion.g>
        );
      })}

      {/* compass label */}
      <motion.text
        x={cx}
        y={cy + r + 50}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="5"
        letterSpacing="0.22em"
        fill={`${color.replace(")", " / 0.55)")}`}
        variants={fade(1.4)}
      >
        BUSINESS BELTS
      </motion.text>
    </motion.g>
  );
}

/** Skyline silhouette — varied building shapes. */
function SketchSkyline({
  buildings,
  color,
  groundY,
}: {
  buildings: Array<{ x: number; w: number; h: number; type?: "flat" | "step" | "antenna" | "dome" }>;
  color: string;
  groundY: number;
}) {
  return (
    <>
      {buildings.map((b, i) => {
        const top = groundY - b.h;
        return (
          <motion.g
            key={`b-${i}-${b.x}`}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 + i * 0.025, duration: 0.4 }}
          >
            <rect
              x={b.x}
              y={top}
              width={b.w}
              height={b.h}
              fill={`${color.replace(")", " / 0.18)")}`}
              stroke={`${color.replace(")", " / 0.45)")}`}
              strokeWidth="0.4"
            />
            {/* tiny window grid */}
            {Array.from({ length: Math.floor(b.h / 11) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor(b.w / 6)) }).map((_, c) => (
                <rect
                  key={`w-${i}-${r}-${c}`}
                  x={b.x + 1.5 + c * 6}
                  y={top + 4 + r * 11}
                  width="2.4"
                  height="3"
                  fill={`${color.replace(")", " / 0.42)")}`}
                />
              ))
            )}
            {b.type === "step" && (
              <rect x={b.x + 2} y={top - 5} width={b.w - 4} height={5} fill={`${color.replace(")", " / 0.36)")}`} />
            )}
            {b.type === "antenna" && (
              <line x1={b.x + b.w / 2} y1={top} x2={b.x + b.w / 2} y2={top - 12} stroke={`${color.replace(")", " / 0.6)")}`} strokeWidth="0.5" />
            )}
            {b.type === "dome" && (
              <path d={`M ${b.x} ${top} Q ${b.x + b.w / 2} ${top - 6} ${b.x + b.w} ${top}`} fill={`${color.replace(")", " / 0.36)")}`} />
            )}
          </motion.g>
        );
      })}
    </>
  );
}

/** Hatched fill — gives any polygon the inked-shading look. */
function HatchedFill({
  id,
  color,
  spacing = 4,
  angle = 45,
}: {
  id: string;
  color: string;
  spacing?: number;
  angle?: number;
}) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing} patternTransform={`rotate(${angle})`}>
      <line x1="0" y1="0" x2="0" y2={spacing} stroke={color} strokeWidth="0.4" />
    </pattern>
  );
}

/* ============================================================================ */
/*                                  JAIPUR                                      */
/* ============================================================================ */

export function JaipurIdentity({ className = "" }: { className?: string }) {
  const pink = "oklch(0.72 0.16 12)";
  const accent = "oklch(0.6 0.2 30)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <HatchedFill id="jp-hatch" color={`${pink.replace(")", " / 0.18)")}`} spacing={3} />
        <linearGradient id="jp-sky" x1="0" y1="60" x2="0" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${pink.replace(")", " / 0.22)")}`} />
          <stop offset="100%" stopColor={`${pink.replace(")", " / 0.04)")}`} />
        </linearGradient>
      </defs>

      <BlueprintGrid color={pink} />
      <rect x="0" y="62" width="480" height="262" fill="url(#jp-sky)" />
      <SketchTitle city="Jaipur" nickname="Pink City · Heritage Capital" est="1727" lat="26.92" lng="75.78" color={pink} accent={accent} />

      {/* sun */}
      <motion.circle cx="396" cy="100" r="20" fill={`${accent.replace(")", " / 0.22)")}`} stroke={accent} strokeWidth="0.6"
        animate={{ r: [18, 22, 18], opacity: [0.7, 1, 0.7] }} transition={{ duration: 5, repeat: Infinity }} />

      {/* Amber Fort hill silhouette */}
      <motion.path
        d="M 0 220 L 30 200 L 55 175 L 80 168 L 100 175 L 95 180 L 105 184 L 100 192 L 110 196 L 105 204 L 115 208 L 0 250 Z"
        fill="url(#jp-hatch)"
        stroke={`${pink.replace(")", " / 0.45)")}`}
        strokeWidth="0.6"
        variants={fade(0.15)}
      />
      <motion.text x="62" y="166" fontFamily="var(--font-mono)" fontSize="5" letterSpacing="0.18em" fill={pink} variants={fade(0.5)}>
        AMBER FORT
      </motion.text>

      {/* Hawa Mahal centre — facade + spire + 4 storey honeycomb */}
      <motion.path d="M 240 96 L 250 116 L 230 116 Z" fill={`${pink.replace(")", " / 0.5)")}`} stroke={pink} strokeWidth="1" variants={draw(0.2)} />
      <motion.circle cx="240" cy="116" r="8" fill={pink} variants={pop(0.32)} />
      <motion.rect x="120" y="128" width="240" height="120" fill={`${pink.replace(")", " / 0.1)")}`} stroke={pink} strokeWidth="1.4" variants={draw(0.25, 1.1)} />
      {/* roofline crenellations */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.path key={`crl-${i}`} d={`M ${122 + i * 20} 128 L ${128 + i * 20} 122 L ${134 + i * 20} 128`} stroke={pink} strokeWidth="0.6" fill="none" variants={draw(0.5 + i * 0.025, 0.4)} />
      ))}
      {/* 4-storey honeycomb of windows */}
      {[
        { y: 138, count: 11, w: 18 },
        { y: 162, count: 10, w: 20 },
        { y: 188, count: 9, w: 22 },
        { y: 215, count: 8, w: 25 },
      ].map((row, r) =>
        Array.from({ length: row.count }).map((_, i) => {
          const totalW = row.count * row.w;
          const startX = 240 - totalW / 2;
          const x = startX + i * row.w;
          return (
            <motion.g key={`win-${r}-${i}`} variants={pop(0.55 + r * 0.04 + i * 0.012)}>
              <rect x={x + 1} y={row.y} width={row.w - 2} height="14" rx="3" fill={`${accent.replace(")", " / 0.28)")}`} stroke={`${accent.replace(")", " / 0.55)")}`} strokeWidth="0.4" />
              <path d={`M ${x + 1} ${row.y + 4} Q ${x + row.w / 2} ${row.y - 3} ${x + row.w - 1} ${row.y + 4}`} fill="none" stroke={`${accent.replace(")", " / 0.55)")}`} strokeWidth="0.4" />
            </motion.g>
          );
        })
      )}
      {/* Hawa Mahal callout */}
      <SketchAnnotation x1={300} y1={120} x2={272} y2={142} label="HAWA MAHAL" sub="953 windows · 1799" color={pink} delay={1.0} align="start" />

      {/* Jantar Mantar instrument (top-left) */}
      <motion.g variants={pop(0.5)}>
        <path d="M 50 138 L 50 100 L 78 100 L 50 138" fill={`${pink.replace(")", " / 0.18)")}`} stroke={pink} strokeWidth="0.7" />
        <line x1="50" y1="100" x2="50" y2="92" stroke={pink} strokeWidth="0.6" />
        <circle cx="50" cy="90" r="1.5" fill={pink} />
        <text x="50" y="148" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" letterSpacing="0.16em" fill={pink}>JANTAR MANTAR</text>
      </motion.g>

      {/* Faceted gemstone (foreground left) */}
      <motion.g variants={pop(0.95)}>
        <path d="M 28 268 L 56 240 L 84 268 L 56 308 Z" fill={`${accent.replace(")", " / 0.45)")}`} stroke={accent} strokeWidth="0.8" />
        <line x1="28" y1="268" x2="84" y2="268" stroke={accent} strokeWidth="0.5" />
        <line x1="42" y1="254" x2="56" y2="268" stroke={accent} strokeWidth="0.4" />
        <line x1="70" y1="254" x2="56" y2="268" stroke={accent} strokeWidth="0.4" />
        <line x1="56" y1="240" x2="56" y2="268" stroke={accent} strokeWidth="0.4" />
        <motion.circle cx="46" cy="252" r="1.4" fill="oklch(0.99 0.05 30)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }} />
      </motion.g>
      <SketchAnnotation x1={106} y1={252} x2={84} y2={258} label="GEM CUT · KOH-I-NOOR LINEAGE" sub="World's #3 cutting hub" color={accent} delay={1.05} align="start" />

      {/* Block-print fabric drape (foreground right) */}
      <motion.g variants={pop(1.0)}>
        <path d="M 360 268 Q 396 282 432 270 L 436 308 Q 396 318 360 308 Z" fill={`${pink.replace(")", " / 0.28)")}`} stroke={pink} strokeWidth="0.6" />
        {[
          { cx: 372, cy: 286 },
          { cx: 392, cy: 290 },
          { cx: 412, cy: 288 },
        ].map((m, i) => (
          <g key={`bp-${i}`}>
            <circle cx={m.cx} cy={m.cy} r="2.4" fill={accent} />
            <circle cx={m.cx} cy={m.cy} r="0.8" fill={pink} />
            <line x1={m.cx - 4} y1={m.cy} x2={m.cx + 4} y2={m.cy} stroke={`${accent.replace(")", " / 0.4)")}`} strokeWidth="0.3" />
            <line x1={m.cx} y1={m.cy - 4} x2={m.cx} y2={m.cy + 4} stroke={`${accent.replace(")", " / 0.4)")}`} strokeWidth="0.3" />
          </g>
        ))}
        {/* stamping block */}
        <rect x="402" y="246" width="14" height="10" rx="1" fill={`${pink.replace(")", " / 0.6)")}`} stroke={pink} strokeWidth="0.5" />
        <line x1="402" y1="256" x2="416" y2="256" stroke={pink} strokeWidth="0.5" />
      </motion.g>
      <SketchAnnotation x1={356} y1={252} x2={364} y2={264} label="SANGANER BLOCK PRINT" sub="GI 86 · 8-gen workshops" color={pink} delay={1.1} align="end" />

      {/* Industry stamps */}
      <IndustryStamp x={20} y={306} label="GEM TRADE" sub="₹40,000Cr exports" color={accent} delay={1.15} />
      <IndustryStamp x={102} y={306} label="BLOCK PRINT" sub="GI · Sanganer / Bagru" color={pink} delay={1.18} />
      <IndustryStamp x={184} y={306} label="HERITAGE" sub="Top-3 tourist arrivals" color={accent} delay={1.21} />

      {/* Prosperity ribbon */}
      <ProsperityRibbon
        color={pink}
        accent={accent}
        metrics={[
          { value: "₹40K Cr", label: "Gem exports / yr" },
          { value: "₹15K Cr", label: "Textile exports" },
          { value: "9×9", label: "Vastu grid plan" },
          { value: "1876", label: "Pink-paint law" },
        ]}
      />

      {/* Compass rose with neighborhoods */}
      <CompassRose
        cx={392}
        cy={358}
        color={pink}
        accent={accent}
        pins={[
          { angle: -90, label: "AMBER" },
          { angle: -30, label: "JOHARI" },
          { angle: 30, label: "MANSAROVAR" },
          { angle: 90, label: "SANGANER" },
          { angle: 150, label: "BAGRU" },
          { angle: 210, label: "VAISHALI" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  MUMBAI                                      */
/* ============================================================================ */

export function MumbaiIdentity({ className = "" }: { className?: string }) {
  const blue = "oklch(0.62 0.2 250)";
  const orange = "oklch(0.78 0.165 50)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="mb-sky" x1="0" y1="62" x2="0" y2="262" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${blue.replace(")", " / 0.22)")}`} />
          <stop offset="55%" stopColor={`${orange.replace(")", " / 0.12)")}`} />
          <stop offset="100%" stopColor="oklch(0.99 0.002 260 / 0)" />
        </linearGradient>
      </defs>
      <BlueprintGrid color={blue} />
      <rect x="0" y="62" width="480" height="200" fill="url(#mb-sky)" />
      <SketchTitle city="Mumbai" nickname="Maximum City · Bombay" est="1668" lat="19.07" lng="72.87" color={blue} accent={orange} />

      {/* setting sun */}
      <motion.circle cx="240" cy="148" r="32" fill={`${orange.replace(")", " / 0.4)")}`} animate={{ r: [30, 36, 30], opacity: [0.65, 0.95, 0.65] }} transition={{ duration: 5, repeat: Infinity }} />

      {/* South Bombay skyline (left) + BKC skyline (right) */}
      <SketchSkyline
        color={blue}
        groundY={262}
        buildings={[
          { x: 16, w: 16, h: 56 },
          { x: 34, w: 20, h: 76, type: "antenna" },
          { x: 56, w: 18, h: 62 },
          { x: 76, w: 16, h: 88 },
          { x: 94, w: 22, h: 68, type: "step" },
          { x: 118, w: 20, h: 100, type: "antenna" },
          { x: 140, w: 16, h: 78 },
          { x: 158, w: 20, h: 92 },
          { x: 314, w: 20, h: 95, type: "antenna" },
          { x: 336, w: 16, h: 72 },
          { x: 354, w: 24, h: 110, type: "step" },
          { x: 380, w: 18, h: 85 },
          { x: 400, w: 22, h: 78 },
          { x: 424, w: 16, h: 62 },
          { x: 442, w: 22, h: 92, type: "antenna" },
        ]}
      />

      {/* Bandra-Worli Sea Link cables */}
      <motion.g variants={fade(0.4)}>
        <line x1="118" y1="92" x2="58" y2="216" stroke={`${blue.replace(")", " / 0.32)")}`} strokeWidth="0.4" />
        <line x1="118" y1="92" x2="98" y2="216" stroke={`${blue.replace(")", " / 0.32)")}`} strokeWidth="0.4" />
        <line x1="118" y1="92" x2="138" y2="216" stroke={`${blue.replace(")", " / 0.32)")}`} strokeWidth="0.4" />
        <line x1="118" y1="92" x2="178" y2="216" stroke={`${blue.replace(")", " / 0.32)")}`} strokeWidth="0.4" />
        <rect x="116" y="86" width="4" height="18" fill={`${blue.replace(")", " / 0.4)")}`} />
      </motion.g>
      <SketchAnnotation x1={92} y1={108} x2={120} y2={94} label="SEA LINK" sub="5.6 km · 2009" color={blue} delay={0.85} align="start" />

      {/* Gateway of India arch */}
      <motion.g variants={pop(0.5)}>
        <path d="M 200 262 L 200 168 Q 200 146 220 146 L 260 146 Q 280 146 280 168 L 280 262" fill={`${blue.replace(")", " / 0.18)")}`} stroke={blue} strokeWidth="1.6" />
        <path d="M 200 168 Q 240 124 280 168 Z" fill={`${blue.replace(")", " / 0.25)")}`} stroke={blue} strokeWidth="1.4" />
        <path d="M 220 262 L 220 198 Q 220 178 240 178 Q 260 178 260 198 L 260 262" fill="var(--background)" stroke={blue} strokeWidth="0.8" />
        {[200, 280].map((x, i) => (
          <g key={`sp-${i}`}>
            <rect x={x - 4} y="134" width="8" height="20" fill={blue} />
            <path d={`M ${x - 5} 134 L ${x} 118 L ${x + 5} 134 Z`} fill={blue} />
            <line x1={x} y1="118" x2={x} y2="110" stroke={blue} strokeWidth="0.6" />
          </g>
        ))}
        <line x1="240" y1="124" x2="240" y2="112" stroke={blue} strokeWidth="0.7" />
        <circle cx="240" cy="110" r="1.8" fill={blue} />
      </motion.g>
      <SketchAnnotation x1={186} y1={150} x2={208} y2={170} label="GATEWAY OF INDIA" sub="1924 · Apollo Bunder" color={blue} delay={0.9} align="end" />

      {/* CST station hint (between buildings) */}
      <motion.g variants={pop(0.7)}>
        <rect x="180" y="218" width="22" height="44" fill={`${orange.replace(")", " / 0.28)")}`} stroke={orange} strokeWidth="0.5" />
        <path d="M 178 218 Q 191 200 204 218" fill={`${orange.replace(")", " / 0.36)")}`} stroke={orange} strokeWidth="0.5" />
        <line x1="191" y1="200" x2="191" y2="194" stroke={orange} strokeWidth="0.4" />
      </motion.g>
      <SketchAnnotation x1={154} y1={206} x2={182} y2={220} label="CST · UNESCO" sub="Indo-Gothic · 1888" color={orange} delay={1.1} align="end" />

      {/* sea + container ship */}
      <motion.rect x="0" y="262" width="480" height="20" fill={`${blue.replace(")", " / 0.18)")}`} variants={fade(0.6)} />
      <motion.g animate={{ x: [-50, 480] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        <rect x="0" y="266" width="46" height="8" rx="1" fill={`${blue.replace(")", " / 0.7)")}`} />
        <rect x="2" y="260" width="6" height="6" fill={orange} />
        <rect x="9" y="260" width="6" height="6" fill={`${blue.replace(")", " / 0.6)")}`} />
        <rect x="16" y="260" width="6" height="6" fill={orange} />
        <rect x="23" y="260" width="6" height="6" fill={`${blue.replace(")", " / 0.6)")}`} />
        <rect x="30" y="260" width="6" height="6" fill={orange} />
        <rect x="38" y="254" width="6" height="12" fill={`${blue.replace(")", " / 0.8)")}`} />
        <rect x="40" y="248" width="2" height="6" fill={`${blue.replace(")", " / 0.6)")}`} />
      </motion.g>

      {/* sea waves */}
      {[274, 280].map((y, i) => (
        <motion.path
          key={`wave-${i}`}
          d={`M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`}
          stroke={`${blue.replace(")", " / 0.45)")}`}
          strokeWidth="0.5"
          fill="none"
          animate={{
            d: [
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y + 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
            ],
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <IndustryStamp x={20} y={290} label="D2C" sub="Bandra-Andheri" color={orange} delay={1.0} />
      <IndustryStamp x={102} y={290} label="BFSI · BKC" sub="RBI · BSE · NSE" color={blue} delay={1.05} />
      <IndustryStamp x={184} y={290} label="REAL ESTATE" sub="Lodha · Hiranandani" color={orange} delay={1.1} />

      <ProsperityRibbon
        color={blue}
        accent={orange}
        metrics={[
          { value: "₹15Cr+", label: "Revenue impacted" },
          { value: "1.6×", label: "CPM vs Bengaluru" },
          { value: "20M+", label: "Metro population" },
          { value: "BSE", label: "Asia's oldest" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={blue}
        accent={orange}
        pins={[
          { angle: -90, label: "BANDRA" },
          { angle: -30, label: "ANDHERI" },
          { angle: 30, label: "POWAI" },
          { angle: 90, label: "BKC" },
          { angle: 150, label: "WORLI" },
          { angle: 210, label: "L. PAREL" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  DELHI                                       */
/* ============================================================================ */

export function DelhiIdentity({ className = "" }: { className?: string }) {
  const red = "oklch(0.55 0.22 25)";
  const accent = "oklch(0.78 0.165 70)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <radialGradient id="dl-glow" cx="50%" cy="38%">
          <stop offset="0%" stopColor={`${accent.replace(")", " / 0.18)")}`} />
          <stop offset="100%" stopColor={`${accent.replace(")", " / 0)")}`} />
        </radialGradient>
        <linearGradient id="dl-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${red.replace(")", " / 0.12)")}`} />
          <stop offset="100%" stopColor={`${accent.replace(")", " / 0.06)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={red} />
      <rect x="0" y="62" width="480" height="218" fill="url(#dl-sky)" />
      <rect x="0" y="62" width="480" height="218" fill="url(#dl-glow)" />
      <SketchTitle city="Delhi NCR" nickname="Capital of Empires · Lutyens'" est="1052" lat="28.61" lng="77.21" color={red} accent={accent} />

      {/* Cyber Hub Gurugram skyline */}
      <SketchSkyline
        color={red}
        groundY={280}
        buildings={[
          { x: 320, w: 22, h: 95, type: "antenna" },
          { x: 344, w: 18, h: 78 },
          { x: 364, w: 24, h: 110, type: "step" },
          { x: 390, w: 18, h: 70 },
          { x: 410, w: 22, h: 88, type: "antenna" },
          { x: 434, w: 24, h: 65 },
        ]}
      />
      <SketchAnnotation x1={414} y1={180} x2={398} y2={200} label="CYBER HUB · GURUGRAM" sub="DLF Phase II / V" color={red} delay={0.9} align="end" />

      {/* construction crane */}
      <motion.g variants={pop(0.4)}>
        <line x1="406" y1="280" x2="406" y2="158" stroke={`${red.replace(")", " / 0.6)")}`} strokeWidth="1.4" />
        <line x1="406" y1="158" x2="450" y2="158" stroke={`${red.replace(")", " / 0.6)")}`} strokeWidth="1.4" />
        <line x1="406" y1="158" x2="376" y2="158" stroke={`${red.replace(")", " / 0.6)")}`} strokeWidth="1" />
        <line x1="406" y1="158" x2="396" y2="142" stroke={`${red.replace(")", " / 0.6)")}`} strokeWidth="0.8" />
        <line x1="406" y1="158" x2="416" y2="142" stroke={`${red.replace(")", " / 0.6)")}`} strokeWidth="0.8" />
        <motion.line x1="446" y1="158" x2="446" y2="218" stroke={`${red.replace(")", " / 0.5)")}`} strokeWidth="0.6" animate={{ y2: [218, 200, 218] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.rect x="442" y="218" width="8" height="6" fill={`${red.replace(")", " / 0.5)")}`} animate={{ y: [218, 200, 218] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      </motion.g>

      {/* Red Fort silhouette (background, between landmarks) */}
      <motion.g variants={fade(0.45)}>
        <rect x="178" y="216" width="124" height="22" fill={`${red.replace(")", " / 0.18)")}`} stroke={`${red.replace(")", " / 0.45)")}`} strokeWidth="0.5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={`crl-${i}`} x={180 + i * 16} y="210" width="8" height="6" fill={`${red.replace(")", " / 0.45)")}`} />
        ))}
        <path d="M 222 216 L 222 200 Q 222 192 232 192 Q 242 192 242 200 L 242 216" fill={`${red.replace(")", " / 0.36)")}`} stroke={`${red.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
      </motion.g>
      <SketchAnnotation x1={170} y1={210} x2={184} y2={216} label="LAL QILA · RED FORT" sub="Mughal · 1648 · UNESCO" color={red} delay={1.05} align="end" />

      {/* India Gate centre */}
      <motion.g variants={pop(0.3)}>
        <rect x="200" y="118" width="80" height="148" rx="2" fill={`${red.replace(")", " / 0.32)")}`} stroke={red} strokeWidth="1.4" />
        <path d="M 216 266 L 216 150 Q 216 134 240 134 Q 264 134 264 150 L 264 266" fill="var(--background)" stroke={red} strokeWidth="1" />
        <motion.path d="M 234 244 Q 240 230 246 244 Q 244 256 240 258 Q 236 256 234 244" fill={accent} animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        <rect x="194" y="110" width="92" height="8" fill={red} />
        <rect x="200" y="102" width="80" height="8" fill={`${red.replace(")", " / 0.7)")}`} />
        <text x="240" y="130" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="4" letterSpacing="0.16em" fill="var(--background)">AMAR JAWAN</text>
      </motion.g>
      <SketchAnnotation x1={284} y1={140} x2={262} y2={158} label="INDIA GATE" sub="WWI memorial · 1931" color={red} delay={0.95} align="start" />

      {/* Lotus Temple */}
      <motion.g variants={pop(0.55)}>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
          const r = 26;
          const x = 90 + r * Math.cos(a);
          const y = 218 + r * Math.sin(a);
          const tx = 90 + r * 0.55 * Math.cos(a);
          const ty = 218 + r * 0.55 * Math.sin(a);
          return (
            <motion.path key={`petal-${i}`} d={`M 90 218 Q ${tx} ${ty - 12} ${x} ${y}`} stroke={red} strokeWidth="1" fill={`${red.replace(")", " / 0.12)")}`} variants={draw(0.6 + i * 0.04, 0.5)} />
          );
        })}
        <circle cx="90" cy="218" r="5" fill={red} />
      </motion.g>
      <SketchAnnotation x1={32} y1={180} x2={66} y2={208} label="LOTUS TEMPLE" sub="9 petals · Bahá'í" color={red} delay={1.1} align="start" />

      {/* Qutub Minar */}
      <motion.g variants={pop(0.45)}>
        {[
          { y: 100, w: 22 },
          { y: 124, w: 26 },
          { y: 148, w: 30 },
          { y: 174, w: 34 },
          { y: 204, w: 38 },
        ].map((seg, i) => (
          <rect key={`qm-${i}`} x={420 - seg.w / 2} y={seg.y} width={seg.w} height="26" fill={`${red.replace(")", " / 0.32)")}`} stroke={red} strokeWidth="0.7" />
        ))}
        <path d="M 416 100 L 420 90 L 424 100 Z" fill={red} />
        <line x1="420" y1="90" x2="420" y2="84" stroke={red} strokeWidth="0.6" />
        <circle cx="420" cy="83" r="1.5" fill={red} />
      </motion.g>
      <SketchAnnotation x1={460} y1={120} x2={438} y2={130} label="QUTUB MINAR" sub="73m · 1193" color={red} delay={1.15} align="end" />

      {/* edtech book stack */}
      <motion.g variants={pop(0.85)}>
        <rect x="30" y="252" width="22" height="6" fill={`${accent.replace(")", " / 0.5)")}`} stroke={accent} strokeWidth="0.4" />
        <rect x="28" y="258" width="26" height="6" fill={`${accent.replace(")", " / 0.4)")}`} stroke={accent} strokeWidth="0.4" />
        <rect x="26" y="264" width="30" height="6" fill={`${accent.replace(")", " / 0.3)")}`} stroke={accent} strokeWidth="0.4" />
        <path d="M 35 252 L 28 249 L 41 245 L 48 248 Z" fill={accent} />
      </motion.g>
      <SketchAnnotation x1={0} y1={264} x2={26} y2={262} label="UPSC · NEET · IIT" sub="Karol Bagh · Saket · S-18" color={accent} delay={1.2} align="start" />

      <IndustryStamp x={20} y={282} label="REAL ESTATE" sub="DLF · Lodha · M3M" color={red} delay={1.0} />
      <IndustryStamp x={102} y={282} label="EDTECH" sub="UPSC · NEET · IIT" color={accent} delay={1.05} />
      <IndustryStamp x={184} y={282} label="GOV / PSU" sub="Lutyens' Delhi" color={red} delay={1.1} />

      <ProsperityRibbon
        color={red}
        accent={accent}
        metrics={[
          { value: "32M+", label: "NCR population" },
          { value: "₹500–2K", label: "Portal CPL" },
          { value: "<5 min", label: "Lead callback SLA" },
          { value: "7×", label: "Empires layered" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={red}
        accent={accent}
        pins={[
          { angle: -90, label: "C. PLACE" },
          { angle: -30, label: "GURGAON" },
          { angle: 30, label: "NOIDA" },
          { angle: 90, label: "FARIDABAD" },
          { angle: 150, label: "AEROCITY" },
          { angle: 210, label: "DWARKA" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                BENGALURU                                     */
/* ============================================================================ */

export function BengaluruIdentity({ className = "" }: { className?: string }) {
  const teal = "oklch(0.66 0.18 180)";
  const green = "oklch(0.74 0.16 155)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="bg-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${teal.replace(")", " / 0.16)")}`} />
          <stop offset="100%" stopColor={`${green.replace(")", " / 0.06)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={teal} />
      <rect x="0" y="62" width="480" height="218" fill="url(#bg-sky)" />
      <SketchTitle city="Bengaluru" nickname="Garden City · Silicon Valley of India" est="1537" lat="12.97" lng="77.59" color={teal} accent={green} />

      {/* circuit board overlay */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={`g-${i}`} x1={(i / 23) * 480} y1="62" x2={(i / 23) * 480} y2="280" stroke={`${teal.replace(")", " / 0.04)")}`} strokeWidth="0.3" />
      ))}

      {/* ISRO rocket trajectory */}
      <motion.path
        d="M 380 260 Q 360 200 380 140 Q 400 100 460 70"
        stroke={`${green.replace(")", " / 0.5)")}`}
        strokeWidth="0.8"
        strokeDasharray="2 4"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.g variants={pop(2.1)}>
        <path d="M 458 70 L 462 64 L 466 70 L 462 78 Z" fill={green} />
        <circle cx="462" cy="70" r="2" fill={green} />
      </motion.g>
      <SketchAnnotation x1={460} y1={88} x2={464} y2={74} label="ISRO" sub="Mangalyaan · Chandrayaan" color={green} delay={2.2} align="end" />

      {/* ITPL skyline */}
      <SketchSkyline
        color={teal}
        groundY={280}
        buildings={[
          { x: 320, w: 18, h: 75 },
          { x: 340, w: 22, h: 95, type: "antenna" },
          { x: 364, w: 24, h: 110, type: "step" },
          { x: 390, w: 20, h: 85 },
          { x: 412, w: 24, h: 100, type: "antenna" },
          { x: 438, w: 22, h: 75 },
        ]}
      />
      <SketchAnnotation x1={412} y1={185} x2={400} y2={200} label="ITPL · WHITEFIELD" sub="SEZ · 1994" color={teal} delay={0.95} align="end" />

      {/* Vidhana Soudha */}
      <motion.g variants={pop(0.3)}>
        <rect x="80" y="260" width="280" height="20" fill={`${teal.replace(")", " / 0.2)")}`} stroke={teal} strokeWidth="0.7" />
        <rect x="100" y="232" width="240" height="28" fill={`${teal.replace(")", " / 0.28)")}`} stroke={teal} strokeWidth="1.4" />
        <rect x="135" y="180" width="170" height="52" fill={`${teal.replace(")", " / 0.06)")}`} stroke={`${teal.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
        {[140, 165, 190, 215, 240, 265, 290].map((x, i) => (
          <motion.g key={`pl-${i}`} variants={pop(0.4 + i * 0.03)}>
            <rect x={x - 4} y="180" width="8" height="52" fill={`${teal.replace(")", " / 0.28)")}`} stroke={teal} strokeWidth="0.5" />
            <rect x={x - 6} y="180" width="12" height="3" fill={teal} />
            <rect x={x - 6} y="230" width="12" height="3" fill={teal} />
          </motion.g>
        ))}
        <path d="M 215 180 Q 220 130 270 130 Q 280 130 280 180" fill={`${teal.replace(")", " / 0.32)")}`} stroke={teal} strokeWidth="1.4" />
        <path d="M 220 154 Q 240 122 260 128 Q 270 132 270 154" fill="none" stroke={`${teal.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
        <line x1="248" y1="122" x2="248" y2="106" stroke={teal} strokeWidth="0.8" />
        <circle cx="248" cy="103" r="3" fill={teal} />
      </motion.g>
      <SketchAnnotation x1={196} y1={120} x2={224} y2={134} label="VIDHANA SOUDHA" sub="1956 · granite" color={teal} delay={0.9} align="end" />

      {/* circuit-node ecosystem */}
      {[
        { cx: 35, cy: 96, label: "API" },
        { cx: 60, cy: 134, label: "DB" },
        { cx: 30, cy: 170, label: "/docs" },
        { cx: 65, cy: 210, label: "stripe" },
      ].map((n, i) => (
        <motion.g key={`cn-${i}`} variants={pop(0.65 + i * 0.07)}>
          <line x1={n.cx} y1={n.cy} x2={150} y2={180} stroke={`${green.replace(")", " / 0.3)")}`} strokeDasharray="2 3" strokeWidth="0.4" />
          <circle cx={n.cx} cy={n.cy} r="9" fill="var(--background)" stroke={green} strokeWidth="0.8" />
          <text x={n.cx} y={n.cy + 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill={green}>{n.label}</text>
        </motion.g>
      ))}

      {/* travelling deploy particle */}
      <motion.circle r="2.5" fill={teal}
        animate={{ cx: [35, 150, 320, 412, 35], cy: [96, 180, 230, 180, 96], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />

      {/* Cubbon Park trees */}
      {[{ cx: 290, cy: 274 }, { cx: 305, cy: 276 }, { cx: 70, cy: 272 }].map((t, i) => (
        <motion.g key={`tr-${i}`} variants={pop(0.95 + i * 0.05)}>
          <circle cx={t.cx} cy={t.cy - 6} r="6" fill={`${green.replace(")", " / 0.5)")}`} />
          <line x1={t.cx} y1={t.cy - 1} x2={t.cx} y2={t.cy + 4} stroke={`${green.replace(")", " / 0.6)")}`} strokeWidth="0.7" />
        </motion.g>
      ))}
      <SketchAnnotation x1={66} y1={258} x2={76} y2={266} label="CUBBON PARK" sub="300 acres · 1864" color={green} delay={1.1} align="start" />

      <IndustryStamp x={20} y={290} label="SAAS" sub="Razorpay · Freshworks" color={teal} delay={1.0} />
      <IndustryStamp x={102} y={290} label="DEV TOOLS" sub="Postman · Hasura" color={green} delay={1.05} />
      <IndustryStamp x={184} y={290} label="BIOTECH" sub="Biocon · Strand" color={teal} delay={1.1} />

      <ProsperityRibbon
        color={teal}
        accent={green}
        metrics={[
          { value: "$50B+", label: "IT exports / yr" },
          { value: "13M+", label: "Metro pop." },
          { value: "240+", label: "Lakes (historic)" },
          { value: "1987", label: "First India ATM" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={teal}
        accent={green}
        pins={[
          { angle: -90, label: "MG ROAD" },
          { angle: -30, label: "INDIRA." },
          { angle: 30, label: "WHITEFIELD" },
          { angle: 90, label: "HSR" },
          { angle: 150, label: "JP NAGAR" },
          { angle: 210, label: "KORAMANG." },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  PUNE                                        */
/* ============================================================================ */

export function PuneIdentity({ className = "" }: { className?: string }) {
  const earth = "oklch(0.55 0.18 30)";
  const accent = "oklch(0.66 0.18 295)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="pn-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${earth.replace(")", " / 0.1)")}`} />
          <stop offset="100%" stopColor={`${accent.replace(")", " / 0.04)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={earth} />
      <rect x="0" y="62" width="480" height="218" fill="url(#pn-sky)" />
      <SketchTitle city="Pune" nickname="Oxford of the East · Maratha Capital" est="937" lat="18.52" lng="73.86" color={earth} accent={accent} />

      {/* Sahyadri hill silhouette */}
      <motion.path
        d="M 0 240 L 50 215 L 100 235 L 150 205 L 200 228 L 260 210 L 320 235 L 380 215 L 440 238 L 480 220 L 480 280 L 0 280 Z"
        fill={`${earth.replace(")", " / 0.12)")}`}
        variants={fade(0.1)}
      />
      <SketchAnnotation x1={150} y1={195} x2={158} y2={208} label="SAHYADRI GHATS" sub="Western Ghats" color={earth} delay={0.6} align="start" />

      {/* Pimpri-Chinchwad factory cluster */}
      <motion.g variants={fade(0.2)}>
        <rect x="20" y="220" width="80" height="60" fill={`${earth.replace(")", " / 0.22)")}`} stroke={`${earth.replace(")", " / 0.5)")}`} strokeWidth="0.6" />
        <path d="M 20 220 L 30 208 L 40 220 L 50 208 L 60 220 L 70 208 L 80 220 L 90 208 L 100 220" fill={`${earth.replace(")", " / 0.28)")}`} stroke={`${earth.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
        {[28, 50, 72].map((x, i) => (
          <g key={`stack-${i}`}>
            <rect x={x} y="186" width="6" height="34" fill={`${earth.replace(")", " / 0.5)")}`} />
            <motion.circle cx={x + 3} cy="178" r="4" fill={`${earth.replace(")", " / 0.18)")}`} animate={{ cy: [178, 158, 178], opacity: [0.6, 0, 0.6] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }} />
            <motion.circle cx={x + 3} cy="173" r="5" fill={`${earth.replace(")", " / 0.14)")}`} animate={{ cy: [173, 148, 173], opacity: [0.4, 0, 0.4] }} transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }} />
          </g>
        ))}
      </motion.g>
      <SketchAnnotation x1={108} y1={196} x2={92} y2={210} label="PIMPRI-CHINCHWAD" sub="Tata · Bajaj · Mahindra" color={earth} delay={0.85} align="start" />

      {/* Hinjewadi IT skyline */}
      <SketchSkyline
        color={accent}
        groundY={280}
        buildings={[
          { x: 380, w: 20, h: 95, type: "antenna" },
          { x: 402, w: 24, h: 120, type: "step" },
          { x: 428, w: 22, h: 80 },
          { x: 452, w: 22, h: 100, type: "antenna" },
        ]}
      />
      <SketchAnnotation x1={420} y1={155} x2={414} y2={170} label="HINJEWADI · SAAS" sub="Phase I/II/III" color={accent} delay={0.95} align="end" />

      {/* Shaniwar Wada */}
      <motion.g variants={pop(0.3)}>
        <rect x="140" y="190" width="200" height="90" fill={`${earth.replace(")", " / 0.22)")}`} stroke={earth} strokeWidth="1.4" />
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={`cr-${i}`} x={142 + i * 18} y="183" width="10" height="9" fill={earth} />
        ))}
        <path d="M 220 280 L 220 226 Q 220 208 240 208 Q 260 208 260 226 L 260 280 Z" fill="var(--background)" stroke={earth} strokeWidth="1.4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.path key={`sp-${i}`} d={`M ${224 + i * 5.5} 226 L ${226.5 + i * 5.5} 219 L ${229 + i * 5.5} 226`} stroke={accent} strokeWidth="0.8" fill="none" variants={draw(0.55 + i * 0.04)} />
        ))}
        {[140, 340].map((x, i) => (
          <g key={`tw-${i}`}>
            <rect x={x - 12} y="165" width="24" height="115" fill={`${earth.replace(")", " / 0.3)")}`} stroke={earth} strokeWidth="1" />
            <path d={`M ${x - 14} 165 L ${x} 150 L ${x + 14} 165 Z`} fill={earth} />
            <line x1={x} y1="150" x2={x} y2="142" stroke={earth} strokeWidth="0.6" />
            <circle cx={x} cy="140" r="1.5" fill={earth} />
          </g>
        ))}
      </motion.g>
      <SketchAnnotation x1={324} y1={150} x2={310} y2={172} label="SHANIWAR WADA" sub="Peshwa palace · 1730" color={earth} delay={0.95} align="end" />

      {/* manufacturing gear */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "60px 110px" }}>
        <motion.g variants={pop(0.5)}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r1 = 24;
            const r2 = 32;
            return (
              <line key={`gt-${i}`} x1={60 + r1 * Math.cos(a)} y1={110 + r1 * Math.sin(a)} x2={60 + r2 * Math.cos(a)} y2={110 + r2 * Math.sin(a)} stroke={accent} strokeWidth="2" />
            );
          })}
          <circle cx="60" cy="110" r="20" fill={`${accent.replace(")", " / 0.18)")}`} stroke={accent} strokeWidth="1.4" />
          <circle cx="60" cy="110" r="5" fill={accent} />
        </motion.g>
      </motion.g>
      <SketchAnnotation x1={108} y1={94} x2={88} y2={102} label="AUTO MFG" sub="Tier-1 supply belt" color={accent} delay={1.0} align="start" />

      <IndustryStamp x={20} y={290} label="AUTO" sub="Chakan · Pimpri" color={earth} delay={1.0} />
      <IndustryStamp x={102} y={290} label="IT · SAAS" sub="Hinjewadi · Kharadi" color={accent} delay={1.05} />
      <IndustryStamp x={184} y={290} label="VACCINES" sub="Serum Institute" color={earth} delay={1.1} />

      <ProsperityRibbon
        color={earth}
        accent={accent}
        metrics={[
          { value: "1.5B", label: "Vaccine doses" },
          { value: "₹6Cr+", label: "Revenue impacted" },
          { value: "9+", label: "ERPs shipped" },
          { value: "200+", label: "Engg. colleges" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={earth}
        accent={accent}
        pins={[
          { angle: -90, label: "FC ROAD" },
          { angle: -30, label: "KHARADI" },
          { angle: 30, label: "HADAPSAR" },
          { angle: 90, label: "HINJEWADI" },
          { angle: 150, label: "BANER" },
          { angle: 210, label: "KOTHRUD" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                CHENNAI                                       */
/* ============================================================================ */

export function ChennaiIdentity({ className = "" }: { className?: string }) {
  const teal = "oklch(0.65 0.16 200)";
  const gold = "oklch(0.78 0.165 70)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="cn-sky" x1="0" y1="62" x2="0" y2="262" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${teal.replace(")", " / 0.18)")}`} />
          <stop offset="100%" stopColor="oklch(0.99 0.002 260 / 0)" />
        </linearGradient>
      </defs>
      <BlueprintGrid color={teal} />
      <rect x="0" y="62" width="480" height="200" fill="url(#cn-sky)" />
      <SketchTitle city="Chennai" nickname="Detroit of India · Marina Mile" est="1639" lat="13.08" lng="80.27" color={teal} accent={gold} />

      {/* sun */}
      <motion.circle cx="100" cy="116" r="20" fill={`${gold.replace(")", " / 0.4)")}`} animate={{ r: [18, 22, 18], opacity: [0.7, 1, 0.7] }} transition={{ duration: 5, repeat: Infinity }} />

      {/* OMR IT skyline */}
      <SketchSkyline
        color={teal}
        groundY={262}
        buildings={[
          { x: 200, w: 18, h: 60 },
          { x: 220, w: 18, h: 75, type: "antenna" },
          { x: 242, w: 22, h: 90, type: "step" },
          { x: 266, w: 18, h: 65 },
          { x: 288, w: 22, h: 80, type: "antenna" },
        ]}
      />
      <SketchAnnotation x1={258} y1={170} x2={252} y2={184} label="OMR · TIDEL PARK" sub="IT · BPO" color={teal} delay={0.9} align="middle" />

      {/* Sriperumbudur auto plant */}
      <motion.g variants={fade(0.3)}>
        <rect x="332" y="208" width="76" height="50" fill={`${teal.replace(")", " / 0.2)")}`} stroke={`${teal.replace(")", " / 0.4)")}`} strokeWidth="0.5" />
        <path d="M 332 208 L 342 200 L 352 208 L 362 200 L 372 208 L 382 200 L 392 208 L 402 200 L 408 208" fill={`${teal.replace(")", " / 0.3)")}`} />
        <line x1="340" y1="232" x2="400" y2="232" stroke={`${teal.replace(")", " / 0.4)")}`} strokeWidth="0.4" />
        <line x1="340" y1="240" x2="400" y2="240" stroke={`${teal.replace(")", " / 0.4)")}`} strokeWidth="0.4" />
      </motion.g>
      <SketchAnnotation x1={420} y1={196} x2={400} y2={208} label="SRIPERUMBUDUR" sub="Hyundai · Ford · Daimler" color={teal} delay={1.05} align="end" />

      {/* Marina Lighthouse */}
      <motion.g variants={pop(0.3)}>
        <rect x="138" y="118" width="14" height="142" fill={`${teal.replace(")", " / 0.32)")}`} stroke={teal} strokeWidth="1" />
        {[126, 158, 190, 222].map((y) => (
          <rect key={`b-${y}`} x="134" y={y} width="22" height="6" fill={teal} />
        ))}
        <rect x="132" y="106" width="26" height="14" fill={teal} />
        <motion.circle cx="145" cy="113" r="4" fill={gold} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M 145 113 L 60 90 L 60 132 Z" fill={`${gold.replace(")", " / 0.18)")}`} animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      </motion.g>
      <SketchAnnotation x1={106} y1={106} x2={132} y2={108} label="MARINA LIGHTHOUSE" sub="2nd-longest urban beach" color={teal} delay={0.95} align="end" />

      {/* Kapaleeshwarar gopuram */}
      <motion.g variants={pop(0.4)}>
        {[
          { y: 108, w: 32, h: 18 },
          { y: 126, w: 40, h: 22 },
          { y: 148, w: 48, h: 26 },
          { y: 174, w: 56, h: 30 },
          { y: 204, w: 64, h: 26 },
          { y: 230, w: 70, h: 28 },
        ].map((tier, i) => (
          <g key={`gop-${i}`}>
            <rect x={420 - tier.w / 2} y={tier.y} width={tier.w} height={tier.h} fill={`${gold.replace(")", " / 0.28)")}`} stroke={gold} strokeWidth="0.6" />
            <rect x={420 - tier.w / 2} y={tier.y + tier.h - 2} width={tier.w} height={2} fill={gold} />
            {Array.from({ length: Math.floor(tier.w / 8) }).map((_, j) => (
              <circle key={`dot-${i}-${j}`} cx={420 - tier.w / 2 + 4 + j * 8} cy={tier.y + tier.h / 2} r="0.7" fill={`${gold.replace(")", " / 0.6)")}`} />
            ))}
          </g>
        ))}
        <path d="M 412 108 L 420 94 L 428 108 Z" fill={gold} />
        <circle cx="420" cy="91" r="2.5" fill={gold} />
      </motion.g>
      <SketchAnnotation x1={460} y1={130} x2={444} y2={138} label="KAPALEESHWARAR" sub="Mylapore · Pallava-era" color={gold} delay={1.0} align="end" />

      {/* sand + sea */}
      <rect x="0" y="262" width="480" height="6" fill={`${gold.replace(")", " / 0.14)")}`} />
      <rect x="0" y="268" width="480" height="14" fill={`${teal.replace(")", " / 0.18)")}`} />
      {[270, 276, 282].map((y, i) => (
        <motion.path
          key={`w-${i}`}
          d={`M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`}
          stroke={`${teal.replace(")", " / 0.4)")}`}
          strokeWidth="0.5"
          fill="none"
          animate={{
            d: [
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y + 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
            ],
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* auto wheel */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "240px 240px" }}>
        <motion.g variants={pop(0.55)}>
          <circle cx="240" cy="240" r="20" fill="var(--background)" stroke={teal} strokeWidth="1.4" />
          <circle cx="240" cy="240" r="7" fill={`${teal.replace(")", " / 0.28)")}`} stroke={teal} strokeWidth="0.8" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line key={`sp-${i}`} x1={240 + 7 * Math.cos(a)} y1={240 + 7 * Math.sin(a)} x2={240 + 19 * Math.cos(a)} y2={240 + 19 * Math.sin(a)} stroke={teal} strokeWidth="1" />
            );
          })}
        </motion.g>
      </motion.g>

      <IndustryStamp x={20} y={290} label="AUTO" sub="40% car exports" color={teal} delay={1.0} />
      <IndustryStamp x={102} y={290} label="HEALTHCARE" sub="Apollo · Sankara" color={gold} delay={1.05} />
      <IndustryStamp x={184} y={290} label="IT · BPO" sub="OMR corridor" color={teal} delay={1.1} />

      <ProsperityRibbon
        color={teal}
        accent={gold}
        metrics={[
          { value: "13 km", label: "Marina length" },
          { value: "40%", label: "Car exports" },
          { value: "1644", label: "Fort St. George" },
          { value: "ம்", label: "Tamil-first SEO" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={teal}
        accent={gold}
        pins={[
          { angle: -90, label: "ANNA NAG." },
          { angle: -30, label: "MYLAPORE" },
          { angle: 30, label: "OMR" },
          { angle: 90, label: "VELACHERY" },
          { angle: 150, label: "T. NAGAR" },
          { angle: 210, label: "ADYAR" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                HYDERABAD                                     */
/* ============================================================================ */

export function HyderabadIdentity({ className = "" }: { className?: string }) {
  const violet = "oklch(0.62 0.18 295)";
  const green = "oklch(0.74 0.16 155)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="hyd-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${violet.replace(")", " / 0.16)")}`} />
          <stop offset="100%" stopColor={`${violet.replace(")", " / 0.04)")}`} />
        </linearGradient>
        <radialGradient id="hyd-pearl" cx="35%" cy="35%">
          <stop offset="0%" stopColor="oklch(0.97 0.04 290)" />
          <stop offset="100%" stopColor="oklch(0.7 0.12 295)" />
        </radialGradient>
      </defs>
      <BlueprintGrid color={violet} />
      <rect x="0" y="62" width="480" height="218" fill="url(#hyd-sky)" />
      <SketchTitle city="Hyderabad" nickname="City of Pearls · Cyberabad" est="1591" lat="17.39" lng="78.49" color={violet} accent={green} />

      {/* HITEC City skyline */}
      <SketchSkyline
        color={violet}
        groundY={280}
        buildings={[
          { x: 320, w: 20, h: 90, type: "antenna" },
          { x: 342, w: 24, h: 115, type: "step" },
          { x: 368, w: 22, h: 80 },
          { x: 392, w: 26, h: 130, type: "antenna" },
          { x: 420, w: 22, h: 95, type: "step" },
          { x: 444, w: 20, h: 78 },
        ]}
      />
      <motion.circle cx="404" cy="98" r="14" fill={`${green.replace(")", " / 0.18)")}`} animate={{ r: [12, 16, 12], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.text x="404" y="101" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill={green} variants={pop(0.7)}>HITEC</motion.text>
      <SketchAnnotation x1={464} y1={170} x2={448} y2={186} label="CYBERABAD" sub="MS · Google · Apple" color={violet} delay={0.95} align="end" />

      {/* Charminar */}
      <motion.g variants={pop(0.3)}>
        <rect x="170" y="208" width="140" height="70" fill={`${violet.replace(")", " / 0.22)")}`} stroke={violet} strokeWidth="1.4" />
        <path d="M 200 278 L 200 244 Q 200 226 215 226 Q 230 226 230 244 L 230 278" fill="var(--background)" stroke={violet} strokeWidth="1" />
        <path d="M 250 278 L 250 244 Q 250 226 265 226 Q 280 226 280 244 L 280 278" fill="var(--background)" stroke={violet} strokeWidth="1" />
        <line x1="170" y1="218" x2="310" y2="218" stroke={violet} strokeWidth="1" />
        <line x1="170" y1="222" x2="310" y2="222" stroke={`${violet.replace(")", " / 0.6)")}`} strokeWidth="0.4" />
        {[170, 310].map((x) => (
          <g key={`min-${x}`}>
            <rect x={x - 6} y="138" width="12" height="80" fill={`${violet.replace(")", " / 0.28)")}`} stroke={violet} strokeWidth="0.7" />
            <rect x={x - 8} y="178" width="16" height="3" fill={violet} />
            <rect x={x - 8} y="142" width="16" height="3" fill={violet} />
            <circle cx={x} cy="130" r="10" fill={`${violet.replace(")", " / 0.4)")}`} stroke={violet} strokeWidth="1" />
            <path d={`M ${x - 8} 130 Q ${x} 120 ${x + 8} 130`} fill={violet} />
            <line x1={x} y1="120" x2={x} y2="112" stroke={violet} strokeWidth="0.7" />
            <circle cx={x} cy="110" r="1.5" fill={violet} />
          </g>
        ))}
        {[200, 280].map((x) => (
          <rect key={`bulb2-${x}`} x={x - 5} y="138" width="10" height="6" fill={violet} />
        ))}
      </motion.g>
      <SketchAnnotation x1={146} y1={158} x2={166} y2={184} label="CHARMINAR" sub="1591 · 4 minarets" color={violet} delay={0.95} align="end" />

      {/* Pearl */}
      <motion.g variants={pop(0.6)}>
        <motion.circle cx="60" cy="118" r="22" fill="url(#hyd-pearl)" stroke={`${violet.replace(")", " / 0.6)")}`} strokeWidth="0.8" animate={{ r: [20, 24, 20] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="56" cy="114" r="3" fill="oklch(0.99 0.04 290)" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </motion.g>
      <SketchAnnotation x1={104} y1={102} x2={84} y2={114} label="PEARL TRADE" sub="Patel Market · Qutb era" color={violet} delay={1.0} align="start" />

      {/* Hussain Sagar Buddha */}
      <motion.g variants={pop(0.5)}>
        <ellipse cx="60" cy="252" rx="20" ry="3" fill={`${violet.replace(")", " / 0.3)")}`} />
        <path d="M 56 252 L 56 232 Q 56 224 60 220 Q 64 224 64 232 L 64 252 Z" fill={`${violet.replace(")", " / 0.5)")}`} stroke={violet} strokeWidth="0.6" />
        <circle cx="60" cy="218" r="3" fill={`${violet.replace(")", " / 0.6)")}`} />
      </motion.g>
      <rect x="20" y="260" width="80" height="12" fill={`${violet.replace(")", " / 0.1)")}`} />
      <SketchAnnotation x1={108} y1={244} x2={84} y2={234} label="HUSSAIN SAGAR" sub="Buddha · 16C" color={green} delay={1.1} align="start" />

      {/* Pharma molecule */}
      <motion.g variants={pop(0.7)}>
        {[
          { cx: 420, cy: 192 },
          { cx: 442, cy: 210 },
          { cx: 432, cy: 237 },
          { cx: 408, cy: 237 },
          { cx: 398, cy: 210 },
        ].map((n, i) => (
          <circle key={`atom-${i}`} cx={n.cx} cy={n.cy} r="5" fill={green} stroke={`${green.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
        ))}
        <path d="M 420 192 L 442 210 L 432 237 L 408 237 L 398 210 Z" stroke={`${green.replace(")", " / 0.5)")}`} strokeWidth="0.7" fill="none" />
        <line x1="420" y1="192" x2="408" y2="237" stroke={`${green.replace(")", " / 0.4)")}`} strokeWidth="0.5" />
      </motion.g>
      <SketchAnnotation x1={462} y1={208} x2={446} y2={212} label="GENOME VALLEY" sub="Asia's largest life-sci" color={green} delay={1.15} align="end" />

      <IndustryStamp x={20} y={290} label="PHARMA" sub="40% bulk drugs" color={green} delay={1.0} />
      <IndustryStamp x={102} y={290} label="IT · CYBERABAD" sub="Microsoft · Google" color={violet} delay={1.05} />
      <IndustryStamp x={184} y={290} label="DEFENCE" sub="DRDL · ECIL" color={violet} delay={1.1} />

      <ProsperityRibbon
        color={violet}
        accent={green}
        metrics={[
          { value: "Koh-i-Noor", label: "Cut here" },
          { value: "200+", label: "Pharma firms" },
          { value: "MS HQ", label: "Largest ex-US" },
          { value: "11M+", label: "Metro pop." },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={violet}
        accent={green}
        pins={[
          { angle: -90, label: "OLD CITY" },
          { angle: -30, label: "BANJARA" },
          { angle: 30, label: "GACHIBOWLI" },
          { angle: 90, label: "HITEC" },
          { angle: 150, label: "JUBILEE" },
          { angle: 210, label: "SECUNDER." },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  KOLKATA                                     */
/* ============================================================================ */

export function KolkataIdentity({ className = "" }: { className?: string }) {
  const maroon = "oklch(0.55 0.18 25)";
  const cream = "oklch(0.85 0.06 80)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="kol-sky" x1="0" y1="62" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${maroon.replace(")", " / 0.12)")}`} />
          <stop offset="100%" stopColor={`${cream.replace(")", " / 0.08)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={maroon} />
      <rect x="0" y="62" width="480" height="178" fill="url(#kol-sky)" />
      <SketchTitle city="Kolkata" nickname="City of Joy · Cultural Capital" est="1690" lat="22.57" lng="88.36" color={maroon} accent={cream} />

      {/* Park Street skyline */}
      <SketchSkyline
        color={maroon}
        groundY={240}
        buildings={[
          { x: 320, w: 18, h: 70, type: "dome" },
          { x: 342, w: 22, h: 88 },
          { x: 366, w: 20, h: 65 },
          { x: 388, w: 22, h: 95, type: "dome" },
          { x: 412, w: 18, h: 60 },
          { x: 432, w: 24, h: 85 },
        ]}
      />

      {/* Howrah Bridge */}
      <motion.g variants={pop(0.3)}>
        {[120, 360].map((x) => (
          <g key={`tw-${x}`}>
            <rect x={x - 8} y="92" width="16" height="148" fill={maroon} />
            <rect x={x - 14} y="88" width="28" height="6" fill={maroon} />
            <rect x={x - 12} y="112" width="24" height="4" fill={maroon} />
            <rect x={x - 10} y="138" width="20" height="4" fill={maroon} />
            <rect x={x - 8} y="164" width="16" height="4" fill={maroon} />
            <rect x={x - 8} y="190" width="16" height="4" fill={maroon} />
          </g>
        ))}
        <line x1="120" y1="98" x2="360" y2="98" stroke={maroon} strokeWidth="1.6" />
        {Array.from({ length: 14 }).map((_, i) => {
          const x1 = 130 + i * 16.5;
          return (
            <motion.line key={`tr-${i}`} x1={x1} y1="234" x2={x1 + 8} y2="98" stroke={`${maroon.replace(")", " / 0.55)")}`} strokeWidth="0.4" variants={draw(0.4 + i * 0.025, 0.45)} />
          );
        })}
        <rect x="40" y="234" width="400" height="6" fill={maroon} />
      </motion.g>
      <SketchAnnotation x1={120} y1={82} x2={130} y2={98} label="HOWRAH BRIDGE" sub="Cantilever · 1943" color={maroon} delay={0.95} align="start" />

      {/* Victoria Memorial */}
      <motion.g variants={pop(0.5)}>
        <rect x="20" y="195" width="80" height="42" fill={`${cream.replace(")", " / 0.4)")}`} stroke={maroon} strokeWidth="0.8" />
        <path d="M 30 195 Q 60 150 90 195" fill={`${cream.replace(")", " / 0.65)")}`} stroke={maroon} strokeWidth="1.2" />
        <line x1="60" y1="150" x2="60" y2="138" stroke={maroon} strokeWidth="0.8" />
        <circle cx="60" cy="135" r="2.5" fill={maroon} />
        {[24, 96].map((x) => (
          <path key={`cup-${x}`} d={`M ${x - 6} 195 Q ${x} 178 ${x + 6} 195`} fill={`${cream.replace(")", " / 0.55)")}`} stroke={maroon} strokeWidth="0.5" />
        ))}
        {[35, 50, 70, 85].map((x) => (
          <line key={`vp-${x}`} x1={x} y1="200" x2={x} y2="234" stroke={`${maroon.replace(")", " / 0.6)")}`} strokeWidth="0.4" />
        ))}
      </motion.g>
      <SketchAnnotation x1={108} y1={166} x2={84} y2={186} label="VICTORIA MEMORIAL" sub="Marble · 1921" color={maroon} delay={1.05} align="start" />

      {/* jute mill (right far) */}
      <motion.g variants={fade(0.55)}>
        <rect x="430" y="198" width="40" height="42" fill={`${cream.replace(")", " / 0.25)")}`} stroke={`${maroon.replace(")", " / 0.5)")}`} strokeWidth="0.4" />
        <path d="M 430 198 L 438 190 L 446 198 L 454 190 L 462 198 L 470 190" fill="none" stroke={`${maroon.replace(")", " / 0.5)")}`} strokeWidth="0.4" />
        <rect x="466" y="172" width="4" height="26" fill={maroon} />
        <motion.circle cx="468" cy="167" r="3" fill={`${maroon.replace(")", " / 0.18)")}`} animate={{ cy: [167, 145, 167], opacity: [0.6, 0, 0.6] }} transition={{ duration: 5, repeat: Infinity }} />
      </motion.g>
      <SketchAnnotation x1={464} y1={156} x2={468} y2={172} label="JUTE MILL" sub="WB exports leader" color={maroon} delay={1.15} align="end" />

      {/* river */}
      <motion.rect x="0" y="240" width="480" height="20" fill={`${maroon.replace(")", " / 0.08)")}`} variants={fade(0.6)} />
      {[246, 252].map((y, i) => (
        <motion.path
          key={`riv-${i}`}
          d={`M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`}
          stroke={`${maroon.replace(")", " / 0.3)")}`}
          strokeWidth="0.5"
          fill="none"
          animate={{
            d: [
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y + 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y - 2} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
            ],
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* yellow Ambassador taxi */}
      <motion.g animate={{ x: [-50, 480] }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}>
        <rect x="0" y="218" width="36" height="14" rx="2" fill="oklch(0.85 0.18 90)" stroke={maroon} strokeWidth="0.5" />
        <rect x="6" y="210" width="24" height="9" rx="1" fill={`${maroon.replace(")", " / 0.7)")}`} />
        <circle cx="9" cy="232" r="2.5" fill={maroon} />
        <circle cx="29" cy="232" r="2.5" fill={maroon} />
      </motion.g>

      <IndustryStamp x={20} y={290} label="LEGACY" sub="BBD Bagh · 1690" color={maroon} delay={1.0} />
      <IndustryStamp x={102} y={290} label="EDU" sub="IIM-C · Jadavpur" color={cream} delay={1.05} />
      <IndustryStamp x={184} y={290} label="JUTE · TEA" sub="WB export base" color={maroon} delay={1.1} />

      <ProsperityRibbon
        color={maroon}
        accent={cream}
        metrics={[
          { value: "139 yrs", label: "British capital" },
          { value: "Asia #1", label: "Oldest museum" },
          { value: "₹2K Cr", label: "Tea exports" },
          { value: "Tagore", label: "Nobel · 1913" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={maroon}
        accent={cream}
        pins={[
          { angle: -90, label: "BBD BAGH" },
          { angle: -30, label: "PARK ST." },
          { angle: 30, label: "SALT LAKE" },
          { angle: 90, label: "BURRABAZ." },
          { angle: 150, label: "HOWRAH" },
          { angle: 210, label: "BEHALA" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  AHMEDABAD                                   */
/* ============================================================================ */

export function AhmedabadIdentity({ className = "" }: { className?: string }) {
  const indigo = "oklch(0.55 0.22 250)";
  const accent = "oklch(0.78 0.165 50)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="ahm-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${indigo.replace(")", " / 0.1)")}`} />
          <stop offset="100%" stopColor={`${accent.replace(")", " / 0.04)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={indigo} />
      <rect x="0" y="62" width="480" height="218" fill="url(#ahm-sky)" />
      <SketchTitle city="Ahmedabad" nickname="Manchester of India · Karnavati" est="1411" lat="23.02" lng="72.57" color={indigo} accent={accent} />

      {/* GIFT City twin towers */}
      <motion.g variants={fade(0.2)}>
        <rect x="380" y="120" width="22" height="160" fill={`${indigo.replace(")", " / 0.3)")}`} stroke={indigo} strokeWidth="0.7" />
        <rect x="406" y="100" width="26" height="180" fill={`${indigo.replace(")", " / 0.32)")}`} stroke={indigo} strokeWidth="0.7" />
        {Array.from({ length: 14 }).map((_, r) => (
          <g key={`gt-${r}`}>
            <line x1="380" y1={130 + r * 10} x2="402" y2={130 + r * 10} stroke={`${indigo.replace(")", " / 0.45)")}`} strokeWidth="0.3" />
            <line x1="406" y1={110 + r * 12} x2="432" y2={110 + r * 12} stroke={`${indigo.replace(")", " / 0.45)")}`} strokeWidth="0.3" />
          </g>
        ))}
        <line x1="391" y1="120" x2="391" y2="108" stroke={indigo} strokeWidth="1" />
        <line x1="419" y1="100" x2="419" y2="84" stroke={indigo} strokeWidth="1" />
      </motion.g>
      <SketchAnnotation x1={462} y1={130} x2={436} y2={132} label="GIFT CITY" sub="IFSC · India's first" color={indigo} delay={0.95} align="end" />

      {/* Naroda textile mill */}
      <motion.g variants={fade(0.25)}>
        <rect x="20" y="210" width="80" height="70" fill={`${accent.replace(")", " / 0.18)")}`} stroke={`${accent.replace(")", " / 0.4)")}`} strokeWidth="0.4" />
        <path d="M 20 210 L 30 198 L 40 210 L 50 198 L 60 210 L 70 198 L 80 210 L 90 198 L 100 210" fill={`${accent.replace(")", " / 0.25)")}`} stroke={`${accent.replace(")", " / 0.5)")}`} strokeWidth="0.4" />
        <rect x="86" y="170" width="6" height="40" fill={`${indigo.replace(")", " / 0.5)")}`} />
        <motion.circle cx="89" cy="166" r="5" fill={`${indigo.replace(")", " / 0.18)")}`} animate={{ cy: [166, 140, 166], opacity: [0.6, 0, 0.6] }} transition={{ duration: 5, repeat: Infinity }} />
        <motion.circle cx="89" cy="158" r="6" fill={`${indigo.replace(")", " / 0.14)")}`} animate={{ cy: [158, 130, 158], opacity: [0.4, 0, 0.4] }} transition={{ duration: 6, repeat: Infinity }} />
      </motion.g>
      <SketchAnnotation x1={106} y1={172} x2={94} y2={188} label="NARODA · TEXTILE" sub="Calico · Arvind · 1880" color={accent} delay={0.85} align="start" />

      {/* Sidi Saiyyed jali */}
      <motion.g variants={pop(0.4)}>
        <path d="M 180 270 L 180 150 Q 180 110 240 110 Q 300 110 300 150 L 300 270 Z" fill={`${indigo.replace(")", " / 0.06)")}`} stroke={indigo} strokeWidth="1.4" />
        <motion.path d="M 240 270 L 240 130" stroke={indigo} strokeWidth="1.2" variants={draw(0.5)} />
        {[
          { y: 240, dx: 38 },
          { y: 218, dx: 32 },
          { y: 196, dx: 26 },
          { y: 174, dx: 20 },
          { y: 154, dx: 14 },
        ].map((br, i) => (
          <motion.g key={`br-${i}`} variants={draw(0.55 + i * 0.05, 0.5)}>
            <path d={`M 240 ${br.y} Q ${240 - br.dx / 2} ${br.y - 8} ${240 - br.dx} ${br.y - 16}`} stroke={indigo} strokeWidth="0.8" fill="none" />
            <path d={`M 240 ${br.y} Q ${240 + br.dx / 2} ${br.y - 8} ${240 + br.dx} ${br.y - 16}`} stroke={indigo} strokeWidth="0.8" fill="none" />
            <circle cx={240 - br.dx} cy={br.y - 16} r="2" fill={accent} />
            <circle cx={240 + br.dx} cy={br.y - 16} r="2" fill={accent} />
          </motion.g>
        ))}
        <motion.path d="M 234 130 Q 240 120 246 130 Q 244 138 240 140 Q 236 138 234 130" fill={accent} variants={pop(0.95)} />
      </motion.g>
      <SketchAnnotation x1={150} y1={108} x2={184} y2={132} label="SIDI SAIYYED JALI" sub="Tree of life · 1573" color={indigo} delay={0.9} align="start" />

      {/* Gandhi chakra */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "60px 130px" }}>
        <motion.g variants={pop(0.5)}>
          <circle cx="60" cy="130" r="26" fill="none" stroke={indigo} strokeWidth="1.2" />
          <circle cx="60" cy="130" r="5" fill={indigo} />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line key={`spk-${i}`} x1={60 + 5 * Math.cos(a)} y1={130 + 5 * Math.sin(a)} x2={60 + 24 * Math.cos(a)} y2={130 + 24 * Math.sin(a)} stroke={`${indigo.replace(")", " / 0.6)")}`} strokeWidth="0.4" />
            );
          })}
        </motion.g>
      </motion.g>
      <SketchAnnotation x1={108} y1={114} x2={84} y2={120} label="SABARMATI" sub="Gandhi · Salt March" color={indigo} delay={1.0} align="start" />

      <IndustryStamp x={20} y={290} label="TEXTILE" sub="30% denim exports" color={accent} delay={1.0} />
      <IndustryStamp x={102} y={290} label="DIAMONDS" sub="90% world cut" color={indigo} delay={1.05} />
      <IndustryStamp x={184} y={290} label="CHEMICAL" sub="Vatva GIDC" color={accent} delay={1.1} />

      <ProsperityRibbon
        color={indigo}
        accent={accent}
        metrics={[
          { value: "90%", label: "World diamonds cut" },
          { value: "1894", label: "Asia #2 stock excg." },
          { value: "1411", label: "Founded · Sultan" },
          { value: "UNESCO", label: "Heritage city · 2017" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={indigo}
        accent={accent}
        pins={[
          { angle: -90, label: "OLD CITY" },
          { angle: -30, label: "NARODA" },
          { angle: 30, label: "VATVA" },
          { angle: 90, label: "GIFT" },
          { angle: 150, label: "SG HW." },
          { angle: 210, label: "BOPAL" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  INDORE                                      */
/* ============================================================================ */

export function IndoreIdentity({ className = "" }: { className?: string }) {
  const orange = "oklch(0.7 0.2 50)";
  const violet = "oklch(0.66 0.18 295)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="ind-sky" x1="0" y1="62" x2="0" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${orange.replace(")", " / 0.1)")}`} />
          <stop offset="100%" stopColor={`${violet.replace(")", " / 0.04)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={orange} />
      <rect x="0" y="62" width="480" height="218" fill="url(#ind-sky)" />
      <SketchTitle city="Indore" nickname="Mini Mumbai · Cleanest City" est="1715" lat="22.72" lng="75.86" color={orange} accent={violet} />

      {/* Sarafa moon */}
      <motion.circle cx="80" cy="100" r="18" fill={`${orange.replace(")", " / 0.3)")}`} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity }} />
      <circle cx="74" cy="96" r="2.5" fill={`${orange.replace(")", " / 0.5)")}`} />
      <circle cx="84" cy="104" r="2" fill={`${orange.replace(")", " / 0.5)")}`} />
      <SketchAnnotation x1={108} y1={88} x2={94} y2={94} label="SARAFA NIGHT" sub="Bazaar · 9pm-2am" color={orange} delay={0.6} align="start" />

      {/* Pithampur factory */}
      <motion.g variants={fade(0.2)}>
        <rect x="0" y="210" width="100" height="50" fill={`${violet.replace(")", " / 0.18)")}`} stroke={`${violet.replace(")", " / 0.4)")}`} strokeWidth="0.5" />
        <path d="M 0 210 L 10 202 L 20 210 L 30 202 L 40 210 L 50 202 L 60 210 L 70 202 L 80 210 L 90 202 L 100 210" fill={`${violet.replace(")", " / 0.22)")}`} />
        <rect x="40" y="178" width="5" height="32" fill={`${violet.replace(")", " / 0.5)")}`} />
        <motion.circle cx="42" cy="175" r="4" fill={`${violet.replace(")", " / 0.18)")}`} animate={{ cy: [175, 150, 175], opacity: [0.6, 0, 0.6] }} transition={{ duration: 5, repeat: Infinity }} />
      </motion.g>
      <SketchAnnotation x1={104} y1={194} x2={94} y2={208} label="PITHAMPUR SEZ" sub="700+ companies" color={violet} delay={0.85} align="start" />

      {/* Rajwada palace */}
      <motion.g variants={pop(0.3)}>
        <rect x="100" y="240" width="280" height="40" fill={`${orange.replace(")", " / 0.28)")}`} stroke={orange} strokeWidth="1.4" />
        <path d="M 220 280 L 220 246 Q 220 228 240 228 Q 260 228 260 246 L 260 280 Z" fill="var(--background)" stroke={orange} strokeWidth="1.4" />
        <rect x="120" y="200" width="240" height="40" fill={`${orange.replace(")", " / 0.22)")}`} stroke={orange} strokeWidth="1" />
        <rect x="140" y="165" width="200" height="35" fill={`${orange.replace(")", " / 0.16)")}`} stroke={orange} strokeWidth="1" />
        <rect x="170" y="135" width="140" height="30" fill={`${orange.replace(")", " / 0.12)")}`} stroke={orange} strokeWidth="0.7" />
        <path d="M 200 135 L 240 115 L 280 135" fill={orange} />
        <line x1="240" y1="115" x2="240" y2="103" stroke={orange} strokeWidth="0.8" />
        <circle cx="240" cy="100" r="2.5" fill={orange} />
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 130 + i * 32 + 10;
          return (
            <motion.g key={`wn2-${i}`} variants={pop(0.4 + i * 0.03)}>
              <rect x={x} y="208" width="14" height="22" rx="2" fill={`${orange.replace(")", " / 0.18)")}`} stroke={orange} strokeWidth="0.4" />
              <path d={`M ${x} 214 Q ${x + 7} 206 ${x + 14} 214`} fill="none" stroke={orange} strokeWidth="0.4" />
            </motion.g>
          );
        })}
      </motion.g>
      <SketchAnnotation x1={344} y1={114} x2={304} y2={138} label="RAJWADA PALACE" sub="Holkar · 1747 · 7-storey" color={orange} delay={0.95} align="end" />

      {/* logistics route + truck */}
      <motion.g variants={pop(0.7)}>
        <motion.path d="M 0 280 Q 240 256 480 280" stroke={`${violet.replace(")", " / 0.5)")}`} strokeWidth="1" strokeDasharray="4 3" fill="none" variants={draw(0.7, 1.4)} />
        <motion.g animate={{ x: [-460, 460] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
          <rect x="0" y="266" width="22" height="14" rx="2" fill={orange} />
          <rect x="0" y="262" width="14" height="6" fill={`${orange.replace(")", " / 0.7)")}`} />
          <circle cx="5" cy="282" r="2.5" fill="oklch(0.2 0.04 60)" />
          <circle cx="18" cy="282" r="2.5" fill="oklch(0.2 0.04 60)" />
        </motion.g>
      </motion.g>

      <IndustryStamp x={20} y={290} label="LOGISTICS" sub="Central India belt" color={violet} delay={1.0} />
      <IndustryStamp x={102} y={290} label="MFG" sub="Pithampur SEZ" color={orange} delay={1.05} />
      <IndustryStamp x={184} y={290} label="EDU" sub="IIM-I · IIT-I" color={violet} delay={1.1} />

      <ProsperityRibbon
        color={orange}
        accent={violet}
        metrics={[
          { value: "#1", label: "Cleanest 7 yrs" },
          { value: "IIM+IIT", label: "Only city" },
          { value: "700+", label: "SEZ companies" },
          { value: "Sarafa", label: "Night food market" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={orange}
        accent={violet}
        pins={[
          { angle: -90, label: "RAJWADA" },
          { angle: -30, label: "VIJAY NG." },
          { angle: 30, label: "PITHAMPUR" },
          { angle: 90, label: "MHOW" },
          { angle: 150, label: "INDORE GPO" },
          { angle: 210, label: "AB ROAD" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                                  BHOPAL                                      */
/* ============================================================================ */

export function BhopalIdentity({ className = "" }: { className?: string }) {
  const teal = "oklch(0.6 0.16 200)";
  const accent = "oklch(0.74 0.16 155)";
  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={`h-auto w-full ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      <defs>
        <linearGradient id="bp-sky" x1="0" y1="62" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={`${teal.replace(")", " / 0.22)")}`} />
          <stop offset="100%" stopColor={`${teal.replace(")", " / 0.04)")}`} />
        </linearGradient>
      </defs>
      <BlueprintGrid color={teal} />
      <rect x="0" y="62" width="480" height="178" fill="url(#bp-sky)" />
      <SketchTitle city="Bhopal" nickname="City of Lakes · MP Capital" est="11C" lat="23.26" lng="77.41" color={teal} accent={accent} />

      {/* Sanchi stupa (background right) */}
      <motion.g variants={fade(0.2)}>
        <ellipse cx="430" cy="190" rx="32" ry="20" fill={`${teal.replace(")", " / 0.18)")}`} stroke={`${teal.replace(")", " / 0.4)")}`} strokeWidth="0.5" />
        <rect x="426" y="155" width="8" height="20" fill={`${teal.replace(")", " / 0.5)")}`} />
        <rect x="420" y="150" width="20" height="6" fill={`${teal.replace(")", " / 0.55)")}`} />
        <line x1="430" y1="145" x2="430" y2="135" stroke={`${teal.replace(")", " / 0.6)")}`} strokeWidth="0.5" />
      </motion.g>
      <SketchAnnotation x1={460} y1={130} x2={436} y2={148} label="SANCHI STUPA" sub="3C BCE · Buddhist UNESCO" color={teal} delay={0.85} align="end" />

      {/* Vidhan Sabha (left) */}
      <motion.g variants={fade(0.25)}>
        <rect x="20" y="170" width="80" height="45" fill={`${teal.replace(")", " / 0.18)")}`} stroke={`${teal.replace(")", " / 0.4)")}`} strokeWidth="0.5" />
        <path d="M 38 170 Q 60 145 82 170" fill={`${teal.replace(")", " / 0.25)")}`} stroke={`${teal.replace(")", " / 0.5)")}`} strokeWidth="0.5" />
        <line x1="60" y1="145" x2="60" y2="135" stroke={`${teal.replace(")", " / 0.6)")}`} strokeWidth="0.5" />
      </motion.g>
      <SketchAnnotation x1={108} y1={140} x2={86} y2={158} label="VIDHAN SABHA" sub="MP capital · 1956" color={teal} delay={0.95} align="start" />

      {/* Taj-ul-Masajid */}
      <motion.g variants={pop(0.3)}>
        <motion.path d="M 200 145 Q 240 80 280 145 Z" fill={`${teal.replace(")", " / 0.32)")}`} stroke={teal} strokeWidth="1.4" variants={draw(0.3, 1)} />
        <line x1="240" y1="80" x2="240" y2="62" stroke={teal} strokeWidth="1.2" />
        <circle cx="240" cy="58" r="3" fill={teal} />
        {[150, 330].map((cx) => (
          <g key={`sd-${cx}`}>
            <path d={`M ${cx - 22} 145 Q ${cx} 102 ${cx + 22} 145 Z`} fill={`${teal.replace(")", " / 0.22)")}`} stroke={teal} strokeWidth="1" />
            <line x1={cx} y1="102" x2={cx} y2="92" stroke={teal} strokeWidth="0.7" />
            <circle cx={cx} cy="89" r="2" fill={teal} />
          </g>
        ))}
        {[78, 402].map((x) => (
          <g key={`mn-${x}`}>
            <rect x={x - 5} y="92" width="10" height="86" fill={`${teal.replace(")", " / 0.25)")}`} stroke={teal} strokeWidth="0.7" />
            <rect x={x - 7} y="118" width="14" height="3" fill={teal} />
            <rect x={x - 7} y="148" width="14" height="3" fill={teal} />
            <path d={`M ${x - 7} 92 Q ${x} 78 ${x + 7} 92`} fill={teal} />
            <line x1={x} y1="78" x2={x} y2="68" stroke={teal} strokeWidth="0.7" />
            <circle cx={x} cy="66" r="2" fill={teal} />
          </g>
        ))}
        <rect x="100" y="145" width="280" height="40" fill={`${teal.replace(")", " / 0.1)")}`} stroke={teal} strokeWidth="0.7" />
        <path d="M 220 185 L 220 162 Q 220 150 240 150 Q 260 150 260 162 L 260 185 Z" fill="var(--background)" stroke={teal} strokeWidth="0.7" />
      </motion.g>
      <SketchAnnotation x1={146} y1={66} x2={172} y2={88} label="TAJ-UL-MASAJID" sub="Asia's largest mosque" color={teal} delay={0.95} align="end" />

      {/* Lake water */}
      <motion.rect x="0" y="185" width="480" height="55" fill={`${teal.replace(")", " / 0.16)")}`} variants={fade(0.6)} />

      {/* mosque reflection */}
      <motion.g variants={fade(0.7)} opacity="0.32">
        <path d="M 200 185 Q 240 252 280 185 Z" fill={teal} />
        {[150, 330].map((cx) => (
          <path key={`rf-${cx}`} d={`M ${cx - 22} 185 Q ${cx} 226 ${cx + 22} 185 Z`} fill={`${teal.replace(")", " / 0.4)")}`} />
        ))}
      </motion.g>

      {/* boat */}
      <motion.g variants={pop(0.85)} animate={{ x: [-30, 480] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
        <path d="M 0 210 L 4 214 L 24 214 L 28 210 Z" fill={`${teal.replace(")", " / 0.6)")}`} stroke={teal} strokeWidth="0.4" />
        <line x1="14" y1="210" x2="14" y2="198" stroke={teal} strokeWidth="0.5" />
        <path d="M 14 198 L 22 206 L 14 206 Z" fill={`${accent.replace(")", " / 0.5)")}`} stroke={accent} strokeWidth="0.3" />
      </motion.g>

      {/* ripples */}
      {[200, 215, 230].map((y, i) => (
        <motion.path
          key={`rp-${i}`}
          d={`M 0 ${y} Q 60 ${y - 1} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`}
          stroke={`${accent.replace(")", " / 0.3)")}`}
          strokeWidth="0.4"
          fill="none"
          animate={{
            d: [
              `M 0 ${y} Q 60 ${y - 1} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y + 1} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
              `M 0 ${y} Q 60 ${y - 1} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y}`,
            ],
          }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <IndustryStamp x={20} y={290} label="GOV / PSU" sub="MP Vidhan Sabha" color={teal} delay={1.0} />
      <IndustryStamp x={102} y={290} label="EDU" sub="IISER · AIIMS · MANIT" color={accent} delay={1.05} />
      <IndustryStamp x={184} y={290} label="HERITAGE" sub="Sanchi · Bhimbetka" color={teal} delay={1.1} />

      <ProsperityRibbon
        color={teal}
        accent={accent}
        metrics={[
          { value: "107 yrs", label: "Begums' rule" },
          { value: "30K BCE", label: "Bhimbetka art" },
          { value: "Asia #1", label: "Largest mosque" },
          { value: "BHEL", label: "PSU anchor" },
        ]}
      />

      <CompassRose
        cx={392}
        cy={358}
        color={teal}
        accent={accent}
        pins={[
          { angle: -90, label: "ARERA" },
          { angle: -30, label: "MP NAGAR" },
          { angle: 30, label: "MANDIDEEP" },
          { angle: 90, label: "BHOJPUR" },
          { angle: 150, label: "OLD CITY" },
          { angle: 210, label: "BAIRAGARH" },
        ]}
      />
    </motion.svg>
  );
}

/* ============================================================================ */
/*                              REGISTRY                                        */
/* ============================================================================ */

export const cityIdentityVisuals: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  jaipur: JaipurIdentity,
  mumbai: MumbaiIdentity,
  delhi: DelhiIdentity,
  bengaluru: BengaluruIdentity,
  pune: PuneIdentity,
  chennai: ChennaiIdentity,
  hyderabad: HyderabadIdentity,
  kolkata: KolkataIdentity,
  ahmedabad: AhmedabadIdentity,
  indore: IndoreIdentity,
  bhopal: BhopalIdentity,
};
