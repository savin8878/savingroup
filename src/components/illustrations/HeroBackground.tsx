"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pause, Play, Sparkles } from "lucide-react";

/**
 * HeroBackground — an infinite, left→right sketched storyboard background.
 *
 * The scene reads like a whiteboard diagram that tells the story of how a
 * visitor becomes a customer in the Savin Group system:
 *
 *   01 ATTENTION → 02 CHANNELS → 03 WEBSITE → 04 CAPTURE →
 *   05 QUALIFY   → 06 NURTURE  → 07 REVENUE → 08 LOYALTY
 *
 * Every step is clean ink strokes with its own subtle breathing animation,
 * and the full strip scrolls continuously from left→right by translating
 * two stacked copies. Every step is also a clickable link into the
 * corresponding page, and there's a small play/pause controller in the
 * top-right of the hero.
 */

const INK = "oklch(0.28 0.025 260)";
const INK_SOFT = "oklch(0.28 0.025 260 / 0.5)";
const INK_FAINT = "oklch(0.28 0.025 260 / 0.18)";
const AMBER = "oklch(0.65 0.19 55)";
const AMBER_SOFT = "oklch(0.65 0.19 55 / 0.14)";

const STRIP_W = 1800;      // width of one full story pass
const CY = 190;            // vertical center of every node (sits near the top)
const NUMBER_Y = 56;       // step number at the very top
const LABEL_Y = 298;       // mono-font step label just below the element
const BASELINE_Y = 320;    // dashed ruler under the whole strip
const SCALE = 0.78;        // uniform downscale so the strokes feel delicate
const DURATION = "100s";   // time for one full strip to scroll past

// --- Step positions, labels and destinations --------------------------------
type StepKey =
  | "attention"
  | "channels"
  | "website"
  | "capture"
  | "qualify"
  | "nurture"
  | "revenue"
  | "loyalty";

const STEPS: ReadonlyArray<{
  key: StepKey;
  x: number;
  num: string;
  label: string;
  href: string;
  hint: string;
}> = [
  { key: "attention", x: 140,  num: "01", label: "ATTENTION", href: "/about",        hint: "Why prospects care"     },
  { key: "channels",  x: 360,  num: "02", label: "CHANNELS",  href: "/services",     hint: "Ads · SEO · social"    },
  { key: "website",   x: 580,  num: "03", label: "WEBSITE",   href: "/services",     hint: "A site that converts"  },
  { key: "capture",   x: 800,  num: "04", label: "CAPTURE",   href: "/contact",      hint: "Qualified lead in 24h" },
  { key: "qualify",   x: 1020, num: "05", label: "QUALIFY",   href: "/industries",   hint: "Filter to ICP"         },
  { key: "nurture",   x: 1240, num: "06", label: "NURTURE",   href: "/services",     hint: "Multi-touch automation"},
  { key: "revenue",   x: 1460, num: "07", label: "REVENUE",   href: "/case-studies", hint: "Growth outcomes"       },
  { key: "loyalty",   x: 1680, num: "08", label: "LOYALTY",   href: "/case-studies", hint: "The LTV engine"        },
];

// ============================================================================
// Shared helpers
// ============================================================================

function StepLabel({ x, num, label }: { x: number; num: string; label: string }) {
  return (
    <g>
      {/* step number — tiny, refined, with hairline brackets */}
      <text
        x={x - 7}
        y={NUMBER_Y}
        textAnchor="end"
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontSize="9"
        letterSpacing="0.18em"
        fill={INK_FAINT}
      >
        STEP
      </text>
      <text
        x={x + 7}
        y={NUMBER_Y}
        textAnchor="start"
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontSize="12"
        fontWeight="600"
        letterSpacing="0.12em"
        fill={AMBER}
      >
        {num}
      </text>
      <line
        x1={x - 14}
        y1={NUMBER_Y + 7}
        x2={x + 14}
        y2={NUMBER_Y + 7}
        stroke={AMBER}
        strokeWidth="0.9"
      />

      {/* caption label below the sketch */}
      <line
        x1={x - 34}
        y1={LABEL_Y - 10}
        x2={x - 6}
        y2={LABEL_Y - 10}
        stroke={INK_FAINT}
        strokeWidth="0.8"
      />
      <line
        x1={x + 6}
        y1={LABEL_Y - 10}
        x2={x + 34}
        y2={LABEL_Y - 10}
        stroke={INK_FAINT}
        strokeWidth="0.8"
      />
      <text
        x={x}
        y={LABEL_Y}
        textAnchor="middle"
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontSize="10"
        fontWeight="500"
        letterSpacing="0.26em"
        fill={INK_SOFT}
      >
        {label}
      </text>
    </g>
  );
}

function Connector({ x1, x2, delay = 0 }: { x1: number; x2: number; delay?: number }) {
  return (
    <g>
      <path
        d={`M ${x1} ${CY} L ${x2} ${CY}`}
        stroke={INK_SOFT}
        strokeWidth="1"
        strokeDasharray="3 5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${x2 - 9} ${CY - 5} L ${x2} ${CY} L ${x2 - 9} ${CY + 5}`}
        stroke={INK_SOFT}
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle r="3.2" fill={AMBER}>
        <animate
          attributeName="cx"
          values={`${x1};${x2}`}
          dur="3.2s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        <animate attributeName="cy" values={`${CY};${CY}`} dur="3.2s" repeatCount="indefinite" />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.15;0.85;1"
          dur="3.2s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

// A gentle, per-element float so each node "breathes" as the strip scrolls.
// Use as the inner <g> wrapper so it stacks with the parent's translate.
function Breathing({
  children,
  dur = "6s",
  dy = 3,
  rot = 0,
}: {
  children: React.ReactNode;
  dur?: string;
  dy?: number;
  rot?: number;
}) {
  return (
    <g>
      {children}
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`0 ${dy};0 ${-dy};0 ${dy}`}
        dur={dur}
        repeatCount="indefinite"
        additive="sum"
      />
      {rot !== 0 && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`${-rot};${rot};${-rot}`}
          dur={dur}
          repeatCount="indefinite"
          additive="sum"
        />
      )}
    </g>
  );
}

// ============================================================================
// Step 01 — ATTENTION (a curious prospect scrolling their phone)
// ============================================================================
function Attention({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="5s" dy={2}>
        {/* Head */}
        <circle cx="0" cy="-78" r="18" />
        <path d="M -14 -90 Q -8 -100 0 -92 Q 8 -100 14 -88" />
        {/* Eyes looking down */}
        <circle cx="-6" cy="-74" r="1.3" fill={INK} stroke="none" />
        <circle cx="6" cy="-74" r="1.3" fill={INK} stroke="none" />
        {/* Mouth */}
        <path d="M -5 -66 Q 0 -62 5 -66" />
        {/* Neck + torso */}
        <path d="M 0 -60 L 0 -10" />
        {/* Arms holding phone */}
        <path d="M -2 -46 Q -18 -36 -18 -20" />
        <path d="M 2 -46 Q 18 -36 18 -22" />
        {/* Phone */}
        <rect x="-14" y="-24" width="28" height="44" rx="4" />
        <line x1="-14" y1="-18" x2="14" y2="-18" />
        <line x1="-14" y1="14" x2="14" y2="14" />
        <line x1="-8" y1="-12" x2="8" y2="-12" stroke={AMBER} strokeWidth="2" />
        <line x1="-8" y1="-6" x2="4" y2="-6" stroke={AMBER} strokeWidth="2" />
        <line x1="-8" y1="0" x2="6" y2="0" />
        <line x1="-8" y1="6" x2="8" y2="6" />
        {/* Legs */}
        <path d="M 0 20 L -14 70" />
        <path d="M 0 20 L 14 70" />
        {/* Shoes */}
        <line x1="-18" y1="70" x2="-8" y2="70" />
        <line x1="8" y1="70" x2="18" y2="70" />
        {/* Wifi signal coming off the phone */}
        <g stroke={AMBER} strokeWidth="1.4">
          <path d="M 28 -10 Q 36 -4 32 6">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M 36 -16 Q 48 -4 40 10">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M 44 -22 Q 60 -4 48 14">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              begin="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 02 — CHANNELS (ads + search + social — three inbound sources)
// ============================================================================
function Channels({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Megaphone (ads) */}
      <g transform="translate(-30 -70)">
        <g>
          <path d="M -28 -10 L 8 -20 L 8 14 L -28 4 Z" />
          <path d="M -28 -10 L -34 -6 L -34 0 L -28 4" />
          <line x1="-2" y1="14" x2="0" y2="24" />
          <line x1="-10" y1="14" x2="-12" y2="24" />
          <path d="M 14 -22 Q 22 -4 14 14" stroke={AMBER} strokeWidth="1.4" />
          <path d="M 22 -30 Q 34 -4 22 22" stroke={AMBER} strokeWidth="1.2" opacity="0.6" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-6;2;-6"
            dur="3s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Magnifying glass (SEO) */}
      <g transform="translate(-30 -4)">
        <g>
          <circle cx="0" cy="0" r="16" />
          <line x1="11" y1="11" x2="24" y2="24" strokeWidth="2.4" />
          <line x1="-7" y1="0" x2="7" y2="0" stroke={AMBER} strokeWidth="1.4" />
          <line x1="0" y1="-7" x2="0" y2="7" stroke={AMBER} strokeWidth="1.4" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 3 -3; 0 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Chat bubble (social) */}
      <g transform="translate(-30 62)">
        <path d="M -22 -12 H 24 V 12 H 6 L -2 22 L -2 12 H -22 Z" />
        <circle cx="-12" cy="0" r="1.8" fill={INK} stroke="none" />
        <circle cx="0" cy="0" r="1.8" fill={INK} stroke="none">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="0" r="1.8" fill={INK} stroke="none">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="1.5s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Fan-in lines converging toward right */}
      <g stroke={INK_SOFT} strokeDasharray="2 4">
        <path d="M -10 -70 Q 30 -40 60 0" />
        <path d="M -10 -4 L 60 0" />
        <path d="M -10 62 Q 30 30 60 0" />
      </g>
      <g fill={AMBER}>
        <circle r="2.5">
          <animateMotion dur="2.4s" repeatCount="indefinite">
            <mpath href="#chan-path-1" />
          </animateMotion>
        </circle>
        <circle r="2.5">
          <animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite">
            <mpath href="#chan-path-2" />
          </animateMotion>
        </circle>
        <circle r="2.5">
          <animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite">
            <mpath href="#chan-path-3" />
          </animateMotion>
        </circle>
      </g>
    </g>
  );
}

// ============================================================================
// Step 03 — WEBSITE (browser mockup with a moving cursor)
// ============================================================================
function Website({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="6s" dy={2}>
        {/* Browser window */}
        <rect x="-90" y="-75" width="180" height="135" rx="7" />
        {/* top bar */}
        <line x1="-90" y1="-52" x2="90" y2="-52" />
        <circle cx="-78" cy="-64" r="3" />
        <circle cx="-66" cy="-64" r="3" />
        <circle cx="-54" cy="-64" r="3" />
        <rect x="-42" y="-70" width="120" height="12" rx="3" />
        <line x1="-34" y1="-64" x2="44" y2="-64" stroke={INK_SOFT} strokeDasharray="1 2" />

        {/* Hero heading block (highlighted) */}
        <line x1="-78" y1="-38" x2="0" y2="-38" strokeWidth="3" stroke={AMBER} />
        <line x1="-78" y1="-28" x2="-30" y2="-28" strokeWidth="3" stroke={AMBER} />

        {/* Content columns */}
        <line x1="-78" y1="-12" x2="14" y2="-12" />
        <line x1="-78" y1="-4" x2="20" y2="-4" />
        <line x1="-78" y1="4" x2="-10" y2="4" />

        {/* CTA button */}
        <rect x="-78" y="18" width="58" height="22" rx="4" fill={AMBER_SOFT} stroke={AMBER} />
        <line x1="-66" y1="30" x2="-40" y2="30" stroke={AMBER} strokeWidth="2" />
        <path d="M -36 27 L -30 30 L -36 33" stroke={AMBER} />

        {/* Media block */}
        <rect x="-4" y="-14" width="88" height="54" rx="4" />
        <path d="M -4 36 L 26 12 L 48 26 L 84 -4" stroke={INK_SOFT} />
        <circle cx="62" cy="0" r="7" stroke={INK_SOFT} />

        {/* Bottom meta chips */}
        <rect x="-78" y="46" width="30" height="10" rx="2" stroke={INK_SOFT} />
        <rect x="-42" y="46" width="26" height="10" rx="2" stroke={INK_SOFT} />
        <rect x="-10" y="46" width="34" height="10" rx="2" stroke={INK_SOFT} />

        {/* Cursor */}
        <g>
          <path
            d="M 0 0 L 0 14 L 4 10 L 8 16 L 11 15 L 7 9 L 13 9 Z"
            fill={INK}
            stroke={INK}
            strokeWidth="0.8"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-60 -30; -30 -8; 10 12; -20 38; -50 0; -60 -30"
            dur="8s"
            repeatCount="indefinite"
            keyTimes="0;0.2;0.4;0.6;0.8;1"
          />
        </g>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 04 — CAPTURE (a lead form with a typing indicator)
// ============================================================================
function Capture({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="5.5s" dy={2}>
        <rect x="-76" y="-85" width="152" height="170" rx="8" />
        {/* header bar */}
        <line x1="-76" y1="-62" x2="76" y2="-62" />
        <text
          x="0"
          y="-68"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize="10"
          letterSpacing="0.2em"
          fill={INK}
          stroke="none"
        >
          GET FREE AUDIT
        </text>

        {/* field 1 — name */}
        <line x1="-60" y1="-48" x2="-18" y2="-48" strokeWidth="1.2" stroke={INK_SOFT} />
        <rect x="-60" y="-42" width="120" height="18" rx="3" />
        <line x1="-54" y1="-33" x2="-20" y2="-33" stroke={INK_SOFT} strokeDasharray="1 2" />

        {/* field 2 — email */}
        <line x1="-60" y1="-14" x2="-24" y2="-14" strokeWidth="1.2" stroke={INK_SOFT} />
        <rect x="-60" y="-8" width="120" height="18" rx="3" />
        <line x1="-54" y1="1" x2="-10" y2="1" stroke={AMBER} strokeWidth="2">
          <animate
            attributeName="x2"
            values="-54;50;50;-54"
            keyTimes="0;0.5;0.85;1"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </line>

        {/* field 3 — phone */}
        <line x1="-60" y1="20" x2="-22" y2="20" strokeWidth="1.2" stroke={INK_SOFT} />
        <rect x="-60" y="26" width="120" height="18" rx="3" />

        {/* button */}
        <rect x="-60" y="54" width="120" height="24" rx="4" fill={AMBER_SOFT} stroke={AMBER} strokeWidth="1.8" />
        <text
          x="0"
          y="70"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize="10"
          letterSpacing="0.2em"
          fill={INK}
          stroke="none"
        >
          SUBMIT →
        </text>
        {/* button hover pulse */}
        <rect x="-60" y="54" width="120" height="24" rx="4" stroke={AMBER} strokeWidth="1">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite" />
          <animate
            attributeName="transform"
            attributeType="XML"
            values="scale(1);scale(1.04);scale(1)"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </rect>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 05 — QUALIFY (a funnel with leads dropping through filters)
// ============================================================================
function Qualify({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="5s" dy={2}>
        {/* Funnel outline */}
        <path d="M -80 -80 L 80 -80 L 34 -20 L 34 80 L -34 80 L -34 -20 Z" />
        {/* horizontal filter bars */}
        <line x1="-70" y1="-60" x2="70" y2="-60" stroke={INK_SOFT} strokeDasharray="2 3" />
        <line x1="-58" y1="-40" x2="58" y2="-40" stroke={INK_SOFT} strokeDasharray="2 3" />
        <line x1="-34" y1="-5" x2="34" y2="-5" stroke={INK_SOFT} strokeDasharray="2 3" />
        <line x1="-34" y1="25" x2="34" y2="25" stroke={INK_SOFT} strokeDasharray="2 3" />
        <line x1="-34" y1="55" x2="34" y2="55" stroke={INK_SOFT} strokeDasharray="2 3" />

        {/* Three flowing lead-dots */}
        <circle r="3.5" fill={AMBER}>
          <animate attributeName="cx" values="-50;-10;0;0" keyTimes="0;0.35;0.7;1" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-90;-25;50;95" keyTimes="0;0.35;0.7;1" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.6s" repeatCount="indefinite" />
        </circle>
        <circle r="3.5" fill={AMBER}>
          <animate attributeName="cx" values="50;10;0;0" keyTimes="0;0.35;0.7;1" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-90;-25;50;95" keyTimes="0;0.35;0.7;1" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill={AMBER}>
          <animate attributeName="cx" values="0;0;0;0" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="-90;-25;50;95" keyTimes="0;0.35;0.7;1" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
        </circle>

        {/* Tiny side annotation */}
        <g stroke={INK_SOFT}>
          <line x1="80" y1="-80" x2="98" y2="-80" />
          <line x1="80" y1="80" x2="98" y2="80" />
          <line x1="98" y1="-80" x2="98" y2="80" />
          <text
            x="108"
            y="4"
            fontFamily="var(--font-mono), monospace"
            fontSize="9"
            letterSpacing="0.15em"
            fill={INK_SOFT}
            stroke="none"
          >
            ICP
          </text>
        </g>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 06 — NURTURE (central automation hub with email/call/chat/bell nodes)
// ============================================================================
function Nurture({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="6s" dy={2}>
        {/* Gear */}
        <g>
          <circle r="30" />
          <circle r="10" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * 360;
            return (
              <line
                key={i}
                x1="0"
                y1="-30"
                x2="0"
                y2="-38"
                transform={`rotate(${a})`}
                strokeWidth="2"
              />
            );
          })}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="20s"
            repeatCount="indefinite"
          />
        </g>

        {/* Node circles */}
        {[
          { cx: -70, cy: -50, icon: "@", delay: 0 },
          { cx: 70, cy: -50, icon: "☎", delay: 0.5 },
          { cx: -70, cy: 50, icon: "♥", delay: 1 },
          { cx: 70, cy: 50, icon: "★", delay: 1.5 },
        ].map((n) => (
          <g key={n.icon}>
            <circle cx={n.cx} cy={n.cy} r="12" />
            <text
              x={n.cx}
              y={n.cy + 4}
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
              fontSize="12"
              fill={INK}
              stroke="none"
            >
              {n.icon}
            </text>
            <circle cx={n.cx} cy={n.cy} r="12" stroke={AMBER} strokeWidth="1.5">
              <animate
                attributeName="r"
                values="12;22;12"
                dur="3s"
                begin={`${n.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.9;0;0.9"
                dur="3s"
                begin={`${n.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Connecting lines from hub to nodes */}
        <g stroke={INK_SOFT} strokeDasharray="2 4">
          <line x1="-60" y1="-44" x2="-22" y2="-16" />
          <line x1="60" y1="-44" x2="22" y2="-16" />
          <line x1="-60" y1="44" x2="-22" y2="16" />
          <line x1="60" y1="44" x2="22" y2="16" />
        </g>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 07 — REVENUE (growing bars + drawing trendline + currency marker)
// ============================================================================
function Revenue({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="5s" dy={2}>
        {/* axes */}
        <line x1="-80" y1="80" x2="90" y2="80" strokeWidth="2" />
        <line x1="-80" y1="80" x2="-80" y2="-80" strokeWidth="2" />
        {/* tick marks */}
        {[-40, 0, 40].map((ty) => (
          <line key={ty} x1="-84" y1={ty} x2="-80" y2={ty} stroke={INK_SOFT} />
        ))}

        {/* Bars — each grows slightly */}
        {[
          { bx: -64, h: 34 },
          { bx: -38, h: 52 },
          { bx: -12, h: 68 },
          { bx: 14, h: 92 },
          { bx: 40, h: 118 },
        ].map((b, i) => (
          <g key={i}>
            <rect
              x={b.bx}
              y={80 - b.h}
              width="16"
              height={b.h}
              fill={AMBER_SOFT}
              stroke={AMBER}
              strokeWidth="1.5"
            >
              <animate
                attributeName="height"
                values={`${b.h - 6};${b.h};${b.h - 6}`}
                dur="5s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                values={`${80 - b.h + 6};${80 - b.h};${80 - b.h + 6}`}
                dur="5s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </rect>
          </g>
        ))}

        {/* Trend line that redraws itself */}
        <path
          d="M -56 50 L -30 34 L -4 14 L 22 -10 L 48 -36"
          stroke={INK}
          strokeWidth="2"
        />
        <path
          d="M -56 50 L -30 34 L -4 14 L 22 -10 L 48 -36"
          stroke={AMBER}
          strokeWidth="2.4"
          strokeDasharray="240"
          strokeDashoffset="240"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="240;0;0;240"
            keyTimes="0;0.5;0.85;1"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M 40 -32 L 48 -36 L 44 -28"
          stroke={INK}
          strokeWidth="2"
        />

        {/* Currency marker */}
        <circle cx="66" cy="-56" r="14" stroke={AMBER} strokeWidth="1.8" />
        <text
          x="66"
          y="-51"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize="14"
          fontWeight="700"
          fill={AMBER}
          stroke="none"
        >
          ₹
        </text>
        <circle cx="66" cy="-56" r="14" stroke={AMBER} strokeWidth="1">
          <animate attributeName="r" values="14;22;14" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.9;0;0.9" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </Breathing>
    </g>
  );
}

// ============================================================================
// Step 08 — LOYALTY (pulsing heart + 5 stars + repeat loop back)
// ============================================================================
function Loyalty({ x }: { x: number }) {
  return (
    <g
      transform={`translate(${x} ${CY}) scale(${SCALE})`}
      stroke={INK}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Breathing dur="5s" dy={2}>
        {/* Stars above */}
        <g transform="translate(0 -64)">
          {[-40, -20, 0, 20, 40].map((sx, i) => (
            <g key={i}>
              <path
                d={`M ${sx} -8 L ${sx + 3} -1 L ${sx + 10} 0 L ${sx + 5} 5 L ${sx + 6} 12 L ${sx} 8 L ${sx - 6} 12 L ${sx - 5} 5 L ${sx - 10} 0 L ${sx - 3} -1 Z`}
                fill={AMBER}
                stroke={AMBER}
                strokeWidth="0.8"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="2.4s"
                  begin={`${i * 0.15}s`}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          ))}
        </g>

        {/* Heart */}
        <g>
          <path
            d="M 0 42 C -34 18, -46 -18, -22 -34 C -8 -42, 0 -26, 0 -16 C 0 -26, 8 -42, 22 -34 C 46 -18, 34 18, 0 42 Z"
            fill={AMBER_SOFT}
            stroke={AMBER}
            strokeWidth="2.2"
          />
          <path
            d="M -14 -18 Q -8 -22 -2 -18"
            stroke={AMBER}
            strokeWidth="1.4"
            opacity="0.5"
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.08;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </g>

        {/* Return loop arrow arcing right — indicates "back into the system" */}
        <g stroke={INK_SOFT} strokeDasharray="3 4">
          <path d="M 46 18 Q 100 20 100 66 Q 100 100 60 100" />
        </g>
        <path d="M 66 96 L 60 100 L 66 104" stroke={INK_SOFT} />
        <text
          x="104"
          y="70"
          fontFamily="var(--font-mono), monospace"
          fontSize="9"
          letterSpacing="0.15em"
          fill={INK_SOFT}
          stroke="none"
        >
          LTV
        </text>
      </Breathing>
    </g>
  );
}

// ============================================================================
// One complete story strip (all 8 steps + their labels + connectors)
// ============================================================================

function renderStep(key: StepKey, x: number) {
  switch (key) {
    case "attention": return <Attention x={x} />;
    case "channels":  return <Channels x={x} />;
    case "website":   return <Website x={x} />;
    case "capture":   return <Capture x={x} />;
    case "qualify":   return <Qualify x={x} />;
    case "nurture":   return <Nurture x={x} />;
    case "revenue":   return <Revenue x={x} />;
    case "loyalty":   return <Loyalty x={x} />;
  }
}

function StoryStrip({
  dx,
  prefix,
  onStepClick,
}: {
  dx: number;
  prefix: string;
  onStepClick: (href: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <g transform={`translate(${dx} 0)`}>
      {/* Dashed ruler — blueprint baseline under the whole strip */}
      <line
        x1="0"
        y1={BASELINE_Y}
        x2={STRIP_W}
        y2={BASELINE_Y}
        stroke={INK_FAINT}
        strokeWidth="0.7"
        strokeDasharray="2 6"
      />
      {Array.from({ length: 37 }).map((_, i) => (
        <line
          key={i}
          x1={i * 50}
          y1={BASELINE_Y - 3}
          x2={i * 50}
          y2={BASELINE_Y + 3}
          stroke={INK_FAINT}
          strokeWidth="0.7"
        />
      ))}

      {/* Top axis — faint overhead line above the step numbers */}
      <line
        x1="0"
        y1={NUMBER_Y - 32}
        x2={STRIP_W}
        y2={NUMBER_Y - 32}
        stroke={INK_FAINT}
        strokeWidth="0.6"
      />

      {/* Connectors between steps (drawn behind so clicks on steps still work) */}
      {STEPS.slice(0, -1).map((s, i) => {
        const next = STEPS[i + 1];
        return <Connector key={s.key} x1={s.x + 74} x2={next.x - 74} delay={i * 0.3} />;
      })}

      {/* Clickable step groups — each one is a native SVG <a> link */}
      {STEPS.map((s) => {
        const hitX = s.x - 90;
        const hitY = NUMBER_Y - 24;
        const hitW = 180;
        const hitH = LABEL_Y - NUMBER_Y + 42;
        return (
          <a
            key={s.key}
            href={`${prefix}${s.href}`}
            onClick={onStepClick(s.href)}
            className="hb-step"
          >
            <title>{`Step ${s.num} · ${s.label} — ${s.hint}`}</title>

            {/* hover halo (hidden by default, visible on :hover via CSS) */}
            <rect
              className="hb-step-halo"
              x={hitX}
              y={hitY}
              width={hitW}
              height={hitH}
              rx="14"
            />

            {/* corner marks — blueprint tech-drawing feel, visible on hover */}
            <g className="hb-step-corners" stroke={AMBER} strokeWidth="1.1" fill="none">
              <path d={`M ${hitX + 6} ${hitY} L ${hitX} ${hitY} L ${hitX} ${hitY + 6}`} />
              <path d={`M ${hitX + hitW - 6} ${hitY} L ${hitX + hitW} ${hitY} L ${hitX + hitW} ${hitY + 6}`} />
              <path d={`M ${hitX} ${hitY + hitH - 6} L ${hitX} ${hitY + hitH} L ${hitX + 6} ${hitY + hitH}`} />
              <path d={`M ${hitX + hitW - 6} ${hitY + hitH} L ${hitX + hitW} ${hitY + hitH} L ${hitX + hitW} ${hitY + hitH - 6}`} />
            </g>

            {/* Number + caption */}
            <StepLabel x={s.x} num={s.num} label={s.label} />

            {/* The drawing itself */}
            {renderStep(s.key, s.x)}

            {/* Hint text that appears on hover, rendered above the label */}
            <text
              className="hb-step-hint"
              x={s.x}
              y={LABEL_Y + 16}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize="8.5"
              letterSpacing="0.18em"
              fill={AMBER}
            >
              {s.hint.toUpperCase()}
            </text>

            {/* Fully transparent hit rect on top — extends the click target */}
            <rect
              x={hitX}
              y={hitY}
              width={hitW}
              height={hitH}
              fill="transparent"
            />
          </a>
        );
      })}
    </g>
  );
}

// ============================================================================
// The whole background
// ============================================================================
export function HeroBackground({
  variant = "top",
}: {
  /**
   * `top` positions the story strip near the top of the hero (home hero),
   * `center` shifts it vertically so it sits behind the title area on taller
   * blog heroes.
   */
  variant?: "top" | "center";
} = {}) {
  const yOffset = variant === "center" ? 220 : 0;
  const params = useParams();
  const router = useRouter();
  const country = (params?.country as string) || "in";
  const locale = (params?.locale as string) || "en";
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;

  const svgRef = useRef<SVGSVGElement>(null);
  const [paused, setPaused] = useState(false);

  const togglePlayback = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // SVG SMIL pause/resume — `pauseAnimations` freezes every animate* tag
    // in the document, including the marquee scroll and per-element motion.
    if (paused) {
      svg.unpauseAnimations?.();
      setPaused(false);
    } else {
      svg.pauseAnimations?.();
      setPaused(true);
    }
  }, [paused]);

  const handleStepClick = useCallback(
    (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push(`${prefix}${href}`);
    },
    [router, prefix]
  );

  // Respect prefers-reduced-motion by pre-pausing once the svg mounts.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduced.matches) {
      svgRef.current?.pauseAnimations?.();
      setPaused(true);
    }
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:opacity-60"
    >
      {/* Scoped hover styles for the clickable story steps */}
      <style>{`
        .hb-step {
          cursor: pointer;
          pointer-events: auto;
        }
        .hb-step .hb-step-halo {
          fill: oklch(0.65 0.19 55 / 0);
          stroke: oklch(0.65 0.19 55);
          stroke-opacity: 0;
          stroke-width: 1;
          stroke-dasharray: 3 4;
          transition: fill 0.3s ease, stroke-opacity 0.3s ease;
        }
        .hb-step:hover .hb-step-halo,
        .hb-step:focus-visible .hb-step-halo {
          fill: oklch(0.65 0.19 55 / 0.08);
          stroke-opacity: 0.55;
        }
        .hb-step .hb-step-corners {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .hb-step:hover .hb-step-corners,
        .hb-step:focus-visible .hb-step-corners {
          opacity: 0.9;
        }
        .hb-step .hb-step-hint {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .hb-step:hover .hb-step-hint,
        .hb-step:focus-visible .hb-step-hint {
          opacity: 1;
        }
        .hb-step:focus-visible {
          outline: none;
        }
      `}</style>

      {/* Subtle paper wash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(at 50% 0%, oklch(0.65 0.19 55 / 0.06) 0px, transparent 60%),
            radial-gradient(at 50% 100%, oklch(0.66 0.18 295 / 0.04) 0px, transparent 60%)
          `,
        }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-0 h-full w-full"
        style={{ filter: "blur(0.35px)" }}
      >
        <defs>
          {/* Faint paper grid */}
          <pattern
            id="hb-paper"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={INK_FAINT} strokeWidth="0.6" />
          </pattern>

          {/* Reusable fan-in connector paths for the CHANNELS step */}
          <path id="chan-path-1" d="M -40 -70 Q -10 -40 30 -4" />
          <path id="chan-path-2" d="M -40 -4 L 30 -4" />
          <path id="chan-path-3" d="M -40 62 Q -10 30 30 -4" />

          {/* Radial fade so edges of the grid dissolve into the surface */}
          <mask id="hb-fade">
            <radialGradient id="hb-fade-g" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </radialGradient>
            <rect width="1440" height="900" fill="url(#hb-fade-g)" />
          </mask>

          {/* Side fade so the scrolling strip fades in from the left and out on the right */}
          <linearGradient id="hb-side-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="10%" stopColor="white" stopOpacity="1" />
            <stop offset="90%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="hb-side-mask">
            <rect width="1440" height="900" fill="url(#hb-side-fade)" />
          </mask>
        </defs>

        {/* Paper grid */}
        <g mask="url(#hb-fade)">
          <rect width="1440" height="900" fill="url(#hb-paper)" />
        </g>

        {/* Scrolling story — two stacked copies translated left→right.
            A static y-offset on the mask wrapper lets us re-center the
            whole strip on taller blog heroes without touching any of the
            per-step coordinates. */}
        <g mask="url(#hb-side-mask)" transform={`translate(0 ${yOffset})`}>
          <g>
            <StoryStrip dx={0} prefix={prefix} onStepClick={handleStepClick} />
            <StoryStrip dx={STRIP_W} prefix={prefix} onStepClick={handleStepClick} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`${-STRIP_W} 0;0 0`}
              dur={DURATION}
              repeatCount="indefinite"
            />
          </g>
        </g>
      </svg>

      {/* --- Controller: play/pause + hint --------------------------------
          On phones we render an icon-only round button (no label, no hint
          chip). From sm: upward we show the labelled pill + the hint chip. */}
      <div className="pointer-events-auto absolute right-3 top-20 z-20 sm:right-6 sm:top-28">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={paused ? "Play story animation" : "Pause story animation"}
          className="group flex items-center gap-2 rounded-full border border-border bg-surface/80 p-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur-md transition hover:border-border-strong hover:bg-surface hover:text-foreground sm:px-3 sm:py-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent">
            {paused ? (
              <Play size={10} fill="currentColor" />
            ) : (
              <Pause size={10} />
            )}
          </span>
          <span className="hidden sm:inline">{paused ? "play story" : "pause story"}</span>
        </button>
        <div className="mt-2 hidden items-center gap-1.5 rounded-full border border-border/60 bg-surface/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-sm sm:flex">
          <Sparkles size={9} className="text-accent" />
          <span>click any step to explore</span>
        </div>
      </div>

      {/* Bottom vignette so content below the storyboard stays clean */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background: "linear-gradient(to top, var(--background) 10%, transparent)",
        }}
      />
    </div>
  );
}
