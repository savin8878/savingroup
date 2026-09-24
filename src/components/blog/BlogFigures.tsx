import { useId, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type { BlogSketchKey } from "@/lib/blogs";
import s from "./BlogFigures.module.css";

/**
 * Blog figures — one technical line drawing per BlogSketchKey plus the
 * "workshop" hero for the blog index. Server-safe (no client JS): every
 * animation is CSS and pauses via [data-motion="paused"] / [data-in-view="false"]
 * supplied by <BlogMotion>. Drawings are complete without motion.
 */

export type BlogFigureKey = BlogSketchKey | "workshop";

export interface FigureArtProps {
  /** Thumbnail mode: tighter crop, no text, motion only while a parent card is hovered. */
  compact?: boolean;
  className?: string;
  /** Accessible description. When set the SVG is role="img"; otherwise it is aria-hidden. */
  label?: string;
}

export const FIGURE_TITLES: Record<BlogFigureKey, string> = {
  workshop: "The workshop",
  auditLens: "The revenue audit",
  leakyFunnel: "Where the leads leak",
  whatsappFlow: "The conversation pipeline",
  layerStack: "The five-layer stack",
  seoPeakGraph: "Compounding search growth",
  procurementFlow: "Request to receipt",
};

export const FIGURE_DESCRIPTIONS: Record<BlogFigureKey, string> = {
  workshop: "Illustration: field notes from client engagements move through an editorial desk and become published articles that reach readers.",
  auditLens: "Diagram: a five-stage sales pipeline from visit to close, inspected with a magnifying lens that finds three leaks between stages.",
  leakyFunnel: "Diagram: a four-stage conversion funnel with leads leaking from its side at each stage, and a route that recovers them.",
  whatsappFlow: "Diagram: chat messages from a customer's phone move through three tiers — bot, relationship manager and human closer — into a CRM.",
  layerStack: "Diagram: five stacked layers — attention, conversion, qualification, nurture and retention — with a loop that feeds retention back into attention.",
  seoPeakGraph: "Chart: organic search traffic compounding over six months while paid traffic stays flat, with a topic cluster of linked pages.",
  procurementFlow: "Diagram: one purchase moving through eight stages, from requisition and approval to purchase order, transport and goods receipt.",
};

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

function useFigureId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/* ── Isometric helpers ─────────────────────────────────────────────────── */
type Pt = [number, number];
type Projector = (x: number, y: number, z?: number) => Pt;
const COS30 = 0.8660254;
const r1 = (n: number) => Math.round(n * 10) / 10;
function projector(ox: number, oy: number): Projector {
  return (x, y, z = 0) => [ox + (x - y) * COS30, oy + (x + y) * 0.5 - z];
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
/** Local frame on a rotated footprint: (lx, ly) → projected point at height z. */
function localFrame(P: Projector, cx0: number, cy0: number, deg: number, z: number) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const n = Math.sin(a);
  return (lx: number, ly: number): Pt => P(cx0 + lx * c - ly * n, cy0 + lx * n + ly * c, z);
}
/** A thin rotated sheet (card / page): top + the two visible edges. */
function sheet(P: Projector, cx0: number, cy0: number, w: number, d: number, z: number, h: number, deg: number) {
  const top = localFrame(P, cx0, cy0, deg, z + h);
  const base = localFrame(P, cx0, cy0, deg, z);
  const [hw, hd] = [w / 2, d / 2];
  return {
    top: poly([top(-hw, -hd), top(hw, -hd), top(hw, hd), top(-hw, hd)]),
    left: poly([top(-hw, hd), top(hw, hd), base(hw, hd), base(-hw, hd)]),
    right: poly([top(hw, -hd), top(hw, hd), base(hw, hd), base(hw, -hd)]),
    at: top,
  };
}

/* ── Shared plate: svg root, dot grid, registration frame ─────────────── */
function Plate({ compact, className, label, viewBox = "0 0 640 400", compactViewBox = "40 44 560 350", children }: FigureArtProps & { viewBox?: string; compactViewBox?: string; children: ReactNode }) {
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

function Frame({ top, tag, bottom, note = "ILLUSTRATIVE SYSTEM", height = 400 }: { top: string; tag: string; bottom: string; note?: string; height?: number }) {
  const b = height - 28;
  return <g className={s.frame}>
    <path className={s.guide} d={`M20 28h16M28 20v16M604 28h16M612 20v16M20 ${b}h16M28 ${b - 8}v16M604 ${b}h16M612 ${b - 8}v16`} />
    <text className={s.annot} x="48" y="36">{top}</text>
    <circle className={s.accentFill} cx="494" cy="33" r="2.5" />
    <text className={s.annot} x="503" y="36">{tag}</text>
    <path className={s.guide} d={`M48 ${b - 16}H592`} />
    <text className={s.annot} x="48" y={b + 3}>{bottom}</text>
    <text className={s.annot} x="592" y={b + 3} textAnchor="end">{note}</text>
  </g>;
}

const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/* ══════════════════════════════════════════════════════════════════════
   FIG — The workshop (blog index hero)
   ══════════════════════════════════════════════════════════════════════ */
export function WorkshopFigure({ compact, className, label, count }: FigureArtProps & { count?: number }) {
  const id = useFigureId("bfw");
  const P = projector(320, 150);
  const floor = box(P, 0, 0, -14, 300, 300, 14);
  const desk = box(P, 120, 118, 0, 76, 76, 56);
  const r1Path = polyline([P(87, 232), P(140, 232), P(140, 194)]);
  const r2Path = polyline([P(196, 150), P(214, 150), P(214, 196), P(228, 196)]);
  const r3Path = polyline([P(262, 168), P(262, 50)]);
  const noteAngles = [6, -4, 3, -7, 2];
  const pageAngles = [0, 2, -2, 1, -1, 0];
  const topNote = sheet(P, 56, 210, 62, 70, 20, 2.5, noteAngles[4]);
  const topPage = sheet(P, 256, 198, 56, 60, 22.5, 2, pageAngles[5]);
  const screen = (x: number, z: number) => P(x, 40, z);
  // Tiny page glyph (centred at the origin) for the travellers.
  const glyph = poly([[-1.3, -5.25], [9.1, 0.75], [1.3, 5.25], [-9.1, -0.75]]);

  return (
    <Plate compact={compact} className={className} label={label} viewBox="0 0 640 520" compactViewBox="40 118 560 350">
      <DotGrid id={id} x={36} y={56} width={568} height={420} />
      <g className={s.frame}>
        <path className={s.guide} d="M20 28h16M28 20v16M604 28h16M612 20v16M20 492h16M28 484v16M604 492h16M612 484v16" />
        <path className={cx(s.guide, s.dashed)} d="M60 96H580M60 474H580M320 64V480" />
        <text className={s.annot} x="48" y="40">FIELD NOTES / EDITORIAL SYSTEM</text>
        <circle className={s.accentFill} cx="512" cy="37" r="2.5" />
        <text className={s.annot} x="521" y="40">PUBLISHING</text>
        <path className={s.guide} d="M48 486H592" />
        <text className={s.annot} x="48" y="506">FROM THE BUILD. TO THE PAGE.</text>
        <text className={s.annot} x="592" y="506" textAnchor="end">ILLUSTRATIVE SYSTEM</text>
      </g>

      {/* The plate: floor with a shallow edge and a drafting grid. */}
      <g>
        <path className={s.soft} d={floor.left} />
        <path className={s.soft} d={floor.right} />
        <path className={s.paper} d={floor.top} />
        <path className={s.guide} d={[1, 2, 3, 4, 5].map((k) => `${polyline([P(k * 50, 0), P(k * 50, 300)])}${polyline([P(0, k * 50), P(300, k * 50)])}`).join("")} />
        <path className={cx(s.guide, s.dashed)} d={poly([P(14, 14), P(286, 14), P(286, 286), P(14, 286)])} />
      </g>

      {/* Routes on the floor: notes → desk → published → readers. */}
      <g>
        <path className={s.route} d={`${r1Path}${r2Path}${r3Path}`} />
        <path className={s.flow} d={r1Path} />
        <path className={cx(s.flow, s.flowFast)} d={r2Path} style={delay(-2)} />
        <path className={s.flow} d={r3Path} style={delay(-5)} />
      </g>
      {/* Sheets travelling along the routes, passing under the objects (progressive enhancement). */}
      {[r1Path, r2Path, r3Path].map((d, k) => <g key={d} className={s.traveler} style={{ offsetPath: `path("${d}")`, ...delay(k * 2.1) }}><path className={s.tint} d={glyph} /></g>)}

      {/* Loose notes on the floor. */}
      {[[48, 262, 40, 26, 14], [100, 272, 36, 24, -10]].map(([x, y, w, d, a]) => {
        const card = sheet(P, x, y, w, d, 0, 1.5, a);
        return <g key={`${x}-${y}`}>
          <path className={s.surface} d={card.left} /><path className={s.surface} d={card.right} /><path className={s.surface} d={card.top} />
          <path className={s.guide} d={`${polyline([card.at(-w / 2 + 6, -4), card.at(w / 2 - 8, -4)])}${polyline([card.at(-w / 2 + 6, 3), card.at(w / 2 - 16, 3)])}`} />
        </g>;
      })}

      {/* Field-notes stack: five cards, the top one written on and tabbed. */}
      <g>
        {noteAngles.map((angle, j) => {
          const card = sheet(P, 56 + (j % 2) * 2, 210 - j, 62, 70, j * 5, 2.5, angle);
          return <g key={j}><path className={s.soft} d={card.left} /><path className={s.soft} d={card.right} /><path className={j === 4 ? s.surface : s.paper} d={card.top} /></g>;
        })}
        <path className={s.accentFill} d={poly([topNote.at(20, -35), topNote.at(31, -35), topNote.at(31, -24), topNote.at(20, -24)])} />
        <path className={s.line} d={[[-22, -22, 14], [-22, -12, 20], [-22, -2, 6], [-22, 8, 16], [-22, 18, 0]].map(([x0, y0, x1]) => polyline([topNote.at(x0, y0), topNote.at(x1, y0)])).join("")} />
        <path className={s.accentLine} d={polyline([topNote.at(-22, 26), topNote.at(-6, 26)])} />
      </g>

      {/* The editorial desk — the one warm, solid object in the drawing. */}
      <g>
        <path className={s.machineRight} d={desk.right} />
        <path className={s.machineLeft} d={desk.left} />
        <path className={s.machineTop} d={desk.top} />
        <path className={s.whiteLine} d={poly([P(128, 126, 56), P(188, 126, 56), P(188, 142, 56), P(128, 142, 56)])} />
        <path className={s.whiteLine} d={[134, 146, 158, 170, 182].map((x) => polyline([P(x, 129, 56), P(x, 139, 56)])).join("")} />
        <path className={s.machineSlot} d={poly([P(136, 150, 56), P(180, 150, 56), P(180, 160, 56), P(136, 160, 56)])} />
        <path className={s.whiteLine} d={[40, 34, 28, 22].map((z) => polyline([P(196, 132, z), P(196, 176, z)])).join("")} />
        <circle className={s.lamp} cx={P(196, 124, 47)[0]} cy={P(196, 124, 47)[1]} r="2.6" />
        <circle className={cx(s.lamp, s.pulse)} cx={P(196, 124, 47)[0]} cy={P(196, 124, 47)[1]} r="2.6" />
        <text className={s.whiteText} x={P(158, 194, 26)[0]} y={P(158, 194, 26)[1]} textAnchor="middle" transform={`rotate(30 ${r1(P(158, 194, 26)[0])} ${r1(P(158, 194, 26)[1])})`}>EDITING</text>
        {/* A note being fed into the desk. */}
        <g className={s.bob}>
          <path className={s.surface} d={poly([P(142, 155, 58), P(174, 155, 58), P(174, 155, 88), P(142, 155, 88)])} />
          <path className={s.guide} d={[80, 74, 68].map((z, k) => polyline([P(147, 155, z), P(168 - k * 5, 155, z)])).join("")} />
          <path className={s.accentLine} d={polyline([P(147, 155, 84), P(160, 155, 84)])} />
        </g>
      </g>

      {/* Floating review label, like the home hero's INTELLIGENCE tag. */}
      <path className={s.accentLine} d={`M${r1(P(158, 155, 88)[0])} ${r1(P(158, 155, 88)[1]) - 4}V178`} strokeDasharray="2 4" />
      <rect className={s.paper} x="262" y="154" width="122" height="24" rx="3" />
      <text className={s.boxLabel} x="323" y="169.5" textAnchor="middle">EDITORIAL REVIEW</text>

      {/* Published field notes: a neat stack, top page typeset. */}
      <g>
        {pageAngles.map((angle, j) => {
          const page = sheet(P, 256, 198, 56, 60, j * 4.5, 2, angle);
          return <g key={j}><path className={s.soft} d={page.left} /><path className={s.soft} d={page.right} /><path className={j === 5 ? s.surface : s.paper} d={page.top} /></g>;
        })}
        <path className={s.tint} d={poly([topPage.at(-21, -22), topPage.at(12, -22), topPage.at(12, -14), topPage.at(-21, -14)])} />
        <path className={s.line} d={[[-21, -6, 20], [-21, 1, 16], [-21, 8, 20], [-21, 15, 4]].map(([x0, y0, x1]) => polyline([topPage.at(x0, y0), topPage.at(x1, y0)])).join("")} />
      </g>

      {/* Readers: a standing screen showing the published article. */}
      <g>
        <path className={s.soft} d={box(P, 224, 26, 0, 48, 24, 4).left} /><path className={s.soft} d={box(P, 224, 26, 0, 48, 24, 4).right} /><path className={s.paper} d={box(P, 224, 26, 0, 48, 24, 4).top} />
        <path className={s.soft} d={box(P, 244, 36, 4, 8, 6, 28).left} /><path className={s.soft} d={box(P, 244, 36, 4, 8, 6, 28).right} />
        <path className={s.soft} d={poly([P(292, 35, 30), P(292, 40, 30), P(292, 40, 120), P(292, 35, 120)])} />
        <path className={s.soft} d={poly([P(204, 35, 120), P(292, 35, 120), P(292, 40, 120), P(204, 40, 120)])} />
        <path className={s.surface} d={poly([screen(204, 30), screen(292, 30), screen(292, 120), screen(204, 120)])} />
        <path className={s.line} d={polyline([screen(204, 110), screen(292, 110)])} />
        {[210, 215, 220].map((x) => <circle key={x} className={s.line} cx={screen(x, 115)[0]} cy={screen(x, 115)[1]} r="1.1" />)}
        <path className={s.tint} d={poly([screen(212, 94), screen(262, 94), screen(262, 102), screen(212, 102)])} />
        <path className={s.guide} d={[[86, 280], [80, 272], [74, 252], [62, 256], [56, 250], [50, 236], [44, 252]].map(([z, x1]) => polyline([screen(212, z), screen(x1, z)])).join("")} />
        {[[266, 16], [273, 24], [280, 12], [287, 28]].map(([x, h], k) => <path key={x} className={cx(s.accentFill, s.grow)} style={delay(k * -1.1)} d={poly([screen(x - 2.5, 40), screen(x + 2.5, 40), screen(x + 2.5, 40 + h), screen(x - 2.5, 40 + h)])} />)}
      </g>

      {/* Nodes where the work changes hands. */}
      {[P(140, 232), P(214, 196), P(262, 110)].map(([x, y]) => <g key={`${x}`}><circle className={s.accentDot} cx={x} cy={y} r="4" /><circle className={cx(s.accentLine, s.pulse)} cx={x} cy={y} r="4" /></g>)}


      {/* Leaders + micro labels. */}
      <path className={s.guide} d="M168 250 140 222H72" />
      <text className={s.micro} x="72" y="216">FIELD NOTES</text>
      <text className={s.microAccent} x="72" y="236">FROM THE BUILD</text>
      <path className={s.guide} d="M370 384 398 402H470" />
      <text className={s.micro} x="476" y="405">PUBLISHED{typeof count === "number" ? ` / ${String(count).padStart(2, "0")}` : ""}</text>
      <path className={s.guide} d="M461 150 446 136H392" />
      <text className={s.micro} x="392" y="131">READERS</text>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   auditLens — pipeline inspected with a lens; three leaks found
   ══════════════════════════════════════════════════════════════════════ */
const PIPE_X = [60, 168, 276, 384, 492];
const PIPE_LABELS = ["VISIT", "ENQUIRY", "REPLY", "CALL", "CLOSE"];
const PIPE_VALUES = [1, 0.62, 0.34, 0.7, 0.46];
const LEAK_X = [264, 372, 480];

function PipelineBoxes() {
  return <>
    {PIPE_X.map((x, i) => <g key={x}>
      <rect className={i === 2 ? s.surface : s.paper} x={x} y="92" width="84" height="54" />
      <text className={s.micro} x={x + 10} y="108">0{i + 1} {PIPE_LABELS[i]}</text>
      <path className={s.guide} d={`M${x + 10} 128h64`} />
      <path className={i === 2 ? s.barAccent : s.bar} d={`M${x + 10} 128h${Math.round(64 * PIPE_VALUES[i])}`} />
      <path className={s.guide} d={`M${x + 10} 137h${36 - i * 3}`} />
    </g>)}
  </>;
}

export function AuditLensFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfa");
  const weeks = [288, 285, 280, 283, 276, 272, 291, 298, 294, 270, 259, 248];
  const wx = (k: number) => 78 + k * 30.5;
  const before = weeks.slice(0, 9).map((y, k) => `${k ? "L" : "M"}${r1(wx(k))} ${y}`).join("");
  const after = weeks.slice(8).map((y, k) => `${k ? "L" : "M"}${r1(wx(k + 8))} ${y}`).join("");
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="REVENUE AUDIT / DIAGNOSTIC VIEW" tag="INSPECTED" bottom="EVERY HANDOFF, INSPECTED." />
      <text className={s.micro} x="60" y="80">01 / PIPELINE</text>
      <text className={s.micro} x="576" y="80" textAnchor="end">45-MINUTE REVIEW</text>

      {/* Data moves between stages; the boxes sit over the line. */}
      <path className={s.route} d="M40 119H600" />
      <path className={s.flow} d="M40 119H600" />
      <PipelineBoxes />

      {/* Leak markers under each broken handoff. */}
      {LEAK_X.map((x, i) => <g key={x}>
        <path className={s.accentLine} d={`M${x} 150v${i === 1 ? 0 : 14}`} strokeDasharray="2 3" />
        <circle className={s.accentDot} cx={x} cy="178" r="8" />
        <text className={s.microAccent} x={x} y="180.5" textAnchor="middle">{i + 1}</text>
        {i !== 1 && [0, 0.8].map((d) => <circle key={d} className={cx(s.accentFill, s.drop)} style={{ ...delay(d + i * 0.4), ["--fall" as string]: "22px" }} cx={x} cy="128" r="1.8" />)}
      </g>)}
      <path className={s.accentLine} d="M258 113l12 12m0-12-12 12M474 113l12 12m0-12-12 12" />

      {/* The lens: magnified view of the worst leak. */}
      <defs><clipPath id={`${id}-lens`}><circle cx="372" cy="119" r="35" /></clipPath></defs>
      <g className={s.bob}>
        <g clipPath={`url(#${id}-lens)`}>
          <rect className={s.fillSurface} x="334" y="81" width="76" height="76" />
          <g transform="translate(372 119) scale(1.9) translate(-372 -119)">
            <path className={s.route} d="M340 119H404" />
            <rect className={s.paper} x="276" y="92" width="84" height="54" />
            <rect className={s.paper} x="384" y="92" width="84" height="54" />
            <path className={s.accentLine} d="M366 113l12 12m0-12-12 12" />
            {[0, 0.9].map((d) => <circle key={d} className={cx(s.accentFill, s.drop)} style={{ ...delay(d), ["--fall" as string]: "14px" }} cx="372" cy="128" r="1.6" />)}
          </g>
        </g>
        <circle className={s.inkLine} cx="372" cy="119" r="37" />
        <circle className={cx(s.guide, s.dashed)} cx="372" cy="119" r="31" />
        <path className={cx(s.accentLine, s.spin)} d="M372 84a35 35 0 0 1 35 35" />
        <path className={s.inkLine} d="m399 146 26 26" style={{ strokeWidth: 7 }} />
        <path d="m401 148 22 22" stroke="var(--home-paper)" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* 02 — the conversion signal, with the dip the leak caused. */}
      <rect className={s.surface} x="60" y="206" width="372" height="120" />
      <text className={s.micro} x="72" y="224">02 / CONVERSION · 12 WEEKS</text>
      <path className={cx(s.guide, s.dashed)} d="M72 250H420M72 276H420M72 302H420" />
      <rect className={s.tintFill} x={wx(5.5)} y="232" width={wx(8.5) - wx(5.5)} height="84" opacity=".7" />
      <text className={s.microAccent} x={wx(7)} y="244" textAnchor="middle">LEAK</text>
      <path className={s.inkLine} d={before} />
      <path className={cx(s.accentLine, s.draw)} d={after} pathLength={1} style={{ strokeWidth: 2 }} />
      {weeks.map((y, k) => <circle key={k} className={k >= 8 ? s.accentDot : s.paper} cx={wx(k)} cy={y} r="2.4" />)}
      <path className={s.guide} d={weeks.map((_, k) => `M${r1(wx(k))} 316v4`).join("")} />
      <g className={s.scanX} style={{ ["--scan" as string]: "335px" }}>
        <path className={s.accentLine} d="M78 212V322" style={{ strokeWidth: 1 }} />
        <circle className={s.accentFill} cx="78" cy="212" r="2.4" />
      </g>

      {/* Findings: three numbered leaks. */}
      <rect className={s.paper} x="452" y="206" width="124" height="120" />
      <text className={s.micro} x="464" y="224">FINDINGS</text>
      {[248, 274, 300].map((y, i) => <g key={y}>
        <circle className={s.accentDot} cx="470" cy={y} r="6" />
        <text className={s.microAccent} x="470" y={y + 2.5} textAnchor="middle">{i + 1}</text>
        <path className={s.inkLine} d={`M484 ${y - 3}h${62 - i * 10}`} style={{ strokeWidth: 1.1 }} />
        <path className={s.guide} d={`M484 ${y + 4}h${40 - i * 6}`} />
      </g>)}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   leakyFunnel — four-stage funnel, leaks, and a recovery route
   ══════════════════════════════════════════════════════════════════════ */
export function LeakyFunnelFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfl");
  const half = (y: number) => (380 - (y - 72) * (260 / 248)) / 2;
  const bands = [[72, 128], [136, 192], [200, 256], [264, 320]] as const;
  const names = ["TRAFFIC", "VISITS", "ENQUIRIES", "CUSTOMERS"];
  const values = ["100%", "41%", "4.2%", "1.9%"];
  const trap = (y0: number, y1: number) => `M${r1(250 - half(y0))} ${y0}H${r1(250 + half(y0))}L${r1(250 + half(y1))} ${y1}H${r1(250 - half(y1))}Z`;
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="CONVERSION FUNNEL / LEAK MAP" tag="3 LEAKS" bottom="FIX THE LEAKS BEFORE BUYING TRAFFIC." />

      {/* Sources feeding the mouth. */}
      {[150, 250, 350].map((x, i) => <g key={x}>
        <rect className={s.surface} x={x - 5} y="48" width="10" height="10" />
        <path className={s.route} d={`M${x} 58V72`} />
        <text className={s.micro} x={x + 10} y="56">{["SEARCH", "ADS", "REFERRAL"][i]}</text>
      </g>)}

      {bands.map(([y0, y1], i) => <g key={y0}>
        <path className={s.paper} d={trap(y0, y1)} />
        <path className={s.soft} d={trap(y1 - 7, y1)} />
        <path className={cx(s.guide, s.dashed)} d={`M${r1(250 - half(y0) + 16)} ${y0 + 13}H${r1(250 + half(y0) - 16)}`} />
        <text className={s.micro} x={r1(250 - half(y0) - 10)} y={y0 + 16} textAnchor="end">0{i + 1}</text>
        {/* Leader to the stage label. */}
        <path className={s.guide} d={`M${r1(250 + half((y0 + y1) / 2) + (i < 3 ? 26 : 8))} ${(y0 + y1) / 2}H458`} />
        <text className={s.microAccent} x="468" y={(y0 + y1) / 2 - 3}>0{i + 1}</text>
        <text className={s.label} x="486" y={(y0 + y1) / 2 - 2}>{names[i].charAt(0) + names[i].slice(1).toLowerCase()}</text>
        <text className={s.micro} x="486" y={(y0 + y1) / 2 + 11}>{values[i]} OF TRAFFIC</text>
      </g>)}

      {/* Leaks at the right edge of the first three stages. */}
      {bands.slice(0, 3).map(([, y1], i) => {
        const y = y1 - 18;
        const x = 250 + half(y);
        return <g key={y1}>
          <path className={s.accentLine} d={`M${r1(x - 1)} ${y - 5}l7 5-7 5`} />
          {[0, 0.7, 1.4].map((d) => <circle key={d} className={cx(s.accentFill, s.drop)} style={{ ...delay(d + i * 0.35), ["--fall" as string]: "38px" }} cx={r1(x + 12)} cy={y + 4} r="2.2" />)}
        </g>;
      })}

      {/* Recovered leads routed back into the last stage. */}
      <path className={s.route} d="M436 206V300H352" />
      <path className={cx(s.flow, s.flowFast)} d="M436 206V300H352" />
      <path className={s.accentLine} d="m358 295-6 5 6 5" />
      <text className={s.microAccent} x="394" y="316" textAnchor="middle">RECOVERED</text>

      {/* The main flow and what comes out of the bottom. */}
      <path className={s.flow} d="M250 60V326" style={delay(-4)} />
      <rect className={s.tint} x="222" y="326" width="56" height="20" />
      <text className={s.microAccent} x="250" y="339" textAnchor="middle">WON</text>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   whatsappFlow — chat → bot → RM → human → CRM
   ══════════════════════════════════════════════════════════════════════ */
export function WhatsAppFlowFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfc");
  const tiers = [
    { y: 86, code: "01 · BOT", name: "Instant reply", glyph: "M-7-4h14v10H-7Zm4-5v5m6-5v5M-3 1h1m4 0h1" },
    { y: 172, code: "02 · RM", name: "Qualify & follow up", glyph: "M-7 6c0-6 14-6 14 0M0-1a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
    { y: 258, code: "03 · HUMAN", name: "Call & close", glyph: "M-6-7c-2 3 2 11 8 13l3-3-3-3-2 1c-2-1-3-3-3-5l1-2-3-3Z" },
  ];
  const bubbles = [
    { x: 72, y: 112, w: 66, h: 22, out: false, lines: [44, 30] },
    { x: 96, y: 142, w: 68, h: 22, out: true, lines: [48, 28] },
    { x: 72, y: 172, w: 80, h: 30, out: false, lines: [60, 52, 30] },
    { x: 90, y: 210, w: 74, h: 22, out: true, lines: [52, 34] },
  ];
  const rows = [124, 154, 184, 214, 244, 274];
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="WHATSAPP / SALES SYSTEM" tag="< 60 S REPLY" bottom="EVERY CONVERSATION LANDS IN ONE RECORD." />

      {/* Phone with a live conversation. */}
      <text className={s.micro} x="56" y="54">CUSTOMER</text>
      <rect className={s.surface} x="56" y="60" width="124" height="280" rx="16" />
      <rect className={s.paper} x="64" y="76" width="108" height="248" rx="6" />
      <path className={s.line} d="M104 68h28" />
      <rect className={s.soft} x="64" y="76" width="108" height="26" rx="6" />
      <circle className={s.surface} cx="80" cy="89" r="6" />
      <path className={s.guide} d="M92 86h40M92 93h26" />
      {bubbles.map((b, i) => <g key={b.y} className={s.cycle} style={delay(i * 0.9)}>
        <rect className={b.out ? s.tint : s.surface} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" />
        <path className={b.out ? s.accentLine : s.guide} style={b.out ? { strokeWidth: 1 } : undefined} d={b.lines.map((w, k) => `M${b.x + 8} ${b.y + 9 + k * 7}h${w}`).join("")} />
      </g>)}
      <rect className={s.surface} x="72" y="240" width="40" height="18" rx="4" />
      {[83, 92, 101].map((x, k) => <circle key={x} className={cx(s.accentFill, s.blink)} style={delay(k * 0.2)} cx={x} cy="249" r="2.1" />)}
      <rect className={s.soft} x="72" y="296" width="78" height="18" rx="9" />
      <circle className={s.accentFill} cx="160" cy="305" r="9" />
      <path className={s.whiteLine} d="m156 305h8m-3-3 3 3-3 3" />

      {/* Reply timer. */}
      <circle className={s.surface} cx="206" cy="172" r="12" />
      <path className={cx(s.accentLine, s.spinFrom)} style={{ transformOrigin: "206px 172px" }} d="M206 172v-8" />
      <text className={s.micro} x="206" y="198" textAnchor="middle">&lt; 60 S</text>

      {/* Routes. */}
      <path className={s.route} d="M180 124H206V112H232M312 138V172M312 224V258M392 112H440M392 198H440M392 284H440" />
      <path className={s.flow} d="M180 124H206V112H232" />
      <path className={cx(s.flow, s.flowFast)} d="M312 138V172" style={delay(-1)} />
      <path className={cx(s.flow, s.flowFast)} d="M312 224V258" style={delay(-3)} />
      <path className={s.flow} d="M392 112H440M392 198H440M392 284H440" style={delay(-6)} />
      <text className={s.micro} x="320" y="159">WARM</text>
      <text className={s.microAccent} x="320" y="245">HOT</text>

      {/* The three-tier stack. */}
      {tiers.map((t, i) => <g key={t.y}>
        <rect className={i === 2 ? s.tint : s.paper} x="232" y={t.y} width="160" height="52" />
        <rect className={s.soft} x="244" y={t.y + 14} width="24" height="24" />
        <path className={i === 2 ? s.accentLine : s.line} d={t.glyph} transform={`translate(256 ${t.y + 26})`} />
        <text className={s.microAccent} x="280" y={t.y + 21}>{t.code}</text>
        <text className={s.label} x="280" y={t.y + 37}>{t.name}</text>
        <circle className={s.accentFill} cx="380" cy={t.y + 12} r="2.4" />
        {i === 0 && <circle className={cx(s.accentLine, s.pulse)} cx="380" cy={t.y + 12} r="2.4" />}
      </g>)}

      {/* CRM ledger with a moving highlight. */}
      <rect className={s.surface} x="440" y="86" width="152" height="224" />
      <rect className={s.soft} x="440" y="86" width="152" height="24" />
      <text className={s.micro} x="452" y="102">CRM · LEADS</text>
      <text className={s.micro} x="580" y="102" textAnchor="end">SCORE</text>
      {rows.map((y, k) => <g key={y}>
        {k > 0 && <path className={s.guide} d={`M448 ${y - 15}H584`} />}
        <circle className={k % 3 === 0 ? s.accentFill : s.paper} cx="454" cy={y} r="3" />
        <path className={s.inkLine} style={{ strokeWidth: 1 }} d={`M466 ${y - 3}h${54 - (k % 3) * 9}`} />
        <path className={s.guide} d={`M466 ${y + 4}h${30 + (k % 2) * 12}`} />
        <text className={s.microInk} x="580" y={y + 3} textAnchor="end">{[92, 78, 64, 51, 88, 40][k]}</text>
      </g>)}
      <rect className={cx(s.accentLine, s.rowScan)} x="444" y="111" width="144" height="26" style={{ strokeWidth: 1.2 }} />
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   layerStack — five exploded layers with a compounding loop
   ══════════════════════════════════════════════════════════════════════ */
const LAYERS = [
  { name: "Attention", sub: "SEARCH · ADS · SOCIAL" },
  { name: "Conversion", sub: "SITE · FORMS · OFFERS" },
  { name: "Qualification", sub: "SCORING · ROUTING" },
  { name: "Nurture", sub: "WHATSAPP · EMAIL" },
  { name: "Retention", sub: "REPEAT · REFERRAL" },
];

export function LayerStackFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfs");
  const size = 110;
  const gap = 44;
  const right = 230 + size * COS30;
  const left = 230 - size * COS30;
  return (
    <Plate compact={compact} className={className} label={label} compactViewBox="-60 44 560 350">
      <DotGrid id={id} />
      <Frame top="REVENUE STACK / EXPLODED VIEW" tag="5 LAYERS" bottom="EACH LAYER FEEDS THE NEXT." />

      {/* Compounding loop on the left: retention feeds attention. */}
      <path className={s.route} d={`M${r1(left)} ${298}H86V122H${r1(left - 6)}`} />
      <path className={cx(s.flow, s.flowReverse)} d={`M${r1(left)} ${298}H86V122H${r1(left - 6)}`} />
      <path className={s.accentLine} d={`M${r1(left - 12)} 117l7 5-7 5`} />
      <text className={s.microAccent} x="76" y="210" textAnchor="middle" transform="rotate(-90 76 210)">COMPOUNDING LOOP</text>

      {[4, 3, 2, 1, 0].map((i) => {
        const P = projector(230, 60 + gap * i);
        const plane = box(P, 0, 0, -7, size, size, 7);
        const tiles = [14, 38, 62].map((x) => poly([P(x, 82), P(x + 16, 82), P(x + 16, 98), P(x, 98)]));
        const sideTiles = [14, 38, 62].map((y) => poly([P(82, y), P(98, y), P(98, y + 16), P(82, y + 16)]));
        return <g key={i}>
          <path className={s.soft} d={plane.left} />
          <path className={s.soft} d={plane.right} />
          <path className={cx(s.paper, s.layerTop)} style={{ ["--i" as string]: i }} d={plane.top} />
          <path className={cx(s.guide, s.dashed)} d={poly([P(10, 10), P(100, 10), P(100, 100), P(10, 100)])} />
          {tiles.map((d, k) => <path key={d} className={k === i % 3 ? s.tint : s.surface} d={d} />)}
          {sideTiles.map((d, k) => <path key={d} className={k === (i + 1) % 3 ? s.tint : s.surface} d={d} />)}
          {i === 0 && <>
            <path className={s.machineRight} d={box(P, 44, 44, 0, 18, 18, 14).right} />
            <path className={s.machineLeft} d={box(P, 44, 44, 0, 18, 18, 14).left} />
            <path className={s.machineTop} d={box(P, 44, 44, 0, 18, 18, 14).top} />
          </>}
        </g>;
      })}

      {/* Spine on the right corners and labels. */}
      <path className={s.route} d={`M${r1(right)} 115V298`} />
      <path className={s.flow} d={`M${r1(right)} 100V306`} />
      {LAYERS.map((layer, i) => {
        const y = 115 + gap * i;
        return <g key={layer.name}>
          <circle className={s.accentDot} cx={r1(right)} cy={y} r="3.2" />
          <path className={s.guide} d={`M${r1(right + 6)} ${y}H392`} />
          <text className={s.microAccent} x="400" y={y + 3}>0{i + 1}</text>
          <text className={s.label} x="422" y={y + 4}>{layer.name}</text>
          <text className={s.micro} x="422" y={y + 17}>{layer.sub}</text>
        </g>;
      })}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   seoPeakGraph — compounding organic curve + topic cluster
   ══════════════════════════════════════════════════════════════════════ */
export function SeoPeakFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfg");
  const curve = "M84 292C130 291 170 287 204 281S268 262 304 240S388 168 444 92";
  const hub: Pt = [534, 148];
  const nodes: Pt[] = [-90, -18, 54, 126, 198].map((deg) => { const a = (deg * Math.PI) / 180; return [hub[0] + Math.cos(a) * 50, hub[1] + Math.sin(a) * 50]; });
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="ORGANIC SEARCH / SIX-MONTH VIEW" tag="COMPOUNDING" bottom="RANKINGS COMPOUND. PAID CLICKS DON'T." />

      {/* Axes and grid. */}
      <path className={s.line} d="M84 70V300H444" />
      <path className={cx(s.guide, s.dashed)} d="M84 130H444M84 190H444M84 250H444" />
      <path className={s.guide} d={[0, 1, 2, 3, 4, 5, 6].map((k) => `M${84 + k * 60} 300v5`).join("")} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <text key={k} className={s.micro} x={84 + k * 60} y="318" textAnchor="middle">M{k}</text>)}
      <text className={s.micro} x="72" y="185" textAnchor="middle" transform="rotate(-90 72 185)">TRAFFIC</text>

      {/* Legend. */}
      <path className={s.accentLine} d="M100 84h18" style={{ strokeWidth: 2 }} />
      <text className={s.microInk} x="124" y="86.5">ORGANIC</text>
      <path className={s.line} d="M100 100h18" strokeDasharray="3 3" />
      <text className={s.micro} x="124" y="102.5">PAID</text>

      {/* Paid plateaus; organic compounds. */}
      <path className={s.line} d="M84 256C150 246 190 242 240 243S350 248 444 250" strokeDasharray="4 4" />
      <path className={s.area} d={`${curve}L444 300H84Z`} />
      <path className={cx(s.accentLine, s.draw)} d={curve} pathLength={1} style={{ strokeWidth: 2 }} />
      <path className={s.flow} d={curve} />
      {([[204, 281, "#48"], [304, 240, "#12"], [444, 92, "#3"]] as const).map(([x, y, rank]) => <g key={rank}>
        <circle className={s.accentDot} cx={x} cy={y} r="4" />
        <text className={s.microAccent} x={x - 8} y={y - 9} textAnchor="end">{rank}</text>
      </g>)}
      <circle className={cx(s.accentLine, s.pulse)} cx="444" cy="92" r="4" />

      {/* Topic cluster: pillar + spokes. */}
      <text className={s.micro} x="534" y="80" textAnchor="middle">TOPIC CLUSTER</text>
      {nodes.map(([x, y], k) => <g key={k}>
        <path className={s.guide} d={`M${r1(x)} ${r1(y)}L${hub[0]} ${hub[1]}`} />
        <path className={cx(s.flow, s.flowReverse, s.flowFast)} style={delay(-k * 1.3)} d={`M${r1(x)} ${r1(y)}L${hub[0]} ${hub[1]}`} />
        <rect className={s.paper} x={r1(x - 5)} y={r1(y - 5)} width="10" height="10" />
      </g>)}
      <circle className={s.tint} cx={hub[0]} cy={hub[1]} r="17" />
      <text className={s.microAccent} x={hub[0]} y={hub[1] + 2.5} textAnchor="middle">PILLAR</text>

      {/* A results page: your page, first. */}
      <rect className={s.surface} x="476" y="224" width="116" height="84" />
      <text className={s.micro} x="486" y="240">RESULTS</text>
      {[258, 278, 298].map((y, k) => <g key={y}>
        <text className={k === 0 ? s.microAccent : s.micro} x="486" y={y + 2.5}>0{k + 1}</text>
        <path className={k === 0 ? s.barAccent : s.guide} style={{ strokeWidth: k === 0 ? 2.5 : 1 }} d={`M504 ${y}h${k === 0 ? 72 : 60 - k * 10}`} />
      </g>)}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   procurementFlow — eight stages, request to receipt
   ══════════════════════════════════════════════════════════════════════ */
function DocGlyph({ x, y, code, state }: { x: number; y: number; code: string; state: "done" | "current" | "next" }) {
  return <g transform={`translate(${x} ${y})`}>
    <path className={state === "current" ? s.tint : state === "done" ? s.surface : s.paper} d="M-19-27H8l11 11v43h-38Z" />
    <path className={state === "current" ? s.accentLine : s.line} style={{ strokeWidth: 1.1 }} d="M8-27v12h11M-11 9h22m-22 7h15" />
    <text className={state === "current" ? s.microAccent : s.microInk} y="1" textAnchor="middle">{code}</text>
    {state === "done" && <g transform="translate(19 -27)"><circle className={s.accentDot} r="7" /><path className={s.accentLine} style={{ strokeWidth: 1.3 }} d="m-3 0 2 2.5 4-5" /></g>}
  </g>;
}

export function ProcurementFlowFigure({ compact, className, label }: FigureArtProps) {
  const id = useFigureId("bfp");
  const route = "M104 132H548V264H104";
  const top = [{ x: 104, code: "PR", name: "REQUISITION" }, { x: 232, code: "OK", name: "APPROVAL" }, { x: 360, code: "RFQ", name: "RFQ" }, { x: 488, code: "BID", name: "QUOTATIONS" }];
  const bottom = [{ x: 488, code: "PO", name: "PURCHASE ORDER" }, { x: 360, code: "SHP", name: "DISPATCH" }, { x: 232, code: "", name: "IN TRANSIT" }, { x: 104, code: "GRN", name: "GOODS RECEIPT" }];
  return (
    <Plate compact={compact} className={className} label={label}>
      <DotGrid id={id} />
      <Frame top="PURCHASING / REQUEST TO RECEIPT" tag="SAMPLE DATA" bottom="ONE RECORD TRAIL. EVERY HANDOFF CONNECTED." note="PR-0241 → GRN-0058" />

      {/* RFQ fan-out to three suppliers. */}
      <path className={s.route} d="M360 104V84M330 84H390M330 84V76M360 84V76M390 84V76" />
      {[330, 360, 390].map((x, i) => <g key={x}><rect className={i === 0 ? s.tint : s.surface} x={x - 7} y="62" width="14" height="14" /><text className={i === 0 ? s.microAccent : s.micro} x={x} y="72" textAnchor="middle">{String.fromCharCode(65 + i)}</text></g>)}

      {/* The road for the physical half of the journey. */}
      <path className={cx(s.guide, s.dashed)} d="M120 276H540" />

      {/* One record trail, snaking through all eight stages. */}
      <path className={s.line} d={route} />
      <path className={s.flow} d={route} />
      <g transform="translate(104 132)"><g className={s.envelope}>
        <rect className={s.surface} x="-11" y="-8" width="22" height="16" rx="2" style={{ stroke: "var(--home-accent)" }} />
        <path className={s.accentLine} style={{ strokeWidth: 1.2 }} d="m-10-7 10 8 10-8" />
      </g></g>

      {top.map((st, i) => <g key={st.x}>
        <text className={s.micro} x={st.x - 19} y="97">0{i + 1}</text>
        <DocGlyph x={st.x} y={132} code={st.code} state="done" />
        <text className={s.micro} x={st.x} y="177" textAnchor="middle">{st.name}</text>
      </g>)}

      {/* Truck heading left from dispatch to the receiving gate. */}
      <g transform="translate(340 264)"><g className={s.truck}>
        <path className={s.tint} d="M-10-30H40V-9H-10Z" />
        <path className={s.surface} d="M-10-22H-24l-8 9v4h22Z" />
        <path className={s.line} d="M-24-20v6h-6" />
        <path className={s.inkLine} style={{ strokeWidth: 1.1 }} d="M-34-8H42" />
        {[-22, 28].map((x) => <circle key={x} className={s.surface} cx={x} cy="-4" r="4.5" style={{ stroke: "var(--home-ink)" }} />)}
      </g></g>

      {bottom.map((st, i) => <g key={st.x}>
        <text className={s.micro} x={st.x - 19} y="229">0{i + 5}</text>
        {st.code ? <DocGlyph x={st.x} y={264} code={st.code} state={i === 0 ? "done" : i === 1 ? "current" : "next"} /> : <g>
          <path className={s.paper} d={`M${st.x} 254l10 10-10 10-10-10Z`} />
          <circle className={s.accentFill} cx={st.x} cy="264" r="2.6" />
          <circle className={cx(s.accentLine, s.pulse)} cx={st.x} cy="264" r="2.6" />
        </g>}
        <text className={i === 1 ? s.microAccent : s.micro} x={st.x} y="309" textAnchor="middle">{st.name}</text>
      </g>)}

      {/* Stock gauge at the receiving end. */}
      <rect className={s.surface} x="44" y="226" width="12" height="76" />
      <rect className={s.accentFill} x="47" y="248" width="6" height="51" />
      <path className={s.guide} d="M44 283h12" />
      <text className={s.micro} x="50" y="318" textAnchor="middle">STOCK</text>
    </Plate>
  );
}

/* ── Dispatcher + frame ─────────────────────────────────────────────── */
export function FigureArt({ sketch, count, ...props }: FigureArtProps & { sketch: BlogFigureKey; count?: number }) {
  switch (sketch) {
    case "workshop": return <WorkshopFigure {...props} count={count} />;
    case "auditLens": return <AuditLensFigure {...props} />;
    case "leakyFunnel": return <LeakyFunnelFigure {...props} />;
    case "whatsappFlow": return <WhatsAppFlowFigure {...props} />;
    case "layerStack": return <LayerStackFigure {...props} />;
    case "seoPeakGraph": return <SeoPeakFigure {...props} />;
    case "procurementFlow": return <ProcurementFlowFigure {...props} />;
    default: return <AuditLensFigure {...props} />;
  }
}

export interface BlogFigureProps {
  sketch: BlogFigureKey;
  /** 1 → "FIG. 01". Omit (or pass null) to hide the caption row. */
  number?: number | string | null;
  /** Caption title (shown uppercase). Defaults to FIGURE_TITLES[sketch]. */
  title?: string;
  /** Up to three legend labels under the drawing (square · accent square · dot). */
  legend?: string[];
  /** Accessible description. Defaults to FIGURE_DESCRIPTIONS[sketch]; false marks it decorative. */
  alt?: string | false;
  /** Thumbnail mode (no caption, no text, hover-only motion). */
  compact?: boolean;
  /** Workshop only: post count shown on the "PUBLISHED" label. */
  count?: number;
  className?: string;
  /** Extra attributes for the <figure>, e.g. data-blog-reveal. */
  reveal?: boolean;
}

/** A figure with the home-style "FIG. 0X / TITLE" caption row. */
export function BlogFigure({ sketch, number, title, legend, alt, compact, count, className, reveal }: BlogFigureProps) {
  const fig = number === undefined || number === null ? null : typeof number === "number" ? `FIG. ${String(number).padStart(2, "0")}` : number;
  const description = alt === false ? undefined : alt ?? FIGURE_DESCRIPTIONS[sketch];
  return (
    <figure className={cx(s.figure, className)} data-blog-reveal={reveal ? "" : undefined}>
      {fig && !compact && <figcaption className={s.caption}><span>{fig}</span><span>{title ?? FIGURE_TITLES[sketch]}</span><Plus size={14} aria-hidden="true" /></figcaption>}
      <FigureArt sketch={sketch} compact={compact} count={count} label={compact ? undefined : description} />
      {legend && legend.length > 0 && !compact && <div className={s.legend} aria-hidden="true">{legend.slice(0, 3).map((item) => <span key={item}><i />{item}</span>)}</div>}
    </figure>
  );
}
