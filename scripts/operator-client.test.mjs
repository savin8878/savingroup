/**
 * Offline tests for the Operator panel's pure client modules: the NDJSON
 * stream reader, the Markdown subset parser and the transcript → request
 * builder, plus the client/server seams: every request the panel can build
 * passes the route's parseRequest, every artifact the tools emit survives the
 * server's re-validation of client-held history, and every event the route
 * emits comes out of the NDJSON reader intact.
 *
 *   node --test --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/operator-client.test.mjs
 *
 * Loads the real modules from src/ through Node's TypeScript type stripping
 * (Node >= 22.18). Neither module touches React, the DOM or the network, so
 * nothing is mocked.
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

const { createNdjsonParser, toOperatorEvent } = await import("../src/components/operator/ndjson.ts");
const { parseMarkdown, parseInline, safeHref, markdownToPlainText, inlineText } = await import("../src/components/operator/markdown-ast.ts");
const { textDir, scriptLang, localeDir } = await import("../src/components/operator/text-dir.ts");
const transcript = await import("../src/components/operator/transcript.ts");
// Server modules, for the seam tests only: the panel never imports these.
const tools = await import("../src/lib/operator/tools.ts");
const validate = await import("../src/lib/operator/validate.ts");
const history = await import("../src/lib/operator/history.ts");
const { OPERATOR_LIMITS } = await import("../src/lib/operator/protocol.ts");

/** Run `chunks` through a fresh parser; returns the events and the skip count. */
function feed(chunks, { end = true } = {}) {
  const events = [];
  const parser = createNdjsonParser((event) => events.push(event));
  for (const chunk of chunks) parser.push(chunk);
  if (end) parser.end();
  return { events, skipped: parser.skipped, parser };
}

/** Every link href anywhere in a block list. */
function hrefs(blocks) {
  const found = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.type === "link") found.push(node.href);
      if (node.children) walk(node.children);
    }
  };
  for (const block of blocks) {
    if (block.type === "list") block.items.forEach(walk);
    else if (block.children) walk(block.children);
  }
  return found;
}

/* -------------------------------------------------------------------------- */
/*                                   NDJSON                                   */
/* -------------------------------------------------------------------------- */

test("ndjson: a line split across chunks is emitted once, whole", () => {
  const line = JSON.stringify({ type: "text", delta: "Hello, world" });
  const { events, skipped } = feed([line.slice(0, 7), line.slice(7, 20), line.slice(20) + "\n"]);
  assert.deepEqual(events, [{ type: "text", delta: "Hello, world" }]);
  assert.equal(skipped, 0);
});

test("ndjson: several lines in one chunk, CRLF endings and blank lines", () => {
  const { events, skipped } = feed([
    '{"type":"status","status":"searching"}\r\n\r\n{"type":"text","delta":"a"}\r\n',
    '\n{"type":"text","delta":"b"}\r',
    '\n{"type":"done"}\r\n',
  ]);
  assert.deepEqual(events, [
    { type: "status", status: "searching" },
    { type: "text", delta: "a" },
    { type: "text", delta: "b" },
    { type: "done" },
  ]);
  assert.equal(skipped, 0, "blank lines are not counted as malformed");
});

test("ndjson: malformed JSON is skipped and counted, parsing continues", () => {
  const { events, skipped } = feed(['{"type":"text","delta":"ok"}\n{"type":"text",\nnot json at all\n{"type":"done"}\n']);
  assert.deepEqual(events, [{ type: "text", delta: "ok" }, { type: "done" }]);
  assert.equal(skipped, 2);
});

test("ndjson: unknown or malformed event types are skipped", () => {
  const { events, skipped } = feed([
    [
      JSON.stringify({ type: "telemetry", value: 1 }),
      JSON.stringify({ delta: "no type" }),
      JSON.stringify(["text", "array"]),
      JSON.stringify("just a string"),
      JSON.stringify({ type: "text", delta: 42 }),
      JSON.stringify({ type: "artifact", artifact: { type: "chart", id: "x" } }),
      JSON.stringify({ type: "artifact", artifact: { type: "graph" } }),
      JSON.stringify({ type: "artifact", artifact: { type: "graph", id: "toolu_1", graph: { nodes: [] } } }),
    ].join("\n") + "\n",
  ]);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "artifact");
  assert.equal(events[0].artifact.id, "toolu_1");
  assert.equal(skipped, 7);
});

test("ndjson: errors are never swallowed; unknown codes and statuses are normalised", () => {
  assert.deepEqual(toOperatorEvent({ type: "error", code: "rate_limited" }), { type: "error", code: "rate_limited" });
  assert.deepEqual(toOperatorEvent({ type: "error", code: "mystery" }), { type: "error", code: "internal" });
  assert.deepEqual(toOperatorEvent({ type: "error" }), { type: "error", code: "internal" });
  assert.deepEqual(toOperatorEvent({ type: "status", status: "pondering" }), { type: "status", status: "thinking" });
  assert.equal(toOperatorEvent({ type: "status" }), null);
});

test("ndjson: end() flushes a final line without a trailing newline", () => {
  const withoutEnd = feed(['{"type":"text","delta":"x"}\n{"type":"done"}'], { end: false });
  assert.deepEqual(withoutEnd.events, [{ type: "text", delta: "x" }], "an unterminated line waits for more input");
  withoutEnd.parser.end();
  assert.deepEqual(withoutEnd.events.at(-1), { type: "done" });

  const { events } = feed(['{"type":"done"}\r']);
  assert.deepEqual(events, [{ type: "done" }], "a trailing \\r is stripped on flush too");

  const after = feed(['{"type":"done"}']);
  after.parser.push('\n{"type":"text","delta":"late"}\n');
  after.parser.end();
  assert.deepEqual(after.events, [{ type: "done" }], "input after end() is ignored");
});

test("ndjson: multi-byte text split mid-character survives a streaming TextDecoder", () => {
  const bytes = new TextEncoder().encode(JSON.stringify({ type: "text", delta: "नमस्ते · 你好 · مرحبا" }) + "\n");
  const decoder = new TextDecoder();
  const events = [];
  const parser = createNdjsonParser((event) => events.push(event));
  for (let i = 0; i < bytes.length; i += 5) parser.push(decoder.decode(bytes.subarray(i, i + 5), { stream: true }));
  parser.push(decoder.decode());
  parser.end();
  assert.deepEqual(events, [{ type: "text", delta: "नमस्ते · 你好 · مرحبا" }]);
});

test("ndjson: an oversized line is dropped without losing the next one", () => {
  const huge = '{"type":"text","delta":"' + "x".repeat(1_100_000);
  const { events, skipped } = feed([huge, "still the same line", '"}\n{"type":"done"}\n']);
  assert.deepEqual(events, [{ type: "done" }]);
  assert.equal(skipped, 1);
});

/* -------------------------------------------------------------------------- */
/*                                  Markdown                                  */
/* -------------------------------------------------------------------------- */

test("markdown: headings fold to four levels and need a space", () => {
  assert.deepEqual(parseMarkdown("# Title"), [{ type: "heading", level: 1, children: [{ type: "text", text: "Title" }] }]);
  assert.deepEqual(parseMarkdown("### Three ###"), [{ type: "heading", level: 3, children: [{ type: "text", text: "Three" }] }]);
  assert.equal(parseMarkdown("###### Six")[0].level, 4);
  assert.deepEqual(parseMarkdown("#hashtag"), [{ type: "paragraph", children: [{ type: "text", text: "#hashtag" }] }]);
  assert.deepEqual(parseMarkdown("#"), [], "an empty heading (mid-stream) renders nothing");
});

test("markdown: strong, em and inline code", () => {
  assert.deepEqual(parseInline("**b** and *e* and _u_ and `c`"), [
    { type: "strong", children: [{ type: "text", text: "b" }] },
    { type: "text", text: " and " },
    { type: "em", children: [{ type: "text", text: "e" }] },
    { type: "text", text: " and " },
    { type: "em", children: [{ type: "text", text: "u" }] },
    { type: "text", text: " and " },
    { type: "code", text: "c" },
  ]);
  assert.deepEqual(parseInline("***both***"), [{ type: "strong", children: [{ type: "em", children: [{ type: "text", text: "both" }] }] }]);
  assert.deepEqual(parseInline("*a **b** c*"), [
    { type: "em", children: [{ type: "text", text: "a " }, { type: "strong", children: [{ type: "text", text: "b" }] }, { type: "text", text: " c" }] },
  ]);
  assert.deepEqual(parseInline("order_id and file_name_here"), [{ type: "text", text: "order_id and file_name_here" }], "snake_case stays literal");
  assert.deepEqual(parseInline("2 * 3 * 4"), [{ type: "text", text: "2 * 3 * 4" }]);
  assert.deepEqual(parseInline("`**not bold**`"), [{ type: "code", text: "**not bold**" }]);
  assert.deepEqual(parseInline("\\*literal\\*"), [{ type: "text", text: "*literal*" }]);
});

test("markdown: unclosed delimiters render literally (streaming)", () => {
  assert.deepEqual(parseMarkdown("This is **bold"), [{ type: "paragraph", children: [{ type: "text", text: "This is **bold" }] }]);
  assert.deepEqual(parseInline("run `npm i"), [{ type: "text", text: "run `npm i" }]);
  assert.deepEqual(parseInline("*half"), [{ type: "text", text: "*half" }]);
  assert.deepEqual(parseInline("[Pricing](/in/en/pri"), [{ type: "text", text: "[Pricing](/in/en/pri" }]);
  const started = performance.now();
  for (const long of ["**a ".repeat(3000), "*a ".repeat(4000), "_a _".repeat(3000), "[a](b ".repeat(2000)]) {
    assert.deepEqual(parseInline(long), [{ type: "text", text: long }], `${long.slice(0, 8)}… stays literal`);
  }
  assert.ok(performance.now() - started < 500, "unbalanced input does not go quadratic");
});

test("markdown: unordered and ordered lists", () => {
  assert.deepEqual(parseMarkdown("- one\n- **two**\n* three"), [
    {
      type: "list",
      ordered: false,
      start: 1,
      items: [[{ type: "text", text: "one" }], [{ type: "strong", children: [{ type: "text", text: "two" }] }], [{ type: "text", text: "three" }]],
    },
  ]);
  const [intro, list, outro] = parseMarkdown("Steps:\n3. Map it\n4) Connect it\n\n5. Measure it\n\nDone.");
  assert.deepEqual(intro, { type: "paragraph", children: [{ type: "text", text: "Steps:" }] });
  assert.equal(list.type, "list");
  assert.equal(list.ordered, true);
  assert.equal(list.start, 3);
  assert.deepEqual(list.items.map((item) => item[0].text), ["Map it", "Connect it", "Measure it"]);
  assert.deepEqual(outro, { type: "paragraph", children: [{ type: "text", text: "Done." }] });

  const [nested] = parseMarkdown("1. Order\n   - ERP\n   - WhatsApp\n2. Invoice");
  assert.equal(nested.items.length, 2, "nested items flatten into their parent");
  assert.deepEqual(nested.items[0], [
    { type: "text", text: "Order" },
    { type: "br" },
    { type: "text", text: "– ERP" },
    { type: "br" },
    { type: "text", text: "– WhatsApp" },
  ]);

  const mixed = parseMarkdown("- a\n1. b");
  assert.deepEqual(mixed.map((b) => [b.type, b.ordered]), [["list", false], ["list", true]]);
  assert.equal(parseMarkdown("* * *").length, 0, "a thematic break is not a bullet");
});

/** Savin's published channels (en.json contact.details), as OperatorPanel derives them. */
const OWN = { whatsappDigits: "918305838352", email: "savingroup@gmail.com" };

test("markdown: allowed links are kept; everything else becomes text", () => {
  const kept = parseMarkdown(
    "[Plans](/in/en/pricing#plans) [Site](https://www.savingroup.in/in/en/about) [Chat](https://wa.me/918305838352?text=Hi) [Mail](mailto:savingroup@gmail.com)",
    OWN,
  );
  assert.deepEqual(hrefs(kept), [
    "/in/en/pricing#plans",
    "https://www.savingroup.in/in/en/about",
    "https://wa.me/918305838352?text=Hi",
    "mailto:savingroup@gmail.com",
  ]);

  for (const target of [
    "javascript:alert(1)",
    "JavaScript:alert(document.cookie)",
    "//evil.example/steal",
    "/\\evil.example",
    "https://evil.example/",
    "https://www.savingroup.in.evil.example/",
    "https://www.savingroup.in@evil.example/",
    "http://www.savingroup.in/in/en",
    "data:text/html,<script>alert(1)</script>",
  ]) {
    const blocks = parseMarkdown(`Go [click here](${target}) now`, OWN);
    assert.deepEqual(hrefs(blocks), [], target);
    assert.deepEqual(blocks, [{ type: "paragraph", children: [{ type: "text", text: "Go click here now" }] }], target);
  }

  assert.equal(safeHref("/in/en/contact"), "/in/en/contact");
  assert.equal(safeHref("//evil"), null);
  assert.equal(safeHref("/\t/evil"), null);
  assert.equal(safeHref("mailto:", OWN), null);
  assert.equal(safeHref("https://www.savingroup.in"), "https://www.savingroup.in");
});

test("markdown: WhatsApp and email links reach only Savin's published channels", () => {
  // A pasted document (or a digit slip) cannot put a look-alike "contact Savin" link in a reply.
  for (const source of [
    "[+91 83058 38352](https://wa.me/447700900123?text=hi)",
    "[https://www.savingroup.in/contact](https://wa.me/15550001111)",
    "[Chat](https://wa.me/918305838352&phone=447700900123)",
    "[Chat](https://wa.me/918305838352?text=hi&phone=447700900123)",
    "[Chat](https://wa.me/91830583835)",
    "[savingroup@gmail.com](mailto:attacker@evil.test?bcc=x@evil.test&subject=Brief)",
    "[Mail us](mailto:savingroup@gmail.com?bcc=x@evil.test)",
    "[Mail us](mailto:savingroup@gmail.com,x@evil.test)",
    "[Mail us](mailto:savingroup%40gmail.com)",
  ]) {
    assert.deepEqual(hrefs(parseMarkdown(source, OWN)), [], source);
  }
  assert.deepEqual(
    parseMarkdown("Send it to [+91 83058 38352](https://wa.me/447700900123) now", OWN),
    [{ type: "paragraph", children: [{ type: "text", text: "Send it to +91 83058 38352 now" }] }],
    "the label stays, as plain text",
  );

  // Fail closed: without the published channels, no wa.me or mailto link at all.
  assert.deepEqual(hrefs(parseMarkdown("[Chat](https://wa.me/918305838352) [Mail](mailto:savingroup@gmail.com) savingroup@gmail.com https://wa.me/918305838352")), []);
  assert.equal(safeHref("https://wa.me/918305838352"), null);
  assert.equal(safeHref("mailto:savingroup@gmail.com"), null);
  assert.equal(safeHref("https://wa.me/918305838352", { whatsappDigits: "", email: "" }), null);
  assert.equal(safeHref("mailto:SaVinGroup@Gmail.com", OWN), "mailto:SaVinGroup@Gmail.com", "email case does not matter");
  assert.equal(safeHref("https://wa.me/918305838352/?text=Hello%20Savin", OWN), "https://wa.me/918305838352/?text=Hello%20Savin");

  // A label that reads as a destination must name the href's own target.
  assert.deepEqual(hrefs(parseMarkdown("[+91 83058 38352](https://wa.me/918305838352)", OWN)), ["https://wa.me/918305838352"]);
  assert.deepEqual(hrefs(parseMarkdown("[+44 7700 900123](https://wa.me/918305838352)", OWN)), []);
  assert.deepEqual(hrefs(parseMarkdown("[SaVinGroup@gmail.com](mailto:savingroup@gmail.com)", OWN)), ["mailto:savingroup@gmail.com"]);
  assert.deepEqual(hrefs(parseMarkdown("[help@savin.example](mailto:savingroup@gmail.com)", OWN)), []);
  assert.deepEqual(hrefs(parseMarkdown("[savingroup@gmail.com](/in/en/contact)", OWN)), []);
  assert.deepEqual(hrefs(parseMarkdown("[https://www.savingroup.in/in/en/pricing](/in/en/pricing)", OWN)), ["/in/en/pricing"]);
  assert.deepEqual(hrefs(parseMarkdown("[https://www.savingroup.in/in/en/pricing](/in/en/privacy)", OWN)), []);
  assert.deepEqual(hrefs(parseMarkdown("[Talk to us on WhatsApp](https://wa.me/918305838352)", OWN)), ["https://wa.me/918305838352"], "free text labels are fine");
});

test("markdown: bare allowed URLs and emails are linked; others stay text", () => {
  const blocks = parseMarkdown("WhatsApp https://wa.me/918305838352. Or email savingroup@gmail.com, or see https://evil.example/x", OWN);
  assert.deepEqual(hrefs(blocks), ["https://wa.me/918305838352", "mailto:savingroup@gmail.com"]);
  const foreign = "write to bob@evil.test or https://wa.me/447700900123 now";
  assert.deepEqual(parseMarkdown(foreign, OWN), [{ type: "paragraph", children: [{ type: "text", text: foreign }] }], "a foreign address or number stays text");
  assert.match(markdownToPlainText("See [pricing](javascript:x) and https://evil.example"), /^See pricing and https:\/\/evil\.example$/);
});

test("markdown: code fences, quotes, breaks and tables-as-text", () => {
  assert.deepEqual(parseMarkdown("```ts\nconst a = 1;\n**not bold**\n```\nafter"), [
    { type: "code", text: "const a = 1;\n**not bold**", lang: "ts" },
    { type: "paragraph", children: [{ type: "text", text: "after" }] },
  ]);
  assert.deepEqual(parseMarkdown("~~~\nopen fence while streaming"), [{ type: "code", text: "open fence while streaming" }]);
  assert.deepEqual(parseMarkdown("```inline```"), [{ type: "paragraph", children: [{ type: "code", text: "inline" }] }]);
  assert.deepEqual(parseMarkdown("> quoted\n> *line*"), [
    { type: "quote", children: [{ type: "text", text: "quoted" }, { type: "br" }, { type: "em", children: [{ type: "text", text: "line" }] }] },
  ]);
  assert.deepEqual(parseMarkdown("line one\nline two"), [
    { type: "paragraph", children: [{ type: "text", text: "line one" }, { type: "br" }, { type: "text", text: "line two" }] },
  ]);
  const table = parseMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
  assert.equal(table.length, 1);
  assert.equal(table[0].type, "paragraph");
  assert.equal(table[0].children[0].text, "| a | b |");
  assert.deepEqual(parseMarkdown("<b>html</b> ![logo](/x.png)"), [{ type: "paragraph", children: [{ type: "text", text: "<b>html</b> logo" }] }]);
});

/* -------------------------------------------------------------------------- */
/*                            Direction and language                          */
/* -------------------------------------------------------------------------- */

test("text-dir: direction follows the letters, not the first strong character", () => {
  // Arabic that opens with a Latin product name is still Arabic (dir="auto" made these LTR).
  assert.equal(textDir("Excel ليس المشكلة هنا؛ المشكلة أن الطلب نفسه يُكتب مرتين.", "ltr"), "rtl");
  assert.equal(textDir("Tally: يحتاج إلى واجهة API مفعّلة.", "ltr"), "rtl");
  assert.equal(textDir("Tally و Excel لا يتواصلان، ونعيد إدخال كل طلب مرتين.", "ltr"), "rtl");
  // English on an Arabic page stays LTR, also with an Arabic word in it.
  assert.equal(textDir("When an order changes after production starts, sales calls.", "rtl"), "ltr");
  assert.equal(textDir("Our Dubai team calls it الطلب", "rtl"), "ltr");
  assert.equal(textDir("नमस्ते, हम Tally इस्तेमाल करते हैं", "rtl"), "ltr");
  // Links and code do not vote.
  assert.equal(textDir("See https://www.savingroup.in/ae/ar/pricing and `ERP_ORDER_ID` — ما رأيك؟", "ltr"), "rtl");
  // No letters: the page decides.
  assert.equal(textDir("", "rtl"), "rtl");
  assert.equal(textDir("12 345 🙂 ?", "rtl"), "rtl");
  assert.equal(textDir("12 345", "ltr"), "ltr");
  assert.equal(localeDir("ar"), "rtl");
  assert.equal(localeDir("en"), "ltr");
  assert.equal(localeDir("xx"), "ltr");

  // As <Markdown> judges a block: from its inline text with code left out.
  const [block] = parseMarkdown("`Excel` ليس المشكلة");
  assert.equal(inlineText(block.children, { code: false }).trim(), "ليس المشكلة");
  assert.equal(inlineText(block.children), "Excel ليس المشكلة");
  const [list] = parseMarkdown("- Tally: يحتاج إلى واجهة API مفعّلة.\n- مجموعة واتساب: لا يوجد سجل تدقيق.\n- Excel stays for reports");
  assert.deepEqual(list.items.map((item) => textDir(inlineText(item, { code: false }), "rtl")), ["rtl", "rtl", "ltr"], "each item on its own");
});

test("text-dir: lang is set only when the text's script is not the page's", () => {
  assert.equal(scriptLang("हम ऑर्डर Excel में ट्रैक करते हैं", "en"), "hi");
  assert.equal(scriptLang("हम ऑर्डर Excel में ट्रैक करते हैं", "hi"), undefined);
  assert.equal(scriptLang("અમે ઓર્ડર Excel માં રાખીએ છીએ", "en"), "gu");
  assert.equal(scriptLang("Excel ليس المشكلة", "en"), "ar");
  assert.equal(scriptLang("Excel ليس المشكلة", "ar"), undefined);
  assert.equal(scriptLang("我们用 Excel 跟踪订单", "en"), "zh");
  // Latin on a non-Latin page reads as English; on a Latin page it inherits (Latin alone cannot tell en from es).
  assert.equal(scriptLang("We track orders in Excel", "hi"), "en");
  assert.equal(scriptLang("We use 订单", "zh"), "en");
  assert.equal(scriptLang("We track orders in Excel", "es"), undefined);
  assert.equal(scriptLang("123 🙂", "hi"), undefined);
});

/* -------------------------------------------------------------------------- */
/*                            Client ↔ server seams                           */
/* -------------------------------------------------------------------------- */

const toolCtx = (id, country = "in", locale = "en") => ({ toolUseId: id, country, locale });

/** One artifact of every kind, produced the way the route produces them. */
function toolArtifacts(prefix = "toolu_seam", country = "in", locale = "en") {
  const calls = [
    ["search_savin_knowledge", { query: "discovery sprint price" }],
    ["build_workflow_graph", {
      title: "Order to dispatch — today",
      view: "current",
      summary: "Orders are re-typed twice before dispatch.",
      nodes: [
        { id: "order", label: "WhatsApp order", kind: "messaging" },
        { id: "excel", label: "Order sheet", kind: "spreadsheet", friction: "Re-typed by hand", detail: "One sheet per month" },
        { id: "dispatch", label: "Dispatch", kind: "team" },
      ],
      edges: [
        { from: "order", to: "excel", mode: "manual", label: "copy/paste", friction: "Typos in quantities" },
        { from: "excel", to: "dispatch", mode: "manual" },
      ],
    }],
    ["build_workflow_graph", {
      title: "Order to dispatch — connected",
      view: "proposed",
      nodes: [
        { id: "order", label: "WhatsApp order", kind: "messaging" },
        { id: "intake", label: "Order intake", kind: "software" },
        { id: "dispatch", label: "Dispatch", kind: "team" },
      ],
      edges: [
        { from: "order", to: "intake", mode: "integration" },
        { from: "intake", to: "dispatch", mode: "automated" },
      ],
    }],
    ["simulate_workflow", {
      title: "Shortage to purchase order",
      scenario: "Order SO-1028 arrives and a component is short.",
      steps: [
        { label: "Order SO-1028 received", actor: "ERP", actor_kind: "system", kind: "event", sample: [{ key: "Order", value: "SO-1028" }] },
        { label: "Purchase request approved", actor: "Purchase manager", actor_kind: "person", kind: "approval" },
        { label: "Purchase order issued", actor: "ERP", actor_kind: "system", kind: "action", consequential: true, system: "Tally" },
      ],
      outcome: "Components ordered after approval.",
    }],
    ["calculate_operational_impact", {
      title: "Daily reconciliation",
      activities: [
        { label: "Reconcile stock", people: 5, minutes_per_occurrence: 45, occurrences: 1, per: "day", source: "visitor" },
        { label: "Chase approvals", people: 2, minutes_per_occurrence: 20, occurrences: 3, per: "week", source: "assumption" },
      ],
      reduction_percent: { value: 60, source: "assumption" },
      hourly_cost: { amount: 450, currency: "inr", source: "visitor" },
    }],
    ["prepare_business_xray", {
      title: "Business X-Ray — order handling",
      company: { industry: "Auto components", size: "40 people" },
      current_workflow: ["Order arrives on WhatsApp", "Re-typed into Excel", "Invoiced in Tally"],
      systems: [{ name: "Tally", role: "Accounting" }],
      handoffs: ["Sales to stores"],
      friction: [{ issue: "Re-typing", evidence: "stated" }, { issue: "Stock uncertainty", evidence: "inferred" }],
      automation_points: [{ point: "Order intake", level: 2, approach: "Sync WhatsApp orders into Tally" }],
      connected_architecture: "WhatsApp intake, an order system, Tally sync.\n\nFirst pass only.",
      verification_questions: ["Order volume per day?"],
      first_experiment: { name: "Intake pilot", scope: "One product line", success_measure: "No re-typing for two weeks" },
    }],
    ["prepare_audit_brief", {
      company: "Acme Components",
      contact: { name: "Asha", email: "asha@example.com", phone: "+91 98765 43210" },
      industry: "Auto components manufacturing",
      current_systems: ["Tally", "Excel", "WhatsApp"],
      current_workflow: "Orders arrive on WhatsApp and are re-typed into Excel and Tally.",
      primary_problem: "Duplicate data entry delays dispatch.",
      observed_friction: ["Re-typing", "Stock uncertainty"],
      desired_outcome: "Orders flow into one system.",
      potential_architecture: "First pass: WhatsApp intake into an order system synced with Tally.",
      unknowns: ["Order volume"],
      urgency: "Before the festive season",
      relevant_capabilities: ["erp", "integrations"],
      summary: "Manufacturer re-typing WhatsApp orders into Excel and Tally.",
    }],
  ];
  return calls.map(([name, input], i) => {
    const outcome = tools.runTool(name, input, toolCtx(`${prefix}_${i}`, country, locale));
    assert.equal(outcome.isError, false, `${name}: ${outcome.content}`);
    assert.ok(outcome.artifact, `${name} returns an artifact`);
    return outcome.artifact;
  });
}

/** A graph near every ceiling, to push requests over the byte limit. */
function bigGraph(id) {
  const nodes = Array.from({ length: 16 }, (_, i) => ({
    id: `n${i}`,
    label: `Step ${i} `.padEnd(58, "x"),
    kind: "action",
    detail: "d".repeat(159),
    friction: "f".repeat(159),
  }));
  const edges = Array.from({ length: 15 }, (_, i) => ({ from: `n${i}`, to: `n${i + 1}`, mode: "manual", label: "l".repeat(39), friction: "e".repeat(159) }));
  const outcome = tools.runTool("build_workflow_graph", { title: "Big map", view: "current", nodes, edges }, toolCtx(id));
  assert.equal(outcome.isError, false, outcome.content);
  return outcome.artifact;
}

let nextId = 0;
const userMsg = (text, pathname = "/in/en/pricing") => ({ id: `u${nextId++}`, role: "user", parts: [{ kind: "text", text }], page: { pathname } });
const assistantMsg = (text, artifacts = [], extra = {}) => ({
  id: `a${nextId++}`,
  role: "assistant",
  parts: [...(text ? [{ kind: "text", text }] : []), ...artifacts.map((artifact) => ({ kind: "artifact", artifact }))],
  ...extra,
});

/** Builds the body exactly as useOperatorChat sends it, and runs it through the route's parser. */
function roundTrip(messages, { locale = "en", country = "in" } = {}) {
  const request = transcript.buildRequest(messages, { locale, country, fallbackPathname: "/in/en" });
  const body = JSON.stringify(request);
  const parsed = history.parseRequest(JSON.parse(body));
  return { request, body, bytes: new TextEncoder().encode(body).length, parsed };
}

function assertAccepted(messages, label, options) {
  const result = roundTrip(messages, options);
  assert.ok(result.request.turns.length > 0, `${label}: at least one turn`);
  assert.equal(result.parsed.ok, true, `${label}: parseRequest rejected ${JSON.stringify(result.request.turns.map((t) => t.role))}`);
  assert.ok(result.bytes <= OPERATOR_LIMITS.maxBodyBytes, `${label}: ${result.bytes} bytes`);
  assert.equal(result.parsed.value.turns.length, result.request.turns.length, `${label}: no turn lost`);
  const sent = result.request.turns.flatMap((turn) => (turn.role === "assistant" ? turn.artifacts : []));
  const kept = result.parsed.value.turns.flatMap((turn) => (turn.role === "assistant" ? turn.artifacts : []));
  assert.equal(kept.length, sent.length, `${label}: the server dropped an artifact the tools produced`);
  return result;
}

test("seam: cleanUserText matches the server's control-character stripping", () => {
  for (const raw of ["  hello\r\nworld\t ", "\u0007\u0000 \u001f", "a\u007fb\rc", "é中文🙂\u000b", "x".repeat(5000)]) {
    const clean = transcript.cleanUserText(raw);
    assert.equal(validate.stripControlChars(clean), clean, JSON.stringify(raw));
    assert.equal(clean, transcript.clip(validate.stripControlChars(raw), OPERATOR_LIMITS.maxUserChars).trim());
    assert.ok(clean.length <= OPERATOR_LIMITS.maxUserChars);
  }
  assert.equal(transcript.cleanUserText("\u0007 \u0000"), "", "only control characters is blank, as on the server");
});

test("seam: every artifact the tools emit survives re-validation of client history unchanged", () => {
  for (const [country, locale] of [["in", "en"], ["ae", "ar"]]) {
    const artifacts = toolArtifacts("toolu_rt", country, locale);
    assert.deepEqual(new Set(artifacts.map((a) => a.type)), new Set(["sources", "graph", "simulation", "impact", "xray", "brief"]));
    for (const artifact of artifacts) {
      // As stored in sessionStorage and resent by the panel.
      const resent = JSON.parse(JSON.stringify(artifact));
      assert.deepEqual(validate.validateArtifact(resent, { country, locale }), artifact, `${artifact.type} (${country}/${locale})`);
    }
  }
});

test("seam: the panel's requests always pass parseRequest", () => {
  const artifacts = toolArtifacts();
  const [sources] = artifacts;

  assertAccepted([userMsg("We re-type WhatsApp orders into Tally.")], "first message");
  assertAccepted([userMsg("hi"), assistantMsg("Tell me more.", artifacts), userMsg("Sure")], "every artifact kind");
  assertAccepted([assistantMsg("orphan reply"), userMsg("hello")], "an assistant message cannot open the transcript");
  assertAccepted([userMsg("\u0007\u0000"), userMsg("real question")], "a control-only message is dropped, not sent blank");
  assertAccepted(
    [userMsg("a"), assistantMsg("", [], { stopped: true }), userMsg("b"), { id: "err", role: "assistant", parts: [] }, userMsg("c")],
    "empty stopped/error replies merge the user turns around them",
  );
  assertAccepted([userMsg("a"), assistantMsg("partial", [], { stopped: true }), userMsg("b")], "a stopped partial reply");
  assertAccepted([userMsg("a"), assistantMsg("", [sources]), userMsg("b")], "a reply with only sources");
  assertAccepted([userMsg("a"), assistantMsg("one"), assistantMsg("two", [sources]), userMsg("b")], "two assistant messages merge");
  assertAccepted([userMsg("a"), assistantMsg("reply"), userMsg("x".repeat(3999)), userMsg("y".repeat(3999))], "an over-long merge keeps the newer message");
  assertAccepted([userMsg("🙂".repeat(2500))], "a surrogate pair at the cap is not split");
  assertAccepted([userMsg("a"), assistantMsg("z".repeat(20_000)), userMsg("b")], "an over-long reply is clipped");
  assertAccepted(
    [userMsg("a"), assistantMsg("many", Array.from({ length: 12 }, (_, i) => ({ ...sources, id: `toolu_s${i}` })).concat(artifacts.slice(1))), userMsg("b")],
    "more than maxArtifactsPerTurn",
  );

  const long = [];
  for (let i = 0; i < 60; i++) long.push(userMsg(`question ${i}`), assistantMsg(`answer ${i}`));
  long.push(userMsg("last"));
  const capped = assertAccepted(long, "more than maxTurns");
  assert.ok(capped.request.turns.length <= OPERATOR_LIMITS.maxTurns);
  assert.equal(capped.request.turns.at(-1).text, "last");

  const heavy = [];
  for (let i = 0; i < 20; i++) {
    heavy.push(userMsg(`map ${i}`), assistantMsg("Here is the map.", Array.from({ length: 8 }, (_, j) => bigGraph(`toolu_big_${i}_${j}`))));
  }
  heavy.push(userMsg("and now?"));
  assert.ok(new TextEncoder().encode(JSON.stringify(transcript.buildTurns(heavy, "/"))).length > OPERATOR_LIMITS.maxBodyBytes, "fixture is over the cap");
  const fitted = assertAccepted(heavy, "over maxBodyBytes");
  assert.equal(fitted.request.turns.at(-1).text, "and now?");
  assert.ok(fitted.request.turns.at(-2).artifacts.length > 0, "the newest artifacts are the last to go");

  assert.deepEqual(roundTrip([userMsg(" \u0007 ")]).request.turns, [], "nothing usable: no turns (the hook skips the request)");
});

test("seam: randomised transcripts always build a request the server accepts", () => {
  const artifacts = toolArtifacts("toolu_rand");
  let seed = 20260929;
  const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = (list) => list[Math.floor(random() * list.length)];
  const texts = ["", "   ", "\u0007", "hello", "line\r\nbreak", "é中文🙂", "x".repeat(4200), "🙂".repeat(2100), "a\tb"];
  for (let run = 0; run < 400; run++) {
    const messages = [];
    const length = 1 + Math.floor(random() * 70);
    for (let i = 0; i < length; i++) {
      if (random() < 0.5) messages.push(userMsg(pick(texts), pick(["/in/en", "/ae/ar/industries/healthcare", "not-a-path", "/in/en/blogs/some-post"])));
      else {
        const count = random() < 0.3 ? Math.floor(random() * 11) : 0;
        messages.push(assistantMsg(pick(texts), Array.from({ length: count }, () => pick(artifacts)), random() < 0.2 ? { stopped: true } : {}));
      }
    }
    const result = roundTrip(messages, { locale: pick(["en", "ar", "xx"]), country: pick(["in", "ae", "zz"]) });
    const usable = messages.some((m) => m.role === "user" && transcript.cleanUserText(transcript.messageText(m)));
    if (!usable) {
      assert.deepEqual(result.request.turns, [], `run ${run}`);
      continue;
    }
    assert.equal(result.parsed.ok, true, `run ${run}: ${JSON.stringify(result.request.turns.map((t) => t.role))}`);
    assert.ok(result.bytes <= OPERATOR_LIMITS.maxBodyBytes, `run ${run}`);
  }
});

test("seam: every event the route emits comes out of the NDJSON reader intact", () => {
  const events = [
    { type: "status", status: "thinking" },
    ...Object.values(tools.TOOL_STATUS).map((status) => ({ type: "status", status })),
    { type: "text", delta: "Here is the map.\n\n" },
    { type: "text", delta: "नमस्ते · مرحبا · 你好 🙂" },
    ...toolArtifacts("toolu_wire").map((artifact) => ({ type: "artifact", artifact })),
    ...["refusal", "truncated", "upstream", "overloaded", "unavailable", "internal"].map((code) => ({ type: "error", code })),
    { type: "done" },
  ];
  // Exactly as route.ts writes them: one JSON object and "\n" per event.
  const bytes = new TextEncoder().encode(events.map((event) => JSON.stringify(event) + "\n").join(""));
  const decoder = new TextDecoder();
  const received = [];
  const parser = createNdjsonParser((event) => received.push(event));
  for (let i = 0; i < bytes.length; i += 97) parser.push(decoder.decode(bytes.subarray(i, i + 97), { stream: true }));
  parser.push(decoder.decode());
  parser.end();
  assert.equal(parser.skipped, 0);
  assert.deepEqual(received, events);
});

/* -------------------------------------------------------------------------- */
/*                              Stored transcript                             */
/* -------------------------------------------------------------------------- */

test("stored transcript: an exchange cut off by a reload comes back with Retry, not '(stopped)'", () => {
  const question = { id: "su", role: "user", parts: [{ kind: "text", text: "question" }], page: { pathname: "/in/en" } };
  const partial = { id: "sa", role: "assistant", parts: [{ kind: "text", text: "partial" }] };

  const stored = transcript.storedMessages([question, partial], true);
  assert.equal(stored.at(-1).interrupted, true);
  assert.equal(stored.at(-1).stopped, undefined, "the visitor stopped nothing");
  assert.equal(partial.interrupted, undefined, "the live message is not mutated");
  const idle = [question, partial];
  assert.equal(transcript.storedMessages(idle, false), idle, "a finished thread is stored as is");
  assert.deepEqual(transcript.storedMessages([question], true), [question], "nothing to mark before the first token");

  const restored = transcript.parseStoredTranscript(JSON.stringify({ v: 1, messages: stored }));
  assert.deepEqual(restored, stored);
  assert.equal(transcript.isUnfinished(restored), true, "mid-reply reload");
  assert.equal(transcript.isUnfinished([question]), true, "reload before the first token, or after an unstored error");
  assert.equal(transcript.isUnfinished([question, partial]), false);
  assert.equal(transcript.isUnfinished([question, { ...partial, stopped: true }]), false, "a reply the visitor stopped is finished");
  assert.equal(transcript.isUnfinished([]), false);
  // Retry drops the partial reply (back to the last user message); typing on instead still builds a valid request.
  assertAccepted(restored.slice(0, 1), "retry after an interrupted reply");
  assertAccepted([...restored, userMsg("follow-up")], "a new message after an interrupted reply");

  assert.equal(transcript.parseStoredTranscript(JSON.stringify({ v: 1, messages: [{ ...partial, interrupted: "yes" }] })), null);
  assert.equal(transcript.parseStoredTranscript(JSON.stringify({ v: 2, messages: [] })), null);
  assert.equal(transcript.parseStoredTranscript("{not json"), null);
  assert.equal(transcript.parseStoredTranscript(null), null);
});
