import { useId, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import bf from "@/components/blog/BlogFigures.module.css";
import s from "./PricingFigures.module.css";

/**
 * Technical line drawings for the pricing page. Same language as the blog /
 * about figures (muted outlines, paper fills, one accent that carries the
 * story, mono annotations) and built on the shared BlogFigures primitives so
 * they re-ink in dark mode and inside the dark band. Server-safe: every
 * animation is CSS and pauses via [data-motion="paused"] /
 * [data-in-view="false"] from <BlogMotion>. Each drawing is complete without
 * motion; the accent paths only indicate direction.
 */

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

/* ── Isometric helpers ─────────────────────────────────────────────────── */
type Pt = [number, number];
type Projector = (x: number, y: number, z?: number) => Pt;
const COS30 = 0.8660254;
const r1 = (n: number) => Math.round(n * 10) / 10;
const projector = (ox: number, oy: number): Projector => (x, y, z = 0) => [ox + (x - y) * COS30, oy + (x + y) * 0.5 - z];
const poly = (points: Pt[]) => `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`;
const polyline = (points: Pt[]) => `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}`;
/** Faces of an axis-aligned box: top, front-left (y+d) and front-right (x+w). */
function box(P: Projector, x: number, y: number, z: number, w: number, d: number, h: number) {
  return {
    top: poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
    left: poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)]),
    right: poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)]),
  };
}
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });
/** Stagger for one-shot settle-in of a group: style={settle(seconds)}. */
const settle = (seconds: number): CSSProperties => ({ ["--d" as string]: `${seconds}s` });

/* ── Plate: svg root + dot grid + registration frame ───────────────────── */
function useFigureId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

function Plate({ viewBox, label, className, children }: { viewBox: string; label?: string; className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={cx(bf.svg, className)}
      fill="none"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-blog-scene=""
    >
      {children}
    </svg>
  );
}

function DotGrid({ id, x, y, width, height }: { id: string; x: number; y: number; width: number; height: number }) {
  return <>
    <defs><pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" className={bf.gridDot} /></pattern></defs>
    <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-grid)`} />
  </>;
}

function Frame({ top, tag, bottom, note, width = 640, height = 400 }: { top: string; tag: string; bottom: string; note: string; width?: number; height?: number }) {
  const b = height - 28;
  const r = width - 20;
  return <g>
    <path className={bf.guide} d={`M20 28h16M28 20v16M${r - 16} 28h16M${r - 8} 20v16M20 ${b}h16M28 ${b - 8}v16M${r - 16} ${b}h16M${r - 8} ${b - 8}v16`} />
    <text className={bf.annot} x="48" y="36">{top}</text>
    <circle className={bf.accentFill} cx={r - 126} cy="33" r="2.5" />
    <text className={bf.annot} x={r - 117} y="36">{tag}</text>
    <path className={bf.guide} d={`M48 ${b - 16}H${r - 28}`} />
    <text className={bf.annot} x="48" y={b + 3}>{bottom}</text>
    <text className={bf.annot} x={r - 28} y={b + 3} textAnchor="end">{note}</text>
  </g>;
}

/** Caption row + drawing + legend, in the shared figure frame. */
export function PricingFigure({ number, title, legend, className, reveal, children }: {
  number: number; title: string; legend?: string[]; className?: string; reveal?: boolean; children: ReactNode;
}) {
  return (
    <figure className={cx(bf.figure, className)} data-blog-reveal={reveal ? "" : undefined}>
      <figcaption className={bf.caption}><span>FIG. {String(number).padStart(2, "0")}</span><span>{title}</span><Plus size={14} aria-hidden="true" /></figcaption>
      {children}
      {legend && legend.length > 0 && <div className={bf.legend} aria-hidden="true">{legend.slice(0, 3).map((item) => <span key={item}><i />{item}</span>)}</div>}
    </figure>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FIG. 01 — Three tiers, one system (hero)
   Three ascending platforms on an isometric grid, each carrying more
   system blocks; an accent signal rail climbs from one to the next. A
   dashed fourth outline stands for Enterprise, scoped separately.
   ══════════════════════════════════════════════════════════════════════ */
export function TiersFigure({ tiers, blocks, enterprise, caption, label }: {
  /** Names of the first four tiers (Launch, Growth, Scale, Enterprise). */
  tiers: string[];
  /** Block labels: site, automation, commerce/CRM. */
  blocks: [string, string, string];
  enterprise: string;
  caption: [string, string];
  label?: string;
}) {
  const id = useFigureId("pft");
  const P = projector(125, 104);
  const SIZE = 110, THICK = 12, STEP = 150, RISE = 42, BLOCK = 34, BH = 24;
  const platforms = [0, 1, 2].map((i) => ({ x: i * STEP, z: i * RISE }));
  const blockAt: [number, number][] = [[14, 14], [60, 14], [36, 60]];
  const railY = 100;
  const rail: Pt[] = [];
  platforms.forEach(({ x, z }, i) => {
    const top = z + THICK;
    rail.push(P(x + 55, railY, top));
    if (i < 2) rail.push(P(x + 55, railY, top + RISE), P(x + STEP + 55, railY, top + RISE));
  });
  rail.push(P(2 * STEP + 55, railY, 2 * RISE + THICK + RISE), P(3 * STEP + 55, railY, 3 * RISE + THICK));
  const ent = box(P, 3 * STEP, 0, 3 * RISE, SIZE, SIZE, THICK);
  const scaleLabelAt = (bx: number, by: number, z: number): Pt => P(2 * STEP + bx + BLOCK, by + BLOCK / 2, z + BH / 2);

  return (
    <Plate viewBox="0 0 640 400" label={label}>
      <DotGrid id={id} x={36} y={46} width={568} height={304} />
      <Frame top={caption[0]} tag="ENGINEERED" bottom="MORE SYSTEM. SAME BUDGET." note={caption[1]} />

      {/* Ground guide lines, one per platform row */}
      <path className={cx(bf.guide, bf.dashed)} d={polyline([P(-30, SIZE + 24), P(2 * STEP + SIZE + 30, SIZE + 24)])} />

      {platforms.map(({ x, z }, i) => {
        const plat = box(P, x, 0, z, SIZE, SIZE, THICK);
        const count = i + 1;
        const [nx, ny] = P(x + SIZE, SIZE + 4, z);
        return (
          <g key={i} className={s.settle} style={settle(i * 0.3)}>
            {/* Lift line: how far this platform sits above the ground */}
            {z > 0 && <path className={cx(bf.guide, bf.dashed)} d={polyline([P(x, SIZE, 0), P(x, SIZE, z)])} />}
            <path className={bf.soft} d={plat.left} />
            <path className={bf.paper} d={plat.right} />
            <path className={bf.surface} d={plat.top} />
            {/* Inset grid on the top face */}
            <path className={bf.guide} d={polyline([P(x + 8, 8, z + THICK), P(x + SIZE - 8, 8, z + THICK), P(x + SIZE - 8, SIZE - 8, z + THICK), P(x + 8, SIZE - 8, z + THICK), P(x + 8, 8, z + THICK)])} />
            {/* Blocks: site (accent machine), automation, commerce/CRM */}
            {blockAt.slice(0, count).map(([bx, by], b) => {
              const cube = box(P, x + bx, by, z + THICK, BLOCK, BLOCK, BH);
              if (b === 0) return <g key={b}><path className={bf.machineLeft} d={cube.left} /><path className={bf.machineRight} d={cube.right} /><path className={bf.machineTop} d={cube.top} /><path className={bf.whiteLine} d={polyline([P(x + bx + 8, by + 8, z + THICK + BH), P(x + bx + BLOCK - 8, by + 8, z + THICK + BH)])} /><path className={bf.whiteLine} d={polyline([P(x + bx + 8, by + 15, z + THICK + BH), P(x + bx + BLOCK - 14, by + 15, z + THICK + BH)])} /></g>;
              return <g key={b}><path className={bf.soft} d={cube.left} /><path className={bf.paper} d={cube.right} /><path className={b === 1 ? bf.tint : bf.surface} d={cube.top} /></g>;
            })}
            {/* Tier name under the front corner */}
            <text className={bf.annot} x={nx + 4} y={ny + 22} textAnchor="start">{(tiers[i] ?? "").toUpperCase()}</text>
            <text className={bf.micro} x={nx + 4} y={ny + 33} textAnchor="start">{String(count).padStart(2, "0")} / {count === 1 ? "BLOCK" : "BLOCKS"}</text>
          </g>
        );
      })}

      {/* Enterprise: dashed outline, scoped separately */}
      <g className={s.settle} style={settle(1)}>
        <path className={cx(bf.guide, bf.dashed)} d={polyline([P(3 * STEP, SIZE, 3 * RISE - 48), P(3 * STEP, SIZE, 3 * RISE)])} />
        <path className={cx(bf.line, s.dashedFace)} d={ent.left} />
        <path className={cx(bf.line, s.dashedFace)} d={ent.right} />
        <path className={cx(bf.line, s.dashedFace)} d={ent.top} />
        <path className={cx(bf.line, s.dashedFace)} d={box(P, 3 * STEP + 36, 36, 3 * RISE + THICK, 38, 38, 28).top} />
        <path className={cx(bf.line, s.dashedFace)} d={box(P, 3 * STEP + 36, 36, 3 * RISE + THICK, 38, 38, 28).left} />
        <path className={cx(bf.line, s.dashedFace)} d={box(P, 3 * STEP + 36, 36, 3 * RISE + THICK, 38, 38, 28).right} />
        <text className={bf.micro} x={P(3 * STEP + SIZE, SIZE + 4, 3 * RISE)[0] + 4} y={P(3 * STEP + SIZE, SIZE + 4, 3 * RISE)[1] + 22}>{enterprise}</text>
      </g>

      {/* Leader labels on the Scale platform: what each block is */}
      {blockAt.map(([bx, by], b) => {
        const [lx, ly] = scaleLabelAt(bx, by, 2 * RISE + THICK);
        const tx = 548, ty = 118 + b * 22;
        return <g key={b}>
          <path className={bf.guide} d={`M${r1(lx)} ${r1(ly)}L${tx - 8} ${ty - 3}H${tx - 2}`} />
          <circle className={bf.accentDot} cx={r1(lx)} cy={r1(ly)} r="2.2" />
          <text className={bf.microInk} x={tx} y={ty}>{blocks[b]}</text>
        </g>;
      })}

      {/* Signal rail: climbs from tier to tier */}
      <path className={bf.route} d={polyline(rail)} />
      <path className={cx(bf.flow, bf.flowFast)} d={polyline(rail)} />
      {platforms.map(({ x, z }, i) => {
        const [cx0, cy0] = P(x + 55, railY, z + THICK);
        return <g key={i}><circle className={bf.pulse} cx={cx0} cy={cy0} r="4" fill="var(--home-accent)" style={delay(i * 0.9)} /><circle className={bf.accentDot} cx={cx0} cy={cy0} r="3" /></g>;
      })}
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FIG. 02 — The engagement path (rail above the six steps)
   Six nodes on one rail; the column centres match a six-column grid
   beneath, so the drawing and the copy read as one instrument.
   ══════════════════════════════════════════════════════════════════════ */
export function RailFigure({ label }: { label?: string }) {
  const nodes = [100, 300, 500, 700, 900, 1100];
  const y = 70;
  const icon = (i: number, x: number) => {
    switch (i) {
      case 0: return <><circle cx={x - 2} cy={y - 2} r="6" className={bf.inkLine} /><path className={bf.inkLine} d={`M${x + 2.5} ${y + 2.5}l5 5`} /></>;
      case 1: return <><path className={bf.inkLine} d={`M${x - 6} ${y - 8}h9l4 4v12h-13z`} /><path className={bf.line} d={`M${x - 3} ${y - 1}h6M${x - 3} ${y + 3}h6`} /></>;
      case 2: return <><circle cx={x} cy={y} r="8" className={bf.accentLine} /><circle cx={x} cy={y} r="4.5" className={cx(bf.guide, bf.dashed)} /><path className={bf.accentLine} d={`M${x - 3} ${y}l2 2 4-4`} /></>;
      case 3: return <><path className={bf.inkLine} d={`M${x - 8} ${y - 6}h16M${x - 8} ${y}h11M${x - 8} ${y + 6}h14`} /><circle className={bf.accentFill} cx={x + 6} cy={y} r="1.6" /></>;
      case 4: return <><path className={bf.inkLine} d={`M${x} ${y - 9}v16M${x - 6} ${y - 3}l6-6 6 6`} /><path className={bf.line} d={`M${x - 6} ${y + 9}h12`} /></>;
      default: return <><circle cx={x} cy={y} r="8" className={bf.inkLine} /><circle cx={x} cy={y} r="3" className={bf.line} /><path className={bf.line} d={`M${x} ${y - 8}v3M${x} ${y + 5}v3M${x - 8} ${y}h3M${x + 5} ${y}h3`} /></>;
    }
  };
  return (
    <Plate viewBox="0 0 1200 130" label={label} className={s.rail}>
      <path className={bf.guide} d={`M20 ${y}H1180`} />
      <path className={bf.route} d={`M${nodes[0]} ${y}H${nodes[5]}`} />
      <path className={bf.flow} d={`M${nodes[0]} ${y}H${nodes[5]}`} />
      {nodes.map((x, i) => (
        <g key={i} className={s.settle} style={settle(i * 0.18)}>
          <circle cx={x} cy={y} r="19" className={i === 2 ? bf.tint : bf.paper} />
          {icon(i, x)}
          <text className={i === 0 || i === 5 ? bf.annotAccent : bf.annot} x={x} y="24" textAnchor="middle">{String(i + 1).padStart(2, "0")}</text>
          <path className={bf.guide} d={`M${x} ${y + 24}v12`} />
        </g>
      ))}
      <text className={bf.micro} x="20" y="118">FREE → SCOPED → FIXED → BUILT → LIVE → SUPPORTED</text>
      <text className={bf.micro} x="1180" y="118" textAnchor="end">ONE PATH FOR EVERY PLAN</text>
    </Plate>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FIG. 03 — Systems stack up with the tier (dark band)
   One isometric stack per tier; slab count = systems delivered. Growth's
   single RevSite Pro slab shows its three strata; Enterprise is dashed.
   ══════════════════════════════════════════════════════════════════════ */
export function LayersFigure({ stacks, label }: {
  stacks: { name: string; systems: string[]; dashed?: boolean }[];
  label?: string;
}) {
  const id = useFigureId("pfl");
  const W = 96, D = 64, H = 15, GAP = 5;
  const centres = [86, 242, 398, 554];
  return (
    <Plate viewBox="0 0 640 340" label={label}>
      <DotGrid id={id} x={36} y={46} width={568} height={244} />
      <Frame top="TIER → SYSTEMS" tag="SCOPE" bottom="A TIER IS A SCOPE OF WORK. A SYSTEM IS WHAT IT DELIVERS." note="ILLUSTRATIVE" height={340} />
      <path className={cx(bf.guide, bf.dashed)} d="M48 238H592" />
      {stacks.slice(0, 4).map((stack, i) => {
        const P = projector(centres[i], 192);
        const n = Math.max(1, stack.systems.length);
        const face = stack.dashed ? cx(bf.line, s.dashedFace) : undefined;
        const [lx, ly] = P(W / 2, D / 2, 0);
        const top = n * (H + GAP);
        return (
          <g key={stack.name} className={s.settle} style={settle(i * 0.25)}>
            {stack.systems.map((system, k) => {
              const z = k * (H + GAP);
              const slab = box(P, -W / 2, -D / 2, z, W, D, H);
              const accent = !stack.dashed && /revsite/i.test(system);
              return (
                <g key={system} className={s.slab} style={{ ["--i" as string]: k }}>
                  {stack.dashed
                    ? <><path className={face} d={slab.left} /><path className={face} d={slab.right} /><path className={face} d={slab.top} /></>
                    : <><path className={accent ? bf.machineLeft : bf.soft} d={slab.left} /><path className={accent ? bf.machineRight : bf.paper} d={slab.right} /><path className={accent ? bf.machineTop : bf.surface} d={slab.top} /></>}
                  {accent && [4, 8, 12].map((dz) => <path key={dz} className={bf.whiteLine} d={polyline([P(-W / 2, D / 2, z + dz), P(W / 2, D / 2, z + dz)])} />)}
                </g>
              );
            })}
            {/* Level line: rises to the top of the stack */}
            <path className={bf.route} d={polyline([P(-W / 2 - 14, D / 2, 0), P(-W / 2 - 14, D / 2, top)])} />
            <path className={cx(bf.flow, bf.flowFast, bf.flowReverse)} d={polyline([P(-W / 2 - 14, D / 2, 0), P(-W / 2 - 14, D / 2, top)])} />
            <circle className={bf.accentDot} cx={P(-W / 2 - 14, D / 2, top)[0]} cy={P(-W / 2 - 14, D / 2, top)[1]} r="2.6" />
            <text className={bf.boxLabel} x={lx} y={ly + 30} textAnchor="middle">{stack.name.toUpperCase()}</text>
            <text className={bf.micro} x={lx} y={ly + 42} textAnchor="middle">{String(n).padStart(2, "0")} / {n === 1 ? "SYSTEM" : "SYSTEMS"}</text>
          </g>
        );
      })}
    </Plate>
  );
}
