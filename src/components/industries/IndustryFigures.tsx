import { useId, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type { IndustryKey } from "@/lib/country-content";
import { INDUSTRY_WORKFLOWS } from "./workflows";
import s from "./IndustryFigures.module.css";

/**
 * Industry figures — one isometric technical drawing per industry page plus
 * the "hub" for /industries. Same hand as the home TechnicalVisuals and the
 * blog figures. Server components: every animation is CSS and pauses under
 * [data-motion="paused"] / [data-in-view="false"] (set by <BlogMotion> or
 * <HomeMotion>) and prefers-reduced-motion. Every drawing is complete without
 * motion or JavaScript.
 *
 *   <IndustryFigure industry="manufacturing" number={1} legend={[...]} />
 *   <IndustryArt industry="hub" compact />   // thumbnail, art only
 *
 * Stage-highlight contract (see workflows.ts): every workflow stage id is a
 * `<g data-stage="<id>">` region of that industry's drawing. When any ancestor
 * carries `data-active-stage="<id>"`, that region lights up (accent outlines,
 * floor halo, animated connector) and the other regions dim — CSS only:
 *
 *   <div data-active-stage="qc"><IndustryArt industry="manufacturing" /></div>
 */

export type IndustryFigureKey = IndustryKey | "hub";

export interface IndustryArtProps {
  industry: IndustryFigureKey;
  /** Thumbnail mode (~320×200): tighter crop, no frame or annotations, motion only while a parent card is hovered. */
  compact?: boolean;
  className?: string;
  /** Accessible description. When set the SVG is role="img"; otherwise it is aria-hidden. */
  label?: string;
}

type ArtProps = Omit<IndustryArtProps, "industry">;

export const FIGURE_TITLES: Record<IndustryFigureKey, string> = {
  hub: "Five sectors, one operating system",
  manufacturing: "Shop floor to ledger",
  "real-estate": "Lead to allotment",
  healthcare: "Booking to recall",
  ecommerce: "Order to reorder",
  edtech: "Enquiry to results",
};

export const FIGURE_DESCRIPTIONS: Record<IndustryFigureKey, string> = {
  hub: "Illustration: five sector buildings — a factory, residential towers, a clinic, a storefront and a classroom — stand around one central operating system of three layers, ERP, automation and AI. Signals travel in from every sector and decisions travel back out.",
  manufacturing: "Diagram: an isometric factory. A raw-material godown feeds a conveyor through two machines and a quality gate into a finished-goods godown, where a truck loads at the dock. Around the floor, the sales order and production plan feed the line, and the dispatch generates the GST e-invoice and the founder's daily P&L.",
  "real-estate": "Diagram: an isometric project site with two residential towers, a crane and a sales gallery on the road. Leads from portals, WhatsApp and walk-ins are scored and answered in minutes, the buyer visits the gallery, receives a cost sheet, pays the booking, and the unit is blocked on the inventory chart and lit on the tower.",
  healthcare: "Diagram: an isometric clinic cut open. A patient books a slot online, gets WhatsApp reminders, checks in by QR at the front desk, waits under a live token board, sees the doctor in the consulting room and pays by UPI at billing; a recall message books the next visit.",
  ecommerce: "Diagram: an isometric warehouse and a customer's home on one road. A shopper browses the store, saves a cart, comes back from a WhatsApp nudge, pays by UPI; the order is packed at the dock, the van delivers it to the door with tracking updates, and a reorder reminder brings the next order.",
  edtech: "Diagram: an isometric coaching institute cut open, with a counselling desk, a demo classroom, a batch classroom and an attendance scanner at its door. An enquiry becomes a counselling call, a demo class, an online admission, a batch seat, daily attendance, fee instalments and published test results.",
};

/** Default English legend labels (square · accent square · dot). Pages may pass localized ones. */
export const FIGURE_LEGENDS: Record<IndustryFigureKey, [string, string, string]> = {
  hub: ["Sectors", "Operating system", "Decisions"],
  manufacturing: ["Shop floor", "Material + data flow", "Stock levels"],
  "real-estate": ["Project site", "Lead flow", "Units allotted"],
  healthcare: ["Clinic floor", "Patient flow", "Reminders"],
  ecommerce: ["Warehouse + home", "Order flow", "Repeat purchase"],
  edtech: ["Institute", "Student record", "Milestones"],
};

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

function useFigureId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/* ── Isometric helpers ─────────────────────────────────────────────────── */
type Pt = [number, number];
type Projector = (x: number, y: number, z?: number) => Pt;
const COS30 = 0.8660254;
const r1 = (n: number) => Math.round(n * 10) / 10;
/** Isometric projection with origin (ox, oy); `k` scales the whole scene. */
function projector(ox: number, oy: number, k = 1): Projector {
  return (x, y, z = 0) => [ox + (x - y) * COS30 * k, oy + ((x + y) * 0.5 - z) * k];
}
/** The same projection, with the footprint moved by (dx, dy). */
function shifted(P: Projector, dx: number, dy: number): Projector {
  return (x, y, z = 0) => P(x + dx, y + dy, z);
}
function poly(points: Pt[]) { return `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`; }
function polyline(points: Pt[]) { return `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}`; }
const pt = ([x, y]: Pt) => `${r1(x)} ${r1(y)}`;
/** Faces of an axis-aligned box: top, front-left (y+d) and front-right (x+w). */
function box(P: Projector, x: number, y: number, z: number, w: number, d: number, h: number) {
  return {
    top: poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
    left: poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)]),
    right: poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)]),
  };
}
/** Quad on the plane x = const (faces front-right). */
const qR = (P: Projector, x: number, y0: number, y1: number, z0: number, z1: number) => poly([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)]);
/** Quad on the plane y = const (faces front-left). */
const qL = (P: Projector, y: number, x0: number, x1: number, z0: number, z1: number) => poly([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)]);
/** Quad on a horizontal plane. */
const qT = (P: Projector, z: number, x0: number, y0: number, x1: number, y1: number) => poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);
/** A circle lying on a plane, as a smooth polygon. */
function ring(P: Projector, plane: "x" | "y" | "z", [a, b, c]: [number, number, number], r: number, n = 24) {
  const pts: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const t = (k / n) * Math.PI * 2;
    const u = r * Math.cos(t);
    const v = r * Math.sin(t);
    pts.push(plane === "z" ? P(a + u, b + v, c) : plane === "x" ? P(a, b + u, c + v) : P(a + u, b, c + v));
  }
  return poly(pts);
}

type Tone = "paper" | "tint" | "machine" | "slot" | "pad" | "surface" | "glass" | "soft";
const TONES: Record<Tone, [string, string, string]> = {
  // [top, front-left, front-right]
  paper: [s.paper, s.surface, s.soft],
  tint: [s.tintMuted, s.tintMuted, s.tintDeep],
  machine: [s.machineTop, s.machineLeft, s.machineRight],
  slot: [s.machineSlot, s.machineSlot, s.machineSlot],
  pad: [s.soft, s.soft, s.soft],
  surface: [s.surface, s.surface, s.soft],
  glass: [s.glass, s.glass, s.glass],
  soft: [s.soft, s.soft, s.soft],
};

function Block({ P, x, y, z = 0, w, d, h, tone = "paper", top = true }: { P: Projector; x: number; y: number; z?: number; w: number; d: number; h: number; tone?: Tone; top?: boolean }) {
  const b = box(P, x, y, z, w, d, h);
  const [t, l, r] = TONES[tone];
  return <g><path className={l} d={b.left} /><path className={r} d={b.right} />{top && <path className={t} d={b.top} />}</g>;
}

/* ── Shared plate: svg root, dot grid, registration frame ─────────────── */
function Plate({ compact, className, label, viewBox = "0 0 640 400", compactViewBox = "44 50 552 345", children }: ArtProps & { viewBox?: string; compactViewBox?: string; children: ReactNode }) {
  return (
    <svg
      viewBox={compact ? compactViewBox : viewBox}
      className={cx(s.svg, compact && s.compact, className)}
      fill="none"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-blog-scene={compact ? undefined : ""}
    >
      {children}
    </svg>
  );
}

function DotGrid({ id, x = 36, y = 46, width = 568, height = 304 }: { id: string; x?: number; y?: number; width?: number; height?: number }) {
  return <>
    <defs><pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" className={s.gridDot} /></pattern></defs>
    <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-grid)`} />
  </>;
}

function Frame({ top, tag, bottom, note = "ILLUSTRATIVE SYSTEM", height = 400, tagX = 494 }: { top: string; tag: string; bottom: string; note?: string; height?: number; tagX?: number }) {
  const b = height - 28;
  return <g className={s.frame}>
    <path className={s.guide} d={`M20 28h16M28 20v16M604 28h16M612 20v16M20 ${b}h16M28 ${b - 8}v16M604 ${b}h16M612 ${b - 8}v16`} />
    <text className={s.annot} x="48" y="36">{top}</text>
    <circle className={cx(s.accentFill, s.minor)} cx={tagX} cy="33" r="2.5" />
    <text className={s.annot} x={tagX + 9} y="36">{tag}</text>
    <path className={s.guide} d={`M48 ${b - 16}H592`} />
    <text className={s.annot} x="48" y={b + 3}>{bottom}</text>
    <text className={s.annot} x="592" y={b + 3} textAnchor="end">{note}</text>
  </g>;
}

/** A sensor tap: small mast + ring where a data riser starts. */
function Tap({ x, y, mast = 6 }: { x: number; y: number; mast?: number }) {
  return <g>
    <path className={s.line} d={`M${r1(x)} ${r1(y + mast)}V${r1(y + 3)}`} />
    <circle className={s.accentDot} cx={r1(x)} cy={r1(y)} r="3.2" />
  </g>;
}

/** A person, standing on screen point (x, y). */
function Person({ x, y, accent = false, scale = 1 }: { x: number; y: number; accent?: boolean; scale?: number }) {
  return <g transform={`translate(${r1(x)} ${r1(y)}) scale(${scale})`}>
    <path className={accent ? s.tint : s.surface} d="M-6 0V-8C-6-14 6-14 6-8V0Z" />
    <circle className={accent ? s.tint : s.surface} cx="0" cy="-18.5" r="4.2" />
  </g>;
}
/** A person standing on floor point (fx, fy). */
function Standing({ P, fx, fy, accent, scale }: { P: Projector; fx: number; fy: number; accent?: boolean; scale?: number }) {
  const [x, y] = P(fx, fy);
  return <Person x={x} y={y} accent={accent} scale={scale} />;
}

function Check({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return <g transform={`translate(${r1(x)} ${r1(y)})`}>
    <circle className={s.accentDot} r={r} />
    <path className={s.accentLine} style={{ strokeWidth: 1.2 }} d={`m${-r * 0.45} 0 ${r * 0.3} ${r * 0.35} ${r * 0.6}-${r * 0.7}`} />
  </g>;
}

/* ══════════════════════════════════════════════════════════════════════
   HUB — five sectors around one operating system (isometric)
   ══════════════════════════════════════════════════════════════════════ */
const HUB_CORE = [160, 160] as const;
/** Sector buildings are drawn around a base footprint centre, then moved out by `shift`. */
const HUB_NODES: { key: IndustryKey; base: [number, number]; shift: [number, number] }[] = [
  { key: "manufacturing", base: [50, 142], shift: [-8, -1] },
  { key: "real-estate", base: [142, 50], shift: [-1, -8] },
  { key: "healthcare", base: [260, 110], shift: [8, -4] },
  { key: "ecommerce", base: [238, 238], shift: [10, 10] },
  { key: "edtech", base: [110, 260], shift: [-4, 8] },
];
const hubAt = (n: (typeof HUB_NODES)[number]): [number, number] => [n.base[0] + n.shift[0], n.base[1] + n.shift[1]];
/** Point along the spoke from a node to the core, `inset` floor units from the node (or from the core when negative). */
function spokePoint(n: (typeof HUB_NODES)[number], inset: number): [number, number] {
  const [nx, ny] = hubAt(n);
  const dx = HUB_CORE[0] - nx;
  const dy = HUB_CORE[1] - ny;
  const t = inset >= 0 ? inset / Math.max(Math.abs(dx), Math.abs(dy)) : 1 + inset / Math.max(Math.abs(dx), Math.abs(dy));
  return [nx + dx * t, ny + dy * t];
}

function HubFactory({ P }: { P: Projector }) {
  const shed = box(P, 30, 128, 3, 40, 32, 16);
  const teeth = [0, 1, 2].map((i) => {
    const x0 = 30 + (i * 40) / 3;
    const x1 = x0 + 40 / 3;
    return {
      slope: poly([P(x0, 128, 19), P(x1, 128, 28), P(x1, 160, 28), P(x0, 160, 19)]),
      glass: poly([P(x1, 128, 19), P(x1, 128, 28), P(x1, 160, 28), P(x1, 160, 19)]),
      cap: poly([P(x0, 160, 19), P(x1, 160, 28), P(x1, 160, 19)]),
    };
  });
  const top = P(36.5, 134.5, 49);
  return <g>
    <Block P={P} x={26} y={118} w={48} d={48} h={3} tone="pad" />
    <Block P={P} x={33} y={131} z={3} w={7} d={7} h={46} />
    <path className={s.tintDeep} d={box(P, 33, 131, 41, 7, 7, 4).left} />
    <path className={s.tintDeep} d={box(P, 33, 131, 41, 7, 7, 4).right} />
    <path className={s.surface} d={shed.left} />
    <path className={s.soft} d={shed.right} />
    {teeth.map((t, i) => <g key={i}>
      <path className={s.paper} d={t.slope} />
      <path className={s.glass} d={t.glass} />
      <path className={s.surface} d={t.cap} />
    </g>)}
    <path className={s.soft} d={poly([P(56, 160, 3), P(65, 160, 3), P(65, 160, 13), P(56, 160, 13)])} />
    <path className={s.line} d={[36, 42].map((x) => polyline([P(x, 160, 9), P(x + 4, 160, 9)])).join("")} />
    <circle className={s.accentFill} cx={top[0]} cy={top[1] - 3} r="2.2" />
    <circle className={cx(s.accentLine, s.pulse)} cx={top[0]} cy={top[1] - 3} r="2.2" style={delay(0)} />
  </g>;
}

function HubTowers({ P }: { P: Projector }) {
  const beacon = P(133, 41, 71);
  return <g>
    <Block P={P} x={118} y={26} w={48} d={48} h={3} tone="pad" />
    <Block P={P} x={122} y={30} z={3} w={22} d={22} h={68} />
    <path className={s.guide} d={[13, 21, 29, 37, 45, 53, 61].map((z) => `${polyline([P(125, 52, z), P(141, 52, z)])}${polyline([P(144, 33, z), P(144, 49, z)])}`).join("")} />
    <Block P={P} x={147} y={44} z={3} w={16} d={24} h={40} />
    <path className={s.guide} d={[13, 21, 29, 37].map((z) => `${polyline([P(149, 68, z), P(161, 68, z)])}${polyline([P(163, 47, z), P(163, 65, z)])}`).join("")} />
    <path className={s.soft} d={poly([P(151, 68, 3), P(157, 68, 3), P(157, 68, 9), P(151, 68, 9)])} />
    <path className={s.line} d={polyline([P(133, 41, 71), P(133, 41, 78)])} />
    <circle className={s.accentFill} cx={beacon[0]} cy={beacon[1] - 8} r="2.2" />
    <circle className={cx(s.accentLine, s.pulse)} cx={beacon[0]} cy={beacon[1] - 8} r="2.2" style={delay(-0.6)} />
  </g>;
}

function HubClinic({ P }: { P: Projector }) {
  const at = (x: number, z: number) => P(x, 109, z);
  return <g>
    <Block P={P} x={236} y={86} w={48} d={48} h={3} tone="pad" />
    <Block P={P} x={240} y={92} z={3} w={40} d={36} h={22} />
    {[[97, 105], [113, 121]].map(([y0, y1]) => <path key={y0} className={s.glass} d={poly([P(280, y0, 10), P(280, y1, 10), P(280, y1, 18), P(280, y0, 18)])} />)}
    {[[243, 250], [272, 278]].map(([x0, x1]) => <path key={x0} className={s.glass} d={poly([P(x0, 128, 10), P(x1, 128, 10), P(x1, 128, 18), P(x0, 128, 18)])} />)}
    <path className={s.glass} d={poly([P(255, 128, 3), P(267, 128, 3), P(267, 128, 13), P(255, 128, 13)])} />
    <Block P={P} x={252} y={128} z={13} w={18} d={6} h={2} />
    {/* Roof sign with the cross. */}
    <Block P={P} x={252} y={106} z={25} w={16} d={3} h={16} />
    <path className={s.accentLine} style={{ strokeWidth: 2.6, strokeLinecap: "butt" }} d={`${polyline([at(255, 33), at(265, 33)])}${polyline([at(260, 28), at(260, 38)])}`} />
  </g>;
}

function HubStore({ P }: { P: Projector }) {
  const awning = (x0: number, x1: number) => poly([P(x0, 250, 18), P(x1, 250, 18), P(x1, 258, 12), P(x0, 258, 12)]);
  return <g>
    <Block P={P} x={214} y={214} w={48} d={48} h={3} tone="pad" />
    <Block P={P} x={218} y={220} z={3} w={32} d={30} h={22} />
    <path className={s.tintMuted} d={poly([P(218, 250, 20), P(250, 250, 20), P(250, 250, 25), P(218, 250, 25)])} />
    <path className={s.glass} d={poly([P(222, 250, 4), P(239, 250, 4), P(239, 250, 11), P(222, 250, 11)])} />
    <path className={s.soft} d={poly([P(242, 250, 3), P(248, 250, 3), P(248, 250, 12), P(242, 250, 12)])} />
    <path className={s.paper} d={awning(220, 248)} />
    {[0, 2].map((k) => <path key={k} className={s.accentFill} d={awning(220 + k * 7, 227 + k * 7)} />)}
    <path className={s.line} style={{ strokeWidth: 1 }} d={awning(220, 248)} />
    <Block P={P} x={252} y={243} z={3} w={9} d={9} h={7} tone="tint" />
    <Block P={P} x={253.5} y={244.5} z={10} w={6} d={6} h={5} />
  </g>;
}

function HubClassroom({ P }: { P: Projector }) {
  const walls = box(P, 90, 244, 3, 38, 30, 16);
  return <g>
    <Block P={P} x={86} y={236} w={48} d={48} h={3} tone="pad" />
    <path className={s.surface} d={walls.left} />
    <path className={s.soft} d={walls.right} />
    <path className={s.soft} d={poly([P(128, 244, 19), P(128, 259, 30), P(128, 274, 19)])} />
    <path className={s.soft} d={poly([P(88, 243, 19), P(130, 243, 19), P(130, 259, 30), P(88, 259, 30)])} />
    <path className={s.paper} d={poly([P(88, 259, 30), P(130, 259, 30), P(130, 275, 19), P(88, 275, 19)])} />
    {[[93, 100], [103, 110]].map(([x0, x1]) => <path key={x0} className={s.glass} d={poly([P(x0, 274, 8), P(x1, 274, 8), P(x1, 274, 14), P(x0, 274, 14)])} />)}
    <path className={s.soft} d={poly([P(115, 274, 3), P(122, 274, 3), P(122, 274, 13), P(115, 274, 13)])} />
    <path className={s.line} d={polyline([P(132, 280, 3), P(132, 280, 42)])} />
    <path className={s.accentFill} d={poly([P(132, 280, 42), P(143, 280, 38.5), P(132, 280, 35)])} />
  </g>;
}

function HubCore({ P }: { P: Projector }) {
  const face = (x: number, z: number) => P(x, 190, z);
  const chip = (a: number, b: number) => poly([P(a, a, 63), P(b, a, 63), P(b, b, 63), P(a, b, 63)]);
  const lamp = P(182, 138, 63);
  const faceText = (text: string, z: number, className: string) => {
    const [x, y] = face(137, z);
    return <text className={className} x={r1(x)} y={r1(y)} transform={`rotate(30 ${r1(x)} ${r1(y)})`}>{text}</text>;
  };
  return <g>
    <Block P={P} x={130} y={130} z={0} w={60} d={60} h={19} />
    <path className={s.line} d={[8, 13].map((z) => polyline([P(190, 140, z), P(190, 150 + z, z)])).join("")} />
    <Block P={P} x={152} y={152} z={19} w={16} d={16} h={6} tone="slot" />
    <Block P={P} x={130} y={130} z={25} w={60} d={60} h={16} tone="tint" />
    <path className={s.accentLine} style={{ strokeWidth: 1.1 }} d={[140, 152, 164].map((y) => polyline([P(190, y, 30), P(190, y + 5, 33), P(190, y, 36)])).join("")} />
    <Block P={P} x={152} y={152} z={41} w={16} d={16} h={6} tone="slot" />
    <Block P={P} x={130} y={130} z={47} w={60} d={60} h={16} tone="machine" />
    <path className={s.whiteLine} d={chip(146, 174)} />
    <path className={s.whiteLine} d={[152, 160, 168].map((k) => `${polyline([P(k, 146, 63), P(k, 140, 63)])}${polyline([P(174, k, 63), P(180, k, 63)])}`).join("")} />
    <path className={s.whiteLine} d={poly([P(154, 154, 63), P(166, 154, 63), P(166, 166, 63), P(154, 166, 63)])} />
    <path className={s.whiteLine} d={[140, 150, 160].map((y) => polyline([P(190, y, 55), P(190, y + 14, 55)])).join("")} />
    <circle className={s.lamp} cx={lamp[0]} cy={lamp[1]} r="2.4" />
    <circle className={cx(s.lamp, s.pulse)} cx={lamp[0]} cy={lamp[1]} r="2.4" />
    {faceText("ERP", 8, s.microInk)}
    {faceText("AUTOMATION", 30, s.microInk)}
    {faceText("AI", 52, s.whiteText)}
  </g>;
}

export function HubArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifh");
  const P = projector(320, 118);
  const floor = box(P, 0, 0, -12, 320, 320, 12);
  const core = P(HUB_CORE[0], HUB_CORE[1]);
  const coreTop = P(HUB_CORE[0], HUB_CORE[1], 63);
  const routes = HUB_NODES.map((n) => polyline([P(...hubAt(n)), P(HUB_CORE[0], HUB_CORE[1])]));
  const outbound = HUB_NODES.map((n) => polyline([P(HUB_CORE[0], HUB_CORE[1]), P(...hubAt(n))]));
  const junctions = HUB_NODES.flatMap((n) => [P(...spokePoint(n, 29)), P(...spokePoint(n, -35))]);
  const node = (k: number) => shifted(P, HUB_NODES[k].shift[0], HUB_NODES[k].shift[1]);
  // A decision token: a small square lying on the floor.
  const glyph = poly([[-6.1, 0], [0, -3.5], [6.1, 0], [0, 3.5]]);
  const labels: { n: string; name: string; sub: string; x: number; y: number; end?: boolean; leader: string }[] = [
    { n: "01", name: "MANUFACTURING", sub: "SHOP FLOOR · GST", x: 56, y: 168, leader: "M198 192 172 168H56" },
    { n: "02", name: "REAL ESTATE", sub: "LEADS · SITE VISITS", x: 584, y: 168, end: true, leader: "M444 192 470 168H584" },
    { n: "03", name: "HEALTHCARE", sub: "SLOTS · QUEUES", x: 590, y: 376, end: true, leader: "M462 334 478 376H590" },
    { n: "04", name: "ECOMMERCE", sub: "ORDERS · REPEAT", x: 404, y: 440, leader: "M326 396 384 440H500" },
    { n: "05", name: "EDTECH", sub: "BATCHES · FEES", x: 50, y: 376, leader: "M178 334 162 376H50" },
  ];

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 520" compactViewBox="20 84 600 375">
      <DotGrid id={id} x={36} y={56} width={568} height={412} />
      <Frame top="INDUSTRIES / ONE OPERATING SYSTEM" tag="5 SECTORS" bottom="FIVE SECTORS. ONE SYSTEM UNDERNEATH." height={520} tagX={506} />

      {/* The plate: floor with a shallow edge, a drafting grid and the orbit the sectors sit on. */}
      <g>
        <path className={s.soft} d={floor.left} />
        <path className={s.soft} d={floor.right} />
        <path className={s.paper} d={floor.top} />
        <path className={s.guide} d={[1, 2, 3, 4, 5, 6, 7].map((k) => `${polyline([P(k * 40, 0), P(k * 40, 320)])}${polyline([P(0, k * 40), P(320, k * 40)])}`).join("")} />
        <path className={cx(s.guide, s.dashed)} d={poly([P(12, 12), P(308, 12), P(308, 308), P(12, 308)])} />
        <ellipse className={cx(s.thin)} strokeDasharray="1 5" cx={core[0]} cy={core[1]} rx="136" ry="78.5" />
      </g>

      {/* Signals travel in along each spoke; decisions ride back out, under the buildings. */}
      <g>
        <path className={s.route} d={routes.join("")} />
        {routes.map((d, k) => <path key={d} className={cx(s.flow, s.flowShort)} d={d} style={delay(-k * 0.7)} />)}
        {junctions.map(([x, y], k) => <circle key={k} className={s.accentDot} cx={r1(x)} cy={r1(y)} r="3" />)}
      </g>
      {outbound.map((d, k) => <g key={d} className={s.traveler} style={{ offsetPath: `path("${d}")`, ...delay(1.4 + k * 1.15) }}><path className={s.accentFill} d={glyph} /></g>)}

      {/* Sectors, back to front. */}
      <HubTowers P={node(1)} />
      <HubFactory P={node(0)} />
      <HubClinic P={node(2)} />
      <HubCore P={P} />
      <HubClassroom P={node(4)} />
      <HubStore P={node(3)} />

      {/* The core's tag, like the home hero's INTELLIGENCE label. */}
      <path className={s.accentLine} d={`M${r1(coreTop[0])} ${r1(coreTop[1]) - 6}V112`} strokeDasharray="2 4" />
      <rect className={s.paper} x="248" y="90" width="144" height="22" rx="3" />
      <text className={s.key} x="320" y="104" textAnchor="middle">OPERATING SYSTEM</text>

      {/* Leaders + labels. */}
      {labels.map((l) => <g key={l.n}>
        <path className={s.guide} d={l.leader} />
        <text className={s.microAccent} x={l.x} y={l.y - 20} textAnchor={l.end ? "end" : "start"}>{l.n} · {l.sub}</text>
        <text className={s.key} x={l.x} y={l.y - 7} textAnchor={l.end ? "end" : "start"}>{l.name}</text>
      </g>)}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Scene kit — isometric plates, buildings, vehicles, software panels and
   the stage-highlight contract
   ══════════════════════════════════════════════════════════════════════ */

/** The floor plate every industry scene stands on. */
function Plate3D({ P, w, d, t = 10, step = 40 }: { P: Projector; w: number; d: number; t?: number; step?: number }) {
  const floor = box(P, 0, 0, -t, w, d, t);
  const xs = Array.from({ length: Math.floor((w - 1) / step) }, (_, k) => (k + 1) * step);
  const ys = Array.from({ length: Math.floor((d - 1) / step) }, (_, k) => (k + 1) * step);
  return <g>
    <path className={s.soft} d={floor.left} />
    <path className={s.soft} d={floor.right} />
    <path className={s.paper} d={floor.top} />
    <path className={s.guide} d={[...xs.map((x) => polyline([P(x, 0), P(x, d)])), ...ys.map((y) => polyline([P(0, y), P(w, y)]))].join("")} />
    <path className={cx(s.guide, s.dashed)} d={poly([P(8, 8), P(w - 8, 8), P(w - 8, d - 8), P(8, d - 8)])} />
  </g>;
}

/** Walls + a gable roof whose ridge runs along x. */
function GableX({ P, x, y, w, d, h, rh, tone = "paper" }: { P: Projector; x: number; y: number; w: number; d: number; h: number; rh: number; tone?: "paper" | "tint" }) {
  const m = y + d / 2;
  return <g>
    <path className={s.soft} d={poly([P(x, y, h), P(x + w, y, h), P(x + w, m, h + rh), P(x, m, h + rh)])} />
    <path className={s.surface} d={qL(P, y + d, x, x + w, 0, h)} />
    <path className={s.soft} d={poly([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, m, h + rh), P(x + w, y, h)])} />
    <path className={tone === "tint" ? s.tintMuted : s.paper} d={poly([P(x, m, h + rh), P(x + w, m, h + rh), P(x + w, y + d, h), P(x, y + d, h)])} />
  </g>;
}

/** A vertical cylinder standing at (x, y). */
function Cyl({ P, x, y, z = 0, r, h, className }: { P: Projector; x: number; y: number; z?: number; r: number; h: number; className?: string }) {
  const [cxb, cyb] = P(x, y, z);
  const [, cyt] = P(x, y, z + h);
  const k = (P(1, 0)[0] - P(0, 0)[0]) / COS30;
  const rx = r * 1.2247 * k;
  const ry = r * 0.7071 * k;
  return <g>
    <path className={className ?? s.surface} d={`M${r1(cxb - rx)} ${r1(cyt)}V${r1(cyb)}A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cxb + rx)} ${r1(cyb)}V${r1(cyt)}Z`} />
    <ellipse className={s.paper} cx={r1(cxb)} cy={r1(cyt)} rx={r1(rx)} ry={r1(ry)} />
  </g>;
}

/** A residential tower: a block with a window grid on both visible faces; one unit may be lit. */
function Tower({ P, x, y, w, d, h, floors, cols = 3, lit }: { P: Projector; x: number; y: number; w: number; d: number; h: number; floors: number; cols?: number; lit?: { face: "l" | "r"; floor: number; col: number } }) {
  const fh = h / floors;
  const parts: string[] = [];
  let litPath = "";
  for (let f = 0; f < floors; f++) {
    const z0 = f * fh + fh * 0.3;
    const z1 = f * fh + fh * 0.78;
    for (let c = 0; c < cols; c++) {
      const u0 = (c + 0.22) / cols;
      const u1 = (c + 0.78) / cols;
      const l = qL(P, y + d, x + w * u0, x + w * u1, z0, z1);
      const r = qR(P, x + w, y + d * u0, y + d * u1, z0, z1);
      if (lit && lit.floor === f && lit.col === c && lit.face === "l") litPath = l; else parts.push(l);
      if (lit && lit.floor === f && lit.col === c && lit.face === "r") litPath = r; else parts.push(r);
    }
  }
  return <g>
    <Block P={P} x={x} y={y} w={w} d={d} h={h} />
    <path className={s.glass} d={parts.join("")} />
    {litPath && <><path className={s.accentFill} d={litPath} /><path className={cx(s.accentLine, s.ping)} d={litPath} /></>}
  </g>;
}
/** Where a tower's lit unit sits (the centre of that window), for leaders and routes. */
function towerUnit(P: Projector, x: number, y: number, w: number, d: number, h: number, floors: number, cols: number, lit: { face: "l" | "r"; floor: number; col: number }) {
  const fh = h / floors;
  const z = lit.floor * fh + fh * 0.54;
  const u = (lit.col + 0.5) / cols;
  return lit.face === "l" ? P(x + w * u, y + d, z) : P(x + w, y + d * u, z);
}

/** A tower under construction: slabs on columns, rebar on the top slab. */
function Skeleton({ P, x, y, w, d, h, floors }: { P: Projector; x: number; y: number; w: number; d: number; h: number; floors: number }) {
  const fh = h / floors;
  const cols = [[x, y + d], [x + w, y + d], [x + w, y], [x + w / 2, y + d], [x + w, y + d / 2]] as const;
  return <g>
    <path className={s.line} d={cols.map(([cxp, cyp]) => polyline([P(cxp, cyp, 0), P(cxp, cyp, h)])).join("")} />
    {Array.from({ length: floors + 1 }, (_, f) => <Block key={f} P={P} x={x} y={y} z={f * fh} w={w} d={d} h={1.4} tone="surface" />)}
    <path className={s.accentLine} style={{ strokeWidth: 1 }} d={[0.2, 0.5, 0.8].map((u) => polyline([P(x + w * u, y + d * 0.5, h + 1.4), P(x + w * u, y + d * 0.5, h + 7)])).join("")} />
  </g>;
}

/** A tower crane: lattice mast, jib along +x, hook with a swinging load. */
function Crane({ P, x, y, h, jib, back = 18, hook }: { P: Projector; x: number; y: number; h: number; jib: number; back?: number; hook: number }) {
  const steps = Math.floor(h / 8);
  return <g>
    <path className={s.line} d={`${polyline([P(x, y, 0), P(x, y, h)])}${polyline([P(x + 3, y, 0), P(x + 3, y, h)])}`} />
    <path className={s.guide} d={Array.from({ length: steps }, (_, k) => polyline([P(x, y, k * 8), P(x + 3, y, k * 8 + 8)])).join("")} />
    <path className={s.line} d={`${polyline([P(x - back, y, h), P(x + jib, y, h)])}${polyline([P(x - back, y, h - 3), P(x + jib, y, h - 3)])}${polyline([P(x + 1.5, y, h + 8), P(x + jib, y, h)])}${polyline([P(x + 1.5, y, h + 8), P(x - back, y, h)])}`} />
    <path className={s.soft} d={qL(P, y, x - back, x - back + 8, h - 8, h - 3)} />
    <g className={s.bob}>
      <path className={s.line} d={polyline([P(hook, y, h - 3), P(hook, y, h - 34)])} />
      <Block P={P} x={hook - 3} y={y - 2.5} z={h - 40} w={6} d={5} h={6} tone="tint" />
    </g>
  </g>;
}

/** A truck or van heading +x: body, cab and wheels. */
function Truck({ P, x, y, z = 0, len, wid, h, cab, cabH, wheel = 4 }: { P: Projector; x: number; y: number; z?: number; len: number; wid: number; h: number; cab: number; cabH: number; wheel?: number }) {
  const inset = wid > 14 ? 2 : 1;
  return <g>
    <Block P={P} x={x} y={y} z={z} w={len} d={wid} h={h} />
    <path className={s.accentLine} d={polyline([P(x + 5, y + wid, z + h * 0.62), P(x + len - 5, y + wid, z + h * 0.62)])} />
    <path className={s.line} d={polyline([P(x + 5, y + wid, z + h * 0.42), P(x + len * 0.55, y + wid, z + h * 0.42)])} />
    <Block P={P} x={x + len} y={y + inset} z={z} w={cab} d={wid - inset * 2} h={cabH} />
    <path className={s.glass} d={qR(P, x + len + cab, y + inset + 2, y + wid - inset - 2, z + cabH * 0.45, z + cabH * 0.85)} />
    <path className={s.glass} d={qL(P, y + wid - inset, x + len + 2, x + len + cab - 2, z + cabH * 0.45, z + cabH * 0.85)} />
    <path className={s.wheel} d={[x + 7, x + len - 6, x + len + cab - 4].map((wx) => ring(P, "y", [wx, y + wid + 0.6, z + wheel], wheel, 16)).join("")} />
  </g>;
}

/** A small car heading +x. */
function Car({ P, x, y }: { P: Projector; x: number; y: number }) {
  return <g>
    <Block P={P} x={x} y={y} z={2} w={18} d={8} h={5} />
    <Block P={P} x={x + 5} y={y + 1} z={7} w={8} d={6} h={4} tone="glass" />
    <path className={s.wheel} d={[x + 4, x + 14].map((wx) => ring(P, "y", [wx, y + 8.6, 2.4], 2.4, 12)).join("")} />
  </g>;
}

/** A low glass partition on the plane x = at (cut-away interiors). */
function LowWallX({ P, at, y0, y1, h = 10 }: { P: Projector; at: number; y0: number; y1: number; h?: number }) {
  return <path className={s.glass} d={qR(P, at, y0, y1, 0, h)} />;
}

/** A dark display board on the plane y = at (token boards, signage). */
function Board({ P, at, x0, x1, z0, z1, children }: { P: Projector; at: number; x0: number; x1: number; z0: number; z1: number; children?: ReactNode }) {
  return <g>
    <path className={s.display} d={qL(P, at, x0, x1, z0, z1)} />
    {children}
  </g>;
}

/**
 * Stage-highlight contract (see workflows.ts). Every stage id of an industry is
 * one or more <g data-stage> regions. An ancestor with data-active-stage="<id>"
 * lights its region (accent outlines, halo, animated connector) and dims the
 * rest; the CSS enumerates every id.
 */
function Stage({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return <g className={cx(s.stage, className)} data-stage={id}>{children}</g>;
}
/** Floor halo under a stage's footprint; invisible until the stage is active. */
function Halo({ d }: { d: string }) {
  return <g className={s.halo} aria-hidden="true"><path className={s.haloFill} d={d} /><path className={s.haloPulse} d={d} /></g>;
}
const footprint = (P: Projector, x: number, y: number, w: number, d: number, pad = 7) => qT(P, 0.5, x - pad, y - pad, x + w + pad, y + d + pad);
const rectPath = (x: number, y: number, w: number, h: number, pad = 5) => `M${x - pad} ${y - pad}H${x + w + pad}V${y + h + pad}H${x - pad}Z`;
/** A stage's incoming connector: a dashed route, a slow ambient flow and a fast flow shown while active. */
function Link({ d, ambient = true, delaySec = 0, fast = false }: { d: string; ambient?: boolean; delaySec?: number; fast?: boolean }) {
  return <g>
    <path className={s.route} d={d} />
    {ambient && <path className={cx(s.flow, s.ambient, fast && s.flowFast)} d={d} style={delay(delaySec)} />}
    <path className={s.link} d={d} />
  </g>;
}
/** A floor path inside a scene: a dashed route with a slow ambient flow (no fast state). */
function FloorPath({ d, delaySec = 0 }: { d: string; delaySec?: number }) {
  return <g>
    <path className={s.route} d={d} />
    <path className={cx(s.flow, s.flowFast, s.ambient)} d={d} style={delay(delaySec)} />
  </g>;
}

/** Numbered stage tag: a badge, an optional leader and a name. */
function Tag({ n, name, x, y, anchor = "start", leader, className }: { n: string; name: string; x: number; y: number; anchor?: "start" | "end" | "middle"; leader?: string; className?: string }) {
  const tx = anchor === "start" ? x + 12 : anchor === "end" ? x - 12 : x;
  const ty = anchor === "middle" ? y + 19.5 : y + 3;
  return <g className={cx(s.tag, className)}>
    {leader && <path className={s.leader} d={leader} />}
    <g className={s.badge}>
      <circle className={s.badgeDisc} cx={r1(x)} cy={r1(y)} r="7.5" />
      <text className={s.badgeNum} x={r1(x)} y={r1(y + 2.5)} textAnchor="middle">{n}</text>
    </g>
    <text className={cx(s.key, s.tagName)} x={r1(tx)} y={r1(ty)} textAnchor={anchor}>{name}</text>
  </g>;
}
/** A tag standing on a floor point, with a leader from another floor point. */
function FloorTag({ P, n, name, at, from, anchor = "middle" }: { P: Projector; n: string; name: string; at: [number, number]; from?: [number, number]; anchor?: "start" | "end" | "middle" }) {
  const [x, y] = P(at[0], at[1]);
  return <Tag n={n} name={name} x={x} y={y} anchor={anchor} leader={from ? polyline([P(from[0], from[1]), P(at[0] + (from[0] - at[0]) * 0.22, at[1] + (from[1] - at[1]) * 0.22)]) : undefined} />;
}

/** A flat software panel floating over the scene. */
function Panel({ x, y, w, h, n, title, code, children }: { x: number; y: number; w: number; h: number; n: string; title: string; code?: string; children?: ReactNode }) {
  return <g>
    <Halo d={rectPath(x, y, w, h)} />
    <rect className={s.panel} x={x} y={y} width={w} height={h} />
    <rect className={s.panelHead} x={x} y={y} width={w} height="18" />
    <g className={s.badge}>
      <circle className={s.badgeDisc} cx={x + 11} cy={y + 9} r="6" />
      <text className={s.badgeNum} x={x + 11} y={y + 11.4} textAnchor="middle" style={{ fontSize: "6.5px" }}>{n}</text>
    </g>
    <text className={cx(s.key, s.panelTitle)} x={x + 22} y={y + 12}>{title}</text>
    {code && <text className={s.micro} x={x + w - 7} y={y + 12} textAnchor="end">{code}</text>}
    {children}
  </g>;
}

/** Label / value rows inside a panel, with hairlines between them. */
function Rows({ x, y, w, rows, gap = 13 }: { x: number; y: number; w: number; rows: [label: string, value: string, accent?: boolean][]; gap?: number }) {
  return <g>
    {rows.map(([label, value, accent], k) => {
      const yy = y + k * gap;
      return <g key={label}>
        {k > 0 && <path className={s.guide} d={`M${x} ${r1(yy - gap / 2 - 2.5)}H${x + w}`} />}
        <text className={s.micro} x={x} y={yy}>{label}</text>
        <text className={accent ? s.microAccent : s.microInk} x={x + w} y={yy} textAnchor="end">{value}</text>
      </g>;
    })}
  </g>;
}

/** A chat bubble (WhatsApp-style) with a couple of text lines and delivery ticks. */
function Bubble({ x, y, w, h = 20, out = true, lines, text, ticks = out, className }: { x: number; y: number; w: number; h?: number; out?: boolean; lines?: number[]; text?: string; ticks?: boolean; className?: string }) {
  return <g className={className}>
    <rect className={out ? s.tint : s.surface} x={x} y={y} width={w} height={h} rx="4" />
    {text && <text className={out ? s.microAccent : s.microInk} x={x + 7} y={y + h / 2 + 2.5}>{text}</text>}
    {!text && lines && <path className={out ? s.accentLine : s.line} style={{ strokeWidth: 1 }} d={lines.map((len, k) => `M${x + 7} ${r1(y + 7 + k * 6)}h${len}`).join("")} />}
    {ticks && <path className={s.accentLine} style={{ strokeWidth: 1 }} d={`m${x + w - 14} ${y + h - 6} 2 2 4-4m1 2 2 2 4-4`} />}
  </g>;
}

/** A small filled chip with white text (status stamps). */
function Chip({ x, y, w, text, accent = true }: { x: number; y: number; w: number; text: string; accent?: boolean }) {
  return <g>
    <rect className={accent ? s.accentFill : s.soft} x={x} y={y} width={w} height="12" />
    <text className={accent ? s.whiteText : s.microInk} x={x + w / 2} y={y + 8.6} textAnchor="middle" style={{ letterSpacing: ".06em" }}>{text}</text>
  </g>;
}

/** Stage numbers come from INDUSTRY_WORKFLOWS so the figure and the simulator always agree. */
function stageNumbers(industry: IndustryKey) {
  const out: Record<string, string> = {};
  INDUSTRY_WORKFLOWS[industry].stages.forEach((stage, k) => { out[stage.id] = String(k + 1).padStart(2, "0"); });
  return out;
}

const QR = [1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1];
function QrCode({ x, y, cell = 5 }: { x: number; y: number; cell?: number }) {
  return <g>{QR.map((on, k) => on ? <rect key={k} className={s.qr} x={x + (k % 4) * (cell + 1)} y={y + Math.floor(k / 4) * (cell + 1)} width={cell} height={cell} /> : null)}</g>;
}

/* ══════════════════════════════════════════════════════════════════════
   MANUFACTURING — order → plan → material → production → QC → dispatch
   → e-invoice → daily P&L
   ══════════════════════════════════════════════════════════════════════ */
export function ManufacturingArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifm");
  const n = stageNumbers("manufacturing");
  const P = projector(246.5, 143, 1);
  const belt = (x0: number, x1: number) => polyline([P(x0, 76, 6.5), P(x1, 76, 6.5)]);
  const chart = [36, 33, 35, 29, 30, 24, 26, 18, 16, 11, 6];
  const chartPath = chart.map((v, k) => `${k ? "L" : "M"}${r1(470 + k * 11.4)} ${104 + v}`).join("");
  const teeth = [0, 1, 2, 3].map((i) => [60 + i * 40, 100 + i * 40] as const);
  const rmTap = P(38, 76, 44);
  const truckTop = P(284, 62, 27);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 60 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="MANUFACTURING / ORDER TO DISPATCH" tag="LIVE WIP" bottom="FROM THE SALES DESK TO THE LEDGER." height={480} tagX={506} />
      <Plate3D P={P} w={320} d={150} />

      {/* The production hall behind the line: a low north-light shed. */}
      <Stage id="production">
        <path className={s.surface} d={qL(P, 30, 60, 220, 0, 24)} />
        <path className={s.soft} d={qR(P, 220, 0, 30, 0, 24)} />
        {teeth.map(([x0, x1]) => <g key={x0}>
          <path className={s.paper} d={poly([P(x0, 0, 24), P(x1, 0, 34), P(x1, 30, 34), P(x0, 30, 24)])} />
          <path className={s.glass} d={qR(P, x1, 0, 30, 24, 34)} />
          <path className={s.surface} d={poly([P(x0, 30, 24), P(x1, 30, 34), P(x1, 30, 24)])} />
        </g>)}
        <path className={s.glass} d={[68, 92, 116, 140, 164, 188].map((x) => qL(P, 30, x, x + 14, 11, 18)).join("")} />
      </Stage>

      {/* 03 — raw-material godown; greige rolls wait by the line. */}
      <Stage id="material">
        <Halo d={footprint(P, 14, 46, 48, 60)} />
        <Link d={`M172 152H${r1(rmTap[0])}V${r1(rmTap[1] - 5)}`} delaySec={-2} fast />
        <GableX P={P} x={14} y={46} w={48} d={60} h={30} rh={14} />
        <path className={s.soft} d={qR(P, 62, 66, 84, 0, 20)} />
        <path className={s.line} d={[5, 10, 15].map((z) => polyline([P(62, 66, z), P(62, 84, z)])).join("")} />
        <path className={s.glass} d={`${qL(P, 106, 22, 32, 16, 22)}${qL(P, 106, 40, 50, 16, 22)}`} />
        <Cyl P={P} x={72} y={94} r={5.5} h={12} className={s.tintMuted} />
        <Cyl P={P} x={82} y={99} r={5.5} h={10} />
        <Tap x={rmTap[0]} y={rmTap[1] - 9} mast={8} />
        <FloorTag P={P} n={n.material} name="MATERIAL" at={[38, 128]} from={[38, 108]} />
      </Stage>

      {/* 04 — production: the conveyor, the dyeing machine and the press. */}
      <Stage id="production">
        <Halo d={footprint(P, 90, 56, 88, 40)} />
        <Block P={P} x={66} y={70} z={0} w={170} d={12} h={6} />
        <path className={s.guide} d={Array.from({ length: 16 }, (_, k) => polyline([P(72 + k * 10.5, 71, 6), P(72 + k * 10.5, 81, 6)])).join("")} />
        <path className={cx(s.goods, s.ambient)} d={belt(66, 236)} />
        <Link d={belt(96, 180)} delaySec={-1} fast />
        {/* M1 — dyeing machine with a sight glass and a control panel. */}
        <Block P={P} x={92} y={58} w={32} d={36} h={34} />
        <path className={s.glass} d={qL(P, 94, 98, 118, 10, 26)} />
        <path className={s.inkLine} d={polyline([P(108, 94, 25), P(108, 94, 16)])} />
        <path className={s.accentLine} d={polyline([P(108, 94, 15), P(108, 94, 12)])} />
        <path className={s.machineSlot} d={qR(P, 124, 64, 78, 18, 30)} />
        <path className={s.whiteLine} d={`${polyline([P(124, 66, 27), P(124, 74, 27)])}${polyline([P(124, 66, 24), P(124, 71, 24)])}`} />
        <circle className={cx(s.accentFill, s.blink)} cx={r1(P(124, 76, 21)[0])} cy={r1(P(124, 76, 21)[1])} r="1.8" />
        <Tap x={P(108, 76, 34)[0]} y={P(108, 76, 34)[1] - 10} mast={8} />
        {/* M2 — press: base, four columns, a moving platen and the head. */}
        <Block P={P} x={140} y={58} w={36} d={36} h={10} />
        <Block P={P} x={142} y={60} z={10} w={6} d={6} h={36} />
        <Block P={P} x={168} y={60} z={10} w={6} d={6} h={36} />
        <g className={s.press} style={cssVars({ "--stroke": "9px" })}>
          <Block P={P} x={148} y={66} z={30} w={20} d={20} h={8} tone="tint" />
        </g>
        <Block P={P} x={142} y={86} z={10} w={6} d={6} h={36} />
        <Block P={P} x={168} y={86} z={10} w={6} d={6} h={36} />
        <Block P={P} x={140} y={58} z={46} w={36} d={36} h={10} />
        <Tap x={P(158, 76, 56)[0]} y={P(158, 76, 56)[1] - 10} mast={8} />
        <FloorTag P={P} n={n.production} name="PRODUCTION" at={[134, 128]} from={[134, 96]} />
      </Stage>

      {/* 05 — quality gate: a light curtain over the belt. */}
      <Stage id="qc">
        <Halo d={footprint(P, 188, 58, 11, 36)} />
        <Link d={belt(180, 206)} delaySec={-3} fast />
        {[60, 86].map((y) => <Block key={y} P={P} x={190} y={y} w={7} d={6} h={32} />)}
        <path className={cx(s.tintFill, s.blink)} d={qR(P, 193.5, 66, 86, 12, 30)} />
        <path className={s.accentLine} strokeDasharray="1.5 3" d={[16, 21, 26].map((z) => polyline([P(193.5, 66, z), P(193.5, 86, z)])).join("")} />
        <Block P={P} x={188} y={58} z={32} w={11} d={36} h={5} />
        <circle className={s.accentFill} cx={r1(P(193.5, 76, 39)[0])} cy={r1(P(193.5, 76, 39)[1])} r="2.2" />
        <circle className={cx(s.accentLine, s.pulse)} cx={r1(P(193.5, 76, 39)[0])} cy={r1(P(193.5, 76, 39)[1])} r="2.2" />
        {[203, 215].map((x) => <Block key={x} P={P} x={x} y={72} z={6} w={7} d={8} h={7} />)}
        <FloorTag P={P} n={n.qc} name="QC" at={[193, 128]} from={[193, 94]} />
      </Stage>

      {/* 06 — finished-goods godown and the truck at its dock. */}
      <Stage id="dispatch">
        <Halo d={footprint(P, 210, 46, 104, 60)} />
        <Link d={belt(206, 232)} delaySec={-5} />
        <GableX P={P} x={210} y={46} w={48} d={60} h={28} rh={12} tone="tint" />
        <path className={s.soft} d={qR(P, 258, 64, 86, 0, 20)} />
        <path className={s.line} d={[5, 10, 15].map((z) => polyline([P(258, 64, z), P(258, 86, z)])).join("")} />
        <path className={s.glass} d={`${qL(P, 106, 218, 228, 15, 21)}${qL(P, 106, 236, 246, 15, 21)}`} />
        <Block P={P} x={258} y={62} w={8} d={26} h={4} tone="soft" />
        <Truck P={P} x={268} y={62} z={4} len={32} wid={24} h={22} cab={14} cabH={17} wheel={4.5} />
        <FloorTag P={P} n={n.dispatch} name="DISPATCH" at={[290, 128]} from={[290, 88]} />
      </Stage>

      {/* 01 — the sales order. */}
      <Stage id="order">
        <Panel x={48} y={60} w={124} h={58} n={n.order} title="SALES ORDER" code="SO-1042">
          <text className={s.micro} x="56" y="87">QUANTITY</text>
          <text className={s.microInk} x="164" y="87" textAnchor="end">1,200 M</text>
          <path className={s.bar} style={{ strokeWidth: 3.4, strokeLinecap: "butt" }} d="M56 97H92" />
          <path className={s.barAccent} style={{ strokeWidth: 3.4, strokeLinecap: "butt" }} d="M94 97H164" />
          <text className={s.micro} x="56" y="111">IN STOCK 400</text>
          <text className={s.microAccent} x="164" y="111" textAnchor="end">TO MAKE 800</text>
        </Panel>
      </Stage>

      {/* 02 — production plan: the work order lands on Thursday, line 2. */}
      <Stage id="plan">
        <Link d="M110 118V126" ambient={false} />
        <Panel x={48} y={126} w={124} h={58} n={n.plan} title="PLAN" code="WO-0318">
          {["M", "T", "W", "T", "F", "S"].map((d, k) => <text key={k} className={k === 3 ? s.microAccent : s.micro} x={r1(63 + k * 18.6)} y="150" textAnchor="middle">{d}</text>)}
          <path className={cx(s.guide, s.dashed)} d="M56 158H164M56 167H164M56 176H164" />
          <path className={s.barSoft} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M56 158H90M98 167H118M56 176H78M132 176H160" />
          <path className={s.bar} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M94 158H118" />
          <path className={s.barAccent} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M110 167H150" />
        </Panel>
      </Stage>

      {/* 08 — the founder's daily P&L. */}
      <Stage id="dashboard">
        <Link d="M527 162V152" ambient={false} />
        <Panel x={462} y={60} w={130} h={92} n={n.dashboard} title={"P&L · TODAY"} code="LIVE">
          <text className={s.figureNum} x="470" y="100">18.4%</text>
          <text className={s.micro} x="584" y="98" textAnchor="end">MARGIN</text>
          <path className={cx(s.guide, s.dashed)} d="M470 116H584M470 128H584" />
          <path className={s.guide} d="M470 142H584" />
          <path className={s.area} d={`${chartPath}L584 142H470Z`} />
          <path className={cx(s.accentLine, s.draw)} d={chartPath} pathLength={1} style={{ strokeWidth: 1.6 }} />
          <circle className={s.accentDot} cx="584" cy="110" r="2.8" />
          <circle className={cx(s.accentLine, s.pulse)} cx="584" cy="110" r="2.8" />
        </Panel>
      </Stage>

      {/* 07 — e-invoice + e-way bill, generated from the dispatch data. */}
      <Stage id="invoice">
        <Link d={`M${pt(truckTop)}V246H480V226`} delaySec={-4} fast />
        <Panel x={462} y={162} w={130} h={64} n={n.invoice} title="E-INVOICE" code="GST">
          <QrCode x={470} y={187} />
          <text className={s.micro} x="500" y="194">IRN</text>
          <text className={s.micro} x="500" y="208">E-WAY BILL</text>
          <path className={s.guide} d="M500 198H572M500 212H572" />
          <Check x={582} y={191} r={4} />
          <Check x={582} y={205} r={4} />
        </Panel>
      </Stage>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   REAL ESTATE — capture → score → respond → site visit → offer → booking
   → allotment, on a project site
   ══════════════════════════════════════════════════════════════════════ */
const SOURCE_GLYPHS = [
  "M-5-4h10v8h-10ZM-5-1.5h10M-3.5-2.8h.1M-2-2.8h.1",
  "M-5-4h10v6.5h-5.5l-3 2.5v-2.5h-1.5Z",
  "M-4 4.5c0-3.8 8-3.8 8 0M0 0.3a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2",
];
const UNITS = ["ssass", "sasss", "ssssa", "asAss", "sassa", "ssass"]; // s sold · a available · A the unit
const TOWER_A = { x: 150, y: 25, w: 45, d: 45, h: 84, floors: 14, cols: 3, lit: { face: "r" as const, floor: 11, col: 1 } };

export function RealEstateArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifr");
  const n = stageNumbers("real-estate");
  const P = projector(272, 145, 1);
  const unit = towerUnit(P, TOWER_A.x, TOWER_A.y, TOWER_A.w, TOWER_A.d, TOWER_A.h, TOWER_A.floors, TOWER_A.cols, TOWER_A.lit);
  const door = P(72, 148);
  const roadFrom = P(100, 159);
  const roadTo = P(262, 159);
  const sources: [string, string, boolean][] = [["PORTAL", "9:42 PM", true], ["WHATSAPP", "2 NEW", false], ["WALK-IN", "1 TODAY", false]];

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 60 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="REAL ESTATE / LEAD TO ALLOTMENT" tag="SITE VISITS" bottom="EVERY LEAD SCORED. EVERY VISIT BOOKED." height={480} tagX={498} />
      <Plate3D P={P} w={280} d={170} />

      {/* The approach road along the front of the site, with a visitor's car. */}
      <path className={s.road} d={qT(P, 0.3, 0, 152, 280, 166)} />
      <path className={cx(s.guide, s.dashed)} d={polyline([P(4, 159), P(276, 159)])} />
      <g className={cx(s.drive, s.ambient)} style={cssVars({ "--drive": "35px", "--drive-y": "20px", animationDuration: "9s" })}>
        <Car P={P} x={36} y={155} />
      </g>

      {/* The project: a finished tower, one under construction, and the crane. */}
      <Stage id="handover">
        <Halo d={footprint(P, 150, 25, 45, 45)} />
        <Link d={`M462 156H434V${r1(unit[1])}H${r1(unit[0] + 4)}`} delaySec={-2} fast />
        <Crane P={P} x={140} y={12} h={108} jib={72} hook={182} />
        <Tower P={P} {...TOWER_A} />
        <path className={s.soft} d={qL(P, 70, 168, 178, 0, 9)} />
        <Tag n={n.handover} name="ALLOTMENT" x={448} y={212} leader={`M${r1(unit[0] + 6)} ${r1(unit[1] + 4)}L440 208`} />
      </Stage>
      <Skeleton P={P} x={212} y={40} w={40} d={40} h={49} floors={7} />
      {/* The walk from the gallery to the tower. */}
      <path className={cx(s.guide, s.dashed)} d={polyline([P(100, 118), P(172, 118), P(172, 74)])} />

      {/* 04 — the sales gallery on the road, where the visit happens. */}
      <Stage id="visit">
        <Halo d={footprint(P, 30, 96, 60, 50)} />
        <Link d={`M198 336H${r1(door[0])}V${r1(door[1] - 4)}`} delaySec={-1} fast />
        <Block P={P} x={30} y={96} w={60} d={50} h={22} />
        <path className={s.glass} d={qL(P, 146, 36, 84, 4, 18)} />
        <path className={s.line} d={[52, 68].map((x) => polyline([P(x, 146, 4), P(x, 146, 18)])).join("")} />
        <path className={s.soft} d={qR(P, 90, 112, 124, 0, 16)} />
        <path className={s.paper} d={poly([P(30, 146, 20), P(90, 146, 20), P(90, 154, 15), P(30, 154, 15)])} />
        <path className={s.accentFill} d={`${poly([P(36, 146, 20), P(44, 146, 20), P(44, 154, 15), P(36, 154, 15)])}${poly([P(60, 146, 20), P(68, 146, 20), P(68, 154, 15), P(60, 154, 15)])}`} />
        <Block P={P} x={40} y={100} z={22} w={40} d={4} h={9} tone="surface" />
        <path className={s.accentLine} d={polyline([P(46, 104, 26.5), P(74, 104, 26.5)])} />
        <Standing P={P} fx={101} fy={118} accent />
        <Standing P={P} fx={112} fy={127} />
        <FloorTag P={P} n={n.visit} name="SITE VISIT" at={[20, 140]} from={[30, 121]} anchor="end" />
      </Stage>

      {/* 01 — every source in one list. */}
      <Stage id="capture">
        <Panel x={48} y={60} w={124} h={60} n={n.capture} title="LEADS · ONE LIST" code="LD-2291">
          {sources.map(([name, meta, hot], k) => {
            const y = 91 + k * 12;
            return <g key={name}>
              <path className={s.line} style={{ strokeWidth: 1 }} d={SOURCE_GLYPHS[k]} transform={`translate(62 ${y - 2.5})`} />
              <text className={hot ? s.microInk : s.micro} x="72" y={y}>{name}</text>
              <text className={hot ? s.microAccent : s.micro} x="164" y={y} textAnchor="end">{meta}</text>
              {hot && <circle className={cx(s.accentFill, s.blink)} cx="117" cy={y - 2.5} r="1.6" />}
            </g>;
          })}
        </Panel>
      </Stage>

      {/* 02 — scored before anyone calls. */}
      <Stage id="score">
        <Link d="M110 120V130" ambient={false} />
        <Panel x={48} y={130} w={124} h={52} n={n.score} title="LEAD SCORE" code="82 / 100">
          <path className={s.barSoft} style={{ strokeWidth: 4, strokeLinecap: "butt" }} d="M56 159H164" />
          <path className={s.barAccent} style={{ strokeWidth: 4, strokeLinecap: "butt" }} d="M56 159H144.6" />
          <path className={s.guide} d="M110 155V163M137 155V163" />
          <text className={s.micro} x="56" y="175">BUDGET ✓ · 3 MONTHS</text>
          <text className={s.microAccent} x="164" y="175" textAnchor="end">SENIOR RM</text>
        </Panel>
      </Stage>

      {/* 03 — a reply in minutes, on WhatsApp. */}
      <Stage id="respond">
        <Link d="M110 182V300" delaySec={-3} />
        <Panel x={48} y={300} w={150} h={74} n={n.respond} title="FIRST RESPONSE" code="2 MIN">
          <Bubble x={56} y={326} w={100} h={22} lines={[64, 44]} className={s.cycle} />
          <g className={s.cycle} style={delay(1)}>
            <Bubble x={102} y={352} w={88} h={16} out={false} text="CALL BY 10 AM" />
          </g>
          <text className={s.micro} x="56" y="364">FLOOR PLAN + PRICES</text>
        </Panel>
      </Stage>

      {/* 05 — the offer stays on one record. */}
      <Stage id="negotiate">
        <Link d={`M${pt(door)}L${pt(roadFrom)}L${pt(roadTo)}V384H462`} delaySec={-5} />
        <Panel x={462} y={320} w={130} h={104} n={n.negotiate} title="COST SHEET" code="B-1203">
          <Rows x={470} y={347} w={114} rows={[["ALL-IN PRICE", "₹92.4 L"], ["DISCOUNT", "APPROVED", true], ["NEXT FOLLOW-UP", "2 DAYS"]]} />
          <path className={s.line} d="M470 404H584" />
          {[470, 508, 546, 584].map((x, k) => k < 2 ? <Check key={x} x={x} y={404} r={4} /> : <circle key={x} className={k === 2 ? s.accentDot : s.surface} cx={x} cy="404" r="4" />)}
          <circle className={cx(s.accentLine, s.pulse)} cx="546" cy="404" r="4" />
          <text className={s.micro} x="470" y="418">FOLLOW-UPS · 2 OF 4 DONE</text>
        </Panel>
      </Stage>

      {/* 06 — the booking blocks the unit on the inventory chart. */}
      <Stage id="book">
        <Link d="M527 320V164" delaySec={-2} fast />
        <Panel x={462} y={60} w={130} h={104} n={n.book} title="INVENTORY" code="BK-0291">
          {UNITS.map((floor, row) => floor.split("").map((state, col) => {
            const x = 476 + col * 20;
            const y = 86 + row * 11;
            const ours = state === "A";
            return <g key={`${row}-${col}`}>
              <rect className={ours ? s.accentFill : state === "s" ? s.soft : s.surface} x={x} y={y} width="16" height="8" />
              {ours && <rect className={cx(s.accentLine, s.ping)} x={x} y={y} width="16" height="8" />}
            </g>;
          }))}
          <text className={s.micro} x="470" y="158">B-1203 · BLOCKED</text>
          <text className={s.microAccent} x="584" y="158" textAnchor="end">PAID</text>
        </Panel>
      </Stage>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HEALTHCARE — book → remind → check-in → queue → consult → bill → recall,
   inside a clinic cut open
   ══════════════════════════════════════════════════════════════════════ */
const SLOTS = ["bcn", "ccb", "bfc", "cbf"]; // b booked · c confirmed · n ours · f free

export function HealthcareArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifc");
  const n = stageNumbers("healthcare");
  const P = projector(272, 145, 1);
  const mat = P(61, 127);
  const counter = P(236, 112, 12);
  const board = (x: number, z: number) => P(x, 34, z);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 60 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="HEALTHCARE / CLINIC FRONT DESK" tag="ON TIME" bottom="FEWER NO-SHOWS. SHORTER WAITS." height={480} tagX={506} />
      <Plate3D P={P} w={280} d={170} />

      {/* The clinic, cut open: floor, two back walls, a sign with the cross. */}
      <path className={s.floor} d={qT(P, 0.3, 40, 30, 240, 130)} />
      <path className={s.surface} d={qL(P, 30, 40, 240, 0, 26)} />
      <path className={s.glass} d={[56, 88, 172, 208].map((x) => qL(P, 30, x, x + 14, 10, 18)).join("")} />
      <path className={s.soft} d={qR(P, 240, 30, 130, 0, 26)} />
      <path className={s.glass} d={qR(P, 240, 100, 114, 10, 18)} />
      <Block P={P} x={128} y={26} z={26} w={12} d={4} h={12} tone="tint" />
      <path className={s.whiteLine} style={{ strokeWidth: 2.2, strokeLinecap: "butt" }} d={`${polyline([P(131, 30, 32), P(137, 30, 32)])}${polyline([P(134, 30, 29), P(134, 30, 35)])}`} />
      {/* Low partition of the consulting room, with a door gap. */}
      <LowWallX P={P} at={180} y0={30} y1={72} />
      <LowWallX P={P} at={180} y0={86} y1={90} />

      {/* 03 — check-in at the front desk. */}
      <Stage id="arrive">
        <Halo d={footprint(P, 48, 60, 50, 74, 5)} />
        <Link d={`M170 300V270H${r1(mat[0])}V${r1(mat[1] + 6)}`} delaySec={-1} fast />
        <Block P={P} x={50} y={62} w={46} d={12} h={12} tone="surface" />
        <path className={s.tintMuted} d={qT(P, 12.2, 50, 62, 96, 74)} />
        <Standing P={P} fx={73} fy={55} />
        <path className={s.line} d={polyline([P(86, 80, 0), P(86, 80, 11)])} />
        <rect className={s.paper} x={r1(P(86, 80, 14)[0] - 3.5)} y={r1(P(86, 80, 14)[1] - 3.5)} width="7" height="7" />
        <path className={s.qr} d={`M${r1(P(86, 80, 14)[0] - 2)} ${r1(P(86, 80, 14)[1] - 2)}h1.5v1.5h-1.5Zm2.5 0h1.5v1.5h-1.5Zm-2.5 2.5h1.5v1.5h-1.5Z`} />
        <path className={s.mat} d={qT(P, 0.6, 52, 122, 70, 132)} />
        <Standing P={P} fx={61} fy={124} accent />
        <FloorPath d={polyline([P(61, 116), P(61, 82)])} />
        <FloorTag P={P} n={n.arrive} name="CHECK-IN" at={[42, 150]} from={[52, 132]} />
      </Stage>

      {/* 04 — the waiting room and its live token board. */}
      <Stage id="queue">
        <Halo d={footprint(P, 106, 34, 56, 78, 5)} />
        <FloorPath d={polyline([P(96, 80), P(124, 80), P(124, 96)])} delaySec={-2} />
        <Board P={P} at={34} x0={118} x1={150} z0={13} z1={25}>
          <path className={s.whiteLine} d={`${polyline([board(122, 22), board(134, 22)])}${polyline([board(122, 19), board(130, 19)])}${polyline([board(122, 16), board(132, 16)])}`} />
          <path className={cx(s.accentFill, s.blink)} d={qL(P, 34.2, 138, 147, 17, 23)} />
        </Board>
        {[108, 120, 132, 144].map((x) => <g key={x}>
          <Block P={P} x={x} y={100} w={8} d={7} h={5} tone="soft" />
          <Block P={P} x={x} y={100} z={5} w={8} d={1.5} h={4} tone="surface" />
        </g>)}
        <Standing P={P} fx={126} fy={99} scale={0.85} />
        <Standing P={P} fx={150} fy={99} accent scale={0.85} />
        <FloorTag P={P} n={n.queue} name="QUEUE" at={[126, 150]} from={[126, 112]} />
      </Stage>

      {/* 05 — the consulting room: notes and the prescription, captured once. */}
      <Stage id="consult">
        <Halo d={footprint(P, 184, 32, 54, 56, 4)} />
        <FloorPath d={polyline([P(150, 99), P(170, 99), P(170, 80), P(196, 80)])} delaySec={-4} />
        <Block P={P} x={232} y={38} w={6} d={22} h={18} tone="surface" />
        <Block P={P} x={200} y={52} w={30} d={10} h={12} tone="surface" />
        <path className={s.glass} d={qL(P, 62.2, 210, 220, 12, 19)} />
        <Standing P={P} fx={215} fy={46} />
        <Standing P={P} fx={215} fy={72} accent />
        <FloorTag P={P} n={n.consult} name="CONSULT" at={[262, 62]} from={[242, 62]} anchor="start" />
      </Stage>

      {/* 06 — billing: UPI at the desk, receipt on WhatsApp. */}
      <Stage id="bill">
        <FloorPath d={polyline([P(200, 90), P(200, 126), P(212, 126)])} delaySec={-6} />
        <Block P={P} x={204} y={106} w={32} d={12} h={12} tone="surface" />
        <Standing P={P} fx={220} fy={100} />
        <Standing P={P} fx={222} fy={126} accent />
        <rect className={s.paper} x={r1(P(232, 118, 12)[0] - 4)} y={r1(P(232, 118, 12)[1] - 9)} width="8" height="8" />
        <QrCode x={r1(P(232, 118, 12)[0] - 3)} y={r1(P(232, 118, 12)[1] - 8)} cell={1} />
        <Link d={`M${pt(counter)}H400V360H462`} delaySec={-3} fast />
        <Panel x={462} y={320} w={130} h={70} n={n.bill} title="BILL" code="BL-3308">
          <Rows x={470} y={347} w={114} rows={[["CONSULTATION", "₹800"], ["UPI", "PAID", true], ["RECEIPT", "WHATSAPP"]]} />
        </Panel>
      </Stage>

      {/* 07 — recall: the next visit books itself. */}
      <Stage id="recall">
        <Link d="M527 320V158" delaySec={-2} fast />
        <Panel x={462} y={60} w={130} h={98} n={n.recall} title="RECALL" code="WEEK 5">
          <Bubble x={470} y={84} w={114} h={22} lines={[70, 48]} className={s.cycle} />
          {["TUE 11:30", "WED 10:00", "THU 16:30"].map((slot, k) => <g key={slot} className={s.cycle} style={delay(0.6 + k * 0.3)}>
            <rect className={k === 0 ? s.tint : s.surface} x={470 + k * 39} y={112} width="36" height="12" />
            <text className={k === 0 ? s.microAccent : s.micro} x={488 + k * 39} y="120.5" textAnchor="middle" style={{ letterSpacing: ".02em" }}>{slot}</text>
          </g>)}
          <text className={s.micro} x="470" y="142">REVIEW REQUEST</text>
          <Check x={580} y={139.5} r={4} />
          <text className={s.micro} x="470" y="152">RELATIONSHIP OWNED BY THE CLINIC</text>
        </Panel>
        {/* …and back to the top: the recall becomes the next booking. */}
        <Link d="M462 100H178" delaySec={-4} />
        <path className={s.accentLine} d="m185 95-7 5 7 5" />
        <rect className={s.fillPaper} x="256" y="92" width="122" height="14" />
        <text className={s.microAccent} x="317" y="102" textAnchor="middle">NEXT VISIT · BOOKED FROM THE RECALL</text>
      </Stage>

      {/* 01 — booking without a phone call. */}
      <Stage id="book">
        <Panel x={48} y={60} w={124} h={68} n={n.book} title="BOOKING" code="APT-3308">
          {["DR A", "DR B", "DR C"].map((d, k) => <text key={d} className={k === 1 ? s.microInk : s.micro} x={92 + k * 26} y="87" textAnchor="middle">{d}</text>)}
          {SLOTS.map((row, r) => <g key={r}>
            <text className={s.micro} x="56" y={r1(97 + r * 8.5)}>{["10:30", "11:00", "11:30", "12:00"][r]}</text>
            {row.split("").map((state, c) => <rect key={c} className={state === "n" ? s.accentFill : state === "c" ? s.tintMuted : state === "b" ? s.soft : cx(s.guide, s.dashed)} x={81 + c * 26} y={r1(91 + r * 8.5)} width="22" height="6" />)}
          </g>)}
          <rect className={cx(s.accentLine, s.ping)} x="107" y="108" width="22" height="6" />
        </Panel>
      </Stage>

      {/* 02 — reminders on WhatsApp, confirmed with one tap. */}
      <Stage id="remind">
        <Link d="M110 128V300" delaySec={-2} />
        <Panel x={48} y={300} w={150} h={74} n={n.remind} title="REMINDERS" code="WHATSAPP">
          <Bubble x={56} y={326} w={104} h={22} lines={[68, 40]} className={s.cycle} />
          <g className={s.cycle} style={delay(1.1)}>
            <rect className={s.paper} x="112" y="352" width="78" height="16" rx="4" />
            <Check x={123} y={360} r={4} />
            <text className={s.microInk} x="132" y="362.5">CONFIRMED</text>
          </g>
          <text className={s.micro} x="56" y="364">DAY BEFORE · 2 H BEFORE</text>
        </Panel>
      </Stage>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ECOMMERCE — browse → cart → recovery → checkout → fulfilment → delivery
   → reorder: a warehouse and a home on one road
   ══════════════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  "M-3-8h6v3l2 2v10h-10v-10l2-2Z",
  "M-5-3h10v10h-10ZM-6-6h12v3h-12Z",
  "M-3.5-8h7l1.5 15h-10ZM-2 6h4v3h-4Z",
];

export function EcommerceArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ife");
  const n = stageNumbers("ecommerce");
  const P = projector(300, 145, 1);
  const dock = P(112, 156);
  const roadPath = polyline([P(104, 124), P(251, 124), P(251, 106)]);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 60 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="D2C / ORDER TO REORDER" tag="SYNCED" bottom="EVERY ORDER BRINGS THE NEXT ONE CLOSER." height={480} tagX={506} />
      <Plate3D P={P} w={280} d={170} />

      {/* The road from the dock to the customer's door. */}
      <path className={s.road} d={qT(P, 0.3, 104, 116, 280, 132)} />
      <path className={s.road} d={qT(P, 0.3, 246, 104, 258, 116)} />
      <path className={cx(s.guide, s.dashed)} d={polyline([P(108, 124), P(276, 124)])} />

      {/* 05 — fulfilment: the warehouse, the dock and the packing bench. */}
      <Stage id="fulfil">
        <Halo d={footprint(P, 20, 90, 104, 62)} />
        <Link d={`M188 380H${r1(dock[0])}V${r1(dock[1] + 6)}`} delaySec={-1} fast />
        <Block P={P} x={20} y={90} w={80} d={60} h={30} tone="surface" />
        <path className={s.glass} d={[32, 54, 76].map((x) => qT(P, 30.2, x, 96, x + 12, 144)).join("")} />
        <path className={s.soft} d={qR(P, 100, 100, 124, 0, 20)} />
        <path className={s.line} d={[4, 8, 12, 16].map((z) => polyline([P(100, 100, z), P(100, 124, z)])).join("")} />
        <path className={s.tintDeep} d={qR(P, 100, 94, 146, 24, 27)} />
        <path className={s.glass} d={qL(P, 150, 30, 40, 12, 20)} />
        <Block P={P} x={104} y={104} w={10} d={8} h={8} />
        <Block P={P} x={104} y={134} w={20} d={16} h={10} tone="surface" />
        <Block P={P} x={106} y={137} z={10} w={8} d={7} h={6} tone="tint" />
        <Block P={P} x={115} y={140} z={10} w={7} d={6} h={5} />
        <circle className={cx(s.accentFill, s.blink)} cx={r1(P(110, 144, 16.5)[0])} cy={r1(P(110, 144, 16.5)[1])} r="1.6" />
        <Standing P={P} fx={114} fy={131} />
        <FloorTag P={P} n={n.fulfil} name="FULFILMENT" at={[60, 162]} from={[60, 152]} />
      </Stage>

      {/* 06 — the van, the road and the customer's door; tracking on WhatsApp. */}
      <Stage id="deliver">
        <Halo d={footprint(P, 228, 58, 48, 60)} />
        <Link d={roadPath} delaySec={-2} fast />
        <g className={cx(s.drive, s.ambient)} style={cssVars({ "--drive": "86.6px", "--drive-y": "50px", animationDuration: "11s" })}>
          <Truck P={P} x={110} y={119} len={22} wid={12} h={15} cab={9} cabH={11} wheel={3.2} />
        </g>
        <GableX P={P} x={230} y={60} w={44} d={44} h={22} rh={14} />
        <path className={s.soft} d={qL(P, 104, 246, 256, 0, 15)} />
        <path className={s.glass} d={`${qL(P, 104, 262, 270, 7, 14)}${qR(P, 274, 68, 78, 7, 14)}`} />
        <Block P={P} x={249} y={105} w={6} d={5} h={5} tone="tint" />
        <Check x={P(252, 107.5, 12)[0]} y={P(252, 107.5, 12)[1]} r={3.5} />
        <Standing P={P} fx={240} fy={111} accent />
        <Link d="M436 330V366H462" delaySec={-3} fast />
        <Panel x={462} y={330} w={130} h={94} n={n.deliver} title="TRACKING" code="AWB 41-2208">
          <path className={s.line} d="M478 358H576" />
          <path className={s.accentLine} d="M478 358H527" />
          {[478, 527, 576].map((x, k) => <g key={x}>
            {k < 2 ? <circle className={s.accentFill} cx={x} cy="358" r="3.5" /> : <circle className={s.accentDot} cx={x} cy="358" r="3.5" />}
            {k === 2 && <circle className={cx(s.accentLine, s.pulse)} cx={x} cy="358" r="3.5" />}
            <text className={k === 2 ? s.microAccent : s.micro} x={x} y="374" textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} dx={k === 0 ? -6 : k === 2 ? 6 : 0}>{["SHIPPED", "OUT", "DELIVERED"][k]}</text>
          </g>)}
          <Rows x={470} y={396} w={114} rows={[["SUPPORT TICKETS", "0", true], ["RTO", "AVOIDED"]]} gap={14} />
        </Panel>
        <FloorTag P={P} n={n.deliver} name="DELIVERY" at={[251, 150]} from={[251, 112]} anchor="end" />
      </Stage>

      {/* 01 — the store loads fast; the shopper finds the bundle. */}
      <Stage id="browse">
        <Panel x={48} y={70} w={124} h={58} n={n.browse} title="STORE" code="1.6 S">
          {PRODUCTS.map((glyph, k) => {
            const pick = k === 1;
            const x = 58 + k * 38;
            return <g key={k}>
              <rect className={pick ? s.tint : s.surface} x={x} y={94} width="30" height="26" />
              <path className={pick ? s.accentLine : s.line} style={{ strokeWidth: 1 }} d={glyph} transform={`translate(${x + 15} 106)`} />
            </g>;
          })}
          <text className={s.microAccent} x="164" y="90" textAnchor="end">ORGANIC SEARCH</text>
        </Panel>
      </Stage>

      {/* 02 — the cart is saved against the customer. */}
      <Stage id="cart">
        <Link d="M110 128V138" ambient={false} />
        <Panel x={48} y={138} w={124} h={54} n={n.cart} title="CART" code="₹1,480">
          <path className={s.inkLine} style={{ strokeWidth: 1.1 }} d="M58 164h4l3.5 12h14l2.5-8h-17M66 181h11" />
          <circle className={s.line} cx="66" cy="184" r="1.6" />
          <circle className={s.line} cx="76" cy="184" r="1.6" />
          <text className={s.microInk} x="88" y="170">1 × SKINCARE BUNDLE</text>
          <text className={s.microAccent} x="88" y="182">LEFT AT SHIPPING · SAVED</text>
        </Panel>
      </Stage>

      {/* 03 — a WhatsApp nudge brings the shopper back. */}
      <Stage id="recover">
        <Link d="M110 192V290" delaySec={-3} />
        <Panel x={48} y={290} w={140} h={62} n={n.recover} title="RECOVERY" code="+40 MIN">
          <Bubble x={56} y={314} w={92} h={20} lines={[58, 36]} className={s.cycle} />
          <g className={s.cycle} style={delay(1)}><Chip x={128} y={336} w={52} text="RETURNED" /></g>
          <text className={s.micro} x="56" y="345">ONE-TAP LINK</text>
        </Panel>
      </Stage>

      {/* 04 — short, prepaid-first checkout. */}
      <Stage id="checkout">
        <Link d="M110 352V362" ambient={false} />
        <Panel x={48} y={362} w={140} h={62} n={n.checkout} title="CHECKOUT" code="ORD-50731">
          {["UPI", "CARD", "COD"].map((name, k) => <g key={name}>
            <circle className={k === 0 ? s.accentDot : s.surface} cx={62 + k * 40} cy="389" r="3.5" />
            {k === 0 && <circle className={s.accentFill} cx="62" cy="389" r="1.6" />}
            <text className={k === 0 ? s.microInk : s.micro} x={70 + k * 40} y="391.5">{name}</text>
          </g>)}
          <rect className={s.accentFill} x="56" y="402" width="124" height="14" />
          <text className={s.whiteText} x="118" y="411.5" textAnchor="middle" style={{ letterSpacing: ".08em" }}>PAID ₹1,480 · 3 STEPS</text>
        </Panel>
      </Stage>

      {/* 07 — the reorder reminder, and the loop back to the store. */}
      <Stage id="reorder">
        <Link d="M485 300H504V134" delaySec={-4} fast />
        <Panel x={462} y={70} w={130} h={64} n={n.reorder} title="REORDER" code="DAY 30">
          <Bubble x={470} y={94} w={114} h={20} lines={[72, 46]} className={s.cycle} />
          <text className={s.micro} x="470" y="126">ORD-51902 · DAY 31</text>
          <text className={s.microAccent} x="584" y="126" textAnchor="end">₹0 TO ACQUIRE</text>
        </Panel>
        <Link d="M462 92H178" delaySec={-6} />
        <path className={s.accentLine} d="m185 87-7 5 7 5" />
        <rect className={s.fillPaper} x="270" y="84" width="100" height="14" />
        <text className={s.microAccent} x="320" y="94" textAnchor="middle">REPEAT LOOP · 2ND ORDER</text>
      </Stage>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EDTECH — enquiry → counselling → demo → enrolment → batch → attendance
   → fees → results, inside a coaching institute cut open
   ══════════════════════════════════════════════════════════════════════ */
const SEATS = ["tttf", "tftt", "ttAt", "fttt"]; // t taken · f free · A ours

export function EdtechArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ift");
  const n = stageNumbers("edtech");
  const P = projector(272, 145, 1);
  const counsellor = P(85, 106);
  const entrance = P(107, 134);
  const sideDoor = P(262, 102);
  const notice = P(220, 30.5, 15);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 60 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="COACHING INSTITUTE / ENQUIRY TO RESULTS" tag="ADMISSIONS" bottom="ONE STUDENT RECORD, FROM FIRST CALL TO FINAL RANK." height={480} tagX={498} />
      <Plate3D P={P} w={280} d={170} />

      {/* The institute, cut open: floor, back walls, corridor, flag. */}
      <path className={s.floor} d={qT(P, 0.3, 40, 30, 240, 130)} />
      <path className={s.surface} d={qL(P, 30, 40, 240, 0, 26)} />
      <path className={s.soft} d={qR(P, 240, 30, 130, 0, 26)} />
      <path className={s.glass} d={qR(P, 240, 40, 56, 10, 18)} />
      <path className={s.soft} d={qR(P, 240, 98, 106, 0, 18)} />
      <path className={s.mat} d={qT(P, 0.5, 40, 98, 240, 106)} />
      <Block P={P} x={100} y={26} z={26} w={80} d={4} h={9} tone="surface" />
      <path className={s.accentLine} d={polyline([P(106, 30, 30.5), P(174, 30, 30.5)])} />
      <path className={s.line} d={polyline([P(236, 40, 26), P(236, 40, 44)])} />
      <path className={s.tint} d={poly([P(236, 40, 44), P(236, 52, 41), P(236, 40, 38)])} />
      <LowWallX P={P} at={126} y0={36} y1={96} />
      <LowWallX P={P} at={206} y0={36} y1={96} />
      <path className={s.mat} d={qT(P, 0.5, 100, 126, 114, 134)} />

      {/* 02 — the counsellor calls with the full context (desk at the front office). */}
      <Stage id="counsel">
        <Link d="M110 118V128" ambient={false} />
        <Panel x={48} y={128} w={124} h={58} n={n.counsel} title="CALL TASK" code="9:00 AM">
          <Rows x={56} y={152} w={108} rows={[["CONCERN", "BATCH TIMING"], ["NEXT STEP", "DEMO CLASS", true]]} gap={13} />
          <text className={s.micro} x="56" y="180">LOGGED ON ENQ-4127</text>
        </Panel>
        <Link d={`M172 152H${r1(counsellor[0])}V${r1(counsellor[1] - 24)}`} delaySec={-2} fast />
        <Halo d={footprint(P, 70, 106, 30, 24, 6)} />
        <Block P={P} x={70} y={110} w={30} d={8} h={10} tone="surface" />
        <Standing P={P} fx={85} fy={106} />
        <Standing P={P} fx={76} fy={128} scale={0.9} />
        <Standing P={P} fx={90} fy={130} accent scale={0.9} />
      </Stage>

      {/* 03 — the demo class: physics, Saturday. */}
      <Stage id="demo">
        <Halo d={footprint(P, 50, 40, 70, 58, 4)} />
        <FloorPath d={polyline([P(100, 114), P(112, 114), P(112, 99), P(86, 99)])} />
        <path className={s.paper} d={qL(P, 30.4, 58, 112, 10, 22)} />
        <path className={s.accentLine} style={{ strokeWidth: 1 }} d={`${polyline([P(64, 30.4, 18), P(84, 30.4, 18)])}${polyline([P(64, 30.4, 15), P(96, 30.4, 15)])}${polyline([P(64, 30.4, 12), P(76, 30.4, 12)])}`} />
        <Standing P={P} fx={85} fy={42} />
        {[58, 80, 102].flatMap((x) => [56, 70, 84].map((y) => <Block key={`${x}-${y}`} P={P} x={x} y={y} w={9} d={5} h={5} tone="surface" />))}
        <Standing P={P} fx={84.5} fy={92} accent scale={0.8} />
        <FloorTag P={P} n={n.demo} name="DEMO CLASS" at={[56, 150]} from={[56, 98]} />
      </Stage>

      {/* 04 — admission and the first instalment, online. */}
      <Stage id="enrol">
        <Link d="M246 200H190V300" delaySec={-3} />
        <Panel x={48} y={300} w={156} h={62} n={n.enrol} title="ADMISSION" code="AD-2026-0412">
          <Rows x={56} y={324} w={140} rows={[["INSTALMENT 1 · UPI", "PAID", true], ["PLAN", "4 INSTALMENTS"], ["DOCUMENTS", "UPLOADED"]]} gap={12} />
        </Panel>
      </Stage>

      {/* 05 — a seat in the evening batch. */}
      <Stage id="batch">
        <Halo d={footprint(P, 132, 40, 70, 58, 4)} />
        <Link d={`M204 340H${r1(entrance[0])}V${r1(entrance[1] + 1)}`} delaySec={-4} fast />
        <FloorPath d={polyline([P(107, 126), P(107, 102), P(160, 102), P(160, 97)])} delaySec={-1} />
        <path className={s.paper} d={qL(P, 30.4, 140, 196, 10, 22)} />
        <path className={s.line} style={{ strokeWidth: 1 }} d={`${polyline([P(146, 30.4, 18), P(170, 30.4, 18)])}${polyline([P(146, 30.4, 14), P(184, 30.4, 14)])}`} />
        {SEATS.map((row, r) => row.split("").map((state, c) => {
          const x = 140 + c * 15;
          const y = 50 + r * 12;
          return <g key={`${r}-${c}`}>
            <Block P={P} x={x} y={y} w={7} d={5} h={4} tone={state === "A" ? "tint" : state === "t" ? "soft" : "paper"} />
            {state === "A" && <path className={cx(s.accentLine, s.ping)} d={qT(P, 4.2, x, y, x + 7, y + 5)} />}
          </g>;
        }))}
        <FloorTag P={P} n={n.batch} name="BATCH E2 · 24/30" at={[202, 150]} from={[202, 98]} />
      </Stage>

      {/* 06 — attendance at the classroom door, straight to the parent. */}
      <Stage id="attend">
        <Halo d={footprint(P, 146, 96, 26, 16, 4)} />
        <Block P={P} x={146} y={98} w={3} d={3} h={14} tone="surface" />
        <path className={cx(s.accentLine, s.blink)} strokeDasharray="1.5 2.5" d={polyline([P(149, 99.5, 10), P(170, 99.5, 10)])} />
        <circle className={s.accentFill} cx={r1(P(147.5, 99.5, 15)[0])} cy={r1(P(147.5, 99.5, 15)[1])} r="1.8" />
        <circle className={cx(s.accentLine, s.pulse)} cx={r1(P(147.5, 99.5, 15)[0])} cy={r1(P(147.5, 99.5, 15)[1])} r="1.8" />
        <Standing P={P} fx={161} fy={110} accent scale={0.9} />
        <FloorTag P={P} n={n.attend} name="ATTENDANCE · 94%" at={[150, 150]} from={[150, 114]} />
      </Stage>

      {/* 07 — instalments collect themselves (the parent's phone). */}
      <Stage id="fees">
        <Link d={`${polyline([P(172, 102), P(238, 102)])}L${pt(sideDoor)}V372H462`} delaySec={-5} />
        <Panel x={462} y={330} w={130} h={94} n={n.fees} title="FEE LEDGER" code="2 OF 4">
          <path className={s.line} d="M478 356H576" />
          {[478, 511, 544, 576].map((x, k) => <g key={x}>
            {k < 2 ? <Check x={x} y={356} r={5} /> : <circle className={k === 2 ? s.accentDot : s.surface} cx={x} cy="356" r="5" />}
            {k === 2 && <circle className={cx(s.accentLine, s.pulse)} cx={x} cy="356" r="5" />}
            <text className={k === 2 ? s.microAccent : s.micro} x={x} y="372" textAnchor="middle">{["PAID", "PAID", "60 D", "SEP"][k]}</text>
          </g>)}
          <Rows x={470} y={394} w={114} rows={[["REMINDERS", "AUTOMATIC"], ["OVERDUE", "₹0", true]]} gap={14} />
        </Panel>
      </Stage>

      {/* 08 — results published to the student and the parent; the notice board echoes them. */}
      <Stage id="results">
        <Link d="M527 330V156" delaySec={-2} fast />
        <Panel x={462} y={60} w={130} h={96} n={n.results} title="MOCK TEST 3" code="212 / 300">
          <path className={s.guide} d="M470 132H584" />
          <path className={cx(s.guide, s.dashed)} d="M470 106H584M470 119H584" />
          {[[118, "MT-1"], [160, "MT-2"], [202, "MT-3"]].map(([h, name], k) => {
            const x = 478 + k * 38;
            const hh = Number(h) * 0.24;
            return <g key={String(name)}>
              <rect className={k === 2 ? cx(s.accentFill, s.grow) : k === 1 ? s.tintMuted : s.soft} x={x} y={r1(132 - hh)} width="12" height={r1(hh)} />
              <text className={k === 2 ? s.microAccent : s.micro} x={x + 6} y="142" textAnchor="middle">{String(name)}</text>
            </g>;
          })}
          <text className={s.microAccent} x="584" y="90" textAnchor="end">RANK 5 · +18</text>
          <text className={s.micro} x="584" y="100" textAnchor="end">PARENT ✓ REFERRAL</text>
          <text className={s.micro} x="584" y="142" textAnchor="end">TREND</text>
        </Panel>
        <Link d={`M462 120H${r1(notice[0])}V${r1(notice[1] - 8)}`} delaySec={-6} fast />
        <path className={s.paper} d={qL(P, 30.4, 206, 234, 8, 22)} />
        <path className={s.line} style={{ strokeWidth: 1 }} d={`${polyline([P(210, 30.4, 18), P(230, 30.4, 18)])}${polyline([P(210, 30.4, 15), P(224, 30.4, 15)])}`} />
        <path className={s.accentFill} d={qL(P, 30.5, 210, 218, 10, 13)} />
      </Stage>

      {/* 01 — the enquiry lands in the admissions pipeline. */}
      <Stage id="enquiry">
        <Panel x={48} y={60} w={124} h={58} n={n.enquiry} title="ENQUIRY" code="ENQ-4127">
          <Rows x={56} y={84} w={108} rows={[["COURSE", "JEE · 2 YEARS"], ["CLASS", "11"], ["SOURCE", "GOOGLE · 10:18 PM", true]]} gap={12} />
        </Panel>
      </Stage>
    </Plate>
  );
}

/* ── Dispatcher + figure frame ─────────────────────────────────────────── */
/** Art only (the bare SVG) — for cards, heroes with their own caption, thumbnails. */
export function IndustryArt({ industry, ...props }: IndustryArtProps) {
  switch (industry) {
    case "hub": return <HubArt {...props} />;
    case "manufacturing": return <ManufacturingArt {...props} />;
    case "real-estate": return <RealEstateArt {...props} />;
    case "healthcare": return <HealthcareArt {...props} />;
    case "ecommerce": return <EcommerceArt {...props} />;
    case "edtech": return <EdtechArt {...props} />;
    default: return <HubArt {...props} />;
  }
}

export interface IndustryFigureProps {
  industry: IndustryFigureKey;
  /** 1 → "FIG. 01"; a string is used as-is ("FIG. 00"). Omit (or null) to hide the caption row. */
  number?: number | string | null;
  /** Caption title (shown uppercase). Defaults to FIGURE_TITLES[industry]. */
  title?: string;
  /** Up to three legend labels under the drawing (square · accent square · dot). */
  legend?: string[];
  /** Visually hidden description for screen readers. Defaults to FIGURE_DESCRIPTIONS[industry]; false = decorative. */
  description?: string | false;
  /** Thumbnail mode: no caption or legend, simplified labels, hover-only motion. */
  compact?: boolean;
  className?: string;
  /** Adds data-blog-reveal so <BlogMotion> fades the figure in once. */
  reveal?: boolean;
}

/** A figure with the home-style "FIG. 0X / TITLE" caption row. The art is aria-hidden; the description is read instead. */
export function IndustryFigure({ industry, number, title, legend, description, compact, className, reveal }: IndustryFigureProps) {
  const fig = number === undefined || number === null ? null : typeof number === "number" ? `FIG. ${String(number).padStart(2, "0")}` : number;
  const text = description === false ? null : description ?? FIGURE_DESCRIPTIONS[industry];
  const showCaption = Boolean(fig) && !compact;
  return (
    <figure className={cx(s.figure, className)} data-blog-reveal={reveal ? "" : undefined}>
      {(showCaption || text) && <figcaption className={showCaption ? s.caption : s.srOnly}>
        {showCaption && <><span>{fig}</span><span>{title ?? FIGURE_TITLES[industry]}</span><Plus size={14} aria-hidden="true" /></>}
        {text && <span className={s.srOnly}>{text}</span>}
      </figcaption>}
      <IndustryArt industry={industry} compact={compact} />
      {legend && legend.length > 0 && !compact && <div className={s.legend} aria-hidden="true">{legend.slice(0, 3).map((item) => <span key={item}><i />{item}</span>)}</div>}
    </figure>
  );
}
