/**
 * Offline tests for the Operator's artifact-view logic: graph layering and
 * edge routing, the list-view reading order, the brief / X-Ray text formats
 * with their WhatsApp and mailto caps, the impact card's number formats and
 * localized assumptions, and the grouping of (possibly malformed) artifacts.
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
const { getViewsCopy, fill, splitAround } = await import("../src/components/operator/views/views-copy.ts");
const impactFormat = await import("../src/components/operator/views/impact-format.ts");
const { groupArtifacts, itemKey } = await import("../src/components/operator/views/group-artifacts.ts");
const { computeImpact } = await import("../src/lib/operator/impact.ts");

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

test("copy: the edge words follow each language's word order", () => {
  for (const locale of ["en", "es", "fr", "de", "ar", "hi", "zh", "gu"]) {
    const { edgeTo, between } = getViewsCopy(locale).graph;
    assert.ok(edgeTo.includes("{to}"), locale);
    assert.ok(between.indexOf("{from}") >= 0 && between.indexOf("{from}") < between.indexOf("{to}"), locale);
  }
  // Hindi and Gujarati postpositions follow the noun: "Tally की ओर", never "की ओर Tally".
  assert.deepEqual(splitAround(getViewsCopy("hi").graph.edgeTo, "to"), ["", " की ओर"]);
  assert.deepEqual(splitAround(getViewsCopy("gu").graph.edgeTo, "to"), ["", " તરફ"]);
  assert.deepEqual(splitAround(en.graph.edgeTo, "to"), ["to ", ""]);
  assert.equal(fill(getViewsCopy("hi").graph.between, { from: "बिक्री", to: "Tally" }), "बिक्री से Tally तक");
  assert.deepEqual(splitAround("towards", "to"), ["towards ", ""], "a template without the placeholder reads as a prefix");
});

test("copy: hints name the controls by their labels, and Spanish addresses Savin as ustedes", () => {
  const de = getViewsCopy("de").sim;
  assert.ok(de.manualHint.includes(de.previous) && de.manualHint.includes(de.next), "voice control: say what you see");
  const es = getViewsCopy("es").brief.greeting;
  assert.ok(!/\b(os|vosotros|vuestro)\b/i.test(es), es);
});

/* ------------------------------------------------------------------------ */
/*                               Impact card                                */
/* ------------------------------------------------------------------------ */

// The lead's seeded estimate: rows 82.5 + 44, total 126.5.
const impactInput = {
  title: "Daily order-change reconciliation",
  activities: [
    { label: "Reconcile order sheet with Tally", people: 5, minutesPerOccurrence: 45, occurrences: 1, per: "day", assumed: [], source: "visitor" },
    { label: "Chase production on WhatsApp", people: 2, minutesPerOccurrence: 10, occurrences: 6, per: "day", assumed: [], source: "visitor" },
  ],
  workingDaysPerMonth: { value: 22, source: "assumption" },
  reductionPercent: { value: 60, source: "assumption" },
  hourlyCost: { amount: 450, currency: "INR", source: "assumption" },
};
const ARABIC_INDIC = /[٠-٩۰-۹]/;

test("impact: hours show at the server's precision, so the total reads as the sum of its rows", () => {
  const impact = computeImpact(impactInput);
  assert.deepEqual(impact.rows.map((row) => row.hoursPerMonth), [82.5, 44]);
  const f = impactFormat.impactFormat("en", "in");
  assert.deepEqual(impact.rows.map((row) => f.hours(row.hoursPerMonth)), ["82.5", "44"]);
  assert.equal(f.hours(impact.totalHoursPerMonth), "126.5", "the footer and the big numeral, not 127");
  assert.equal(f.hours(impact.totalHoursPerYear), "1,518");
  assert.equal(impactFormat.rowsDisagreeWithTotal(impact), false);
  // Rows and total are rounded separately upstream; the card flags it rather than recomputing.
  assert.equal(impactFormat.rowsDisagreeWithTotal({ rows: [{ label: "a", hoursPerMonth: 10 }, { label: "b", hoursPerMonth: 10 }], totalHoursPerMonth: 20.1 }), true);
  assert.equal(impactFormat.rowsDisagreeWithTotal({ rows: [{ label: "a", hoursPerMonth: 0.1 }, { label: "b", hoursPerMonth: 0.2 }], totalHoursPerMonth: 0.3 }), false);
});

test("impact: digits are Latin in every Arabic market; en-IN keeps lakh grouping", () => {
  for (const country of ["sa", "qa", "kw", "bh", "om", "jo", "eg", "iq", "ae"]) {
    const f = impactFormat.impactFormat("ar", country);
    for (const text of [f.hours(126.5), f.input(45), f.money(56925, "SAR"), f.rate(12.5, "SAR")]) {
      assert.ok(!ARABIC_INDIC.test(text), `ar-${country}: ${text}`);
    }
    assert.equal(f.hours(126.5), "126.5", country);
  }
  assert.equal(impactFormat.impactFormat("en", "in").input(123456), "1,23,456");
  assert.equal(impactFormat.impactFormat("en", "in").money(56925, "INR"), "₹56,925");
});

test("impact: inputs echo at the precision the server used", () => {
  const f = impactFormat.impactFormat("en", "ie");
  assert.equal(f.rate(22.5, "EUR"), "€22.50", "not €23");
  assert.equal(f.rate(450, "EUR"), "€450");
  assert.equal(f.money(1234.4, "EUR"), "€1,234");
  assert.equal(f.input(0.04), "0.04", "not 0");
  assert.equal(f.input(2.5), "2.5");
  assert.equal(f.rate(22.5, "NOT-A-CODE"), "NOT-A-CODE 22.5", "an unknown code still shows the amount");
  assert.match(impactFormat.impactFormat("fr", "fr").rate(22.5, "EUR"), /^22,50\s€$/);
});

test("impact: assumptions are listed in the visitor's language, from the same flags as the server's", () => {
  const impact = computeImpact(impactInput);
  assert.equal(impact.assumptions.length, 3);
  const hi = getViewsCopy("hi");
  const lines = impactFormat.assumptionLines(impact, hi.impact, impactFormat.impactFormat("hi", "in"), "hi");
  assert.deepEqual(lines, ["प्रति माह 22 कार्यदिवस", "प्रस्तावित बदलाव से इस समय का 60% कम होगा", "स्टाफ़ की लागत ₹450 प्रति घंटा"]);

  // Only the numbers the visitor did not state are listed, one by one.
  const assumedActivity = {
    ...impactInput,
    activities: [
      { ...impactInput.activities[0], assumed: ["minutesPerOccurrence"], source: "assumption" },
      { ...impactInput.activities[1], people: 1, assumed: ["people", "occurrences"], source: "assumption" },
    ],
  };
  const withActivities = computeImpact(assumedActivity);
  const enLines = impactFormat.assumptionLines(withActivities, en.impact, impactFormat.impactFormat("en", "in"), "en");
  assert.equal(enLines.length, withActivities.assumptions.length);
  assert.equal(enLines[0], "⁦Reconcile order sheet with Tally⁩: 45 min each time", "the label is LTR-isolated; the visitor's 5 people are not called assumed");
  assert.equal(enLines[1], "⁦Chase production on WhatsApp⁩: 1 person, 6× / day");
  const ar = getViewsCopy("ar");
  const arLines = impactFormat.assumptionLines(withActivities, ar.impact, impactFormat.impactFormat("ar", "sa"), "ar");
  assert.ok(arLines[0].includes("45 دقيقة في كل مرة") && arLines[1].includes("شخص واحد، "), arLines.join(" | "));
  assert.ok(arLines.every((line) => !ARABIC_INDIC.test(line)));
  assert.equal(impactFormat.assumptionLines(withActivities, getViewsCopy("zh").impact, impactFormat.impactFormat("zh", "cn"), "zh")[1], "⁦Chase production on WhatsApp⁩：1 人，每天 6 次");

  // A transcript stored before `assumed` existed: `source` alone marks all three numbers.
  const legacy = { ...impactInput.activities[0], source: "assumption" };
  delete legacy.assumed;
  assert.deepEqual([...impactFormat.assumedFields(legacy)], ["people", "minutesPerOccurrence", "occurrences"]);
  assert.deepEqual([...impactFormat.assumedFields({ ...legacy, source: "visitor" })], []);
  assert.deepEqual([...impactFormat.assumedFields({ assumed: ["occurrences", "bogus", "people"], source: "assumption" })], ["people", "occurrences"]);
  const legacyImpact = { input: { ...impactInput, activities: [legacy] }, assumptions: ["old line", ...impact.assumptions] };
  assert.equal(impactFormat.assumptionLines(legacyImpact, en.impact, impactFormat.impactFormat("en", "in"), "en")[0], "⁦Reconcile order sheet with Tally⁩: 5 people, 45 min each time, 1× / day");

  // A kind of assumption this client cannot phrase: fall back to the server's list rather than hide one.
  const unknown = { ...impact, assumptions: [...impact.assumptions, "4.33 weeks per month (assumed)"] };
  assert.equal(impactFormat.assumptionLines(unknown, en.impact, impactFormat.impactFormat("en", "in"), "en"), null);
});

test("impact: every locale has its own people form for every plural category it uses", () => {
  for (const locale of ["es", "fr", "de", "ar", "hi", "zh", "gu"]) {
    const templates = getViewsCopy(locale).impact.peopleCount;
    for (const category of new Intl.PluralRules(locale).resolvedOptions().pluralCategories) {
      const template = templates[category] ?? templates.other;
      assert.notEqual(template, en.impact.peopleCount[category] ?? en.impact.peopleCount.other, `${locale}/${category} falls back to English`);
    }
  }
  const f = impactFormat.impactFormat("en", "");
  assert.equal(impactFormat.peopleText(1, en.impact.peopleCount, "en", f.input), "1 person");
  assert.equal(impactFormat.peopleText(1.5, en.impact.peopleCount, "en", f.input), "1.5 people");
  assert.equal(impactFormat.peopleText(2, getViewsCopy("ar").impact.peopleCount, "ar", f.input), "شخصان");
});

/* ------------------------------------------------------------------------ */
/*                              Artifact grouping                           */
/* ------------------------------------------------------------------------ */

const mapArtifact = (id, view) => ({ type: "graph", id, graph: { title: id, view, nodes: [], edges: [] } });

test("groupArtifacts pairs a current map with a proposed one, and drops sources", () => {
  const items = groupArtifacts([mapArtifact("p", "proposed"), { type: "sources", id: "s", sources: [] }, mapArtifact("c", "current"), { type: "impact", id: "i", impact: {} }]);
  assert.equal(items.length, 2);
  assert.equal(items[0].kind, "pair");
  assert.equal(items[0].today.id, "c", "Today is the current map whatever the order");
  assert.equal(items[0].connected.id, "p");
  assert.deepEqual(items.map(itemKey), ["c+p", "i"]);
  // Two maps of the same kind stay separate.
  assert.deepEqual(groupArtifacts([mapArtifact("a", "current"), mapArtifact("b", "current")]).map((item) => item.kind), ["single", "single"]);
});

test("groupArtifacts never throws on a malformed restored transcript", () => {
  // The shape that crashed the page: a graph artifact without its graph, next to a valid one.
  const restored = [{ type: "graph", id: "old1", map: {} }, mapArtifact("old2", "proposed")];
  assert.deepEqual(groupArtifacts(restored).map((item) => item.kind), ["single", "single"]);
  assert.deepEqual(groupArtifacts([{ type: "graph", id: "x", graph: null }, { type: "graph", id: "y", graph: "current" }]).map(itemKey), ["x", "y"]);
  assert.deepEqual(groupArtifacts([null, undefined, mapArtifact("z", "current")]).map(itemKey), ["z"]);
  assert.deepEqual(groupArtifacts([]), []);
});
