import type { BlogSketchKey } from "@/lib/blogs";

/**
 * BlogSketches — a small library of hand-drawn ink SVGs used as the hero
 * illustration on each blog post (and on the blogs listing page). They use
 * the same pen-on-paper aesthetic as HeroBackground: thin strokes, amber
 * highlights, subtle SMIL motion. Each sketch is a single self-contained
 * component, sized by the parent via `className`.
 */

const INK = "oklch(0.28 0.025 260)";
const INK_SOFT = "oklch(0.28 0.025 260 / 0.5)";
const INK_FAINT = "oklch(0.28 0.025 260 / 0.18)";
const AMBER = "oklch(0.65 0.19 55)";
const AMBER_SOFT = "oklch(0.65 0.19 55 / 0.14)";

type Props = { className?: string };

// ============================================================================
// 1. Audit Lens — magnifying glass over a dashboard
// ============================================================================
export function AuditLensSketch({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Paper grid */}
      <defs>
        <pattern id="bl-audit-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke={INK_FAINT} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#bl-audit-grid)" opacity="0.6" />

      {/* Dashboard card */}
      <g transform="translate(60 60)" stroke={INK} strokeWidth="1.4">
        <rect x="0" y="0" width="320" height="200" rx="8" />
        {/* header */}
        <line x1="0" y1="28" x2="320" y2="28" />
        <circle cx="14" cy="14" r="3.5" />
        <circle cx="28" cy="14" r="3.5" />
        <circle cx="42" cy="14" r="3.5" />
        <text x="60" y="18" fontFamily="var(--font-mono), monospace" fontSize="9" fill={INK_SOFT} stroke="none">
          REVENUE DASHBOARD · 2026
        </text>

        {/* KPI row */}
        <g transform="translate(16 44)">
          <rect x="0" y="0" width="88" height="46" rx="4" stroke={INK_SOFT} />
          <text x="8" y="14" fontSize="7" fontFamily="var(--font-mono), monospace" fill={INK_SOFT} stroke="none">
            MRR
          </text>
          <text x="8" y="34" fontSize="14" fontWeight="600" fill={INK} stroke="none" fontFamily="var(--font-mono), monospace">
            ₹12.4L
          </text>
        </g>
        <g transform="translate(116 44)">
          <rect x="0" y="0" width="88" height="46" rx="4" stroke={INK_SOFT} />
          <text x="8" y="14" fontSize="7" fontFamily="var(--font-mono), monospace" fill={INK_SOFT} stroke="none">
            CVR
          </text>
          <text x="8" y="34" fontSize="14" fontWeight="600" fill={AMBER} stroke="none" fontFamily="var(--font-mono), monospace">
            2.1%
          </text>
        </g>
        <g transform="translate(216 44)">
          <rect x="0" y="0" width="88" height="46" rx="4" stroke={INK_SOFT} />
          <text x="8" y="14" fontSize="7" fontFamily="var(--font-mono), monospace" fill={INK_SOFT} stroke="none">
            CAC
          </text>
          <text x="8" y="34" fontSize="14" fontWeight="600" fill={INK} stroke="none" fontFamily="var(--font-mono), monospace">
            ₹840
          </text>
        </g>

        {/* chart */}
        <g transform="translate(16 106)">
          <line x1="0" y1="0" x2="0" y2="70" />
          <line x1="0" y1="70" x2="288" y2="70" />
          <path
            d="M 0 50 L 36 44 L 72 52 L 108 30 L 144 38 L 180 22 L 216 28 L 252 12 L 288 6"
            stroke={INK_SOFT}
            strokeWidth="1.2"
          />
          <path
            d="M 0 50 L 36 44 L 72 52 L 108 30 L 144 38 L 180 22 L 216 28 L 252 12 L 288 6"
            stroke={AMBER}
            strokeWidth="1.8"
            strokeDasharray="600"
            strokeDashoffset="600"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="600"
              to="0"
              dur="3s"
              begin="0s"
              fill="freeze"
            />
          </path>
          {/* data dots */}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288].map((cx, i) => (
            <circle
              key={i}
              cx={cx}
              cy={[50, 44, 52, 30, 38, 22, 28, 12, 6][i]}
              r="2"
              fill={AMBER}
            />
          ))}
        </g>
      </g>

      {/* Magnifying glass on top of the chart */}
      <g transform="translate(270 190)" stroke={INK} strokeWidth="2.2">
        <circle cx="0" cy="0" r="52" fill="oklch(0.98 0.005 260 / 0.8)" />
        <circle cx="0" cy="0" r="52" />
        <line x1="38" y1="38" x2="72" y2="72" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="40" x2="70" y2="74" strokeWidth="4" stroke={INK_SOFT} opacity="0.3" />

        {/* inside lens — zoomed fragment showing leak */}
        <g transform="translate(-30 -10)">
          <path
            d="M 0 20 L 14 14 L 28 18 L 42 4 L 56 8"
            stroke={AMBER}
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx="28" cy="18" r="3" fill={AMBER}>
            <animate attributeName="r" values="3;7;3" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </g>
        <text
          x="0"
          y="30"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize="8"
          letterSpacing="0.15em"
          fill={AMBER}
          stroke="none"
        >
          LEAK
        </text>
      </g>

      {/* Corner annotation */}
      <g transform="translate(390 60)" fill={INK_SOFT} stroke="none">
        <text fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="0.18em">
          AUDIT · 45 MIN
        </text>
      </g>
      <g transform="translate(390 40)" stroke={AMBER_SOFT} strokeWidth="1">
        <line x1="0" y1="0" x2="100" y2="0" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

// ============================================================================
// 2. Leaky Funnel — funnel with drops leaking out
// ============================================================================
export function LeakyFunnelSketch({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="bl-leak-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke={INK_FAINT} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#bl-leak-grid)" opacity="0.6" />

      {/* Traffic label */}
      <g transform="translate(260 34)" fill={INK_SOFT} stroke="none" textAnchor="middle">
        <text fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="0.2em">
          1,000 VISITORS
        </text>
      </g>

      {/* Arrows flowing down into funnel */}
      <g transform="translate(260 44)" stroke={INK_SOFT} strokeWidth="1.2" strokeDasharray="2 4">
        {[-60, -20, 20, 60].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="34" />
        ))}
      </g>

      {/* Funnel outline */}
      <g transform="translate(260 190)" stroke={INK} strokeWidth="1.8">
        <path d="M -140 -60 L 140 -60 L 60 30 L 60 120 L -60 120 L -60 30 Z" />
        {/* filter bars */}
        <line x1="-130" y1="-40" x2="130" y2="-40" strokeDasharray="2 4" stroke={INK_SOFT} />
        <line x1="-100" y1="-10" x2="100" y2="-10" strokeDasharray="2 4" stroke={INK_SOFT} />
        <line x1="-60" y1="20" x2="60" y2="20" strokeDasharray="2 4" stroke={INK_SOFT} />
        <line x1="-60" y1="60" x2="60" y2="60" strokeDasharray="2 4" stroke={INK_SOFT} />
        <line x1="-60" y1="100" x2="60" y2="100" strokeDasharray="2 4" stroke={INK_SOFT} />

        {/* ===== Leaking drops ===== */}
        {/* left side leak 1 */}
        <g>
          <path d="M -92 -30 L -130 -8" stroke={AMBER} strokeWidth="1.6" />
          <circle r="3" fill={AMBER}>
            <animateMotion dur="2.4s" repeatCount="indefinite">
              <mpath href="#bl-leak-path-1" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <path id="bl-leak-path-1" d="M -92 -30 L -150 30" stroke="none" fill="none" />
        </g>

        {/* right side leak */}
        <g>
          <path d="M 92 -30 L 130 -8" stroke={AMBER} strokeWidth="1.6" />
          <circle r="3" fill={AMBER}>
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#bl-leak-path-2" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3s" repeatCount="indefinite" />
          </circle>
          <path id="bl-leak-path-2" d="M 92 -30 L 160 40" stroke="none" fill="none" />
        </g>

        {/* bottom left leak */}
        <g>
          <path d="M -50 70 L -90 95" stroke={AMBER} strokeWidth="1.4" />
          <circle r="2.5" fill={AMBER}>
            <animateMotion dur="2.8s" begin="1s" repeatCount="indefinite">
              <mpath href="#bl-leak-path-3" />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.8s" begin="1s" repeatCount="indefinite" />
          </circle>
          <path id="bl-leak-path-3" d="M -50 70 L -110 130" stroke="none" fill="none" />
        </g>

        {/* Flowing dots through the funnel */}
        <circle r="3" fill={INK}>
          <animate attributeName="cx" values="-40;-10;0;0" keyTimes="0;0.35;0.7;1" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-60;-10;60;125" keyTimes="0;0.35;0.7;1" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill={INK}>
          <animate attributeName="cx" values="40;10;0;0" keyTimes="0;0.35;0.7;1" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-60;-10;60;125" keyTimes="0;0.35;0.7;1" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
        </circle>

        {/* Result label at the bottom */}
        <text
          x="0"
          y="150"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize="9"
          letterSpacing="0.2em"
          fill={INK}
          stroke="none"
        >
          19 BUYERS · 1.9%
        </text>
      </g>
    </svg>
  );
}

// ============================================================================
// 3. WhatsApp Flow — phone with chat bubbles flowing upward
// ============================================================================
export function WhatsAppFlowSketch({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="bl-wa-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke={INK_FAINT} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#bl-wa-grid)" opacity="0.6" />

      {/* Three-tier labels */}
      <g fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="0.18em" stroke="none">
        <text x="380" y="80" fill={INK_SOFT}>TIER 1 · BOT</text>
        <text x="380" y="160" fill={INK_SOFT}>TIER 2 · RM</text>
        <text x="380" y="240" fill={INK_SOFT}>TIER 3 · HUMAN</text>
        <line x1="380" y1="84" x2="470" y2="84" stroke={AMBER} strokeOpacity="0.4" strokeWidth="0.8" />
        <line x1="380" y1="164" x2="470" y2="164" stroke={AMBER} strokeOpacity="0.4" strokeWidth="0.8" />
        <line x1="380" y1="244" x2="470" y2="244" stroke={AMBER} strokeOpacity="0.4" strokeWidth="0.8" />
      </g>

      {/* Phone */}
      <g transform="translate(140 40)" stroke={INK} strokeWidth="1.8">
        <rect x="0" y="0" width="160" height="260" rx="18" />
        <rect x="0" y="0" width="160" height="260" rx="18" stroke={INK_SOFT} strokeWidth="0.6" transform="translate(2 2)" />
        {/* notch */}
        <rect x="58" y="8" width="44" height="8" rx="4" fill={INK} />
        {/* screen area */}
        <rect x="8" y="24" width="144" height="220" rx="6" stroke={INK_SOFT} />

        {/* Chat header */}
        <rect x="8" y="24" width="144" height="22" fill={AMBER_SOFT} stroke={AMBER_SOFT} />
        <circle cx="22" cy="35" r="7" stroke={AMBER} />
        <text x="34" y="33" fontFamily="var(--font-mono), monospace" fontSize="8" fontWeight="600" fill={INK} stroke="none">
          SAVIN · GROUP
        </text>
        <text x="34" y="42" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK_SOFT} stroke="none">
          online · typing
        </text>

        {/* Chat bubbles (from bottom up) */}
        {/* bot bubble 1 */}
        <g transform="translate(16 210)">
          <rect x="0" y="0" width="84" height="20" rx="10" fill={INK_FAINT} stroke={INK_SOFT} strokeWidth="0.8" />
          <text x="6" y="13" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK} stroke="none">
            hi · what brings you?
          </text>
        </g>
        {/* user reply */}
        <g transform="translate(52 184)">
          <rect x="0" y="0" width="84" height="20" rx="10" fill={AMBER_SOFT} stroke={AMBER} strokeWidth="0.8" />
          <text x="6" y="13" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK} stroke="none">
            want a quote
          </text>
        </g>
        {/* bot bubble 2 */}
        <g transform="translate(16 158)">
          <rect x="0" y="0" width="104" height="20" rx="10" fill={INK_FAINT} stroke={INK_SOFT} strokeWidth="0.8" />
          <text x="6" y="13" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK} stroke="none">
            cool. budget range?
          </text>
        </g>
        {/* user reply */}
        <g transform="translate(52 132)">
          <rect x="0" y="0" width="84" height="20" rx="10" fill={AMBER_SOFT} stroke={AMBER} strokeWidth="0.8" />
          <text x="6" y="13" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK} stroke="none">
            ₹2-5L
          </text>
        </g>
        {/* bot bubble 3 - handoff */}
        <g transform="translate(16 106)">
          <rect x="0" y="0" width="120" height="20" rx="10" fill={INK_FAINT} stroke={INK_SOFT} strokeWidth="0.8" />
          <text x="6" y="13" fontFamily="var(--font-mono), monospace" fontSize="6" fill={INK} stroke="none">
            connecting you to Kanha
          </text>
        </g>
        {/* typing indicator */}
        <g transform="translate(16 82)">
          <rect x="0" y="0" width="40" height="16" rx="8" fill={INK_FAINT} stroke={INK_SOFT} strokeWidth="0.8" />
          <circle cx="12" cy="8" r="1.5" fill={INK}>
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="20" cy="8" r="1.5" fill={INK}>
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="28" cy="8" r="1.5" fill={INK}>
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>

      {/* flying message icons from phone to tiers */}
      <g stroke={AMBER} strokeWidth="1.4">
        {/* arrow to tier 1 */}
        <path d="M 310 100 Q 340 80 374 80" strokeDasharray="2 3" />
        <circle r="3" fill={AMBER}>
          <animate attributeName="cx" values="310;374" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="100;80" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.2s" repeatCount="indefinite" />
        </circle>
        {/* arrow to tier 2 */}
        <path d="M 310 170 L 374 160" strokeDasharray="2 3" />
        <circle r="3" fill={AMBER}>
          <animate attributeName="cx" values="310;374" dur="2.6s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="cy" values="170;160" dur="2.6s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.6s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        {/* arrow to tier 3 */}
        <path d="M 310 230 Q 340 244 374 240" strokeDasharray="2 3" />
        <circle r="3" fill={AMBER}>
          <animate attributeName="cx" values="310;374" dur="3s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="230;240" dur="3s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3s" begin="1.2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

// ============================================================================
// 4. Layer Stack — 5-layer revenue architecture
// ============================================================================
export function LayerStackSketch({ className }: Props) {
  const layers = [
    { label: "05 · RETENTION", icon: "♥", highlight: true  },
    { label: "04 · NURTURE",   icon: "@", highlight: false },
    { label: "03 · QUALIFY",   icon: "▽", highlight: false },
    { label: "02 · CONVERT",   icon: "→", highlight: false },
    { label: "01 · ATTENTION", icon: "◎", highlight: true  },
  ];
  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="bl-ls-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke={INK_FAINT} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#bl-ls-grid)" opacity="0.6" />

      {/* Stack */}
      <g transform="translate(120 34)" stroke={INK} strokeWidth="1.6">
        {layers.map((l, i) => (
          <g key={l.label} transform={`translate(0 ${i * 48})`}>
            <rect
              x="0"
              y="0"
              width="280"
              height="40"
              rx="4"
              fill={l.highlight ? AMBER_SOFT : "transparent"}
              stroke={l.highlight ? AMBER : INK}
            />
            <text
              x="16"
              y="25"
              fontFamily="var(--font-mono), monospace"
              fontSize="10"
              letterSpacing="0.2em"
              fontWeight="600"
              fill={INK}
              stroke="none"
            >
              {l.label}
            </text>
            <circle cx="254" cy="20" r="12" stroke={l.highlight ? AMBER : INK_SOFT} strokeWidth="1.2" />
            <text
              x="254"
              y="25"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
              fontSize="12"
              fontWeight="600"
              fill={INK}
              stroke="none"
            >
              {l.icon}
            </text>
          </g>
        ))}

        {/* Right-side annotations */}
        <g transform="translate(300 0)" stroke={INK_SOFT} strokeWidth="0.8" fill={INK_SOFT}>
          <line x1="0" y1="20" x2="20" y2="20" />
          <line x1="20" y1="20" x2="20" y2="220" />
          <line x1="20" y1="220" x2="0" y2="220" />
          <text
            x="30"
            y="124"
            fontFamily="var(--font-mono), monospace"
            fontSize="9"
            letterSpacing="0.18em"
            fill={INK_SOFT}
            stroke="none"
          >
            THE FULL
          </text>
          <text
            x="30"
            y="138"
            fontFamily="var(--font-mono), monospace"
            fontSize="9"
            letterSpacing="0.18em"
            fill={INK_SOFT}
            stroke="none"
          >
            REVENUE STACK
          </text>
        </g>

        {/* Arrows showing the feedback loop from retention back to attention */}
        <g stroke={AMBER} strokeWidth="1.4" fill="none">
          <path
            d="M -18 20 Q -60 20 -60 232 Q -60 252 -18 252"
            strokeDasharray="3 4"
          />
          <path d="M -22 248 L -18 252 L -22 256" />
          <text
            x="-100"
            y="136"
            fontFamily="var(--font-mono), monospace"
            fontSize="8"
            letterSpacing="0.18em"
            fill={AMBER}
            stroke="none"
            transform="rotate(-90 -100 136)"
          >
            REFERRAL LOOP
          </text>
        </g>

        {/* Upward compounding flow arrow */}
        <g stroke={INK_SOFT} strokeWidth="1.4" fill="none">
          <line x1="140" y1="260" x2="140" y2="280" strokeDasharray="2 3" />
        </g>
      </g>
    </svg>
  );
}

// ============================================================================
// 5. SEO Peak Graph — keyword growth graph with tags
// ============================================================================
export function SeoPeakGraphSketch({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="bl-seo-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke={INK_FAINT} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#bl-seo-grid)" opacity="0.6" />

      {/* Axes */}
      <g transform="translate(70 50)" stroke={INK} strokeWidth="1.5">
        <line x1="0" y1="0" x2="0" y2="220" />
        <line x1="0" y1="220" x2="400" y2="220" />

        {/* Y labels */}
        <g fontFamily="var(--font-mono), monospace" fontSize="8" fill={INK_SOFT} stroke="none">
          <text x="-32" y="4">#1</text>
          <text x="-32" y="74">#10</text>
          <text x="-32" y="144">#50</text>
          <text x="-32" y="220">#100</text>
        </g>

        {/* X labels */}
        <g fontFamily="var(--font-mono), monospace" fontSize="8" fill={INK_SOFT} stroke="none" textAnchor="middle">
          <text x="0" y="236">M0</text>
          <text x="80" y="236">M1</text>
          <text x="160" y="236">M2</text>
          <text x="240" y="236">M3</text>
          <text x="320" y="236">M6</text>
          <text x="400" y="236">M9</text>
        </g>

        {/* Tick marks */}
        {[0, 80, 160, 240, 320, 400].map((x) => (
          <line key={x} x1={x} y1="220" x2={x} y2="224" stroke={INK_SOFT} />
        ))}

        {/* Content freshness dotted ceiling */}
        <line x1="0" y1="40" x2="400" y2="40" stroke={INK_FAINT} strokeDasharray="2 4" />
        <text
          x="404"
          y="44"
          fontFamily="var(--font-mono), monospace"
          fontSize="7"
          fill={INK_FAINT}
          stroke="none"
        >
          TOP 10
        </text>

        {/* Long-tail climb */}
        <path
          d="M 0 200 L 40 196 L 80 180 L 120 150 L 160 108 L 200 86 L 240 60 L 280 48 L 320 36 L 360 28 L 400 16"
          stroke={INK_SOFT}
          strokeWidth="1.4"
        />
        <path
          d="M 0 200 L 40 196 L 80 180 L 120 150 L 160 108 L 200 86 L 240 60 L 280 48 L 320 36 L 360 28 L 400 16"
          stroke={AMBER}
          strokeWidth="2.2"
          strokeDasharray="800"
          strokeDashoffset="800"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="800"
            to="0"
            dur="4s"
            fill="freeze"
          />
        </path>

        {/* Milestone dots */}
        {[
          { x: 0, y: 200, label: "start" },
          { x: 120, y: 150, label: "" },
          { x: 240, y: 60, label: "page 1" },
          { x: 400, y: 16, label: "#1" },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={AMBER} />
            {p.label && (
              <text
                x={p.x + 6}
                y={p.y - 6}
                fontFamily="var(--font-mono), monospace"
                fontSize="7.5"
                letterSpacing="0.12em"
                fill={AMBER}
                stroke="none"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}

        {/* Keyword tags floating on the right */}
        <g transform="translate(220 -30)">
          {[
            { x: 0, y: 0, kw: "revenue audit", cls: AMBER },
            { x: 60, y: -14, kw: "sme crm", cls: INK_SOFT },
            { x: 130, y: 4, kw: "whatsapp sales", cls: AMBER },
            { x: 30, y: 22, kw: "+23 more", cls: INK_FAINT },
          ].map((k, i) => (
            <g key={i} transform={`translate(${k.x} ${k.y})`}>
              <rect
                x="0"
                y="-10"
                width={k.kw.length * 5 + 12}
                height="16"
                rx="8"
                stroke={k.cls}
                strokeWidth="1"
                fill="oklch(1 0 0 / 0.5)"
              />
              <text
                x="6"
                y="1"
                fontFamily="var(--font-mono), monospace"
                fontSize="8"
                fill={INK}
                stroke="none"
              >
                {k.kw}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* Corner label */}
      <g transform="translate(60 30)" fill={INK_SOFT} stroke="none">
        <text fontFamily="var(--font-mono), monospace" fontSize="9" letterSpacing="0.18em">
          KEYWORD · POSITION
        </text>
        <line x1="0" y1="6" x2="140" y2="6" stroke={AMBER_SOFT} strokeWidth="1" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

// ============================================================================
// Dispatcher — renders the right sketch for a BlogSketchKey
// ============================================================================
export function BlogSketch({
  sketchKey,
  className,
}: {
  sketchKey: BlogSketchKey;
  className?: string;
}) {
  switch (sketchKey) {
    case "auditLens":
      return <AuditLensSketch className={className} />;
    case "leakyFunnel":
      return <LeakyFunnelSketch className={className} />;
    case "whatsappFlow":
      return <WhatsAppFlowSketch className={className} />;
    case "layerStack":
      return <LayerStackSketch className={className} />;
    case "seoPeakGraph":
      return <SeoPeakGraphSketch className={className} />;
    default:
      return null;
  }
}
