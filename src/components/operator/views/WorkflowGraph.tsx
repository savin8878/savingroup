"use client";

// components/operator/views/WorkflowGraph.tsx
//
// A workflow map from the Operator: how work moves today, or how it could
// move once connected. Top-to-bottom layers of HTML node cards (so labels
// wrap and scale like text) under one SVG overlay whose orthogonal edges
// are routed from the cards' measured boxes (graph-layout.ts).
//
// - Edge modes differ by dash pattern, not hue: manual is dashed and muted,
//   automated / integration solid accent, approval dotted ink, physical long
//   dashes. Only manual, AI-assisted and approval edges carry a tag.
// - Friction shows three ways: × on the card, × on the edge, and a text list
//   under the map — the list is the part that must never be missed.
// - The diagram is aria-hidden. Its equivalent is an ordered list of nodes
//   with their outgoing edges, rendered visually hidden beside the diagram
//   and shown instead of it by "List view" — or automatically when a row
//   would not fit (more than 3 per row; 5 once the column is ≥ 720px) or the
//   column is under 340px.
// - Solid edges draw in once when first routed, never under reduced or
//   paused motion. No measurement → no edges, but the cards are all there.

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Bell,
  BrainCircuit,
  Database,
  Factory,
  Flag,
  List,
  MessageSquare,
  Sheet,
  Split,
  User,
  UserCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { GraphEdge, GraphEdgeMode, GraphNode, GraphNodeKind, WorkflowGraph as WorkflowGraphData } from "@/lib/operator/protocol";
import { channelSize, laneSpace, layoutGraph, routeEdges, toRailOrder, type Box, type GraphLayout, type RoutedEdge } from "./graph-layout";
import { localeDir } from "../text-dir";
import { textAttrs } from "./text-attrs";
import { useMotionAllowed } from "./useMotionAllowed";
import { fill, getViewsCopy, splitAround, type ViewsCopy } from "./views-copy";
import s from "./Views.module.css";

export const NODE_ICONS: Record<GraphNodeKind, LucideIcon> = {
  trigger: Bell,
  person: User,
  team: Users,
  software: AppWindow,
  spreadsheet: Sheet,
  messaging: MessageSquare,
  data: Database,
  machine: Factory,
  decision: Split,
  ai: BrainCircuit,
  action: Zap,
  result: Flag,
};

/** Solid edges — the only ones that draw in (their dash array is free for the animation). */
const SOLID: ReadonlySet<GraphEdgeMode> = new Set<GraphEdgeMode>(["automated", "integration", "ai_assisted"]);
/** Legend rows: modes that look identical share one. */
const LEGEND: GraphEdgeMode[][] = [["manual"], ["automated", "integration"], ["ai_assisted"], ["approval"], ["physical"]];
type Tone = "accent" | "muted" | "ink";
const toneOf = (mode: GraphEdgeMode): Tone => (mode === "manual" ? "muted" : mode === "approval" || mode === "physical" ? "ink" : "accent");
const ARROW_CLASS: Record<Tone, string> = { accent: s.arrowAccent, muted: s.arrowMuted, ink: s.arrowInk };

type WidthBucket = "unknown" | "narrow" | "normal" | "wide";
const bucketOf = (width: number): WidthBucket => (width < 340 ? "narrow" : width >= 720 ? "wide" : "normal");
const pad = (n: number) => String(n).padStart(2, "0");

interface EdgeTag {
  /** The model's edge label, or our word for the mode when it gave none (`plain`). */
  text: string;
  plain: boolean;
  /** Our word before a model label ("AI · API sync"): page language, so that part reads in the page direction. */
  prefix?: string;
}

/** The short tag an edge carries on the map; null for modes that stay untagged. */
function tagOf(edge: GraphEdge, copy: ViewsCopy["graph"]): EdgeTag | null {
  if (edge.mode === "manual") return edge.label ? { text: edge.label, plain: false } : { text: copy.tags.manual, plain: true };
  if (edge.mode === "ai_assisted") return edge.label ? { text: edge.label, plain: false, prefix: copy.tags.ai } : { text: copy.tags.ai, plain: true };
  if (edge.mode === "approval") return edge.label ? { text: edge.label, plain: false } : { text: copy.tags.approval, plain: true };
  return null;
}

/** A short line in an edge's style, for the legend and the list view. */
function Swatch({ mode }: { mode: GraphEdgeMode }) {
  return (
    <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true" focusable="false" className={s.dirIcon}>
      <path d="M1 4H21" className={s.edge} data-mode={mode} />
    </svg>
  );
}

interface Routed {
  layout: GraphLayout;
  edges: RoutedEdge[];
  /** Decided once, when a layout is first routed: re-measuring never replays the draw-in. */
  draw: boolean;
}

export interface WorkflowGraphProps {
  graph: WorkflowGraphData;
  locale: Locale;
  /** Extra header control — ArtifactList passes the Today / Connected toggle here. */
  controls?: ReactNode;
}

export function WorkflowGraph({ graph, locale, controls }: WorkflowGraphProps) {
  const copy = getViewsCopy(locale);
  const g = copy.graph;
  const pageDir = localeDir(locale);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `op-${uid}-title`;
  const frictionId = `op-${uid}-friction`;
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed(rootRef);
  const motionRef = useRef(false);
  const [width, setWidth] = useState<WidthBucket>("unknown");
  const [choice, setChoice] = useState<"diagram" | "list">("diagram");
  const [routed, setRouted] = useState<Routed | null>(null);

  useEffect(() => { motionRef.current = motion; }, [motion]);

  // Layers do not depend on the row limit, only the fit decision does.
  const layout = useMemo(() => layoutGraph(graph, { maxPerRow: Infinity }), [graph]);
  const rail = useMemo(() => toRailOrder(graph), [graph]);
  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of graph.nodes) if (!map.has(node.id)) map.set(node.id, node);
    return map;
  }, [graph]);
  const outgoing = useMemo(() => {
    const map = new Map<string, Array<{ edge: GraphEdge; index: number }>>();
    graph.edges.forEach((edge, index) => {
      if (!layout.plans[index]) return;
      if (!map.has(edge.from)) map.set(edge.from, []);
      map.get(edge.from)?.push({ edge, index });
    });
    return map;
  }, [graph, layout]);

  const maxPerRow = width === "wide" ? 5 : 3;
  const fits = layout.widest <= maxPerRow && width !== "narrow";
  const view = fits ? choice : "list";
  const routes = routed && routed.layout === layout ? routed : null;
  const rowCount = layout.layers.length;

  // Column width decides the row limit and the narrow fallback. A width of 0
  // means hidden, not narrow: the panel stays mounted while its <dialog> is
  // closed (display: none), and reading that as "narrow" unmounted every
  // diagram on close and flashed the list view for a frame on each reopen.
  // Keep the last real bucket (or "unknown", which draws the diagram).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const measured = entry.contentRect.width;
      if (measured > 0) setWidth(bucketOf(measured));
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Measure the cards (layout offsets, so a panel's entrance transform cannot skew them) and route.
  useEffect(() => {
    if (view !== "diagram") return;
    const box = boxRef.current;
    if (!box) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // Hidden (closed panel): zero-size boxes would replace good routes with degenerate ones.
      if (!box.offsetWidth) return;
      const boxes = new Map<string, Box>();
      box.querySelectorAll<HTMLElement>("[data-node]").forEach((element) => {
        const id = element.dataset.node;
        if (id) boxes.set(id, { x: element.offsetLeft, y: element.offsetTop, w: element.offsetWidth, h: element.offsetHeight });
      });
      const edges = routeEdges(graph, layout, boxes);
      setRouted((previous) => {
        const same = previous !== null && previous.layout === layout;
        if (same && previous.edges.length === edges.length && previous.edges.every((edge, i) => edge.d === edges[i].d)) return previous;
        return { layout, edges, draw: same ? previous.draw : motionRef.current };
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    if (typeof ResizeObserver === "undefined") return () => cancelAnimationFrame(frame);
    const observer = new ResizeObserver(schedule);
    observer.observe(box);
    box.querySelectorAll("[data-node]").forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [view, layout, graph]);

  const modesPresent = useMemo(() => new Set(graph.edges.map((edge) => edge.mode)), [graph]);
  const frictions = useMemo(() => {
    const items: Array<{ key: string; from: string; to?: string; note: string }> = [];
    for (const id of rail) {
      const node = nodeById.get(id);
      if (!node) continue;
      if (node.friction) items.push({ key: `n:${id}`, from: node.label, note: node.friction });
      for (const { edge, index } of outgoing.get(id) ?? []) {
        if (edge.friction) items.push({ key: `e:${index}`, from: node.label, to: nodeById.get(edge.to)?.label ?? edge.to, note: edge.friction });
      }
    }
    return items;
  }, [rail, nodeById, outgoing]);

  const eyebrow = graph.view === "proposed" ? copy.eyebrows.mapConnected : copy.eyebrows.mapToday;
  const showDetail = layout.widest <= 2;
  // Screen-reader words on whichever side of the target the language puts them ("to X", "X की ओर").
  const [toBefore, toAfter] = splitAround(g.edgeTo, "to");

  const railList = (
    <ol className={`${s.rail} ${view === "diagram" ? s.srOnly : ""}`}>
      {rail.map((id, i) => {
        const node = nodeById.get(id);
        if (!node) return null;
        const Icon = NODE_ICONS[node.kind] ?? Zap;
        const out = outgoing.get(id) ?? [];
        return (
          <li key={id} className={s.railItem}>
            <span className={s.railIndex} aria-hidden="true">{pad(i + 1)}</span>
            <div>
              <p className={s.railHead}>
                <Icon size={14} strokeWidth={1.4} aria-hidden="true" />
                <span className={s.railLabel} {...textAttrs(node.label, locale)}>{node.label}</span>
                <span className={s.micro}>{g.kinds[node.kind] ?? node.kind}</span>
                {node.friction && <span className={s.x} role="img" aria-label={g.frictionPoint}>×</span>}
              </p>
              {node.detail && <p className={s.railDetail} {...textAttrs(node.detail, locale)}>{node.detail}</p>}
              {out.length ? (
                <ul className={s.railEdges}>
                  {out.map(({ edge, index }) => {
                    const target = nodeById.get(edge.to)?.label ?? edge.to;
                    return (
                      <li key={index} data-mode={edge.mode}>
                        <Swatch mode={edge.mode} />
                        <span>
                          {toBefore && <span className={s.srOnly}>{toBefore}</span>}
                          <span {...textAttrs(target, locale)}>{target}</span>
                          {toAfter && <span className={s.srOnly}>{toAfter}</span>}
                          <span className={s.railMode}>
                            {" ("}{g.modes[edge.mode] ?? edge.mode}
                            {edge.label && <>: <span {...textAttrs(edge.label, locale)}>{edge.label}</span></>}
                            {")"}
                          </span>
                          {layout.plans[index]?.kind === "back" && <span className={s.railMode}> · {g.loopsBack}</span>}
                        </span>
                        {edge.friction && <span className={s.x} role="img" aria-label={g.frictionPoint}>×</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={s.railEnd}>{g.end}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  return (
    <figure ref={rootRef} className={s.view} aria-labelledby={titleId} data-view={graph.view}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.eyebrow}>{eyebrow}</span>
          {controls}
        </div>
        <h3 id={titleId} className={s.title} {...textAttrs(graph.title, locale)}>{graph.title}</h3>
        {graph.summary && <p className={s.lede} {...textAttrs(graph.summary, locale)}>{graph.summary}</p>}
      </header>

      {rowCount > 0 && (
        <>
          <div className={s.graphBar}>
            {view === "diagram" ? (
              <ul className={s.legend} aria-label={g.legend}>
                {LEGEND.map((group) => {
                  const present = group.filter((mode) => modesPresent.has(mode));
                  if (!present.length) return null;
                  return (
                    <li key={group[0]} className={s.legendItem}>
                      <Swatch mode={present[0]} />
                      {present.map((mode) => g.modes[mode]).join(" · ")}
                    </li>
                  );
                })}
                {frictions.length > 0 && (
                  <li className={s.legendItem}><span className={s.x} aria-hidden="true">×</span>{g.friction}</li>
                )}
              </ul>
            ) : <span />}
            {fits && (
              <button type="button" className={s.linkButton} aria-pressed={choice === "list"} onClick={() => setChoice((value) => (value === "list" ? "diagram" : "list"))}>
                <List size={13} strokeWidth={1.6} aria-hidden="true" />
                {g.listView}
              </button>
            )}
          </div>
          {!fits && <p className={s.note}>{g.listNote}</p>}

          {view === "diagram" && (
            <div ref={boxRef} className={s.diagram} aria-hidden="true" data-cols={layout.widest} style={{ "--cols": Math.max(1, layout.widest) } as CSSProperties}>
              {routes && (
                <svg className={s.wires} focusable="false">
                  <defs>
                    {(["accent", "muted", "ink"] as const).map((tone) => (
                      <marker key={tone} id={`op-${uid}-${tone}`} viewBox="0 0 8 8" refX="8" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
                        <path d="M0 0L8 4L0 8Z" className={ARROW_CLASS[tone]} />
                      </marker>
                    ))}
                  </defs>
                  {routes.edges.map((route) => {
                    const edge = graph.edges[route.index];
                    const solid = SOLID.has(edge.mode);
                    return (
                      <path
                        key={`${graph.view}:${route.index}`}
                        d={route.d}
                        className={s.edge}
                        data-mode={edge.mode}
                        data-draw={solid && routes.draw ? "" : undefined}
                        pathLength={solid ? 1 : undefined}
                        markerEnd={`url(#op-${uid}-${toneOf(edge.mode)})`}
                      />
                    );
                  })}
                  {routes.edges.map((route) => {
                    const edge = graph.edges[route.index];
                    if (!edge.friction || tagOf(edge, g)) return null;
                    return (
                      <g key={`x:${route.index}`} transform={`translate(${route.anchor[0]} ${route.anchor[1]})`}>
                        <rect x="-5.5" y="-5.5" width="11" height="11" className={s.xBox} />
                        <path d="M-3 -3L3 3M3 -3L-3 3" className={s.xLine} />
                      </g>
                    );
                  })}
                </svg>
              )}
              <div
                className={s.rows}
                style={{
                  paddingBlockStart: 14 + channelSize(0, rowCount, layout.channels[0]),
                  paddingBlockEnd: 14 + channelSize(rowCount, rowCount, layout.channels[rowCount]),
                  paddingInlineStart: 10 + laneSpace(layout.lanes.start),
                  paddingInlineEnd: 10 + laneSpace(layout.lanes.end),
                }}
              >
                {layout.layers.map((row, r) => (
                  <div key={r} className={s.row} style={r ? { marginBlockStart: channelSize(r, rowCount, layout.channels[r]) } : undefined}>
                    {row.map((id) => {
                      const node = nodeById.get(id);
                      if (!node) return null;
                      const Icon = NODE_ICONS[node.kind] ?? Zap;
                      return (
                        <div key={id} className={s.node} data-node={id} data-kind={node.kind} data-friction={node.friction ? "" : undefined}>
                          <span className={s.nodeTop}>
                            <Icon size={15} strokeWidth={1.4} aria-hidden="true" />
                            <span className={s.micro}>{g.kinds[node.kind] ?? node.kind}</span>
                          </span>
                          {/* The box is LTR for its measured coordinates; the words in a card still read their own way. */}
                          <span className={s.nodeLabel} {...textAttrs(node.label, locale)}>{node.label}</span>
                          {showDetail && node.detail && <span className={s.nodeDetail} {...textAttrs(node.detail, locale)}>{node.detail}</span>}
                          {node.friction && <span className={s.badge}>×</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {routes?.edges.map((route) => {
                const edge = graph.edges[route.index];
                const tag = tagOf(edge, g);
                if (!tag) return null;
                // Measured, physical coordinates inside a box that is always LTR.
                return (
                  <span
                    key={`t:${route.index}`}
                    className={s.edgeTag}
                    data-mode={edge.mode}
                    data-plain={tag.plain ? "" : undefined}
                    data-friction={edge.friction ? "" : undefined}
                    style={{ left: route.anchor[0], top: route.anchor[1] }}
                  >
                    {edge.friction && <b>×</b>}
                    {edge.mode === "approval" && <UserCheck size={11} strokeWidth={1.6} aria-hidden="true" />}
                    {tag.prefix ? (
                      <span dir={pageDir}>{tag.prefix} · <span {...textAttrs(tag.text, locale)}>{tag.text}</span></span>
                    ) : (
                      <span {...(tag.plain ? { dir: pageDir } : textAttrs(tag.text, locale))}>{tag.text}</span>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {railList}
        </>
      )}

      {frictions.length > 0 && (
        <div className={s.friction}>
          <p className={s.micro} id={frictionId}>{g.friction}</p>
          <ul aria-labelledby={frictionId}>
            {frictions.map((item) => {
              // The line reads in the direction of its own words. Between two
              // labels the arrow must point the way THEY read: the page
              // direction cannot say, when both are English on an Arabic page.
              const lineDir = textAttrs([item.from, item.to ?? "", item.note].join(" "), locale).dir;
              const pairDir = item.to === undefined ? lineDir : textAttrs(`${item.from} ${item.to}`, locale).dir;
              return (
                <li key={item.key}>
                  <span className={s.x} aria-hidden="true">×</span>
                  <span dir={lineDir}>
                    {item.to === undefined ? (
                      <strong {...textAttrs(item.from, locale)}>{item.from}</strong>
                    ) : (
                      <strong dir={pairDir}>
                        {/* The arrow is visual; screen readers get the handoff as one phrase in the language's own word order. */}
                        <span aria-hidden="true">
                          <span {...textAttrs(item.from, locale)}>{item.from}</span>
                          {pairDir === "rtl"
                            ? <ArrowLeft size={11} strokeWidth={1.6} />
                            : <ArrowRight size={11} strokeWidth={1.6} />}
                          <span {...textAttrs(item.to, locale)}>{item.to}</span>
                        </span>
                        <span className={s.srOnly}>{fill(g.between, { from: item.from, to: item.to })}</span>
                      </strong>
                    )}
                    {" — "}
                    <span {...textAttrs(item.note, locale)}>{item.note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </figure>
  );
}

export default WorkflowGraph;
