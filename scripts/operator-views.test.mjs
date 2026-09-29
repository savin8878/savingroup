/**
 * Offline tests for the Operator's artifact-view logic: graph layering and
 * edge routing, the list-view reading order, and the brief / X-Ray text
 * formats with their WhatsApp and mailto caps.
 *
 *   node --test --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/operator-views.test.mjs
 *
 * Loads the real modules from src/ through Node's TypeScript type stripping
 * (Node >= 22.18). Only pure modules are imported — no React, no CSS.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// Resolve the `@/` alias and extensionless imports inside src/, and load the
// locale JSON files as modules (they are imported without import attributes).
const SRC = new URL("../src/", import.meta.url).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const SRC = ${JSON.stringify(SRC)};
function withExtension(href) {
  if (/\\.(ts|tsx|mjs|js|json)$/.test(href)) return href;
  for (const ext of [".ts", ".tsx", "/index.ts"]) {
    if (existsSync(fileURLToPath(href + ext))) return href + ext;
  }
  return href;
}
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) return next(withExtension(new URL(specifier.slice(2), SRC).href), context);
  if (specifier.startsWith(".") && context.parentURL?.startsWith(SRC)) {
    return next(withExtension(new URL(specifier, context.parentURL).href), context);
  }
  try {
    return await next(specifier, context);
  } catch (err) {
    // Package subpaths without an exports map (next/cache) need the extension under ESM.
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^[@\\w]/.test(specifier) && !/\\.\\w+$/.test(specifier)) {
      return next(specifier + ".js", context);
    }
    throw err;
  }
}
export async function load(url, context, next) {
  if (url.startsWith(SRC) && url.endsWith(".json")) {
    return { format: "module", source: "export default " + (await readFile(new URL(url), "utf8")) + ";", shortCircuit: true };
  }
  return next(url, context);
}
`),
);

const layout = await import("../src/components/operator/views/graph-layout.ts");
const format = await import("../src/components/operator/views/brief-format.ts");
const { getViewsCopy, fill } = await import("../src/components/operator/views/views-copy.ts");

const { layoutGraph, toRailOrder, routeEdges, edgeKey, channelSize, pointAlong } = layout;

/* ------------------------------------------------------------------------ */
/*                                 Fixtures                                 */
/* ------------------------------------------------------------------------ */

const node = (id, kind = "action") => ({ id, label: id.toUpperCase(), kind });
const edge = (from, to, mode = "manual") => ({ from, to, mode });
const graph = (nodes, edges, view = "current") => ({ title: "T", view, nodes: nodes.map((n) => (typeof n === "string" ? node(n) : n)), edges });

const chain = graph(["a", "b", "c", "d"], [edge("a", "b"), edge("b", "c"), edge("c", "d")]);
const diamond = graph(["start", "left", "right", "join"], [edge("start", "left"), edge("start", "right"), edge("left", "join"), edge("right", "join")]);
// order → check → fix → check is a rework loop; ship ends it.
const cycle = graph(["order", "check", "fix", "ship"], [edge("order", "check"), edge("check", "fix"), edge("fix", "check"), edge("check", "ship", "automated")]);

/** Boxes laid out like the renderer: rows `gap` apart, cards 100×50, 10px between them. */
function boxesFor(result, gap = 40) {
  const boxes = new Map();
  let y = channelSize(0, result.layers.length, result.channels[0]);
  result.layers.forEach((row, r) => {
    if (r > 0) y += Math.max(gap, channelSize(r, result.layers.length, result.channels[r]));
    const width = row.length * 100 + (row.length - 1) * 10;
    row.forEach((id, i) => boxes.set(id, { x: 200 - width / 2 + i * 110, y, w: 100, h: 50 }));
    y += 50;
  });
  return boxes;
}

/* ------------------------------------------------------------------------ */
/*                                  Layout                                  */
/* ------------------------------------------------------------------------ */

test("a linear chain is one node per layer, in order", () => {
  const result = layoutGraph(chain, { maxPerRow: 3 });
  assert.deepEqual(result.layers, [["a"], ["b"], ["c"], ["d"]]);
  assert.equal(result.backEdges.size, 0);
  assert.equal(result.widest, 1);
  assert.equal(result.overflow, false);
  assert.deepEqual(result.plans.map((plan) => plan.kind), ["forward", "forward", "forward"]);
});

test("a diamond branches into one layer and merges below it", () => {
  const result = layoutGraph(diamond, { maxPerRow: 3 });
  assert.deepEqual(result.layers, [["start"], ["left", "right"], ["join"]]);
  assert.equal(result.backEdges.size, 0);
  assert.equal(result.widest, 2);
  assert.equal(layoutGraph(diamond, { maxPerRow: 1 }).overflow, true);
});

test("a cycle marks its back edge, terminates, and lays out the same way every time", () => {
  const first = layoutGraph(cycle, { maxPerRow: 3 });
  assert.deepEqual([...first.backEdges], [edgeKey("fix", "check")]);
  assert.deepEqual(first.layers, [["order"], ["check"], ["fix", "ship"]]);
  assert.deepEqual(first.plans.map((plan) => plan.kind), ["forward", "forward", "back", "forward"]);
  assert.deepEqual(first.lanes, { start: 1, end: 0 });
  for (let i = 0; i < 5; i++) {
    const again = layoutGraph(structuredClone(cycle), { maxPerRow: 3 });
    assert.deepEqual(again.layers, first.layers);
    assert.deepEqual([...again.backEdges], [...first.backEdges]);
  }
});

test("a graph that is only a cycle, and a self-loop, still terminate", () => {
  const ring = graph(["x", "y", "z"], [edge("x", "y"), edge("y", "z"), edge("z", "x")]);
  const result = layoutGraph(ring, { maxPerRow: 3 });
  assert.deepEqual(result.layers, [["x"], ["y"], ["z"]]);
  assert.deepEqual([...result.backEdges], [edgeKey("z", "x")]);

  const self = layoutGraph(graph(["a", "b"], [edge("a", "a"), edge("a", "b")]), { maxPerRow: 3 });
  assert.deepEqual(self.layers, [["a"], ["b"]]);
  assert.deepEqual([...self.backEdges], [edgeKey("a", "a")]);
});

test("disconnected nodes and edges to unknown nodes are handled, not dropped or thrown", () => {
  const result = layoutGraph(graph(["a", "b", "lonely"], [edge("a", "b"), edge("b", "ghost"), edge("nobody", "a")]), { maxPerRow: 3 });
  const placed = result.layers.flat();
  assert.deepEqual([...placed].sort(), ["a", "b", "lonely"]);
  assert.equal(result.position.get("lonely").layer, 0);
  assert.deepEqual(result.plans.map((plan) => plan?.kind ?? null), ["forward", null, null]);
});

test("a source is placed just above its first consumer, not in the top row", () => {
  const late = graph(["a", "b", "c", "sheet"], [edge("a", "b"), edge("b", "c"), edge("sheet", "c")]);
  const result = layoutGraph(late, { maxPerRow: 3 });
  assert.equal(result.position.get("sheet").layer, 1);
  assert.deepEqual(result.plans.map((plan) => plan.kind), ["forward", "forward", "forward"]);
});

test("ordering within a layer follows the barycenter and is stable across runs", () => {
  // Crossed input: b feeds y and a feeds x, but y is listed first. The sweep uncrosses them.
  const crossed = graph(["a", "b", "y", "x"], [edge("a", "x"), edge("b", "y")]);
  const result = layoutGraph(crossed, { maxPerRow: 3 });
  assert.deepEqual(result.layers, [["a", "b"], ["x", "y"]]);
  // Ties keep input order.
  const fan = graph(["root", "p", "q", "r"], [edge("root", "p"), edge("root", "q"), edge("root", "r")]);
  assert.deepEqual(layoutGraph(fan, { maxPerRow: 3 }).layers, [["root"], ["p", "q", "r"]]);
  for (let i = 0; i < 3; i++) assert.deepEqual(layoutGraph(structuredClone(crossed), { maxPerRow: 3 }).layers, result.layers);
});

test("channel counts reserve room for every horizontal run", () => {
  const skip = graph(["a", "b", "c"], [edge("a", "b"), edge("b", "c"), edge("a", "c", "automated")]);
  const result = layoutGraph(skip, { maxPerRow: 3 });
  assert.deepEqual(result.plans.map((plan) => plan.kind), ["forward", "forward", "long"]);
  assert.deepEqual(result.lanes, { start: 0, end: 1 });
  // channel 1 (a→b plus the long edge's exit), channel 2 (b→c plus its entry)
  assert.deepEqual(result.channels, [0, 2, 2, 0]);
});

/* ------------------------------------------------------------------------ */
/*                                 Rail order                               */
/* ------------------------------------------------------------------------ */

test("toRailOrder covers every node exactly once, cycles and islands included", () => {
  for (const g of [chain, diamond, cycle, graph(["z", "a", "b"], [edge("a", "b"), edge("b", "a")])]) {
    const order = toRailOrder(g);
    assert.equal(order.length, g.nodes.length);
    assert.deepEqual([...order].sort(), g.nodes.map((n) => n.id).sort());
  }
  assert.deepEqual(toRailOrder(cycle), ["order", "check", "fix", "ship"]);
  assert.deepEqual(toRailOrder(diamond), ["start", "left", "right", "join"]);
});

/* ------------------------------------------------------------------------ */
/*                                  Routing                                 */
/* ------------------------------------------------------------------------ */

test("routes leave the source's bottom, enter the target's top, and are orthogonal", () => {
  for (const g of [chain, diamond, cycle]) {
    const result = layoutGraph(g, { maxPerRow: 3 });
    const boxes = boxesFor(result);
    const routes = routeEdges(g, result, boxes);
    assert.equal(routes.length, g.edges.length);
    for (const route of routes) {
      const { from, to } = g.edges[route.index];
      const [sx, sy] = route.points[0];
      const [tx, ty] = route.points[route.points.length - 1];
      const source = boxes.get(from);
      const target = boxes.get(to);
      assert.equal(sy, source.y + source.h);
      assert.ok(sx > source.x && sx < source.x + source.w);
      assert.equal(ty, target.y);
      assert.ok(tx > target.x && tx < target.x + target.w);
      for (let i = 1; i < route.points.length; i++) {
        const [x1, y1] = route.points[i - 1];
        const [x2, y2] = route.points[i];
        assert.ok(x1 === x2 || y1 === y2, `segment ${i} of ${from}->${to} is diagonal`);
      }
      assert.match(route.d, /^M[\d.-]+ [\d.-]+(L[\d.-]+ [\d.-]+)+$/);
    }
  }
});

test("a back edge returns along the inline-start side, left of every node", () => {
  const result = layoutGraph(cycle, { maxPerRow: 3 });
  const boxes = boxesFor(result);
  const back = routeEdges(cycle, result, boxes).find((route) => route.kind === "back");
  const minX = Math.min(...[...boxes.values()].map((b) => b.x));
  assert.ok(back.points.some(([x]) => x < minX));
  assert.equal(routeEdges(cycle, result, new Map()).length, 0, "no routes before every node is measured");
});

test("pointAlong walks a polyline by length", () => {
  assert.deepEqual(pointAlong([[0, 0], [10, 0], [10, 10]], 0.5), [10, 0]);
  assert.deepEqual(pointAlong([[0, 0], [0, 20]], 0.25), [0, 5]);
});

/* ------------------------------------------------------------------------ */
/*                               Brief formats                              */
/* ------------------------------------------------------------------------ */

const en = getViewsCopy("en");
const brief = {
  company: "Acme Components",
  contact: { name: "Asha", email: "asha@example.com" },
  industry: "Auto components",
  currentSystems: ["Tally", "Excel", "WhatsApp"],
  currentWorkflow: "Orders arrive on WhatsApp and are re-typed into Excel, then Tally.",
  primaryProblem: "Order status lives in three places.",
  observedFriction: Array.from({ length: 30 }, (_, i) => `Friction item number ${i + 1} with a little detail about the re-keying involved`),
  desiredOutcome: "One order record from enquiry to invoice.",
  potentialArchitecture: "WhatsApp Business API into an order service synced with Tally.",
  unknowns: ["Tally version", "Who approves credit"],
  relevantCapabilities: ["integrations", "erp"],
  summary: "Manufacturer re-keying WhatsApp orders into Excel and Tally.",
  channels: { whatsappDigits: "918305838352", email: "savingroup@gmail.com" },
};

test("briefToPlainText cuts at a line boundary and says so", () => {
  const full = format.briefToPlainText(brief, en.brief, 100_000);
  assert.ok(!full.includes(en.brief.truncated));
  assert.ok(full.startsWith(en.brief.greeting));
  assert.ok(full.includes("Summary: Manufacturer"), "summary leads");
  assert.ok(full.includes("Relevant capabilities: APIs & system integrations, ERP & business systems"));
  assert.ok(!full.includes("Urgency"), "absent optional fields are omitted, never invented");

  const cut = format.briefToPlainText(brief, en.brief, 900);
  assert.ok(cut.length <= 900);
  assert.ok(cut.endsWith(en.brief.truncated));
  const kept = cut.slice(0, -en.brief.truncated.length).replace(/\n$/, "").split("\n");
  const original = full.split("\n");
  // Every kept line is a whole line of the full text, in order.
  assert.deepEqual(kept, original.slice(0, kept.length));
  assert.ok(kept.length < original.length);
});

test("buildWhatsAppUrl encodes the text and stays under the cap, in any script", () => {
  const text = format.briefToPlainText(brief, en.brief, format.WHATSAPP_TEXT_MAX, format.whatsAppLength);
  const url = format.buildWhatsAppUrl("+91 83058-38352", text);
  assert.ok(url.startsWith("https://wa.me/918305838352?text="));
  const value = url.slice(url.indexOf("?text=") + 6);
  assert.ok(value.length <= format.WHATSAPP_TEXT_MAX);
  assert.equal(decodeURIComponent(value), text);
  assert.ok(!/[\s&#]/.test(value), "spaces, & and # are encoded");

  // Devanagari encodes to 9 characters each; the encoded cap still holds.
  const hi = getViewsCopy("hi");
  const hindi = { ...brief, observedFriction: brief.observedFriction.map(() => "ऑर्डर व्हाट्सऐप से आते हैं और एक्सेल में दोबारा टाइप किए जाते हैं") };
  const hindiText = format.briefToPlainText(hindi, hi.brief, format.WHATSAPP_TEXT_MAX, format.whatsAppLength);
  assert.ok(hindiText.endsWith(hi.brief.truncated));
  const hindiUrl = format.buildWhatsAppUrl("918305838352", hindiText);
  assert.ok(hindiUrl.length - "https://wa.me/918305838352?text=".length <= format.WHATSAPP_TEXT_MAX);

  // A text the caller forgot to cap is still cut by the builder.
  const raw = format.buildWhatsAppUrl("918305838352", Array.from({ length: 400 }, (_, i) => `line ${i}`).join("\n"));
  assert.ok(raw.length - "https://wa.me/918305838352?text=".length <= format.WHATSAPP_TEXT_MAX);
});

test("buildMailtoUrl encodes the subject and sends CRLF line breaks", () => {
  const subject = format.briefSubject(brief, en.brief);
  assert.equal(subject, "Audit brief — Acme Components");
  const body = format.briefToPlainText(brief, en.brief, format.MAILTO_BODY_MAX, format.mailtoLength);
  const url = format.buildMailtoUrl("savingroup@gmail.com", subject, body);
  assert.ok(url.startsWith("mailto:savingroup@gmail.com?subject=Audit%20brief%20%E2%80%94%20Acme%20Components&body="));
  const value = url.slice(url.indexOf("&body=") + 6);
  assert.ok(value.includes("%0D%0A"));
  assert.ok(!/%0A/.test(value.replace(/%0D%0A/g, "")), "no bare LF");
  assert.ok(value.length <= format.MAILTO_BODY_MAX);
  assert.ok(!/[\s&]/.test(value));
});

test("briefToMarkdown lists present fields and the destinations", () => {
  const md = format.briefToMarkdown(brief, en.brief, { email: "savingroup@gmail.com", whatsapp: format.formatWhatsAppNumber("918305838352") });
  assert.ok(md.startsWith("# Audit brief — Acme Components\n"));
  assert.ok(md.includes("**Contact:** Asha · asha@example.com"));
  assert.ok(md.includes("- Tally"));
  assert.ok(md.includes("Send to: savingroup@gmail.com · +91 83058 38352"));
  assert.equal(format.formatWhatsAppNumber("15551234567"), "+15551234567");
});

test("xrayToMarkdown includes all eight sections, evidence tags and levels", () => {
  const xray = {
    title: "Stores X-Ray",
    company: { industry: "Manufacturing", size: "120 people" },
    currentWorkflow: ["Indent raised on paper", "Stores checks Excel"],
    systems: [{ name: "Tally", role: "Accounts" }],
    handoffs: ["Stores → Purchase by phone"],
    friction: [{ issue: "Stock counts drift", evidence: "stated" }, { issue: "Approvals wait on one person", evidence: "inferred" }],
    automationPoints: [{ point: "Low-stock alert", level: 2, approach: "Sync Excel stock to Tally" }],
    connectedArchitecture: "A shared item master with Tally as the ledger.",
    verificationQuestions: [],
    firstExperiment: { name: "Two-week stock sync", scope: "One store", successMeasure: "Zero manual counts" },
  };
  const md = format.xrayToMarkdown(xray, en.xray);
  en.xray.sections.forEach((name, i) => assert.ok(md.includes(`## 0${i + 1} · ${name}`), `section ${i + 1}`));
  assert.ok(md.includes("**[Stated]** Stock counts drift"));
  assert.ok(md.includes("**[Inferred]** Approvals wait on one person"));
  assert.ok(md.includes("L2 · System integration"));
  assert.ok(md.includes("_None noted_"), "an empty section says so");
  assert.ok(md.includes("- **Size:** 120 people"));
  assert.ok(!md.includes("Locations"), "absent company facts are omitted");
});

test("copy: every locale merges over English and fills placeholders", () => {
  for (const locale of ["en", "es", "fr", "de", "ar", "hi", "zh", "gu"]) {
    const copy = getViewsCopy(locale);
    assert.equal(copy.xray.sections.length, 8, locale);
    assert.equal(copy.xray.levels.length, 7, locale);
    assert.equal(Object.keys(copy.brief.capabilities).length, 8, locale);
    assert.ok(copy.graph.modes.physical && copy.impact.hours && copy.sim.stepKinds.record, locale);
  }
  assert.equal(getViewsCopy("xx"), getViewsCopy("en"));
  assert.equal(getViewsCopy("toString"), getViewsCopy("en"));
  assert.equal(fill(en.sim.stepOf, { n: 3, total: 8 }), "Step 3 of 8");
  assert.equal(format.fileSlug("Acme — Stores X-Ray", "x"), "acme-stores-x-ray");
  assert.equal(format.fileSlug("业务透视", "business-x-ray"), "business-x-ray");
});
