/**
 * Offline tests for the Savin Operator knowledge index.
 *
 *   node --test --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/operator-knowledge.test.mjs
 *
 * Loads src/lib/operator/knowledge.ts, and the real copy modules it indexes,
 * through Node's TypeScript type stripping (Node >= 22.18). The honesty checks
 * use their own patterns rather than the module's denylist, so a regression
 * in the module's filters cannot also hide itself from the test.
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

const knowledge = await import("../src/lib/operator/knowledge.ts");
const {
  KNOWLEDGE_RECORDS,
  searchKnowledge,
  getKnowledgeRecord,
  localizeHref,
  toKnowledgeSource,
  OPERATOR_FACT_SHEET,
  CONTACT_CHANNELS,
} = knowledge;
const { AUDIT, CTA_LABEL, DISCOVERY } = await import("../src/lib/offer.ts");
const { CASE_STUDIES_EN } = await import("../src/components/case-studies/case-studies-copy.ts");
const { default: en } = await import("../src/locales/en.json");
const { OPERATOR_SYSTEM_PROMPT } = await import("../src/lib/operator/system-prompt.ts");

const KINDS = new Set([
  "offer", "service_system", "capability", "case_study", "industry", "industry_faq",
  "pricing_tier", "process_step", "principle", "faq", "contact", "brand", "tech", "absence",
]);
const CONFIDENCE = new Set(["canonical", "published_range", "reported_outcome"]);

/** Claims the site renders but cannot substantiate (see the knowledge research). */
const UNVERIFIABLE = [
  /(?:^|[^\d.])4\.9(?!\d)/,
  /(?:^|[^\d])50\+/,
  /(?:^|[^\d.])200\s?%/,
  /₹\s?40\s?Cr\+/i,
  /average ROI/i,
  /average revenue lift/i,
  /payback/i,
  /SOC\s?2/i,
  /HIPAA/i,
  /\bBAA\b/,
  /AURORA|NORTHFIELD/i,
  /XXXX/,
  /\bwe(?:'|’)ve\b/i,
  /live examples/i,
  /1-week paid discovery/i,
  /12 cities/i,
  /Rohan M\.|Priya S\.|Dr\. Anil K\.|Vikram J\./,
  /didn't just build us a website|That changed everything|at a third of the cost/,
  /Tally → cloud ERP in 6 weeks/,
];

const text = (record) => `${record.title}\n${record.body}\n${record.caveat ?? ""}`;
const ids = (records) => records.map((record) => record.id);

test("records are non-empty, uniquely identified and well formed", () => {
  assert.ok(KNOWLEDGE_RECORDS.length > 40, `only ${KNOWLEDGE_RECORDS.length} records`);
  const seen = new Set();
  for (const record of KNOWLEDGE_RECORDS) {
    assert.ok(!seen.has(record.id), `duplicate id ${record.id}`);
    seen.add(record.id);
    assert.ok(KINDS.has(record.kind), `${record.id}: kind ${record.kind}`);
    assert.ok(record.id.startsWith(`${record.kind}:`), `${record.id}: id/kind mismatch`);
    assert.ok(CONFIDENCE.has(record.confidence), `${record.id}: confidence ${record.confidence}`);
    assert.ok(record.path === "" || /^[/#]/.test(record.path), `${record.id}: path ${JSON.stringify(record.path)}`);
    assert.ok(!/\s/.test(record.path), `${record.id}: whitespace in path`);
    assert.ok(record.title.trim().length > 0 && record.body.trim().length > 0, `${record.id}: empty text`);
    assert.doesNotMatch(text(record), /undefined|\[object Object\]|\{minutes\}/, record.id);
    assert.ok(record.source.length > 0, `${record.id}: no source`);
    assert.ok(Array.isArray(record.tags) && record.tags.every((tag) => tag === tag.toLowerCase()), record.id);
    assert.equal(getKnowledgeRecord(record.id), record);
    assert.ok(Object.isFrozen(record), `${record.id} is mutable`);
  }
  assert.ok(Object.isFrozen(KNOWLEDGE_RECORDS));
  assert.equal(getKnowledgeRecord("offer:does-not-exist"), undefined);
  for (const kind of KINDS) {
    assert.ok(KNOWLEDGE_RECORDS.some((record) => record.kind === kind), `no ${kind} records`);
  }
});

test("no record repeats a flagged unverifiable claim", () => {
  for (const record of KNOWLEDGE_RECORDS) {
    for (const re of UNVERIFIABLE) assert.doesNotMatch(text(record), re, `${record.id} matches ${re}`);
    // The only mention of the stale 30-minute audit is the line reconciling it.
    if (record.id !== "offer:free-audit") {
      assert.doesNotMatch(text(record), /30[- ]minutes?(?: free| revenue)? (?:audit|slot|call|consultation|session)/i, record.id);
    }
  }
  for (const record of KNOWLEDGE_RECORDS.filter((r) => r.kind === "industry_faq")) {
    assert.doesNotMatch(record.title, /what does (?:this|it) cost/i, record.id);
    assert.doesNotMatch(record.body, /₹/, `${record.id}: industry prices contradict lib/offer.ts`);
  }
  // Excluded sections never become records at all.
  const all = KNOWLEDGE_RECORDS.map(text).join("\n");
  for (const item of en.testimonials.items) assert.ok(!all.includes(item.quote), "testimonial quote leaked");
  for (const item of en.caseStudies.items) assert.ok(!all.includes(item.quote), `${item.id} quote leaked`);
  for (const item of en.services.items) {
    for (const outcome of item.outcomes) assert.ok(!all.includes(outcome), `${item.id} outcome leaked: ${outcome}`);
  }
  for (const item of en.industries.items) assert.ok(!all.includes(item.outcome), `${item.id} outcome leaked`);
});

test("reported outcomes and published ranges carry their caveats", () => {
  const cases = KNOWLEDGE_RECORDS.filter((record) => record.kind === "case_study");
  assert.equal(cases.length, en.caseStudies.items.length);
  for (const record of KNOWLEDGE_RECORDS) {
    if (record.confidence === "reported_outcome") {
      assert.ok(record.caveat, `${record.id}: reported outcome without caveat`);
      assert.ok(record.caveat.includes(CASE_STUDIES_EN.disclaimer), record.id);
      assert.match(record.caveat, /Anonymised client project; reported outcome\./, record.id);
    }
    if (record.confidence === "published_range") assert.match(record.caveat ?? "", /INR/, record.id);
  }
  for (const record of cases) assert.equal(record.confidence, "reported_outcome", record.id);
  for (const kind of ["pricing_tier", "service_system"]) {
    const priced = KNOWLEDGE_RECORDS.filter((record) => record.kind === kind && /₹/.test(record.title + record.body));
    assert.ok(priced.length > 0, kind);
    for (const record of priced) assert.equal(record.confidence, "published_range", record.id);
  }
});

test("offer facts come from lib/offer.ts and absences are explicit", () => {
  const audit = getKnowledgeRecord("offer:free-audit");
  assert.equal(audit.title, AUDIT.label);
  assert.match(audit.body, /45/);
  const discovery = getKnowledgeRecord("offer:discovery-sprint");
  assert.ok(discovery.body.includes(DISCOVERY.price) && discovery.body.includes(DISCOVERY.note));
  for (const id of ["absence:team", "absence:social", "absence:address", "absence:scheduler", "absence:credentials"]) {
    const record = getKnowledgeRecord(id);
    assert.ok(record, `missing ${id}`);
    assert.equal(record.kind, "absence");
  }
  assert.match(getKnowledgeRecord("absence:scheduler").body, /savingroup@gmail\.com/);
  const tech = KNOWLEDGE_RECORDS.filter((record) => record.kind === "tech");
  assert.ok(tech.every((record) => !/\bpartner(?:ed|s)? with\b/i.test(record.body)), "tech framed as partnership");
});

test("search ranks the obvious record first", () => {
  const [top] = searchKnowledge("manufacturing erp tally");
  assert.ok(top, "no results");
  assert.ok(["industry", "case_study"].includes(top.kind), `top is ${top.id}`);
  assert.ok(top.tags.includes("manufacturing"), `top is ${top.id}`);

  const cost = searchKnowledge("how much does it cost");
  assert.ok(cost.length > 0);
  assert.ok(["pricing_tier", "offer"].includes(cost[0].kind), `top is ${cost[0].id}`);
  assert.ok(cost.some((r) => r.kind === "pricing_tier") && cost.some((r) => r.kind === "offer"), ids(cost).join(", "));

  assert.equal(searchKnowledge("who is the founder")[0]?.id, "absence:team");
  assert.equal(searchKnowledge("can I book a call")[0]?.id, "absence:scheduler");
  assert.equal(searchKnowledge("Where is your office address?")[0]?.id, "absence:address");
  assert.equal(searchKnowledge("sensors on machines")[0]?.kind, "capability");
  assert.equal(searchKnowledge("WhatsApp follow-ups for leads")[0]?.id, "service_system:autosell-engine");
  assert.ok(searchKnowledge("case studies").slice(0, 3).every((r) => r.kind === "case_study"));
  // Diacritics and case fold away; plural and -ing forms meet their stems.
  assert.deepEqual(ids(searchKnowledge("PRÍCING")), ids(searchKnowledge("prices")));
});

test("kinds filter, blank queries and limits", () => {
  const tiers = searchKnowledge("pricing whatsapp seo", { kinds: ["pricing_tier"] });
  assert.ok(tiers.length > 0 && tiers.every((r) => r.kind === "pricing_tier"), ids(tiers).join(", "));
  const mixed = searchKnowledge("manufacturing", { kinds: ["case_study", "industry_faq"] });
  assert.ok(mixed.length > 0 && mixed.every((r) => r.kind === "case_study" || r.kind === "industry_faq"));
  assert.equal(searchKnowledge("manufacturing", { kinds: [] }).length, 5, "empty kinds means all kinds");

  for (const blank of ["", "   ", "\n\t", "the and of it", "?!", undefined, null, 42]) {
    assert.deepEqual(searchKnowledge(blank), [], JSON.stringify(blank));
  }
  assert.deepEqual(searchKnowledge("zzqxw nonexistentterm"), []);

  const broad = "whatsapp automation erp pricing seo website audit";
  assert.equal(searchKnowledge(broad).length, 5, "default limit");
  assert.equal(searchKnowledge(broad, { limit: 3 }).length, 3);
  assert.equal(searchKnowledge(broad, { limit: 50 }).length, 8, "max limit");
  assert.equal(searchKnowledge(broad, { limit: 2.9 }).length, 2);
  assert.equal(searchKnowledge(broad, { limit: Number.NaN }).length, 5);
  assert.ok(searchKnowledge("x".repeat(20_000) + " pricing").length >= 0, "long input does not throw");
});

test("ordering is deterministic across calls and fresh module loads", async () => {
  const queries = ["manufacturing erp tally", "how much does it cost", "ai agent approvals", "whatsapp", "clinic"];
  const first = queries.map((q) => ids(searchKnowledge(q, { limit: 8 })));
  const second = queries.map((q) => ids(searchKnowledge(q, { limit: 8 })));
  assert.deepEqual(first, second);

  const fresh = await import("../src/lib/operator/knowledge.ts?fresh=1");
  assert.notEqual(fresh.KNOWLEDGE_RECORDS, KNOWLEDGE_RECORDS, "expected a second module instance");
  assert.deepEqual(ids(fresh.KNOWLEDGE_RECORDS), ids(KNOWLEDGE_RECORDS));
  assert.deepEqual(queries.map((q) => ids(fresh.searchKnowledge(q, { limit: 8 }))), first);
  assert.equal(fresh.OPERATOR_FACT_SHEET, OPERATOR_FACT_SHEET);
});

test("localizeHref and toKnowledgeSource", () => {
  assert.equal(localizeHref("", "in", "en"), "/in/en");
  assert.equal(localizeHref("/", "in", "en"), "/in/en");
  assert.equal(localizeHref("#faq", "in", "en"), "/in/en#faq");
  assert.equal(localizeHref("/pricing#plans", "in", "en"), "/in/en/pricing#plans");
  assert.equal(localizeHref("/about", "ae", "ar"), "/ae/ar/about");
  assert.equal(localizeHref("/services#erp", "IN", "HI"), "/in/hi/services#erp");
  assert.equal(localizeHref("contact", "gb", "en"), "/gb/en/contact");
  assert.equal(localizeHref("/about", "../evil", "e n"), "/in/en/about", "bad segments fall back");

  const study = getKnowledgeRecord("case_study:manufacturing-erp");
  const source = toKnowledgeSource(study, "us", "es");
  assert.deepEqual(Object.keys(source).sort(), ["caveat", "confidence", "href", "id", "kind", "title"]);
  assert.equal(source.href, "/us/es/case-studies#manufacturing-erp");
  assert.equal(source.caveat, study.caveat);

  const plain = toKnowledgeSource(getKnowledgeRecord("capability:erp"), "in", "en");
  assert.ok(!("caveat" in plain), "no caveat key when the record has none");
  assert.equal(plain.href, "/in/en/services#service-ecosystem");
});

test("fact sheet and contact channels", () => {
  assert.equal(CONTACT_CHANNELS.email, "savingroup@gmail.com");
  assert.equal(CONTACT_CHANNELS.whatsappDigits, "918305838352");
  assert.equal(CONTACT_CHANNELS.whatsappDisplay, "+91 83058 38352");
  assert.equal(CONTACT_CHANNELS.hours, en.contact.details.hours);

  const sheet = OPERATOR_FACT_SHEET;
  assert.ok(sheet.includes(CONTACT_CHANNELS.email));
  assert.ok(sheet.includes(CONTACT_CHANNELS.whatsappDisplay));
  assert.match(sheet, /\b45\b/);
  assert.ok(sheet.includes(DISCOVERY.price));
  assert.ok(sheet.includes(AUDIT.name));
  assert.ok(
    sheet.trimEnd().endsWith(
      "Anything not in this sheet must come from search_savin_knowledge; if it is not there either, say you do not have verified information.",
    ),
  );
  for (const item of en.caseStudies.items) assert.ok(sheet.includes(item.title), `${item.id} missing`);
  for (const tier of en.pricing.tiers) assert.ok(sheet.includes(tier.priceRange), `${tier.id} missing`);
  for (const re of UNVERIFIABLE) assert.doesNotMatch(sheet, re);
  const words = sheet.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 900, `${words} words`);
});

/* ------------------------------ honesty fixes ------------------------------ */

// Every CTA button leads to /contact, whose form fakes a successful submit.
test("no record or fact-sheet line steers visitors to the site's button or form", () => {
  for (const record of KNOWLEDGE_RECORDS) {
    assert.ok(!text(record).includes(CTA_LABEL), `${record.id} names the CTA button`);
    assert.doesNotMatch(text(record), /\b(?:enquiry|contact|request) form\b/i, `${record.id} points at the form`);
  }
  assert.ok(!OPERATOR_FACT_SHEET.includes(CTA_LABEL), "fact sheet names the CTA button");
  assert.doesNotMatch(OPERATOR_FACT_SHEET, /from the contact page|\bform\b/i);
  for (const id of ["offer:free-audit", "absence:scheduler"]) {
    const body = getKnowledgeRecord(id).body;
    assert.ok(body.includes(CONTACT_CHANNELS.email) && body.includes(CONTACT_CHANNELS.whatsappDisplay), id);
  }
});

test("industry copy carries no unsourced statistics, vendor limits or replace-first stance", () => {
  const industry = KNOWLEDGE_RECORDS.filter((record) => record.kind === "industry" || record.kind === "industry_faq");
  assert.ok(industry.length >= 20, `${industry.length} industry records`);
  for (const record of industry) {
    const t = text(record);
    assert.doesNotMatch(t, /\d\s?%/, `${record.id}: bare percentage`);
    assert.doesNotMatch(t, /\blosing \d/i, record.id);
    assert.doesNotMatch(t, /\(most are\)|\bwe replace it\b/i, `${record.id}: replace-first stance`);
    assert.doesNotMatch(t, /\bone in four\b|\bthree-quarters\b/i, record.id);
  }
  // Only the flagged sentences go: the scenarios, deliverables and answers stay.
  const manufacturing = getKnowledgeRecord("industry:manufacturing").body;
  assert.match(manufacturing, /Production planning happens on a printed Excel sheet/);
  assert.match(manufacturing, /Inventory mismatches between godowns and books\./);
  assert.doesNotMatch(manufacturing, /3–7%|caps at/);
  const store = getKnowledgeRecord("industry:ecommerce-build").body;
  assert.match(store, /Storefront CRO rebuild: Mobile-first PDP with sub-2s LCP, [^.]*WhatsApp Click-to-Chat from PDP\./);
  assert.doesNotMatch(store, /OTP step/);
  const crm = getKnowledgeRecord("industry_faq:real-estate-q5");
  assert.ok(crm, "the keep-your-CRM answer survives without its replace-first sentences");
  assert.match(crm.body, /on top\.$/);
});

test("no record invents a paid audit or states a third-party product's limits", () => {
  const PAID_AUDIT = [/\bpaid\s+(?:[\w-]+\s+){0,2}audit\b/i, /\bCRO audit\b/i];
  const VENDOR_LIMIT = [/\b(?:Tally|Zoho|SAP)\b[^.]*\b\d+\s+(?:concurrent\s+)?users?\b/i, /\bcaps? at \d/i];
  for (const record of KNOWLEDGE_RECORDS) {
    for (const re of [...PAID_AUDIT, ...VENDOR_LIMIT]) assert.doesNotMatch(text(record), re, `${record.id} matches ${re}`);
  }
  for (const re of PAID_AUDIT) assert.doesNotMatch(OPERATOR_FACT_SHEET, re);
  // The e-commerce answer keeps its honest half; the Tally/Zoho/SAP comparison goes whole.
  assert.match(getKnowledgeRecord("industry_faq:ecommerce-q2")?.body ?? "", /under-promise/);
  assert.equal(getKnowledgeRecord("industry_faq:manufacturing-q1"), undefined);
  for (const record of searchKnowledge("Tally users limit", { limit: 8 })) {
    for (const re of VENDOR_LIMIT) assert.doesNotMatch(text(record), re, record.id);
  }
});

test("capability work is never priced from a website tier", () => {
  const absence = getKnowledgeRecord("absence:capability-pricing");
  assert.ok(absence, "missing absence:capability-pricing");
  assert.equal(absence.kind, "absence");
  for (const tier of en.pricing.tiers) assert.ok(absence.body.includes(tier.scope), `${tier.id} scope missing`);
  assert.equal(searchKnowledge("IoT sensor price")[0]?.id, "absence:capability-pricing");
  assert.equal(searchKnowledge("price of AI agent")[0]?.id, "absence:capability-pricing");
  assert.ok(ids(searchKnowledge("Tally WhatsApp integration price")).includes("absence:capability-pricing"));
  // A general price question still leads with the published prices.
  assert.ok(["pricing_tier", "offer"].includes(searchKnowledge("how much does it cost")[0]?.kind));

  const sheet = OPERATOR_FACT_SHEET;
  assert.doesNotMatch(sheet, /a complete system from/, "the RevSite Pro entry point keeps its scope");
  assert.match(sheet, /complete revenue system \(website \+ WhatsApp lead capture/);
  const notPublished = sheet.slice(sheet.indexOf("NOT PUBLISHED"), sheet.indexOf("CONTACT ("));
  assert.match(notPublished, /Prices for AI agents, industrial IoT, integrations, custom software/);
  // Tier ranges and system ranges are separate lists, never sums of each other.
  assert.match(sheet, /Tier ranges and service-system ranges are separate published lists/);
  assert.match(getKnowledgeRecord("offer:tier-to-system").body, /separate published lists/);
});

test("the Discovery Sprint rule is stated once and consistently", () => {
  const sheet = OPERATOR_FACT_SHEET;
  assert.doesNotMatch(sheet, /Only if a build is worth scoping/);
  assert.match(sheet, /Enterprise scopes always start with the paid Discovery Sprint\. For the other plans \(Launch, Growth and Scale\)[^\n]*optional/);
  assert.match(getKnowledgeRecord("offer:discovery-sprint").body, /Enterprise scopes always start with the paid Discovery Sprint/);
  const path = getKnowledgeRecord("process_step:quote-path").body;
  assert.match(path, /Nothing is billed before the quote is fixed[^.]*\. The one exception is Enterprise: those scopes start with the paid Discovery Sprint \(₹15,000/);
});

test("deployment notes defer absences to the fact sheet and cover the chat's own handling", () => {
  const notes = OPERATOR_SYSTEM_PROMPT.slice(
    OPERATOR_SYSTEM_PROMPT.indexOf("# DEPLOYMENT NOTES"),
    OPERATOR_SYSTEM_PROMPT.indexOf("# VERIFIED SAVIN FACT SHEET"),
  );
  assert.ok(notes.length > 1000, "deployment notes not found");
  // lib/team.ts and SOCIAL_PROFILES decide these; the fact sheet follows them.
  assert.doesNotMatch(notes, /no team names|no social profiles|no named team/i);
  assert.match(notes, /follow the NOT PUBLISHED list in the fact sheet/);
  assert.match(notes, /Name only WhatsApp or email/);
  assert.match(notes, /Never direct visitors to a form or button on the site/);
  assert.match(notes, /form is not a verified channel/);
  assert.match(notes, /never use it as an input to calculate_operational_impact/);
  assert.match(notes, /Never map a process, integration or capability onto a website pricing tier/);
  const chat = notes.slice(notes.indexOf("## 8."));
  assert.match(chat, /^## 8\. This conversation/);
  assert.match(chat, /kept in this browser tab/);
  assert.match(chat, /Anthropic's API/);
  assert.match(chat, /Savin's team does not receive the conversation/);
  assert.ok(OPERATOR_SYSTEM_PROMPT.endsWith(OPERATOR_FACT_SHEET));
});
