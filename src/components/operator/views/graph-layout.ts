// components/operator/views/graph-layout.ts
//
// Layered layout and orthogonal edge routing for the Operator's workflow
// maps (<WorkflowGraph>). Pure: types only from the protocol, no React and no
// DOM, so `node --test` can load it and the arithmetic is testable offline.
//
// The model draws these graphs freely, so the layout has to survive what a
// hand-drawn diagram never has: cycles (rework loops are the norm in the
// processes visitors describe), nodes nothing points to, edges to self,
// duplicate edges, edges naming unknown nodes. Everything is deterministic —
// the same graph always lands the same way — because the transcript is
// re-rendered on every visit and a diagram that reshuffles between renders
// reads as a different process.
//
// Pipeline: DFS from the sources marks back edges (the rest is a DAG) →
// longest-path layering → sources pulled down next to their first consumer →
// two barycenter sweeps order each layer. Routing then works on measured
// boxes: every edge leaves the bottom of its source and enters the top of its
// target through the horizontal "channel" between two rows; an edge that
// skips rows runs down a lane on the right, and a back edge returns up a lane
// on the left, so no line ever crosses a node card.

import type { GraphEdge, WorkflowGraph } from "@/lib/operator/protocol";

/** How an edge is routed: between adjacent rows, down the skip lane, or up the return lane. */
export type EdgeRouteKind = "forward" | "long" | "back";

export interface EdgePlan {
  kind: EdgeRouteKind;
  /** Layer of the source and of the target. */
  from: number;
  to: number;
}

export interface GraphLayout {
  /** Node ids per layer, top row first; order within a layer is left to right. */
  layers: string[][];
  /** Layer and in-layer index of every node id. */
  position: Map<string, { layer: number; index: number }>;
  /** `from->to` keys (see `edgeKey`) of edges that point back up the flow. */
  backEdges: Set<string>;
  /** Size of the widest layer. */
  widest: number;
  /** True when some layer holds more nodes than `maxPerRow` — the caller switches to the list view. */
  overflow: boolean;
  /**
   * Horizontal segments that will run through each channel. Channel `c` sits
   * above layer `c`; channel `layers.length` is below the last row. Known
   * before measuring, so the renderer can size row gaps up front and never
   * re-layout after routing.
   */
  channels: number[];
  /** Lanes needed on each side: `start` (left) for back edges, `end` (right) for row-skipping edges. */
  lanes: { start: number; end: number };
  /** One entry per `graph.edges[i]`; null when the edge names a node that does not exist. */
  plans: (EdgePlan | null)[];
}

export function edgeKey(from: string, to: string): string {
  return `${from}->${to}`;
}

interface Prepared {
  ids: string[];
  indexOf: Map<string, number>;
  /** Valid edges only, as node indices; `edge` is the index into graph.edges. */
  edges: Array<{ edge: number; from: number; to: number }>;
}

/** First occurrence of a node id wins; edges to unknown ids are dropped here, once. */
function prepare(graph: WorkflowGraph): Prepared {
  const ids: string[] = [];
  const indexOf = new Map<string, number>();
  for (const node of graph.nodes) {
    if (!indexOf.has(node.id)) {
      indexOf.set(node.id, ids.length);
      ids.push(node.id);
    }
  }
  const edges: Prepared["edges"] = [];
  graph.edges.forEach((edge, index) => {
    const from = indexOf.get(edge.from);
    const to = indexOf.get(edge.to);
    if (from !== undefined && to !== undefined) edges.push({ edge: index, from, to });
  });
  return { ids, indexOf, edges };
}

/**
 * Indices (into `edges`) of back edges: DFS from every source in input
 * order, then from any node still unvisited (a cycle nothing feeds).
 * Iterative, so a long chain cannot overflow the stack. Self-loops are
 * always back edges.
 */
function findBackEdges(count: number, edges: Prepared["edges"]): Set<number> {
  const out: number[][] = Array.from({ length: count }, () => []);
  const indegree = new Array<number>(count).fill(0);
  edges.forEach((edge, k) => {
    out[edge.from].push(k);
    if (edge.from !== edge.to) indegree[edge.to] += 1;
  });
  const state = new Uint8Array(count); // 0 unseen, 1 on the DFS stack, 2 finished
  const back = new Set<number>();
  const visit = (root: number) => {
    state[root] = 1;
    const stack: Array<[node: number, next: number]> = [[root, 0]];
    while (stack.length) {
      const top = stack[stack.length - 1];
      const [node, next] = top;
      if (next < out[node].length) {
        top[1] = next + 1;
        const k = out[node][next];
        const target = edges[k].to;
        if (state[target] === 1) back.add(k);
        else if (state[target] === 0) {
          state[target] = 1;
          stack.push([target, 0]);
        }
      } else {
        state[node] = 2;
        stack.pop();
      }
    }
  };
  for (let v = 0; v < count; v++) if (indegree[v] === 0 && state[v] === 0) visit(v);
  for (let v = 0; v < count; v++) if (state[v] === 0) visit(v);
  return back;
}

/** Kahn's algorithm over the DAG, always taking the lowest input index that is ready. */
function topologicalOrder(count: number, dagOut: number[][]): number[] {
  const remaining = new Array<number>(count).fill(0);
  for (const targets of dagOut) for (const w of targets) remaining[w] += 1;
  const ready: number[] = [];
  for (let v = 0; v < count; v++) if (remaining[v] === 0) ready.push(v);
  const order: number[] = [];
  while (ready.length) {
    const v = ready.shift() as number;
    order.push(v);
    for (const w of dagOut[v]) {
      remaining[w] -= 1;
      if (remaining[w] === 0) {
        let at = 0;
        while (at < ready.length && ready[at] < w) at += 1;
        ready.splice(at, 0, w);
      }
    }
  }
  return order;
}

interface Dag {
  prepared: Prepared;
  back: Set<number>;
  dagOut: number[][];
  dagIn: number[][];
  order: number[];
}

function buildDag(graph: WorkflowGraph): Dag {
  const prepared = prepare(graph);
  const count = prepared.ids.length;
  const back = findBackEdges(count, prepared.edges);
  const dagOut: number[][] = Array.from({ length: count }, () => []);
  const dagIn: number[][] = Array.from({ length: count }, () => []);
  prepared.edges.forEach((edge, k) => {
    if (back.has(k)) return;
    dagOut[edge.from].push(edge.to);
    dagIn[edge.to].push(edge.from);
  });
  return { prepared, back, dagOut, dagIn, order: topologicalOrder(count, dagOut) };
}

/**
 * Reading order for the list view: a topological order of the graph with
 * back edges ignored, preferring input order wherever the edges allow it.
 * Covers every node exactly once, cycles included.
 */
export function toRailOrder(graph: WorkflowGraph): string[] {
  const { prepared, order } = buildDag(graph);
  return order.map((v) => prepared.ids[v]);
}

/** Channel height in px for `segments` horizontal runs; the outer channels (above the first row, below the last) exist only when used. */
export const ROUTING = {
  /** Vertical distance between parallel horizontal runs in one channel. */
  track: 8,
  /** Minimum gap between two rows. */
  minGap: 36,
  /** Gap before the first and after the last track. */
  gapPad: 20,
  outerPad: 12,
  /** First lane's distance from the outermost node, and the step between lanes. */
  laneGap: 12,
  laneStep: 6,
} as const;

export function channelSize(channel: number, layerCount: number, segments: number): number {
  if (channel === 0 || channel === layerCount) return segments ? ROUTING.outerPad + segments * ROUTING.track : 0;
  return Math.max(ROUTING.minGap, ROUTING.gapPad + segments * ROUTING.track);
}

/** Horizontal room to reserve beside the nodes for `lanes` vertical lanes. */
export function laneSpace(lanes: number): number {
  return lanes ? ROUTING.laneGap + (lanes - 1) * ROUTING.laneStep + 4 : 0;
}

export function layoutGraph(graph: WorkflowGraph, opts: { maxPerRow: number }): GraphLayout {
  const { prepared, back, dagOut, dagIn, order } = buildDag(graph);
  const { ids, edges } = prepared;
  const count = ids.length;

  // Longest-path layering: every node sits one row below its lowest predecessor.
  const layerOf = new Array<number>(count).fill(0);
  for (const v of order) for (const w of dagOut[v]) layerOf[w] = Math.max(layerOf[w], layerOf[v] + 1);
  // A source that only feeds a late step (the spreadsheet read at step 4)
  // would otherwise sit in the top row with a long edge down; place it just
  // above its earliest consumer instead.
  for (const v of order) {
    if (dagIn[v].length === 0 && dagOut[v].length > 0) {
      layerOf[v] = Math.min(...dagOut[v].map((w) => layerOf[w])) - 1;
    }
  }
  // Compact (defensive: the passes above leave no empty rows, but a gap would render as blank space).
  const used = [...new Set(layerOf)].sort((a, b) => a - b);
  const remap = new Map(used.map((layer, index) => [layer, index]));
  for (let v = 0; v < count; v++) layerOf[v] = remap.get(layerOf[v]) as number;

  const layers: number[][] = Array.from({ length: used.length }, () => []);
  for (let v = 0; v < count; v++) layers[layerOf[v]].push(v); // input order to start

  // Two barycenter sweeps (down, then up) over DAG edges. A neighbour in any
  // other row counts by its relative position in that row, so edges that skip
  // rows still pull their ends into line. Ties keep input order.
  const slot = new Array<number>(count).fill(0);
  const relative = (v: number) => (slot[v] + 0.5) / layers[layerOf[v]].length;
  const index = () => layers.forEach((row) => row.forEach((v, i) => { slot[v] = i; }));
  const sweep = (rows: number[], neighbours: number[][]) => {
    for (const r of rows) {
      const row = layers[r];
      const weight = new Map<number, number>();
      for (const v of row) {
        const around = neighbours[v];
        weight.set(v, around.length ? around.reduce((sum, u) => sum + relative(u), 0) / around.length : relative(v));
      }
      row.sort((a, b) => (weight.get(a) as number) - (weight.get(b) as number) || a - b);
      row.forEach((v, i) => { slot[v] = i; });
    }
  };
  index();
  const down = layers.map((_, r) => r).slice(1);
  const up = layers.map((_, r) => r).reverse().slice(1);
  sweep(down, dagIn);
  sweep(up, dagOut);

  const position = new Map<string, { layer: number; index: number }>();
  layers.forEach((row, layer) => row.forEach((v, i) => position.set(ids[v], { layer, index: i })));

  // Plans and the segment count per channel (see `channels` above).
  const plans: (EdgePlan | null)[] = graph.edges.map(() => null);
  const channels = new Array<number>(layers.length + 1).fill(0);
  const backEdges = new Set<string>();
  const lanes = { start: 0, end: 0 };
  edges.forEach((edge, k) => {
    const from = layerOf[edge.from];
    const to = layerOf[edge.to];
    const source = graph.edges[edge.edge] as GraphEdge;
    if (back.has(k) || to <= from) {
      backEdges.add(edgeKey(source.from, source.to));
      plans[edge.edge] = { kind: "back", from, to };
      channels[from + 1] += 1;
      channels[to] += 1;
      lanes.start += 1;
    } else if (to === from + 1) {
      plans[edge.edge] = { kind: "forward", from, to };
      channels[to] += 1;
    } else {
      plans[edge.edge] = { kind: "long", from, to };
      channels[from + 1] += 1;
      channels[to] += 1;
      lanes.end += 1;
    }
  });

  const idLayers = layers.map((row) => row.map((v) => ids[v]));
  const widest = idLayers.reduce((max, row) => Math.max(max, row.length), 0);
  return { layers: idLayers, position, backEdges, widest, overflow: widest > opts.maxPerRow, channels, lanes, plans };
}

/* -------------------------------------------------------------------------- */
/*                                  Routing                                   */
/* -------------------------------------------------------------------------- */

/** A node card's box in the diagram's own coordinates (px). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Point = [number, number];

export interface RoutedEdge {
  /** Index into graph.edges. */
  index: number;
  kind: EdgeRouteKind;
  points: Point[];
  /** SVG path data (orthogonal polyline, square corners). */
  d: string;
  /** Where a tag or a friction mark sits: the middle of the longest horizontal run, else the middle of the path. */
  anchor: Point;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The point at fraction `t` (0–1) of a polyline's length. */
export function pointAlong(points: Point[], t: number): Point {
  if (points.length === 0) return [0, 0];
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let remaining = lengths.reduce((sum, n) => sum + n, 0) * Math.min(1, Math.max(0, t));
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, remaining / lengths[i]) : 0;
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * f, points[i][1] + (points[i + 1][1] - points[i][1]) * f];
    }
    remaining -= lengths[i];
  }
  return points[points.length - 1];
}

function anchorOf(points: Point[]): Point {
  let best: Point | null = null;
  let bestLength = 23; // shorter runs cannot hold a tag
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    if (Math.abs(y1 - y2) < 0.5 && Math.abs(x2 - x1) > bestLength) {
      bestLength = Math.abs(x2 - x1);
      best = [(x1 + x2) / 2, y1];
    }
  }
  return best ?? pointAlong(points, 0.5);
}

function toPath(points: Point[]): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)} ${round(y)}`).join("");
}

interface Segment {
  edge: number;
  channel: number;
  x1: number;
  x2: number;
  y: number;
}

/**
 * Route every planned edge through measured boxes. Returns [] until every
 * node has a box (first render, before measuring). Exit and entry points
 * spread along a card's bottom and top edges in the order of where the other
 * end lies, and horizontal runs in one channel get separate tracks ordered
 * so that runs in the same direction do not cross each other.
 */
export function routeEdges(graph: WorkflowGraph, layout: GraphLayout, boxes: ReadonlyMap<string, Box>): RoutedEdge[] {
  const rowCount = layout.layers.length;
  if (!rowCount) return [];
  for (const row of layout.layers) for (const id of row) if (!boxes.has(id)) return [];
  const box = (id: string) => boxes.get(id) as Box;
  const centre = (id: string) => box(id).x + box(id).w / 2;

  const rowTop = layout.layers.map((row) => Math.min(...row.map((id) => box(id).y)));
  const rowBottom = layout.layers.map((row) => Math.max(...row.map((id) => box(id).y + box(id).h)));
  let minX = Infinity;
  let maxX = -Infinity;
  boxes.forEach((b) => { minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x + b.w); });

  const channelSpan = (c: number): [number, number] => {
    if (c === 0) return [rowTop[0] - channelSize(0, rowCount, layout.channels[0]), rowTop[0]];
    if (c === rowCount) return [rowBottom[rowCount - 1], rowBottom[rowCount - 1] + channelSize(c, rowCount, layout.channels[c])];
    return [rowBottom[c - 1], rowTop[c]];
  };

  const planned = graph.edges.map((edge, index) => ({ edge, index, plan: layout.plans[index] })).filter((item): item is { edge: GraphEdge; index: number; plan: EdgePlan } => item.plan !== null);

  // Exit / entry x: spread along the card in the order of the other end's side.
  const side = (plan: EdgePlan, otherX: number) => (plan.kind === "back" ? -Infinity : plan.kind === "long" ? Infinity : otherX);
  const exitX = new Map<number, number>();
  const entryX = new Map<number, number>();
  const spread = (id: string, items: Array<{ index: number; key: number }>, into: Map<number, number>) => {
    items.sort((a, b) => a.key - b.key || a.index - b.index);
    const b = box(id);
    items.forEach((item, rank) => into.set(item.index, b.x + (b.w * (rank + 1)) / (items.length + 1)));
  };
  const outgoing = new Map<string, Array<{ index: number; key: number }>>();
  const incoming = new Map<string, Array<{ index: number; key: number }>>();
  for (const { edge, index, plan } of planned) {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    (outgoing.get(edge.from) as Array<{ index: number; key: number }>).push({ index, key: side(plan, centre(edge.to)) });
    (incoming.get(edge.to) as Array<{ index: number; key: number }>).push({ index, key: side(plan, centre(edge.from)) });
  }
  outgoing.forEach((items, id) => spread(id, items, exitX));
  incoming.forEach((items, id) => spread(id, items, entryX));

  // Lanes: shorter spans run closer to the nodes so nested loops never cross.
  const laneX = new Map<number, number>();
  const assignLanes = (kind: EdgeRouteKind, x: (lane: number) => number) => {
    planned
      .filter((item) => item.plan.kind === kind)
      .sort((a, b) => Math.abs(a.plan.to - a.plan.from) - Math.abs(b.plan.to - b.plan.from) || a.index - b.index)
      .forEach((item, lane) => laneX.set(item.index, x(lane)));
  };
  assignLanes("back", (lane) => minX - ROUTING.laneGap - lane * ROUTING.laneStep);
  assignLanes("long", (lane) => maxX + ROUTING.laneGap + lane * ROUTING.laneStep);

  // Horizontal runs, then one track per run inside its channel.
  const segments: Segment[] = [];
  for (const { index, plan } of planned) {
    const ex = exitX.get(index) as number;
    const nx = entryX.get(index) as number;
    if (plan.kind === "forward") segments.push({ edge: index, channel: plan.to, x1: ex, x2: nx, y: 0 });
    else {
      const lx = laneX.get(index) as number;
      segments.push({ edge: index, channel: plan.from + 1, x1: ex, x2: lx, y: 0 });
      segments.push({ edge: index, channel: plan.to, x1: lx, x2: nx, y: 0 });
    }
  }
  const byChannel = new Map<number, Segment[]>();
  for (const segment of segments) {
    if (!byChannel.has(segment.channel)) byChannel.set(segment.channel, []);
    (byChannel.get(segment.channel) as Segment[]).push(segment);
  }
  byChannel.forEach((list, channel) => {
    // Rightward runs: the one starting furthest right turns first (top track);
    // leftward runs mirror that. Same-direction runs then never cross.
    const direction = (s: Segment) => (s.x2 - s.x1 > 0.5 ? 0 : s.x1 - s.x2 > 0.5 ? 1 : 2);
    list.sort((a, b) => {
      const da = direction(a);
      const db = direction(b);
      if (da !== db) return da - db;
      if (da === 0) return b.x1 - a.x1 || a.edge - b.edge;
      if (da === 1) return a.x1 - b.x1 || a.edge - b.edge;
      return a.edge - b.edge;
    });
    const [top, bottom] = channelSpan(channel);
    const height = Math.max(0, bottom - top);
    const step = Math.min(ROUTING.track, height / (list.length + 1));
    const first = top + (height - (list.length - 1) * step) / 2;
    list.forEach((segment, i) => { segment.y = first + i * step; });
  });
  const runs = new Map<number, Segment[]>();
  for (const segment of segments) {
    if (!runs.has(segment.edge)) runs.set(segment.edge, []);
    (runs.get(segment.edge) as Segment[]).push(segment);
  }

  return planned.map(({ edge, index, plan }) => {
    const [first, second] = runs.get(index) as Segment[];
    const start: Point = [first.x1, box(edge.from).y + box(edge.from).h];
    const endY = box(edge.to).y;
    let points: Point[];
    if (plan.kind === "forward") {
      points = Math.abs(first.x1 - first.x2) <= 0.5
        ? [start, [first.x1, endY]]
        : [start, [first.x1, first.y], [first.x2, first.y], [first.x2, endY]];
    } else {
      points = [start, [first.x1, first.y], [first.x2, first.y], [second.x1, second.y], [second.x2, second.y], [second.x2, endY]];
    }
    return { index, kind: plan.kind, points, d: toPath(points), anchor: anchorOf(points) };
  });
}
