"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Lightbulb,
  Globe2,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
} from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import type { CityExtras } from "@/lib/city-extras";
import { INDIA_CITIES, type CityContent } from "@/lib/cities";

/**
 * Visualizations for an individual /cities/[slug] page.
 *
 *   - CityLeadCTA         — the prominent triple lead button cluster
 *                           (Book audit / WhatsApp / Phone) shown high on
 *                           the page, just under the hero.
 *   - CityHiddenGem       — the operational-edge callout (insight + proof +
 *                           "what we ship to extract it").
 *   - CityGlobalPeersCard — 2–3 international peer cities rendered with
 *                           an animated arc connecting each peer back to
 *                           the Indian metro on a stylised mini-globe.
 *   - CityStatRadials     — the hero stats reimagined as animated radial
 *                           dials (consistent with industry segment pages).
 */

const WORLD_W = 600;
const WORLD_H = 280;
function projectWorld(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * WORLD_W;
  const y = ((90 - lat) / 180) * WORLD_H;
  return { x, y };
}

/* -------------------------------------------------------------------------- */
/*                                CityLeadCTA                                 */
/* -------------------------------------------------------------------------- */

/**
 * Triple-button lead CTA — primary "Book audit" deeplink, secondary
 * WhatsApp, tertiary phone. Trust line below + ambient mini-stats.
 */
export function CityLeadCTA({
  city,
  whatsappNumber,
  phoneNumber,
}: {
  city: CityContent;
  /** International phone in E.164 (e.g. "918305838352") for wa.me */
  whatsappNumber: string;
  /** Display phone (e.g. "+91 83058 38352") — the tel: link is built from this */
  phoneNumber: string;
}) {
  const tel = phoneNumber.replace(/[^+\d]/g, "");
  const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Savin Group, I'm in ${city.name} and want to book a revenue audit.`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-surface via-surface/90 to-accent/5 p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[oklch(0.66_0.18_295/0.12)] blur-3xl"
      />

      <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            3 audit slots open this week · {city.name}
          </div>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            Get a free 45-minute revenue audit for your{" "}
            <span className="text-accent">{city.name}</span> business.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            We&apos;ll map your funnel, identify the top three leaks, and walk
            you through what the fix looks like. No deck, no decks, no
            commitment.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* Primary — Book audit */}
            <LocalizedLink
              href="/contact"
              className="group relative inline-flex items-center gap-2 rounded-full bg-accent-strong px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-10px_oklch(0.78_0.165_70/0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_oklch(0.78_0.165_70/0.8)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent to-[oklch(0.72_0.18_55)] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70"
              />
              <Calendar size={16} />
              Book {city.name} audit
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </LocalizedLink>

            {/* Secondary — WhatsApp */}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-5 py-3 text-sm font-semibold text-success transition-all hover:-translate-y-0.5 hover:border-success/70 hover:bg-success/15"
            >
              <MessageCircle size={16} />
              WhatsApp now
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

            {/* Tertiary — Phone */}
            <a
              href={`tel:${tel}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/50 hover:text-accent-strong"
            >
              <Phone size={15} />
              {phoneNumber}
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-accent" />
              Mon–Sat · 10–19 IST
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-accent" />
              INR · GST invoice
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-accent" />
              DPDP-aligned
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="grid gap-3">
            {city.heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-baseline justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-sm"
              >
                <div className="font-display text-2xl font-semibold tracking-tight text-accent sm:text-3xl">
                  {s.value}
                </div>
                <div className="text-right text-xs leading-snug text-muted-foreground">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CityHiddenGem                                 */
/* -------------------------------------------------------------------------- */

/**
 * "Hidden gem" callout — the operational insight specific to this city.
 * Big tilted card with a lightbulb visual, headline + body, a proof chip,
 * and a tag-row of "what we ship" to extract the edge.
 */
export function CityHiddenGem({
  extras,
  cityName,
}: {
  extras: CityExtras;
  cityName: string;
}) {
  const gem = extras.hiddenGem;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/8 via-surface/40 to-[oklch(0.66_0.18_295/0.06)] p-6 sm:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Visual */}
        <div className="lg:col-span-4">
          <HiddenGemSVG />
        </div>

        {/* Body */}
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <Sparkles size={11} />
            Hidden gem · {cityName}
          </div>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.5rem]">
            {gem.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {gem.body}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-4 py-2.5">
            <CheckCircle2 size={14} className="text-success" />
            <span className="text-sm font-semibold text-foreground">
              {gem.proof}
            </span>
          </div>

          <div className="mt-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              What we ship to extract the edge
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {gem.ourMove.map((move, i) => (
                <motion.span
                  key={move}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  {move}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiddenGemSVG() {
  return (
    <motion.svg
      viewBox="0 0 240 240"
      className="h-auto w-full max-w-[240px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="gem-glow" cx="50%" cy="45%">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70 / 0)" />
        </radialGradient>
        <linearGradient id="bulb-grad" x1="120" y1="60" x2="120" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.85 0.16 72)" />
          <stop offset="100%" stopColor="oklch(0.65 0.19 55)" />
        </linearGradient>
      </defs>

      {/* radial pulse */}
      <motion.circle
        cx="120"
        cy="100"
        r="80"
        fill="url(#gem-glow)"
        animate={{ r: [70, 95, 70], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* concentric dashed rings */}
      <motion.circle
        cx="120"
        cy="100"
        r="60"
        stroke="oklch(0.78 0.165 70 / 0.3)"
        strokeWidth="0.8"
        strokeDasharray="3 5"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "120px 100px" }}
      />
      <motion.circle
        cx="120"
        cy="100"
        r="80"
        stroke="oklch(0.66 0.18 295 / 0.25)"
        strokeWidth="0.6"
        strokeDasharray="2 6"
        fill="none"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "120px 100px" }}
      />

      {/* bulb body */}
      <motion.path
        d="M 100 80 C 100 60 140 60 140 80 C 140 95 132 100 132 115 L 108 115 C 108 100 100 95 100 80 Z"
        fill="url(#bulb-grad)"
        stroke="oklch(0.65 0.19 55 / 0.6)"
        strokeWidth="1"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4 }}
      />
      {/* bulb base */}
      <rect x="108" y="115" width="24" height="6" rx="1" fill="oklch(0.55 0.04 60)" />
      <rect x="110" y="121" width="20" height="4" rx="1" fill="oklch(0.45 0.04 60)" />
      <rect x="112" y="125" width="16" height="3" rx="1" fill="oklch(0.4 0.04 60)" />

      {/* filament */}
      <motion.path
        d="M 112 88 Q 120 96 128 88 Q 124 100 120 92 Q 116 100 112 88"
        stroke="oklch(0.99 0.05 72)"
        strokeWidth="1.2"
        fill="none"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* light rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r1 = 50;
        const r2 = 70;
        const x1 = 120 + r1 * Math.cos(angle);
        const y1 = 100 + r1 * Math.sin(angle);
        const x2 = 120 + r2 * Math.cos(angle);
        const y2 = 100 + r2 * Math.sin(angle);
        return (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="oklch(0.78 0.165 70 / 0.6)"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.06, type: "spring" }}
          />
        );
      })}

      {/* "GEM" caption */}
      <text
        x="120"
        y="190"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        letterSpacing="0.3em"
        fill="oklch(0.78 0.165 70 / 0.7)"
      >
        HIDDEN GEM
      </text>
      <text
        x="120"
        y="206"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        letterSpacing="0.2em"
        fill="var(--muted-foreground)"
      >
        OUR EDGE · YOUR LEAK
      </text>
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CityGlobalPeersCard                             */
/* -------------------------------------------------------------------------- */

export function CityGlobalPeersCard({
  city,
  extras,
}: {
  city: CityContent;
  extras: CityExtras;
}) {
  const cityCoord = projectWorld(parseFloat(city.geo.lat), parseFloat(city.geo.lng));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[oklch(0.66_0.18_295/0.12)] blur-3xl"
      />
      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <Globe2 size={11} />
            World twins
          </div>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Where else does the{" "}
            <span className="bg-gradient-to-br from-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
              {city.name} playbook
            </span>{" "}
            already work?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            These are the cities whose buyer pattern, industry mix, and ad-market
            dynamics most closely mirror {city.name}. We borrow the proven moves
            from each — and ship them locally.
          </p>

          <div className="mt-6 space-y-3">
            {extras.globalPeers.map((peer, i) => (
              <motion.article
                key={peer.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-accent-strong">
                        {peer.countryCode}
                      </span>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                        {peer.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        · {peer.country}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {peer.reason}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {peer.shared.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <PeerWorldSVG city={city} extras={extras} cityCoord={cityCoord} />
        </div>
      </div>
    </div>
  );
}

function PeerWorldSVG({
  city,
  extras,
  cityCoord,
}: {
  city: CityContent;
  extras: CityExtras;
  cityCoord: { x: number; y: number };
}) {
  return (
    <motion.svg
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      className="h-auto w-full"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        <linearGradient id="peer-ocean" x1="0" y1="0" x2="0" y2={WORLD_H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.05)" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 295 / 0.04)" />
        </linearGradient>
        <radialGradient id="peer-india-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70 / 0)" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="url(#peer-ocean)" />

      {/* graticule */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={(i / 12) * WORLD_W}
          y1={0}
          x2={(i / 12) * WORLD_W}
          y2={WORLD_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.4"
          strokeDasharray="2 6"
        />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={(i / 4) * WORLD_H}
          x2={WORLD_W}
          y2={(i / 4) * WORLD_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.4"
          strokeDasharray="2 6"
        />
      ))}

      {/* arcs from India city to peers */}
      {extras.globalPeers.map((peer, i) => {
        const end = projectWorld(peer.geo.lat, peer.geo.lng);
        const mx = (cityCoord.x + end.x) / 2;
        const my = Math.min(cityCoord.y, end.y) - 50;
        return (
          <g key={peer.name}>
            <motion.path
              d={`M ${cityCoord.x} ${cityCoord.y} Q ${mx} ${my} ${end.x} ${end.y}`}
              stroke="oklch(0.78 0.165 70 / 0.5)"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.3 + i * 0.12 }}
            />
            <motion.circle
              r="2.5"
              fill="oklch(0.78 0.165 70)"
              animate={{
                offsetDistance: ["0%", "100%"],
              }}
              transition={{ duration: 0, repeat: 0 }}
            />
          </g>
        );
      })}

      {/* Animated travelling particles along each arc */}
      {extras.globalPeers.map((peer, i) => {
        const end = projectWorld(peer.geo.lat, peer.geo.lng);
        const mx = (cityCoord.x + end.x) / 2;
        const my = Math.min(cityCoord.y, end.y) - 50;
        // bezier sample points (t=0.25 and t=0.75)
        const sample = (t: number) => {
          const x =
            (1 - t) * (1 - t) * cityCoord.x +
            2 * (1 - t) * t * mx +
            t * t * end.x;
          const y =
            (1 - t) * (1 - t) * cityCoord.y +
            2 * (1 - t) * t * my +
            t * t * end.y;
          return { x, y };
        };
        const stops = [0, 0.33, 0.66, 1].map(sample);
        return (
          <motion.circle
            key={`p-${peer.name}`}
            r="2.6"
            fill="oklch(0.78 0.165 70)"
            animate={{
              cx: stops.map((p) => p.x),
              cy: stops.map((p) => p.y),
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        );
      })}

      {/* India source city */}
      <motion.circle
        cx={cityCoord.x}
        cy={cityCoord.y}
        r="22"
        fill="url(#peer-india-glow)"
        animate={{ r: [18, 26, 18], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle
        cx={cityCoord.x}
        cy={cityCoord.y}
        r="6"
        fill="oklch(0.78 0.165 70)"
        stroke="var(--background)"
        strokeWidth="1.2"
      />
      <text
        x={cityCoord.x}
        y={cityCoord.y - 12}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.06em"
        fill="oklch(0.78 0.165 70)"
      >
        {city.name.toUpperCase()}
      </text>

      {/* peer cities */}
      {extras.globalPeers.map((peer, i) => {
        const { x, y } = projectWorld(peer.geo.lat, peer.geo.lng);
        return (
          <motion.g
            key={peer.name}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 180 }}
          >
            <motion.circle
              cx={x}
              cy={y}
              r="14"
              fill="none"
              stroke="oklch(0.66 0.18 295 / 0.4)"
              strokeWidth="0.8"
              animate={{ r: [10, 18, 10], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
            />
            <circle
              cx={x}
              cy={y}
              r="5"
              fill="oklch(0.66 0.18 295)"
              stroke="var(--background)"
              strokeWidth="1.2"
            />
            <text
              x={x}
              y={y - 12}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="8.5"
              fontWeight="700"
              letterSpacing="0.06em"
              fill="oklch(0.66 0.18 295)"
            >
              {peer.name.toUpperCase()}
            </text>
            <text
              x={x}
              y={y + 18}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6.5"
              fill="var(--muted-foreground)"
            >
              {peer.countryCode}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CityStatRadials                               */
/* -------------------------------------------------------------------------- */

export function CityStatRadials({ city }: { city: CityContent }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {city.heroStats.map((s, i) => (
        <StatRadial
          key={s.label}
          value={s.value}
          label={s.label}
          index={i}
          pct={70 + i * 8}
        />
      ))}
    </div>
  );
}

function StatRadial({
  value,
  label,
  pct,
  index,
}: {
  value: string;
  label: string;
  pct: number;
  index: number;
}) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const filled = Math.max(15, Math.min(100, pct));
  const dash = (filled / 100) * c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group flex flex-col items-center rounded-2xl border border-border bg-surface/60 p-5 transition-all hover:-translate-y-0.5"
    >
      <svg viewBox="0 0 100 100" className="h-28 w-28">
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="var(--svg-line-faint)"
          strokeWidth="3"
          fill="none"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          stroke="oklch(0.78 0.165 70)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 50 50)"
          initial={{ strokeDasharray: `0 ${c}` }}
          whileInView={{ strokeDasharray: `${dash} ${c}` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.2 + index * 0.08, ease: "easeOut" }}
        />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const inner = 30;
          const outer = 34;
          return (
            <line
              key={i}
              x1={50 + inner * Math.cos(a)}
              y1={50 + inner * Math.sin(a)}
              x2={50 + outer * Math.cos(a)}
              y2={50 + outer * Math.sin(a)}
              stroke="var(--svg-line-faint)"
              strokeWidth="0.6"
            />
          );
        })}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-display)"
          fontSize="13"
          fontWeight="700"
          fill="oklch(0.78 0.165 70)"
        >
          {value}
        </text>
      </svg>
      <div className="mt-3 text-center text-xs leading-snug text-foreground sm:text-sm">
        {label}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CityContextMap                                */
/* -------------------------------------------------------------------------- */

/**
 * Interactive India map for city detail pages.
 *
 *   - Active city shown large with pulsing accent halo + always-visible label
 *   - Other 9 cities shown as clickable smaller pins, dimmed by default,
 *     full-color on hover with a tooltip showing the city's hero stat
 *   - Network lines from active city to every other city (drawn-on entrance)
 *   - SVG silhouette of India outline + dotted lat/lng grid background
 *   - Each pin is a LocalizedLink → /cities/{slug}
 *
 * Lat/lng projection uses the same India bbox as IndiaMetroMap on the hub.
 */
const CCM_BBOX = { minLat: 8, maxLat: 36, minLng: 68, maxLng: 97 };
const CCM_W = 460;
const CCM_H = 520;

function projectCcm(lat: number, lng: number) {
  const x =
    ((lng - CCM_BBOX.minLng) / (CCM_BBOX.maxLng - CCM_BBOX.minLng)) * CCM_W;
  const y =
    CCM_H -
    ((lat - CCM_BBOX.minLat) / (CCM_BBOX.maxLat - CCM_BBOX.minLat)) * CCM_H;
  return { x, y };
}

export function CityContextMap({
  city,
  themeColor,
  themeColorAccent,
  prefix,
}: {
  /** The active city being viewed */
  city: CityContent;
  /** OKLCH color for the active city accent (from CityIdentity) */
  themeColor?: string;
  /** Secondary accent for active-city aura */
  themeColorAccent?: string;
  /** Locale-aware route prefix (e.g. "/in/en") used to build pin links */
  prefix: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const accent = themeColor ?? "oklch(0.78 0.165 70)";
  const accentSecondary =
    themeColorAccent ?? "oklch(0.66 0.18 295)";

  const activeLat = parseFloat(city.geo.lat);
  const activeLng = parseFloat(city.geo.lng);
  const activePos = projectCcm(activeLat, activeLng);

  const others = INDIA_CITIES.filter((c) => c.slug !== city.slug);

  return (
    <div
      className="relative isolate overflow-hidden rounded-3xl border bg-surface/40"
      style={{
        borderColor: accent.replace(")", " / 0.3)"),
      }}
    >
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ background: accent.replace(")", " / 0.12)") }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ background: accentSecondary.replace(")", " / 0.10)") }}
      />

      <div className="relative grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-12 lg:gap-10 lg:p-10">
        {/* Left: copy column — compact on mobile, full on lg */}
        <div className="lg:col-span-5">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] sm:px-3 sm:py-1.5 sm:text-[10px]"
            style={{
              borderColor: accent.replace(")", " / 0.4)"),
              background: accent.replace(")", " / 0.06)"),
              color: accent,
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: accent }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: accent }}
              />
            </span>
            {city.name} · in the network
          </div>
          <h2 className="text-balance mt-3 font-display text-xl font-semibold leading-[1.1] tracking-tight text-foreground sm:mt-5 sm:text-[26px] sm:leading-[1.05] lg:text-[2.4rem]">
            {city.name} doesn&apos;t work alone.
            <span className="lg:block">
              {" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, var(--foreground), ${accent}, ${accentSecondary})`,
                }}
              >
                Wired into 9 other metros.
              </span>
            </span>
          </h2>
          <p className="mt-2.5 hidden text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:block sm:text-base">
            Every dot is a metro we ship into. Click any pin to jump to that
            city&apos;s playbook — same delivery rhythm, locally tuned stack.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
            <div
              className="rounded-xl border p-2.5 sm:rounded-2xl sm:p-4"
              style={{
                borderColor: accent.replace(")", " / 0.3)"),
                background: accent.replace(")", " / 0.04)"),
              }}
            >
              <div
                className="font-mono text-[8px] uppercase tracking-[0.22em] sm:text-[9px]"
                style={{ color: accent }}
              >
                Active metro
              </div>
              <div className="mt-1 font-display text-sm font-semibold leading-tight text-foreground sm:mt-1.5 sm:text-lg">
                {city.name}
              </div>
              <div className="mt-0.5 font-mono text-[9px] text-muted-foreground sm:mt-1 sm:text-[10px]">
                {city.state}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-2.5 sm:rounded-2xl sm:p-4">
              <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[9px]">
                Connected
              </div>
              <div className="mt-1 font-display text-sm font-semibold leading-tight text-foreground sm:mt-1.5 sm:text-lg">
                {others.length} cities
              </div>
              <div className="mt-0.5 font-mono text-[9px] text-muted-foreground sm:mt-1 sm:text-[10px]">
                <span className="hidden sm:inline">Hover any pin</span>
                <span className="sm:hidden">Tap any pin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SVG map — natural aspect on mobile (no min-h), capped on lg */}
        <div className="relative flex items-center justify-center lg:col-span-7 lg:min-h-[460px]">
          <motion.svg
            viewBox={`0 0 ${CCM_W} ${CCM_H}`}
            className="h-auto w-full max-w-[320px] sm:max-w-[440px] lg:h-full lg:max-w-[560px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7 }}
          >
            <defs>
              <radialGradient id={`ccm-glow-${city.slug}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor={accent.replace(")", " / 0.18)")} />
                <stop offset="100%" stopColor={accent.replace(")", " / 0)")} />
              </radialGradient>
              <linearGradient
                id={`ccm-line-${city.slug}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={accent.replace(")", " / 0.5)")} />
                <stop
                  offset="100%"
                  stopColor={accentSecondary.replace(")", " / 0.15)")}
                />
              </linearGradient>
            </defs>

            {/* Dotted lat/lng grid */}
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`ccm-vline-${i}`}
                x1={(i / 6) * CCM_W}
                y1={0}
                x2={(i / 6) * CCM_W}
                y2={CCM_H}
                stroke="var(--svg-grid-line)"
                strokeWidth="0.6"
                strokeDasharray="2 6"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`ccm-hline-${i}`}
                x1={0}
                y1={(i / 7) * CCM_H}
                x2={CCM_W}
                y2={(i / 7) * CCM_H}
                stroke="var(--svg-grid-line)"
                strokeWidth="0.6"
                strokeDasharray="2 6"
              />
            ))}

            {/* India silhouette */}
            <motion.path
              d="M 100 80 L 145 60 L 195 65 L 240 55 L 295 60 L 350 100 L 372 145 L 360 195 L 340 240 L 320 290 L 295 340 L 255 405 L 220 460 L 195 480 L 170 460 L 155 425 L 140 380 L 120 330 L 100 275 L 90 225 L 85 175 L 90 125 Z"
              fill={`url(#ccm-glow-${city.slug})`}
              stroke={accent.replace(")", " / 0.35)")}
              strokeWidth="1.2"
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Network lines from active city to every other city */}
            {others.map((c, i) => {
              const lat = parseFloat(c.geo.lat);
              const lng = parseFloat(c.geo.lng);
              const { x, y } = projectCcm(lat, lng);
              return (
                <motion.line
                  key={`ccm-line-${c.slug}`}
                  x1={activePos.x}
                  y1={activePos.y}
                  x2={x}
                  y2={y}
                  stroke={`url(#ccm-line-${city.slug})`}
                  strokeWidth={hovered === c.slug ? 1.5 : 0.6}
                  strokeDasharray={hovered === c.slug ? "0" : "3 4"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    pathLength: { duration: 1.2, delay: 0.6 + i * 0.05 },
                    opacity: { duration: 0.4, delay: 0.6 + i * 0.05 },
                  }}
                  style={{
                    transition: "stroke-width 0.2s, stroke-dasharray 0.2s",
                  }}
                />
              );
            })}

            {/* Other-city pins */}
            {others.map((c, i) => {
              const lat = parseFloat(c.geo.lat);
              const lng = parseFloat(c.geo.lng);
              const { x, y } = projectCcm(lat, lng);
              const isHovered = hovered === c.slug;
              return (
                <motion.g
                  key={c.slug}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 1 + i * 0.05,
                    type: "spring",
                    stiffness: 180,
                    damping: 14,
                  }}
                  onMouseEnter={() => setHovered(c.slug)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <a href={`${prefix}/cities/${c.slug}`}>
                    {/* Hit area */}
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="transparent"
                    />
                    {/* Halo on hover */}
                    {isHovered && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="none"
                        stroke={accent}
                        strokeWidth="0.8"
                        initial={{ r: 4, opacity: 0 }}
                        animate={{ r: 12, opacity: 0.6 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "5" : "3.5"}
                      fill={
                        isHovered
                          ? accent
                          : "var(--muted-foreground)"
                      }
                      stroke="var(--background)"
                      strokeWidth="1.2"
                      style={{
                        transition: "r 0.2s, fill 0.2s",
                        opacity: isHovered ? 1 : 0.55,
                      }}
                    />
                    <text
                      x={x + 9}
                      y={y + 3.5}
                      fontFamily="var(--font-mono)"
                      fontSize="9"
                      fontWeight="600"
                      fill={
                        isHovered
                          ? "var(--foreground)"
                          : "var(--muted-foreground)"
                      }
                      style={{
                        transition: "fill 0.2s, opacity 0.2s",
                        opacity: isHovered ? 1 : 0.7,
                      }}
                    >
                      {c.name.split(" ")[0]}
                    </text>
                  </a>
                </motion.g>
              );
            })}

            {/* Active city pin — large, glowing, always labeled */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.4,
                type: "spring",
                stiffness: 180,
                damping: 14,
              }}
            >
              {/* Outer pulse */}
              <motion.circle
                cx={activePos.x}
                cy={activePos.y}
                r="16"
                fill="none"
                stroke={accent}
                strokeWidth="0.8"
                animate={{
                  r: [12, 26, 12],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Inner halo */}
              <circle
                cx={activePos.x}
                cy={activePos.y}
                r="10"
                fill={accent.replace(")", " / 0.18)")}
                stroke={accent}
                strokeWidth="0.8"
              />
              {/* Center dot */}
              <circle
                cx={activePos.x}
                cy={activePos.y}
                r="5"
                fill={accent}
                stroke="var(--background)"
                strokeWidth="1.5"
              />
              {/* Label badge */}
              <g>
                <rect
                  x={activePos.x + 12}
                  y={activePos.y - 9}
                  width={city.name.length * 6.2 + 14}
                  height="18"
                  rx="9"
                  fill="var(--background)"
                  stroke={accent.replace(")", " / 0.45)")}
                  strokeWidth="1"
                />
                <text
                  x={activePos.x + 19}
                  y={activePos.y + 3.5}
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fontWeight="700"
                  fill={accent}
                >
                  {city.name}
                </text>
              </g>
            </motion.g>
          </motion.svg>

          {/* Hover tooltip — HTML overlay positioned over SVG hover target */}
          {hovered &&
            (() => {
              const c = others.find((x) => x.slug === hovered);
              if (!c) return null;
              const lat = parseFloat(c.geo.lat);
              const lng = parseFloat(c.geo.lng);
              const { x, y } = projectCcm(lat, lng);
              const stat = c.heroStats[0];
              return (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-background/95 px-3 py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md"
                  style={{
                    left: `${(x / CCM_W) * 100}%`,
                    top: `${(y / CCM_H) * 100}%`,
                    marginTop: "-12px",
                  }}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                    <MapPin size={9} /> {c.state}
                  </div>
                  <div className="mt-0.5 font-display text-sm font-semibold tracking-tight text-foreground">
                    {c.name}
                  </div>
                  {stat && (
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-base font-semibold leading-none text-accent-strong">
                        {stat.value}
                      </span>
                      <span className="text-[10px] leading-tight text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                  )}
                  <div className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Click to open
                    <ArrowUpRight size={9} />
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
