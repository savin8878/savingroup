import { useId, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type { IndustryKey } from "@/lib/country-content";
import { INDUSTRY_WORKFLOWS } from "./workflows";
import s from "./IndustryFigures.module.css";

/**
 * Industry figures — one technical line drawing per industry page plus the
 * isometric "hub" for /industries. Same hand as the home TechnicalVisuals and
 * the blog figures. Server components: every animation is CSS and pauses under
 * [data-motion="paused"] / [data-in-view="false"] (set by <BlogMotion> or
 * <HomeMotion>) and prefers-reduced-motion. Every drawing is complete without
 * motion or JavaScript.
 *
 *   <IndustryFigure industry="manufacturing" number={1} legend={[...]} />
 *   <IndustryArt industry="hub" compact />   // thumbnail, art only
 */

export type IndustryFigureKey = IndustryKey | "hub";

export interface IndustryArtProps {
  industry: IndustryFigureKey;
  /** Thumbnail mode (~320×200): tighter crop, no frame or annotations, larger key labels, motion only while a parent card is hovered. */
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
  healthcare: "The clinic front desk",
  ecommerce: "Order to reorder",
  edtech: "Enquiry to results",
};

export const FIGURE_DESCRIPTIONS: Record<IndustryFigureKey, string> = {
  hub: "Illustration: five sector buildings — a factory, residential towers, a clinic, a storefront and a classroom — stand around one central operating system of three layers, ERP, automation and AI. Signals travel in from every sector and decisions travel back out.",
  manufacturing: "Diagram: a shop floor with a raw-material godown, two machines with work-in-progress, a quality gate, a finished-goods godown and a dispatch truck. Material moves along the line while machine and stock data rise into one ERP, which feeds the founder's daily dashboard and generates the GST e-invoice and e-way bill.",
  "real-estate": "Diagram: leads from property portals, WhatsApp and walk-ins are scored, booked into a site-visit calendar and end in a unit allotted in a tower, drawn over a thin skyline of the project under construction.",
  healthcare: "Diagram: a clinic front desk. Patients arrive, appointments fill a slot grid for three doctors, WhatsApp reminders confirm visits, a token queue moves patients to the doctor's room, and billing and records close each visit.",
  ecommerce: "Diagram: a direct-to-consumer store. Products in a catalog synced with marketplaces move to the cart, checkout and a packed parcel with a courier, and a repeat-purchase loop brings delivered customers back to the catalog.",
  edtech: "Diagram: a coaching institute's student journey in six stages — enquiry, counselling, batch allocation, attendance, fee instalments and test results — joined by one student record.",
};

/** Default English legend labels (square · accent square · dot). Pages may pass localized ones. */
export const FIGURE_LEGENDS: Record<IndustryFigureKey, [string, string, string]> = {
  hub: ["Sectors", "Operating system", "Decisions"],
  manufacturing: ["Shop floor", "Material + data flow", "Stock levels"],
  "real-estate": ["Lead sources", "Lead flow", "Units allotted"],
  healthcare: ["Front desk", "Patient flow", "Reminders"],
  ecommerce: ["Storefront", "Order flow", "Repeat purchase"],
  edtech: ["Stages", "Student record", "Milestones"],
};

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

function useFigureId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/* ── Isometric helpers (hub) ───────────────────────────────────────────── */
type Pt = [number, number];
type Projector = (x: number, y: number, z?: number) => Pt;
const COS30 = 0.8660254;
const r1 = (n: number) => Math.round(n * 10) / 10;
function projector(ox: number, oy: number): Projector {
  return (x, y, z = 0) => [ox + (x - y) * COS30, oy + (x + y) * 0.5 - z];
}
/** The same projection, with the footprint moved by (dx, dy). */
function shifted(P: Projector, dx: number, dy: number): Projector {
  return (x, y, z = 0) => P(x + dx, y + dy, z);
}
function poly(points: Pt[]) { return `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`; }
function polyline(points: Pt[]) { return `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}`; }
/** Faces of an axis-aligned box: top, front-left (y+d) and front-right (x+w). */
function box(P: Projector, x: number, y: number, z: number, w: number, d: number, h: number) {
  return {
    top: poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
    left: poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)]),
    right: poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)]),
  };
}

type Tone = "paper" | "tint" | "machine" | "slot" | "pad" | "surface" | "glass";
const TONES: Record<Tone, [string, string, string]> = {
  // [top, front-left, front-right]
  paper: [s.paper, s.surface, s.soft],
  tint: [s.tintMuted, s.tintMuted, s.tintDeep],
  machine: [s.machineTop, s.machineLeft, s.machineRight],
  slot: [s.machineSlot, s.machineSlot, s.machineSlot],
  pad: [s.soft, s.soft, s.soft],
  surface: [s.surface, s.surface, s.soft],
  glass: [s.glass, s.glass, s.glass],
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
    <path className={s.line} d={`M${x} ${y + mast}V${y + 3}`} />
    <circle className={s.accentDot} cx={x} cy={y} r="3.2" />
  </g>;
}

/** A person, standing on (x, y). */
function Person({ x, y, accent = false, scale = 1 }: { x: number; y: number; accent?: boolean; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path className={accent ? s.tint : s.surface} d="M-7 0V-9C-7-15.5 7-15.5 7-9V0Z" />
    <circle className={accent ? s.tint : s.surface} cx="0" cy="-20.5" r="4.5" />
  </g>;
}

function Check({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return <g transform={`translate(${x} ${y})`}>
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
   Scene kit — isometric plates, faces and the stage-highlight contract
   ══════════════════════════════════════════════════════════════════════ */
/** Quad on the plane x = const (faces front-right). */
const qR = (P: Projector, x: number, y0: number, y1: number, z0: number, z1: number) => poly([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)]);
/** Quad on the plane y = const (faces front-left). */
const qL = (P: Projector, y: number, x0: number, x1: number, z0: number, z1: number) => poly([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)]);
/** Quad on a horizontal plane. */
const qT = (P: Projector, z: number, x0: number, y0: number, x1: number, y1: number) => poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);
/** A circle lying on a plane, as a smooth polygon. */
function ring(P: Projector, plane: "x" | "y" | "z", [a, b, c]: [number, number, number], r: number, n = 28) {
  const pts: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const t = (k / n) * Math.PI * 2;
    const u = r * Math.cos(t);
    const v = r * Math.sin(t);
    pts.push(plane === "z" ? P(a + u, b + v, c) : plane === "x" ? P(a, b + u, c + v) : P(a + u, b, c + v));
  }
  return poly(pts);
}
/** SVG transform that lays text on a face: "l" (y = const), "r" (x = const) or "t" (the floor, along x). */
function faceMatrix(face: "l" | "r" | "t", [x, y]: Pt) {
  const m = face === "l" ? "0.866 0.5 0 1" : face === "r" ? "0.866 -0.5 0 1" : "0.866 0.5 -0.866 0.5";
  return `matrix(${m} ${r1(x)} ${r1(y)})`;
}

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
  const rx = r * 1.2247;
  const ry = r * 0.7071;
  return <g>
    <path className={className ?? s.surface} d={`M${r1(cxb - rx)} ${r1(cyt)}V${r1(cyb)}A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cxb + rx)} ${r1(cyb)}V${r1(cyt)}Z`} />
    <ellipse className={s.paper} cx={r1(cxb)} cy={r1(cyt)} rx={r1(rx)} ry={r1(ry)} />
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

/** Numbered stage tag: a badge, an optional leader and a name. */
function Tag({ n, name, x, y, anchor = "start", leader, className }: { n: string; name: string; x: number; y: number; anchor?: "start" | "end" | "middle"; leader?: string; className?: string }) {
  const tx = anchor === "start" ? x + 12 : anchor === "end" ? x - 12 : x;
  const ty = anchor === "middle" ? y + 19 : y + 3;
  return <g className={cx(s.tag, className)}>
    {leader && <path className={s.leader} d={leader} />}
    <g className={s.badge}>
      <circle className={s.badgeDisc} cx={x} cy={y} r="7.5" />
      <text className={s.badgeNum} x={x} y={r1(y + 2.5)} textAnchor="middle">{n}</text>
    </g>
    <text className={cx(s.key, s.tagName)} x={tx} y={r1(ty)} textAnchor={anchor}>{name}</text>
  </g>;
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

/** Stage numbers come from INDUSTRY_WORKFLOWS so the figure and the simulator always agree. */
function stageNumbers(industry: IndustryKey) {
  const out: Record<string, string> = {};
  INDUSTRY_WORKFLOWS[industry].stages.forEach((stage, k) => { out[stage.id] = String(k + 1).padStart(2, "0"); });
  return out;
}

/* ══════════════════════════════════════════════════════════════════════
   MANUFACTURING — order → plan → material → production → QC → dispatch
   → e-invoice → daily P&L
   ══════════════════════════════════════════════════════════════════════ */
const QR = [1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1];

export function ManufacturingArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifm");
  const n = stageNumbers("manufacturing");
  const P = projector(251, 158);
  const at = (x: number, y: number, z = 0) => P(x, y, z);
  const chart = [36, 33, 35, 29, 30, 24, 26, 18, 16, 11, 6];
  const chartPath = chart.map((v, k) => `${k ? "L" : "M"}${462 + k * 11.8} ${108 + v}`).join("");
  const belt = (x0: number, x1: number) => polyline([P(x0, 60, 12.5), P(x1, 60, 12.5)]);
  const [m1x, m1y] = at(89, 60, 34);
  const [m2x, m2y] = at(149, 60, 52);
  const [qcx, qcy] = at(187, 60, 36);
  const [tkx, tky] = at(300, 60, 26);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 480" compactViewBox="60 52 520 325">
      <DotGrid id={id} x={36} y={52} width={568} height={372} />
      <Frame top="MANUFACTURING / ORDER TO DISPATCH" tag="LIVE WIP" bottom="FROM THE SALES DESK TO THE LEDGER." height={480} tagX={506} />
      <Plate3D P={P} w={330} d={170} />

      {/* 03 — raw-material godown, with greige rolls waiting at its door. */}
      <Stage id="material">
        <Halo d={footprint(P, 6, 32, 52, 88)} />
        <GableX P={P} x={8} y={34} w={48} d={50} h={30} rh={14} />
        <path className={s.soft} d={qR(P, 56, 52, 68, 0, 20)} />
        <path className={s.line} d={[5, 10, 15].map((z) => polyline([P(56, 52, z), P(56, 68, z)])).join("")} />
        {[[16, 26], [30, 40], [44, 54]].map(([x0, x1]) => <path key={x0} className={s.glass} d={qL(P, 84, x0, x1, 18, 24)} />)}
        <path className={s.soft} d={qL(P, 84, 20, 34, 0, 13)} />
        {[[16, 100], [30, 100], [44, 100], [23, 112], [37, 112]].map(([x, y], k) => <Cyl key={k} P={P} x={x} y={y} r={5.5} h={k < 3 ? 13 : 11} className={k === 1 ? s.tintMuted : s.surface} />)}
        <Tap x={r1(at(32, 59, 44)[0])} y={r1(at(32, 59, 44)[1] - 9)} mast={6} />
      </Stage>

      {/* Conveyor through the line; goods ride it. */}
      <g>
        <Block P={P} x={56} y={52} z={6} w={162} d={16} h={6} />
        <path className={s.line} d={[70, 124, 176, 214].map((x) => `${polyline([P(x, 68, 0), P(x, 68, 6)])}`).join("")} />
        <path className={s.guide} d={Array.from({ length: 15 }, (_, k) => polyline([P(62 + k * 10.5, 53, 12), P(62 + k * 10.5, 67, 12)])).join("")} />
      </g>

      {/* 04 — production: M1 (CNC) and M2 (press), WIP between them. */}
      <Stage id="production">
        <Halo d={footprint(P, 70, 40, 100, 40)} />
        <Link d={belt(58, 132)} delaySec={-1} />
        <path className={cx(s.goods, s.ambient)} d={belt(58, 218)} />
        {/* M1 */}
        <Block P={P} x={74} y={44} w={30} d={32} h={34} />
        <path className={s.glass} d={qL(P, 76, 78, 96, 10, 28)} />
        <path className={s.inkLine} d={polyline([P(87, 76, 28), P(87, 76, 19)])} />
        <path className={s.accentLine} d={polyline([P(87, 76, 18), P(87, 76, 15)])} />
        <path className={s.machineSlot} d={qR(P, 104, 50, 62, 18, 28)} />
        <path className={s.whiteLine} d={polyline([P(104, 52, 25), P(104, 58, 25)])} />
        <circle className={cx(s.accentFill, s.blink)} cx={r1(at(104, 68, 24)[0])} cy={r1(at(104, 68, 24)[1])} r="1.8" />
        {/* WIP crates */}
        {[[110, 12], [110, 19], [120, 12]].map(([x, z], k) => <Block key={k} P={P} x={x} y={54} z={z} w={8} d={10} h={7} tone={k === 1 ? "tint" : "paper"} />)}
        {/* M2 — press frame, crown and the cycling ram */}
        <Block P={P} x={132} y={42} w={34} d={36} h={10} />
        <Block P={P} x={134} y={44} z={10} w={6} d={6} h={34} />
        <Block P={P} x={158} y={44} z={10} w={6} d={6} h={34} />
        <Block P={P} x={132} y={42} z={44} w={34} d={12} h={10} />
        <g className={s.press} style={cssVars({ "--stroke": "9px" })}>
          <Block P={P} x={140} y={52} z={30} w={18} d={16} h={8} tone="tint" />
        </g>
        <Block P={P} x={134} y={68} z={10} w={6} d={6} h={34} />
        <Block P={P} x={158} y={68} z={10} w={6} d={6} h={34} />
        <Block P={P} x={132} y={66} z={44} w={34} d={12} h={10} />
        <Tap x={r1(m1x)} y={r1(m1y - 12)} mast={9} />
        <Tap x={r1(m2x)} y={r1(m2y - 10)} mast={7} />
      </Stage>

      {/* 05 — quality gate: a light curtain over the belt. */}
      <Stage id="qc">
        <Halo d={footprint(P, 180, 44, 16, 32)} />
        <Link d={belt(166, 186)} delaySec={-3} fast />
        {[46, 68].map((y) => <Block key={y} P={P} x={183} y={y} w={7} d={6} h={32} />)}
        <path className={cx(s.tintFill, s.blink)} d={qR(P, 186.5, 52, 68, 13, 30)} />
        <path className={s.accentLine} strokeDasharray="1.5 3" d={[16, 21, 26].map((z) => polyline([P(186.5, 52, z), P(186.5, 68, z)])).join("")} />
        <Block P={P} x={181} y={44} z={32} w={11} d={32} h={5} />
        <circle className={s.accentFill} cx={r1(qcx)} cy={r1(qcy - 2)} r="2.2" />
        <circle className={cx(s.accentLine, s.pulse)} cx={r1(qcx)} cy={r1(qcy - 2)} r="2.2" />
        {[[198, 12], [206, 12]].map(([x, z], k) => <Block key={k} P={P} x={x} y={54} z={z} w={7} d={10} h={7} />)}
      </Stage>

      {/* 06 — finished-goods godown and the truck at its dock. */}
      <Stage id="dispatch">
        <Halo d={footprint(P, 220, 32, 104, 56)} />
        <Link d={`${belt(190, 222)}${polyline([P(270, 60, 2), P(278, 60, 2)])}`} delaySec={-5} />
        <GableX P={P} x={222} y={34} w={48} d={50} h={28} rh={12} tone="tint" />
        <path className={s.soft} d={qR(P, 270, 50, 70, 0, 20)} />
        <path className={s.line} d={[5, 10, 15].map((z) => polyline([P(270, 50, z), P(270, 70, z)])).join("")} />
        {[[230, 240], [252, 262]].map(([x0, x1]) => <path key={x0} className={s.glass} d={qL(P, 84, x0, x1, 16, 22)} />)}
        <path className={s.soft} d={qL(P, 84, 242, 252, 0, 12)} />
        <g className={s.drive} style={cssVars({ "--drive": "0px" })}>
          <Block P={P} x={276} y={48} z={4} w={32} d={24} h={22} />
          <path className={s.accentLine} d={polyline([P(282, 72, 16), P(300, 72, 16)])} />
          <path className={s.line} d={polyline([P(282, 72, 11), P(294, 72, 11)])} />
          <Block P={P} x={308} y={50} z={4} w={14} d={22} h={17} />
          <path className={s.glass} d={qR(P, 322, 53, 69, 11, 18)} />
          <path className={s.glass} d={qL(P, 72, 311, 319, 11, 18)} />
          {[[284, 72], [300, 72], [316, 72]].map(([x, y]) => <path key={x} className={s.wheel} d={ring(P, "y", [x, y + 0.5, 4.5], 4.5, 20)} />)}
        </g>
      </Stage>

      {/* 01 — the sales order. */}
      <Stage id="order">
        <Panel x={48} y={60} w={124} h={64} n={n.order} title="SALES ORDER" code="SO-1042">
          <text className={s.micro} x="56" y="92">QTY</text>
          <text className={s.microInk} x="164" y="92" textAnchor="end">1,200 M</text>
          <path className={s.guide} d="M56 98H164" />
          <text className={s.micro} x="56" y="108">IN STOCK 400</text>
          <text className={s.microAccent} x="164" y="108" textAnchor="end">MAKE 800</text>
          <path className={s.bar} style={{ strokeWidth: 3.4, strokeLinecap: "butt" }} d="M56 116H90" />
          <path className={s.barAccent} style={{ strokeWidth: 3.4, strokeLinecap: "butt" }} d="M92 116H164" />
        </Panel>
      </Stage>

      {/* 02 — production plan: the work order lands on Thursday, line 2. */}
      <Stage id="plan">
        <Link d="M110 124V134" ambient={false} />
        <Panel x={48} y={134} w={124} h={64} n={n.plan} title="PLAN" code="WO-0318">
          {["M", "T", "W", "T", "F", "S"].map((d, k) => <text key={k} className={k === 3 ? s.microAccent : s.micro} x={r1(63 + k * 18.5)} y="163" textAnchor="middle">{d}</text>)}
          <path className={cx(s.guide, s.dashed)} d="M56 169H164M56 179H164M56 189H164" />
          <path className={s.barSoft} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M56 169H92M100 179H124M56 189H80M130 189H158" />
          <path className={s.barAccent} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M112 179H150" />
          <path className={s.bar} style={{ strokeWidth: 5, strokeLinecap: "butt" }} d="M96 169H120" />
        </Panel>
        {/* The plan issues material from the godown. */}
        <Link d={`M172 150H${r1(at(32, 59, 44)[0])}V${r1(at(32, 59, 44)[1] - 12)}`} delaySec={-2} fast />
      </Stage>

      {/* 07 — e-invoice + e-way bill, generated from the dispatch data. */}
      <Stage id="invoice">
        <Link d={`M${r1(tkx)} ${r1(tky - 2)}V232`} delaySec={-4} fast />
        <Panel x={452} y={168} w={140} h={64} n={n.invoice} title="E-INVOICE" code="GST">
          {QR.map((on, k) => on ? <rect key={k} className={s.qr} x={460 + (k % 4) * 6} y={194 + Math.floor(k / 4) * 6} width="5" height="5" /> : null)}
          <text className={s.micro} x="494" y="201">IRN</text>
          <text className={s.micro} x="494" y="215">E-WAY BILL</text>
          <Check x={580} y={198} r={4} />
          <Check x={580} y={212} r={4} />
          <path className={s.guide} d="M494 205H572M494 219H572" />
        </Panel>
      </Stage>

      {/* 08 — the founder's daily P&L. */}
      <Stage id="dashboard">
        <Link d="M522 168V156" ambient={false} />
        <Panel x={452} y={60} w={140} h={96} n={n.dashboard} title={"P&L · TODAY"} code="LIVE">
          <text className={s.figureNum} x="460" y="99">18.4%</text>
          <text className={s.micro} x="584" y="97" textAnchor="end">MARGIN</text>
          <path className={cx(s.guide, s.dashed)} d="M460 116H584M460 130H584" />
          <path className={s.guide} d="M460 144H584" />
          <path className={s.area} d={`${chartPath}L580 144H462Z`} />
          <path className={cx(s.accentLine, s.draw)} d={chartPath} pathLength={1} style={{ strokeWidth: 1.6 }} />
          <circle className={s.accentDot} cx="580" cy="114" r="2.8" />
          <circle className={cx(s.accentLine, s.pulse)} cx="580" cy="114" r="2.8" />
        </Panel>
      </Stage>

      {/* Stage tags for the floor, on a rail in front of the line. */}
      <Stage id="material"><Tag n={n.material} name="MATERIAL" x={r1(at(30, 150)[0])} y={r1(at(30, 150)[1])} anchor="end" leader={polyline([at(30, 120), at(30, 144)])} /></Stage>
      <Stage id="production"><Tag n={n.production} name="PRODUCTION" x={r1(at(118, 150)[0])} y={r1(at(118, 150)[1])} leader={polyline([at(118, 80), at(118, 144)])} /></Stage>
      <Stage id="qc"><Tag n={n.qc} name="QC" x={r1(at(187, 150)[0])} y={r1(at(187, 150)[1])} leader={polyline([at(187, 78), at(187, 144)])} /></Stage>
      <Stage id="dispatch"><Tag n={n.dispatch} name="DISPATCH" x={r1(at(292, 150)[0])} y={r1(at(292, 150)[1])} leader={polyline([at(292, 78), at(292, 144)])} /></Stage>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   REAL ESTATE — sources → score → site visit → allotment, over a skyline
   ══════════════════════════════════════════════════════════════════════ */
const SOURCE_GLYPHS = [
  "M-6-5h12v10h-12ZM-6-2h12M-4-3.5h.1M-2-3.5h.1",
  "M-6-5h12v8h-6.5l-3.5 3v-3h-2Z",
  "M-5 6c0-4.6 10-4.6 10 0M0 0.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2",
];

export function RealEstateArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifr");
  const sources = ["PORTALS", "WHATSAPP", "WALK-INS"];
  const scores = [92, 78, 64, 41];
  const booked = new Set(["0-5", "0-6", "1-2", "1-5", "1-6", "2-6", "2-3", "3-5", "3-1", "0-3"]);
  const units = [
    "ssas", "sass", "sAsa", "ssaa", "asss", "saas", "ssss", "sasa", "ssas", "sass",
  ];
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="REAL ESTATE / LEAD TO ALLOTMENT" tag="SITE VISITS" bottom="EVERY LEAD SCORED. EVERY VISIT BOOKED." />

      {/* A thin skyline of the project, drawn behind everything. */}
      <g className={s.thin}>
        <path d="M60 318V252H96V318M100 318V228H128V318M134 318V264H176V318" />
        <path d="M66 262h24M66 274h24M66 286h24M66 298h24M106 240h16M106 252h16M106 264h16M106 276h16M106 288h16M106 300h16M140 276h30M140 290h30M140 304h30" strokeDasharray="2 3" />
        {/* The tower under construction: slabs and columns. */}
        <path d="M208 318V246H262V318M208 258H262M208 270H262M208 282H262M208 294H262M208 306H262M226 246V318M244 246V318" />
        <path d="M280 318V238H320V318M328 318V272H362V318M370 318V256H420V318M428 318V282H470V318" />
        <path d="M288 250h24M288 262h24M288 274h24M288 286h24M288 298h24M378 268h34M378 282h34M378 296h34M436 294h26M436 306h26" strokeDasharray="2 3" />
        {/* Crane. */}
        <path d="M196 318V216M192 318V216M192 224l4 8M196 232l-4 8M192 240l4 8M196 248l-4 8M192 256l4 8M196 264l-4 8M192 272l4 8M196 280l-4 8M192 288l4 8M196 296l-4 8M192 304l4 8M172 216H266M178 216l16-10 16 10M172 216v8h10v-8" />
      </g>
      <g className={s.bob}>
        <path className={s.line} d="M252 216V240" />
        <rect className={s.tint} x="247" y="240" width="10" height="7" />
      </g>
      <path className={s.line} d="M48 318H592" />

      {/* 01 — lead sources. */}
      {sources.map((name, i) => {
        const y = 76 + i * 42;
        return <g key={name}>
          <rect className={s.surface} x="56" y={y} width="100" height="30" />
          <g className={s.minor}>
            <rect className={s.soft} x="62" y={y + 6} width="18" height="18" />
            <path className={s.line} style={{ strokeWidth: 1.1 }} d={SOURCE_GLYPHS[i]} transform={`translate(71 ${y + 15})`} />
          </g>
          <text className={cx(s.key, s.pullSmall)} style={cssVars({ "--pull": "-22px" })} x="88" y={y + 19}>{name}</text>
          <circle className={s.accentFill} cx="156" cy={y + 15} r="2.2" />
          <circle className={cx(s.accentLine, s.pulse)} cx="156" cy={y + 15} r="2.2" style={delay(i * 0.9)} />
        </g>;
      })}
      <path className={s.route} d="M156 91H172V175H156M156 133H190" />
      <path className={s.flow} d="M156 91H172V133H190" />
      <path className={s.flow} d="M156 175H172V133H190" style={delay(-4)} />
      <path className={cx(s.flow, s.flowFast)} d="M156 133H190" style={delay(-2)} />

      {/* 02 — scoring. */}
      <rect className={s.paper} x="190" y="76" width="110" height="114" />
      <rect className={s.soft} x="190" y="76" width="110" height="16" />
      <text className={s.key} x="200" y="87.5">LEAD SCORE</text>
      {scores.map((score, k) => {
        const y = 110 + k * 20;
        return <g key={score}>
          {k > 0 && <path className={s.guide} d={`M198 ${y - 10}H292`} />}
          <circle className={k === 0 ? s.accentFill : s.paper} cx="202" cy={y} r="3" />
          <path className={s.inkLine} style={{ strokeWidth: 1 }} d={`M212 ${y - 3}h${46 - k * 7}`} />
          <path className={s.guide} d={`M212 ${y + 3.5}h${28 + (k % 2) * 10}`} />
          <text className={k === 0 ? s.microAccent : s.microInk} x="291" y={y + 2.5} textAnchor="end">{score}</text>
        </g>;
      })}
      <rect className={cx(s.accentLine, s.rowScan)} style={cssVars({ strokeWidth: 1.2, "--row": "20px" })} x="194" y="100" width="102" height="20" />
      <path className={s.route} d="M300 133H330" />
      <path className={cx(s.flow, s.flowFast)} d="M300 133H330" style={delay(-3)} />

      {/* 03 — site-visit calendar (weekends fill first). */}
      <rect className={s.paper} x="330" y="76" width="130" height="114" />
      <rect className={s.soft} x="330" y="76" width="130" height="16" />
      <text className={s.key} x="340" y="87.5">SITE VISITS</text>
      <text className={s.micro} x="451" y="87" textAnchor="end">OCT</text>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, k) => <text key={k} className={k > 4 ? s.microAccent : s.micro} x={r1(344.6 + k * 17.14)} y="104" textAnchor="middle">{d}</text>)}
      {Array.from({ length: 28 }, (_, i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        const x = 336 + col * 17.14;
        const y = 110 + row * 18;
        const next = row === 2 && col === 5;
        return <g key={i}>
          <rect className={next ? s.accentFill : booked.has(`${row}-${col}`) ? s.tintMuted : s.guide} style={next || booked.has(`${row}-${col}`) ? undefined : { fill: "var(--home-surface)" }} x={r1(x + 1.5)} y={y + 1.5} width="14.1" height="15" />
          {next && <rect className={cx(s.accentLine, s.pulse)} x={r1(x + 1.5)} y={y + 1.5} width="14.1" height="15" />}
        </g>;
      })}
      <path className={s.route} d="M460 133H492" />
      <path className={cx(s.flow, s.flowFast)} d="M460 133H492" style={delay(-5)} />

      {/* 04 — allotment: the tower's unit grid, one unit being allotted. */}
      <text className={s.key} x="492" y="72">ALLOTMENT</text>
      <rect className={s.soft} x="488" y="78" width="96" height="6" />
      <rect className={s.paper} x="492" y="84" width="88" height="234" />
      <rect className={s.soft} x="580" y="84" width="6" height="234" />
      <path className={s.guide} d="M496 88H576" />
      {units.map((floor, row) => floor.split("").map((state, col) => {
        const x = 500 + col * 18;
        const y = 94 + row * 20;
        const allotted = state === "A";
        return <g key={`${row}-${col}`}>
          <rect className={allotted ? s.accentFill : state === "s" ? s.soft : s.surface} x={x} y={y} width="16" height="14" />
          {allotted && <rect className={cx(s.accentLine, s.pulse)} x={x} y={y} width="16" height="14" />}
        </g>;
      }))}
      <rect className={s.soft} x="526" y="298" width="20" height="20" />
      <text className={s.microAccent} x="536" y="338" textAnchor="middle">UNIT 1204 · ALLOTTED</text>
      <text className={s.micro} x="56" y="338">PROJECT · PHASE II · 3 TOWERS</text>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HEALTHCARE — arrivals → slots → queue → billing + records; reminders
   ══════════════════════════════════════════════════════════════════════ */
export function HealthcareArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ifc");
  // b booked · c confirmed · n now · f free
  const slots = ["cbn", "ccb", "bfc", "cbf", "fcb", "bff"];
  const times = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];
  const queue = [["T-12", "ROOM 1"], ["T-13", "NEXT"], ["T-14", "8 MIN"], ["T-15", "14 MIN"], ["T-16", "20 MIN"]];
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="HEALTHCARE / CLINIC FRONT DESK" tag="ON TIME" bottom="FEWER NO-SHOWS. SHORTER WAITS." />
      <path className={s.line} d="M48 318H592" />

      {/* The clinic front, with arrivals. */}
      <rect className={s.soft} x="60" y="164" width="100" height="6" />
      <rect className={s.paper} x="64" y="170" width="92" height="148" />
      <rect className={s.accentFill} x="98" y="180" width="24" height="24" />
      <path className={s.whiteLine} style={{ strokeWidth: 3.2, strokeLinecap: "butt" }} d="M110 185V199M103 192H117" />
      <rect className={s.glass} x="72" y="214" width="20" height="16" />
      <rect className={s.glass} x="128" y="214" width="20" height="16" />
      <rect className={s.soft} x="82" y="242" width="56" height="5" />
      <rect className={s.glass} x="92" y="247" width="36" height="71" />
      <path className={s.line} d="M110 247V318" />
      <Person x={78} y={318} />
      <g className={s.bob}><Person x={144} y={318} accent /></g>

      {/* Arrivals check in against the day's slots. */}
      <path className={s.route} d="M156 282H172V150H190" />
      <path className={s.flow} d="M156 282H172V150H190" />

      {/* Appointment slot grid. */}
      <rect className={s.paper} x="190" y="64" width="170" height="158" />
      <rect className={s.soft} x="190" y="64" width="170" height="16" />
      <text className={s.key} x="200" y="75.5">APPOINTMENTS</text>
      {["DR A", "DR B", "DR C"].map((d, k) => <text key={d} className={s.micro} x={248 + k * 44} y="92" textAnchor="middle">{d}</text>)}
      {times.map((t, row) => <text key={t} className={s.micro} x="198" y={111 + row * 20}>{t}</text>)}
      {slots.map((r, row) => r.split("").map((state, col) => {
        const x = 229 + col * 44;
        const y = 101 + row * 20;
        return <rect key={`${row}-${col}`} className={state === "n" ? s.accentFill : state === "c" ? s.tintMuted : state === "b" ? s.soft : cx(s.guide, s.dashed)} x={x} y={y} width="38" height="14" />;
      }))}
      <g className={s.scanY} style={cssVars({ "--scan": "96px" })}>
        <path className={s.accentLine} style={{ strokeWidth: 1 }} d="M226 108H358" />
        <circle className={s.accentFill} cx="226" cy="108" r="2.2" />
      </g>

      {/* WhatsApp reminders go out from the grid; confirmations come back. */}
      <path className={s.route} d="M275 222V238" />
      <path className={cx(s.flow, s.flowFast)} d="M275 222V238" />
      <rect className={s.surface} x="190" y="238" width="170" height="72" />
      <text className={s.key} x="200" y="252">REMINDERS</text>
      <g className={s.cycle}>
        <rect className={s.tint} x="236" y="258" width="112" height="22" rx="4" />
        <path className={s.accentLine} style={{ strokeWidth: 1 }} d="M245 266H318M245 273H296" />
        <path className={s.accentLine} style={{ strokeWidth: 1.1 }} d="m326 272 2 2 4-4m1 2 2 2 4-4" />
      </g>
      <g className={s.cycle} style={delay(1.2)}>
        <rect className={s.paper} x="200" y="286" width="84" height="18" rx="4" />
        <Check x={211} y={295} r={4} />
        <text className={s.microInk} x="220" y="297.5">CONFIRMED</text>
      </g>
      <path className={s.route} d="M190 300H160" />
      <path className={cx(s.flow, s.flowFast)} d="M190 300H160" style={delay(-2)} />

      {/* Doctor queue: a token board and the consulting room. */}
      <path className={s.route} d="M360 140H390" />
      <path className={cx(s.flow, s.flowFast)} d="M360 140H390" style={delay(-4)} />
      <rect className={s.surface} x="390" y="64" width="92" height="156" />
      <rect className={s.soft} x="390" y="64" width="92" height="16" />
      <text className={s.key} x="400" y="75.5">QUEUE</text>
      {queue.map(([token, state], k) => {
        const y = 98 + k * 25;
        return <g key={token}>
          {k > 0 && <path className={s.guide} d={`M396 ${y - 12}H476`} />}
          <text className={k === 0 ? s.microAccent : s.microInk} x="400" y={y + 2.5}>{token}</text>
          {k === 0 ? <rect className={s.accentFill} x="428" y={y - 6} width="46" height="12" /> : null}
          <text className={k === 0 ? s.whiteText : k === 1 ? cx(s.microAccent, s.blink) : s.micro} x="470" y={y + 2.5} textAnchor="end">{state}</text>
          <g className={s.smallOnly}>
            <path className={k < 2 ? s.barAccent : s.bar} d={`M400 ${y}H418`} />
            {k > 0 && <path className={k === 1 ? s.barAccent : s.barSoft} d={`M${474 - k * 9} ${y}H470`} />}
          </g>
        </g>;
      })}
      <rect className={s.paper} x="410" y="244" width="52" height="74" />
      <rect className={s.soft} x="416" y="252" width="40" height="66" />
      <circle className={s.line} cx="449" cy="286" r="1.6" />
      <rect className={s.surface} x="416" y="234" width="30" height="8" />
      <text className={s.micro} x="431" y="240.5" textAnchor="middle">RM 1</text>
      <circle className={s.accentFill} cx="454" cy="238" r="2.4" />
      <circle className={cx(s.accentLine, s.pulse)} cx="454" cy="238" r="2.4" />
      <path className={cx(s.guide, s.dashed)} d="M436 220V234" />

      {/* Billing, then the patient record. */}
      <path className={s.route} d="M482 120H512" />
      <path className={cx(s.flow, s.flowFast)} d="M482 120H512" style={delay(-6)} />
      <path className={s.paper} d="M512 64H576L588 76V180H512Z" />
      <path className={s.line} d="M576 64V76H588" />
      <text className={s.key} x="520" y="82">BILLING</text>
      <path className={s.guide} d="M520 96H566M520 106H572M520 116H560M520 126H570" />
      <path className={s.guide} d="M520 138H580" />
      <path className={s.bar} d="M520 150H546" />
      <g transform="rotate(-10 562 164)">
        <rect className={s.accentLine} style={{ strokeWidth: 1.2 }} x="545" y="157" width="34" height="14" />
        <text className={s.microAccent} x="562" y="166.5" textAnchor="middle">PAID</text>
      </g>
      <path className={s.route} d="M550 180V202" />
      <path className={cx(s.flow, s.flowFast)} d="M550 180V202" style={delay(-1)} />
      <rect className={s.tint} x="528" y="202" width="40" height="12" />
      <path className={s.accentLine} style={{ strokeWidth: 1 }} d="M534 208H556" />
      <rect className={s.paper} x="516" y="214" width="68" height="104" />
      {[222, 254, 286].map((y) => <g key={y}><rect className={s.surface} x="522" y={y} width="56" height="26" /><path className={s.line} d={`M543 ${y + 13}H557`} /></g>)}

      {/* Floor labels. */}
      {[["ARRIVALS", 110], ["DOCTOR", 436], ["RECORDS", 550]].map(([name, x]) => <text key={name} className={s.key} x={x} y="338" textAnchor="middle">{name}</text>)}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ECOMMERCE — catalog → cart → checkout → fulfilment → repeat
   ══════════════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  "M-4-13h8v4l3 3v18h-14v-18l3-3Z",
  "M-8-5h16v17h-16ZM-9-10h18v5h-18Z",
  "M-5-13h10l2 21h-14ZM-3 8h6v4h-6Z",
  "M-2.5-14h5v6h-5ZM-6-8h12v20h-12Z",
  "M-9-8h18v20h-18ZM-9-2h18",
  "M-5-6h10v18h-10ZM-1-6v-5h6M-5-2h10",
];

export function EcommerceArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ife");
  const P = projector(500, 214);
  const parcel = box(P, 0, 0, 0, 28, 22, 20);
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="D2C / ORDER TO REORDER" tag="SYNCED" bottom="EVERY ORDER BRINGS THE NEXT ONE CLOSER." />

      {/* Marketplace sync with the catalog. */}
      {[64, 112, 160].map((x, k) => <g key={x}>
        <rect className={s.surface} x={x} y="58" width="40" height="26" />
        <path className={k === 0 ? s.tint : s.soft} d={`M${x + 8} 70h24l-3-6h-18Z`} />
        <path className={s.line} style={{ strokeWidth: 1 }} d={`M${x + 10} 70v8h20v-8M${x + 17} 78v-5h6v5`} />
      </g>)}
      <text className={s.key} x="212" y="75">MARKETPLACES</text>
      <path className={s.route} d="M84 84V92H180V84M132 92V110" />
      <path className={cx(s.flow, s.flowFast)} d="M132 92V110" />
      <path className={cx(s.flow, s.flowFast, s.flowReverse)} d="M84 92H180" />
      <g className={s.spin}>
        <circle className={s.paper} cx="132" cy="96" r="7" />
        <path className={s.accentLine} style={{ strokeWidth: 1.1 }} d="M127.5 93a5 5 0 0 1 8.5-1.5M136.5 99a5 5 0 0 1-8.5 1.5M136.5 89.5l-.4 2.1-2.1-.4M127.5 102.5l.4-2.1 2.1.4" />
      </g>

      {/* Catalog. */}
      <rect className={s.paper} x="56" y="110" width="152" height="140" />
      <rect className={s.soft} x="56" y="110" width="152" height="16" />
      <text className={s.key} x="66" y="121.5">CATALOG</text>
      {PRODUCTS.map((glyph, k) => {
        const x = 66 + (k % 3) * 46;
        const y = 134 + Math.floor(k / 3) * 56;
        const pick = k === 1;
        return <g key={k}>
          <rect className={pick ? s.tint : s.surface} x={x} y={y} width="40" height="50" />
          <path className={pick ? s.accentLine : s.line} style={{ strokeWidth: 1.1 }} d={glyph} transform={`translate(${x + 20} ${y + 22})`} />
          <path className={pick ? s.barAccent : s.bar} style={{ strokeWidth: 2 }} d={`M${x + 6} ${y + 43}h${pick ? 16 : 12}`} />
        </g>;
      })}

      {/* Cart. */}
      <path className={s.route} d="M208 180H236" />
      <path className={cx(s.flow, s.flowFast)} d="M208 180H236" />
      <rect className={s.paper} x="236" y="110" width="88" height="140" />
      <rect className={s.soft} x="236" y="110" width="88" height="16" />
      <text className={s.key} x="246" y="121.5">CART</text>
      <path className={s.inkLine} style={{ strokeWidth: 1.2 }} d="M254 142h7l6 22h26l5-16h-33M270 170h22" />
      <circle className={s.line} cx="271" cy="176" r="3" />
      <circle className={s.line} cx="289" cy="176" r="3" />
      <circle className={s.accentFill} cx="302" cy="140" r="7" />
      <text className={s.whiteText} x="302" y="142.5" textAnchor="middle" style={{ letterSpacing: 0 }}>2</text>
      {[196, 218].map((y, k) => <g key={y}>
        <rect className={k === 0 ? s.tint : s.soft} x="246" y={y} width="14" height="14" />
        <path className={s.inkLine} style={{ strokeWidth: 1 }} d={`M266 ${y + 4}h${30 - k * 8}`} />
        <path className={s.guide} d={`M266 ${y + 10}h18`} />
      </g>)}

      {/* Checkout. */}
      <path className={s.route} d="M324 180H352" />
      <path className={cx(s.flow, s.flowFast)} d="M324 180H352" style={delay(-2)} />
      <rect className={s.paper} x="352" y="110" width="88" height="140" />
      <rect className={s.soft} x="352" y="110" width="88" height="16" />
      <text className={s.key} x="362" y="121.5">CHECKOUT</text>
      {["UPI", "CARD", "COD"].map((name, k) => {
        const y = 146 + k * 22;
        return <g key={name}>
          {k > 0 && <path className={s.guide} d={`M360 ${y - 11}H432`} />}
          <circle className={k === 0 ? s.accentDot : s.surface} cx="367" cy={y} r="4.5" />
          {k === 0 && <circle className={s.accentFill} cx="367" cy={y} r="2" />}
          <text className={k === 0 ? s.microInk : s.micro} x="378" y={y + 2.5}>{name}</text>
          <path className={s.guide} d={`M408 ${y}h${18 - k * 4}`} />
        </g>;
      })}
      <rect className={s.accentFill} x="362" y="214" width="68" height="22" />
      <path className={s.whiteLine} style={{ strokeWidth: 1.4 }} d="m388 225 3.5 3.5 7-7" />

      {/* Fulfilment: a packed parcel with its airway bill and the courier. */}
      <text className={s.key} x="470" y="121.5">FULFILMENT</text>
      <path className={s.route} d="M440 225H478" />
      <path className={cx(s.flow, s.flowFast)} d="M440 225H478" style={delay(-4)} />
      <path className={s.line} d="M462 240H592" />
      <path className={s.surface} d={parcel.left} />
      <path className={s.soft} d={parcel.right} />
      <path className={s.paper} d={parcel.top} />
      <path className={s.accentLine} style={{ strokeWidth: 1.2 }} d={polyline([P(14, 0, 20), P(14, 22, 20), P(14, 22, 12)])} />
      <path className={s.tintMuted} d={poly([P(4, 22, 5), P(11, 22, 5), P(11, 22, 12), P(4, 22, 12)])} />
      {/* Tracking, pushed to the customer at every step. */}
      <path className={s.line} d="M476 148H584" />
      <path className={s.accentLine} d="M476 148H530" />
      {[476, 530, 584].map((x, k) => <g key={x}>
        {k < 2 ? <circle className={s.accentFill} cx={x} cy="148" r="4" /> : <circle className={s.accentDot} cx={x} cy="148" r="4" />}
        {k === 2 && <circle className={cx(s.accentLine, s.pulse)} cx={x} cy="148" r="4" />}
        <text className={k === 2 ? s.microAccent : s.micro} x={x} y="164" textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} dx={k === 0 ? -4 : k === 2 ? 4 : 0}>{["PACKED", "SHIPPED", "OUT"][k]}</text>
      </g>)}
      <text className={s.micro} x="470" y="190">AWB 41·2208</text>
      <path className={s.guide} d="M478 194 486 208" />
      <g className={s.drive} style={cssVars({ "--drive": "10px" })}>
        <path className={s.paper} d="M530 204H566V234H530Z" />
        <path className={s.surface} d="M566 212H580L588 222V234H566Z" />
        <path className={s.glass} d="M569 215H579L584 222H569Z" />
        <path className={s.accentLine} style={{ strokeWidth: 1.2 }} d="M536 214h16" />
        {[540, 578].map((x) => <circle key={x} className={s.surface} style={{ stroke: "var(--home-ink)" }} cx={x} cy="235" r="5" />)}
      </g>

      {/* The repeat-purchase loop back into the catalog. */}
      <path className={s.route} d="M560 246V296H132V250" />
      <path className={s.flow} d="M560 246V296H132V252" />
      <path className={s.accentLine} d="m127 257 5-6 5 6" />
      {[[520, "DELIVERED", false], [408, "REVIEW", false], [296, "REORDER · DAY 30", true]].map(([x, name, accent]) => <g key={String(name)}>
        <circle className={accent ? s.accentFill : s.accentDot} cx={Number(x)} cy="296" r="4" />
        {accent ? <circle className={cx(s.accentLine, s.pulse)} cx={Number(x)} cy="296" r="4" /> : null}
        <text className={accent ? s.microAccent : s.micro} x={Number(x)} y="314" textAnchor="middle">{String(name)}</text>
      </g>)}
      <text className={s.keyAccent} x="144" y="288">REPEAT LOOP</text>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EDTECH — enquiry → counselling → batch → attendance → fees → results
   ══════════════════════════════════════════════════════════════════════ */
const EDTECH_CARDS = [
  { x: 56, y: 70, n: "01", name: "ENQUIRY" },
  { x: 256, y: 70, n: "02", name: "COUNSELLING" },
  { x: 456, y: 70, n: "03", name: "BATCHES" },
  { x: 456, y: 214, n: "04", name: "ATTENDANCE" },
  { x: 256, y: 214, n: "05", name: "FEES" },
  { x: 56, y: 214, n: "06", name: "RESULTS" },
];

export function EdtechArt({ compact, className, label }: ArtProps) {
  const id = useFigureId("ift");
  const trail = "M120 120H520V264H120";
  const card = "M-7-5h14v10h-14Z";
  const cards = EDTECH_CARDS;
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="COACHING INSTITUTE / ENQUIRY TO RESULTS" tag="ADMISSIONS" bottom="ONE STUDENT RECORD, FROM FIRST CALL TO FINAL RANK." />

      {/* One student record, snaking through six stages. */}
      <path className={s.route} d="M184 120H256M384 120H456M520 170V214M456 264H384M256 264H184" />
      <path className={s.flow} d="M184 120H256" />
      <path className={s.flow} d="M384 120H456" style={delay(-3)} />
      <path className={cx(s.flow, s.flowFast)} d="M520 170V214" style={delay(-1)} />
      <path className={s.flow} d="M456 264H384" style={delay(-6)} />
      <path className={s.flow} d="M256 264H184" style={delay(-9)} />
      {[0, 4].map((k) => <g key={k} className={s.traveler} style={{ offsetPath: `path("${trail}")`, animationDuration: "12s", ...delay(k * -1 + k * 1.5) }}>
        <path className={s.tint} d={card} />
        <circle className={s.accentFill} cx="-3" cy="-1" r="1.5" />
      </g>)}

      {cards.map((c) => <g key={c.n}>
        <rect className={s.paper} x={c.x} y={c.y} width="128" height="100" />
        <text className={s.microAccent} x={c.x + 10} y={c.y + 17}>{c.n}</text>
        <text className={s.key} x={c.x + 26} y={c.y + 17}>{c.name}</text>
        <path className={s.guide} d={`M${c.x + 8} ${c.y + 25}H${c.x + 120}`} />
      </g>)}

      {/* 01 Enquiry: a form arriving. */}
      <g className={s.cycle}>
        <rect className={s.surface} x="66" y="104" width="108" height="13" />
        <rect className={s.surface} x="66" y="122" width="108" height="13" />
        <rect className={s.surface} x="66" y="140" width="72" height="13" />
        <text className={s.micro} x="71" y="113">NAME</text>
        <text className={s.micro} x="71" y="131">CLASS 11 · JEE</text>
        <text className={s.micro} x="71" y="149">CALLBACK</text>
      </g>
      <rect className={s.accentFill} x="144" y="140" width="30" height="13" />
      <text className={s.whiteText} x="159" y="149" textAnchor="middle" style={{ letterSpacing: ".06em" }}>NEW</text>
      <circle className={s.accentFill} cx="170" cy="82" r="2.2" />
      <circle className={cx(s.accentLine, s.pulse)} cx="170" cy="82" r="2.2" />

      {/* 02 Counselling: two chairs across a desk. */}
      <path className={s.inkLine} style={{ strokeWidth: 1.1 }} d="M288 152H352M296 152V164M344 152V164" />
      <Person x={290} y={152} scale={0.9} />
      <Person x={350} y={152} scale={0.9} accent />
      <g className={s.cycle} style={delay(0.8)}>
        <rect className={s.surface} x="296" y="104" width="40" height="18" rx="3" />
        <path className={s.guide} d="M302 110h28M302 116h18" />
      </g>
      <text className={s.micro} x="320" y="164" textAnchor="middle">4:30 PM</text>

      {/* 03 Batches: seat maps, one seat allocated. */}
      {[0, 1, 2].map((b) => <g key={b}>
        <text className={s.micro} x={470 + b * 36} y="108">{String.fromCharCode(65 + b)}</text>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 473 + b * 36 + col * 9;
          const y = 118 + row * 11;
          const taken = (i + b * 2) % 5 !== 0;
          const pick = b === 1 && i === 7;
          return <g key={i}>
            <rect className={pick ? s.accentFill : taken ? s.soft : s.surface} x={x - 3} y={y - 3} width="7" height="7" />
            {pick && <rect className={cx(s.accentLine, s.pulse)} x={x - 3} y={y - 3} width="7" height="7" />}
          </g>;
        })}
      </g>)}
      <text className={s.micro} x="470" y="166">24 / 30 SEATS</text>

      {/* 04 Attendance: a register, one absence flagged. */}
      {Array.from({ length: 28 }, (_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = 468 + col * 15;
        const y = 248 + row * 12;
        const absent = row === 2 && col === 4;
        return <g key={i}>
          <rect className={absent ? s.tint : s.surface} x={x} y={y} width="12" height="9" />
          {absent
            ? <path className={cx(s.accentLine, s.blink)} style={{ strokeWidth: 1.1 }} d={`M${x + 3.5} ${y + 2}l5 5m0-5-5 5`} />
            : <path className={s.line} style={{ strokeWidth: 1 }} d={`m${x + 3.5} ${y + 4.5} 1.8 2 3.4-3.6`} />}
        </g>;
      })}
      <text className={s.microAccent} x="468" y="304">SMS SENT TO PARENT</text>

      {/* 05 Fees: instalments on a line. */}
      <path className={s.line} d="M274 268H366" />
      {[274, 305, 336, 366].map((x, k) => <g key={x}>
        {k < 2 ? <Check x={x} y={268} r={6} /> : <circle className={k === 2 ? s.accentDot : s.surface} cx={x} cy="268" r="6" />}
        {k === 2 && <circle className={cx(s.accentLine, s.pulse)} cx={x} cy="268" r="6" />}
        <text className={k === 2 ? s.microAccent : s.micro} x={x} y="288" textAnchor="middle">{["PAID", "PAID", "DUE", "MAR"][k]}</text>
      </g>)}
      <path className={s.guide} d="M270 298H370" />
      <text className={s.micro} x="270" y="308">INSTALMENT 3 OF 4</text>

      {/* 06 Results: scores rising across tests. */}
      <path className={s.guide} d="M70 300H170" />
      <path className={cx(s.guide, s.dashed)} d="M70 262H170M70 281H170" />
      {[18, 26, 23, 34, 40, 50].map((h, k) => <rect key={k} className={k === 5 ? cx(s.accentFill, s.grow) : k === 4 ? s.tintMuted : s.soft} x={74 + k * 16} y={300 - h} width="10" height={h} />)}
      <text className={s.microAccent} x="170" y="246" textAnchor="end">RANK 12</text>
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
