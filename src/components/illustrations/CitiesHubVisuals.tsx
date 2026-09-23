"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, Sparkles, ArrowUpRight, Globe2 } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import { INDIA_CITIES, type CityContent } from "@/lib/cities";
import { CITY_EXTRAS, type CityIntentTag } from "@/lib/city-extras";

/**
 * Visualizations for the /cities hub page.
 *
 *   - IndiaMetroMap: animated SVG of an India bounding box with pulsing
 *     metros plotted by lat/lng. Equirectangular projection — pixel-perfect
 *     India geometry isn't needed for the visual story.
 *   - CitiesIntentMatrix: matrix of city × intent tag with dot markers.
 *   - GlobalPeersConstellation: world map showing every peer city we mirror.
 */

/* -------------------------------------------------------------------------- */
/*                              Geo projection                                */
/* -------------------------------------------------------------------------- */

// Bounding box for India (rough — covers Kashmir to Kanyakumari, Gujarat to NE)
const INDIA_BBOX = { minLat: 8, maxLat: 36, minLng: 68, maxLng: 97 };
const MAP_W = 400;
const MAP_H = 460;

function projectIndia(lat: number, lng: number) {
  const x = ((lng - INDIA_BBOX.minLng) / (INDIA_BBOX.maxLng - INDIA_BBOX.minLng)) * MAP_W;
  // Inverted Y — bigger lat = further north = smaller y
  const y =
    MAP_H -
    ((lat - INDIA_BBOX.minLat) / (INDIA_BBOX.maxLat - INDIA_BBOX.minLat)) * MAP_H;
  return { x, y };
}

// Equirectangular projection for the world map.
const WORLD_W = 800;
const WORLD_H = 400;
function projectWorld(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * WORLD_W;
  const y = ((90 - lat) / 180) * WORLD_H;
  return { x, y };
}

/* -------------------------------------------------------------------------- */
/*                              IndiaMetroMap                                 */
/* -------------------------------------------------------------------------- */

const INTENT_COLORS: Record<CityIntentTag, string> = {
  "D2C": "oklch(0.65 0.22 25)",
  "BFSI": "oklch(0.66 0.18 295)",
  "Real Estate": "oklch(0.55 0.2 295)",
  "EdTech": "oklch(0.74 0.16 155)",
  "SaaS": "oklch(0.78 0.165 70)",
  "Manufacturing": "oklch(0.78 0.165 70)",
  "Pharma / Healthcare": "oklch(0.74 0.16 155)",
  "Auto": "oklch(0.65 0.22 25)",
  "Logistics / Trade": "oklch(0.66 0.18 295)",
  "Heritage / Craft": "oklch(0.78 0.165 70)",
  "IT Services": "oklch(0.66 0.18 295)",
  "Government / PSU": "oklch(0.7 0.015 260)",
  "Legacy Commerce": "oklch(0.55 0.2 295)",
};

export function IndiaMetroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [-20, 30]);

  return (
    <div
      ref={containerRef}
      className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface/40"
    >
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-50" />
      <motion.div
        aria-hidden
        style={{ y: parallax }}
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative grid gap-5 p-4 sm:gap-6 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-12">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong sm:px-3 sm:py-1.5 sm:text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            11 metros · live build map
          </div>
          <h2 className="text-balance mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:mt-5 sm:text-3xl md:text-4xl lg:text-[3rem] lg:leading-[1.05]">
            We build city-aware,{" "}
            <span className="bg-gradient-to-br from-foreground via-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
              not city-templated.
            </span>
          </h2>
          <p className="text-pretty mt-3 hidden text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:block sm:text-base lg:text-lg">
            Every dot is a metro we&apos;ve shipped revenue systems into — with
            local stack, local language, and local SEO. The colours encode the
            primary industry mix; the pulses are live engagements.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-7 sm:gap-2">
            {(["D2C", "BFSI", "Real Estate", "SaaS", "Manufacturing", "EdTech"] as CityIntentTag[]).map(
              (tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px]"
                >
                  <span
                    className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5"
                    style={{ background: INTENT_COLORS[tag] }}
                  />
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-7 lg:min-h-[420px]">
          <IndiaSVG />
        </div>
      </div>
    </div>
  );
}

function IndiaSVG() {
  return (
    <motion.svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="h-auto w-full max-w-[300px] sm:max-w-[420px] lg:h-full lg:max-w-[520px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        <radialGradient id="india-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.18)" />
          <stop offset="100%" stopColor="oklch(0.78 0.165 70 / 0)" />
        </radialGradient>
      </defs>

      {/* dotted lat/lng grid suggesting a map */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`vline-${i}`}
          x1={(i / 6) * MAP_W}
          y1={0}
          x2={(i / 6) * MAP_W}
          y2={MAP_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`hline-${i}`}
          x1={0}
          y1={(i / 7) * MAP_H}
          x2={MAP_W}
          y2={(i / 7) * MAP_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
      ))}

      {/* stylised India outline (simplified silhouette) */}
      <motion.path
        d="M 90 70 L 130 55 L 175 60 L 215 50 L 260 55 L 310 90 L 330 130 L 320 175 L 300 215 L 285 260 L 260 305 L 225 360 L 195 405 L 175 425 L 155 410 L 140 380 L 125 340 L 105 295 L 90 245 L 80 200 L 75 155 L 80 110 Z"
        fill="url(#india-glow)"
        stroke="oklch(0.78 0.165 70 / 0.4)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />

      {/* connection lines from each city to a virtual hub at country centre */}
      <CityConnections />

      {/* city dots */}
      {INDIA_CITIES.map((city, i) => {
        const lat = parseFloat(city.geo.lat);
        const lng = parseFloat(city.geo.lng);
        const { x, y } = projectIndia(lat, lng);
        const extras = CITY_EXTRAS[city.slug];
        const primaryIntent = extras?.intent[0] ?? "SaaS";
        const color = INTENT_COLORS[primaryIntent];
        const isPrimary = city.slug === "ahmedabad" || city.slug === "mumbai";
        return (
          <motion.g
            key={city.slug}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6 + i * 0.06,
              type: "spring",
              stiffness: 180,
              damping: 14,
            }}
          >
            {isPrimary && (
              <motion.circle
                cx={x}
                cy={y}
                r="14"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                animate={{ r: [10, 22, 10], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.3 }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isPrimary ? "5" : "3.5"}
              fill={color}
              stroke="var(--background)"
              strokeWidth="1.2"
            />
            <motion.circle
              cx={x}
              cy={y}
              r={isPrimary ? "5" : "3.5"}
              fill="none"
              stroke={color}
              strokeWidth="0.6"
              animate={{ r: [3.5, 9, 3.5], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
            />
            {/* label */}
            <text
              x={x + 9}
              y={y + 3.5}
              fontFamily="var(--font-mono)"
              fontSize="9"
              fontWeight="600"
              fill="var(--foreground)"
            >
              {city.name.split(" ")[0]}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

function CityConnections() {
  // virtual centroid roughly Nagpur
  const cx = 200;
  const cy = 250;
  return (
    <>
      {INDIA_CITIES.map((city, i) => {
        const { x, y } = projectIndia(
          parseFloat(city.geo.lat),
          parseFloat(city.geo.lng)
        );
        return (
          <motion.line
            key={city.slug}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="oklch(0.78 0.165 70 / 0.15)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.05 }}
          />
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CitiesScrollTimeline                            */
/* -------------------------------------------------------------------------- */

/**
 * Vertical scroll-driven city ladder. Replaces the flat 3-column grid on the
 * cities hub. Each row is a sticky identity panel + headline + stats with a
 * progress rail filling on scroll.
 */
export function CitiesScrollTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={sectionRef} className="relative">
      <div
        aria-hidden
        className="absolute left-5 top-0 hidden h-full w-px bg-border lg:block"
      />
      <motion.div
        aria-hidden
        style={{ height: railHeight }}
        className="absolute left-5 top-0 hidden w-px bg-gradient-to-b from-accent via-[oklch(0.66_0.18_295)] to-accent lg:block"
      />

      <div className="space-y-6 sm:space-y-10 lg:space-y-16 lg:pl-16">
        {INDIA_CITIES.map((city, i) => (
          <CityTimelineRow key={city.slug} city={city} index={i} />
        ))}
      </div>
    </div>
  );
}

function CityTimelineRow({ city, index }: { city: CityContent; index: number }) {
  const extras = CITY_EXTRAS[city.slug];
  const primaryIntent = extras?.intent[0] ?? "SaaS";
  const color = INTENT_COLORS[primaryIntent];

  return (
    <motion.article
      id={city.slug}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className="relative scroll-mt-32"
    >
      {/* rail dot */}
      <div className="absolute -left-[60px] top-2 hidden lg:block">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-background font-mono text-xs font-bold"
          style={{ borderColor: color.replace(")", " / 0.5)"), color }}
        >
          {String(index + 1).padStart(2, "0")}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-2xl border-2"
            style={{ borderColor: color }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
          />
        </motion.div>
      </div>

      <LocalizedLink
        href={`/cities/${city.slug}`}
        className="group block overflow-hidden rounded-3xl border border-border bg-surface/40 transition-all hover:-translate-y-0.5 hover:border-accent/40"
        style={{
          background: `linear-gradient(140deg, ${color.replace(")", " / 0.05)")}, transparent 60%)`,
        }}
      >
        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:p-7 lg:grid-cols-12 lg:gap-10 lg:p-8">
          {/* Identity */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em]"
                style={{
                  borderColor: color.replace(")", " / 0.4)"),
                  color,
                }}
              >
                <MapPin size={10} />
                {city.state}
              </div>
              <ArrowUpRight
                size={16}
                className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              />
            </div>

            <h3 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl">
              {city.name}
            </h3>
            {extras && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {extras.intent.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pitch + stats */}
          <div className="lg:col-span-8">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {city.heroSubheadline}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {city.heroStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="rounded-xl border border-border bg-background/70 p-3 sm:p-4"
                >
                  <div
                    className="font-display text-lg font-semibold tracking-tight sm:text-xl"
                    style={{ color }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-xs">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {extras && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5">
                <Sparkles size={12} style={{ color }} />
                <span className="line-clamp-1 text-xs leading-relaxed text-foreground sm:text-sm">
                  <span
                    className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.18em]"
                    style={{ color }}
                  >
                    Hidden gem
                  </span>
                  {extras.hiddenGem.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </LocalizedLink>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*                          GlobalPeersConstellation                          */
/* -------------------------------------------------------------------------- */

/**
 * World map showing every Indian metro paired with its global peer cities.
 * Tells the positioning story: "we apply Stuttgart-grade discipline to Pune,
 * SF-grade SaaS instincts to Bengaluru, etc."
 */
export function GlobalPeersConstellation() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[oklch(0.66_0.18_295/0.12)] blur-3xl"
      />
      <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <Globe2 size={11} />
            World peer mapping
          </div>
          <h2 className="text-balance mt-5 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Every Indian metro has a{" "}
            <span className="bg-gradient-to-br from-accent to-[oklch(0.66_0.18_295)] bg-clip-text text-transparent">
              world twin
            </span>
            . We work the playbook.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Stuttgart for Pune manufacturing. San Francisco for Bengaluru SaaS.
            Antwerp for Jaipur gems. These aren&apos;t branding lines — they
            tell us which buyer pattern to ship for.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {Object.values(CITY_EXTRAS)
              .slice(0, 4)
              .map((cx) => (
                <LocalizedLink
                  key={cx.slug}
                  href={`/cities/${cx.slug}`}
                  className="group rounded-xl border border-border bg-background/60 p-3 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                >
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-strong">
                    {cx.slug}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-foreground">
                    ↔ {cx.globalPeers[0].name}
                  </div>
                </LocalizedLink>
              ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <WorldMapSVG />
        </div>
      </div>
    </div>
  );
}

function WorldMapSVG() {
  // gather all distinct peer cities
  const peerSet = new Map<
    string,
    { name: string; lat: number; lng: number; country: string }
  >();
  Object.values(CITY_EXTRAS).forEach((c) => {
    c.globalPeers.forEach((p) => {
      const key = `${p.name}-${p.country}`;
      if (!peerSet.has(key)) {
        peerSet.set(key, {
          name: p.name,
          lat: p.geo.lat,
          lng: p.geo.lng,
          country: p.country,
        });
      }
    });
  });
  const peers = Array.from(peerSet.values());

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
        <linearGradient id="ocean-grad" x1="0" y1="0" x2="0" y2={WORLD_H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.78 0.165 70 / 0.04)" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 295 / 0.04)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="url(#ocean-grad)" />

      {/* dotted graticule */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={(i / 12) * WORLD_W}
          y1={0}
          x2={(i / 12) * WORLD_W}
          y2={WORLD_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.5"
          strokeDasharray="2 6"
        />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={(i / 6) * WORLD_H}
          x2={WORLD_W}
          y2={(i / 6) * WORLD_H}
          stroke="var(--svg-grid-line)"
          strokeWidth="0.5"
          strokeDasharray="2 6"
        />
      ))}

      {/* connection arcs from Indian metros to global peers */}
      {Object.values(CITY_EXTRAS).flatMap((extras, i) => {
        const indiaCity = INDIA_CITIES.find((c) => c.slug === extras.slug);
        if (!indiaCity) return [];
        const start = projectWorld(
          parseFloat(indiaCity.geo.lat),
          parseFloat(indiaCity.geo.lng)
        );
        return extras.globalPeers.map((peer, j) => {
          const end = projectWorld(peer.geo.lat, peer.geo.lng);
          const mx = (start.x + end.x) / 2;
          const my = Math.min(start.y, end.y) - 60;
          return (
            <motion.path
              key={`${extras.slug}-${peer.name}`}
              d={`M ${start.x} ${start.y} Q ${mx} ${my} ${end.x} ${end.y}`}
              stroke="oklch(0.78 0.165 70 / 0.3)"
              strokeWidth="0.6"
              fill="none"
              strokeDasharray="3 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.4 + i * 0.06 + j * 0.04 }}
            />
          );
        });
      })}

      {/* India metros (origin nodes) */}
      {INDIA_CITIES.map((city, i) => {
        const { x, y } = projectWorld(
          parseFloat(city.geo.lat),
          parseFloat(city.geo.lng)
        );
        return (
          <motion.g
            key={city.slug}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.2 + i * 0.05,
              type: "spring",
              stiffness: 180,
            }}
          >
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill="oklch(0.78 0.165 70)"
              stroke="var(--background)"
              strokeWidth="0.8"
            />
            <motion.circle
              cx={x}
              cy={y}
              r="3.5"
              fill="none"
              stroke="oklch(0.78 0.165 70 / 0.5)"
              strokeWidth="0.5"
              animate={{ r: [3.5, 8, 3.5], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.g>
        );
      })}

      {/* Global peer nodes */}
      {peers.map((p, i) => {
        const { x, y } = projectWorld(p.lat, p.lng);
        return (
          <motion.g
            key={`peer-${p.name}`}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6 + i * 0.04,
              type: "spring",
              stiffness: 160,
            }}
          >
            <circle
              cx={x}
              cy={y}
              r="3"
              fill="oklch(0.66 0.18 295)"
              stroke="var(--background)"
              strokeWidth="0.8"
            />
            <text
              x={x}
              y={y - 6}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6"
              fontWeight="600"
              fill="oklch(0.66 0.18 295)"
            >
              {p.name}
            </text>
          </motion.g>
        );
      })}

      {/* Caption */}
      <text
        x={WORLD_W / 2}
        y={WORLD_H - 8}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        letterSpacing="0.2em"
        fill="var(--muted-foreground)"
      >
        IN METROS · WORLD PEERS — same playbook, different timezone
      </text>
    </motion.svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CitiesIntentMatrix                              */
/* -------------------------------------------------------------------------- */

const MATRIX_INTENTS: CityIntentTag[] = [
  "D2C",
  "BFSI",
  "Real Estate",
  "EdTech",
  "SaaS",
  "Manufacturing",
  "Pharma / Healthcare",
  "Auto",
  "Logistics / Trade",
  "Heritage / Craft",
];

export function CitiesIntentMatrix() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <Sparkles size={11} />
            Intent × city matrix
          </div>
          <h2 className="text-balance mt-4 max-w-2xl font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            Pick a city if your intent fits — or scroll to find the metro that
            matches yours.
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          ● = primary fit · ○ = active builds
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-border px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                City
              </th>
              {MATRIX_INTENTS.map((intent) => (
                <th
                  key={intent}
                  className="border-b border-border px-2 py-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {intent.split(" / ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDIA_CITIES.map((city, i) => {
              const extras = CITY_EXTRAS[city.slug];
              if (!extras) return null;
              return (
                <motion.tr
                  key={city.slug}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-background/40"
                >
                  <td className="border-b border-border px-3 py-3">
                    <LocalizedLink
                      href={`/cities/${city.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-accent-strong"
                    >
                      {city.name}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </LocalizedLink>
                  </td>
                  {MATRIX_INTENTS.map((intent) => {
                    const isPrimary = extras.intent[0] === intent;
                    const isActive = extras.intent.includes(intent);
                    return (
                      <td
                        key={intent}
                        className="border-b border-border px-2 py-3 text-center"
                      >
                        {isPrimary ? (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: INTENT_COLORS[intent] }}
                          />
                        ) : isActive ? (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border"
                            style={{
                              borderColor: INTENT_COLORS[intent],
                              background: INTENT_COLORS[intent].replace(")", " / 0.15)"),
                            }}
                          />
                        ) : (
                          <span className="inline-block h-2.5 w-2.5 rounded-full border border-border/50" />
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
