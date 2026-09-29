// lib/operator/knowledge.ts
//
// The Operator's verified knowledge index: the only Savin facts Claude may
// quote. `search_savin_knowledge` (tools.ts) ranks these records, the route
// puts OPERATOR_FACT_SHEET in the system prompt, and the audit brief takes its
// channels from CONTACT_CHANNELS.
//
// ALLOW-LIST, NOT A CRAWL. Every record is built by importing the site's own
// copy modules, so an edit to the site lands here on the next deploy. What is
// left out matters as much as what goes in: the site also renders invented
// ratings, placeholder client logos, aggregate numbers no one can source and
// per-market claims that are wrong. None of that is imported, and a final
// denylist drops any record that picks such a claim up later.
//
// English sources only. The non-English locale files lag behind lib/offer.ts
// (they still say "30 minutes" and older discovery prices); the model
// translates English records for the visitor instead.
//
// Pure module: data imports, type-only protocol imports and deterministic
// string work. No SDK, React, next/* or CSS, so `node --test` can load it
// through type stripping (scripts/operator-knowledge.test.mjs). Server-side
// by convention; nothing client-side imports it.

import type { KnowledgeConfidence, KnowledgeKind, KnowledgeSource } from "@/lib/operator/protocol";
import type { CaseCopy } from "@/components/case-studies/case-studies-copy";
import en from "@/locales/en.json";
import { AFTER_ENQUIRY, AUDIT, CTA_LABEL, DISCOVERY, ENTRY, TIER_TO_SYSTEM } from "@/lib/offer";
import { TEAM } from "@/lib/team";
import { BASE_URL, BRAND, SOCIAL_PROFILES, STATIC_PAGES } from "@/lib/constants";
import { SERVICES_EN } from "@/components/services/services-copy";
import { CASE_STUDIES_EN } from "@/components/case-studies/case-studies-copy";
import { EN_ABOUT } from "@/components/about/about-copy";
import { getPricingContent } from "@/components/pricing/pricing-data";
import { getPricingCopy } from "@/components/pricing/copy/pricing-copy";
import { INDUSTRY_DATA, INDUSTRY_SLUGS } from "@/lib/industry-data";
import { OPERATIONS_FAQ } from "@/components/home/home-content";

export interface KnowledgeRecord {
  /** `<kind>:<slug>`, stable across deploys while the source copy keeps its shape. */
  id: string;
  kind: KnowledgeKind;
  title: string;
  /** Plain text, facts only. */
  body: string;
  /** Locale-free site path: "" = home, "/pricing#plans", or a bare "#hash". */
  path: string;
  tags: string[];
  confidence: KnowledgeConfidence;
  /** Must travel with the fact wherever it is quoted. */
  caveat?: string;
  /** Where the text came from, e.g. "lib/offer.ts#DISCOVERY". */
  source: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Text helpers                               */
/* -------------------------------------------------------------------------- */

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Ends a fragment with a full stop unless it already ends a sentence. */
function sentence(text: string): string {
  const t = clean(text);
  return !t || /[.!?…:]$/.test(t) ? t : `${t}.`;
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** Split on sentence ends followed by whitespace, so "0.6%" and "99.9%" stay whole. */
function splitSentences(text: string): string[] {
  return clean(text)
    .replace(/([.!?])\s+/g, "$1\u0000")
    .split("\u0000")
    .filter(Boolean);
}

/**
 * Outcome promises and unverifiable track-record lines inside otherwise
 * factual copy ("No-show rate drops from 25% to 5–8%", "We've shipped to
 * factories in Vapi", "Review velocity 5–10x"). The deliverable or answer
 * around them is real scope; the sentence itself is a forecast or a client
 * claim nobody can check, so only that sentence is removed.
 */
const CLAIM_SENTENCE: readonly RegExp[] = [
  /\bwe(?:'|’)ve\b/i,
  /\bour own data\b/i,
  /\bwho(?:'|’)ve worked with us\b/i,
  /\b(?:most|many|our) (?:clients|clinics|brands|institutes|founders|customers)\b/i,
  /\bbrands we work with\b/i,
  /\bwe ship for\b/i,
  /\bbreaks? even\b/i,
  /\bpays? back\b/i,
  /\b\d+(?:\.\d+)?(?:\s?[–-]\s?\d+(?:\.\d+)?)?x\b/i,
  /\b(?:drops?|lifts?|falls?|rises?) from\b/i,
  /\bfrom \d[\d.]*(?:\s?[–-]\s?\d[\d.]*)?%\s+to\b/i,
  /\b(?:reduces?|cuts?|down|up)\b[^.]*?\d+(?:\s?[–-]\s?\d+)?\s?(?:%|percentage points)/i,
  /\d+(?:\s?[–-]\s?\d+)?% (?:more|fewer|lower|higher|faster|recovery|lift|growth)\b/i,
  /\btop[- ]3\b/i,
  /\b(?:usually|typically) (?:shows?|sees?)\b/i,
  /\b(?:is|becomes?) realistic\b/i,
  /\b(?:in|inside|within) the first \d+(?:\s?[–-]\s?\d+)? (?:days|weeks|months)\b/i,
];

function stripSentences(text: string, patterns: readonly RegExp[]): string {
  return splitSentences(text)
    .filter((s) => !patterns.some((re) => re.test(s)))
    .join(" ");
}

function stripClaims(text: string): string {
  return stripSentences(text, CLAIM_SENTENCE);
}

/**
 * Industry FAQ answers are dropped whole when they carry a price (every
 * industry price contradicts lib/offer.ts), an unverifiable "we've shipped"
 * claim, a compliance claim, or a promise of "live examples".
 */
const FAQ_EXCLUDE = /₹|\bwe(?:'|’)ve\b|\bHIPAA\b|\bBAA\b|\bSOC\s?2?\b|live examples/i;
const COST_QUESTION = /\bwhat does (?:this|it) cost\b/i;
/** Below this, a claim-stripped answer no longer answers its question. */
const MIN_ANSWER_CHARS = 80;

/**
 * Last line of defence. The site's known unverifiable figures and
 * placeholders; a record whose title, body or caveat matches is dropped, so a
 * future copy edit cannot smuggle one in through an allowed field.
 */
const DENYLIST: readonly RegExp[] = [
  /(?:^|[^\d.])4\.9(?!\d)/,
  /(?:^|[^\d])50\+/,
  /(?:^|[^\d.])200\s?%/,
  /₹\s?40\s?Cr\+/i,
  /\baverage ROI\b/i,
  /\b(?:average|avg\.?) (?:revenue lift|CPA reduction)\b/i,
  /\bpayback\b/i,
  /\bSOC\s?2\b/i,
  /\bHIPAA\b/i,
  /\bAURORA\b/i,
  /\bNORTHFIELD\b/i,
  /XXXX/,
];

function isDenied(record: KnowledgeRecord): boolean {
  const text = `${record.title}\n${record.body}\n${record.caveat ?? ""}`;
  return DENYLIST.some((re) => re.test(text));
}

/* -------------------------------------------------------------------------- */
/*                              Shared source data                            */
/* -------------------------------------------------------------------------- */

const DETAILS = en.contact.details;
const PRICING = getPricingContent(en);
const PRICING_COPY = getPricingCopy("en");

const PRICE_CAVEAT = PRICING.note
  ? `Published starting range in INR. ${clean(PRICING.note)}`
  : "Published starting range in INR; the final quote follows the free audit.";

const CASE_CAVEAT = `${CASE_STUDIES_EN.disclaimer} Anonymised client project; reported outcome.`;

/** Which industry page each anonymised case belongs to (for tags only). */
const CASE_INDUSTRY: Record<string, string> = {
  "d2c-skincare": "ecommerce",
  "real-estate-developer": "real-estate",
  "manufacturing-erp": "manufacturing",
};

/** Words visitors use for each industry; the pages themselves are keyword-dense. */
const INDUSTRY_TAGS: Record<string, string[]> = {
  manufacturing: ["manufacturing", "manufacturer", "factory", "erp", "tally", "gst", "production", "inventory"],
  "real-estate": ["real estate", "property", "developer", "broker", "crm", "leads"],
  healthcare: ["healthcare", "clinic", "doctor", "patients", "appointments"],
  ecommerce: ["ecommerce", "d2c", "shopify", "store", "retail"],
  edtech: ["edtech", "coaching", "education", "institute", "lms", "students"],
};

const CAPABILITY_TAGS: Record<string, string[]> = {
  ai: ["ai", "agents", "assistant", "llm"],
  automation: ["automation", "workflow", "approvals", "follow-up"],
  erp: ["erp", "operateos", "inventory", "orders", "purchasing", "finance"],
  industrial: ["industrial", "iot", "machines", "sensors", "shop floor"],
  software: ["custom software", "internal tools", "spreadsheets"],
  integrations: ["api", "integration", "data exchange"],
  data: ["analytics", "dashboards", "reporting"],
  platforms: ["portal", "platform", "web"],
};

const SERVICE_NAME = new Map(en.services.items.map((item) => [item.id, item.name]));

/** Tier names whose TIER_TO_SYSTEM entry includes this system. */
function tiersForSystem(systemName: string): string[] {
  return Object.keys(TIER_TO_SYSTEM).filter((tier) => TIER_TO_SYSTEM[tier]?.systems.includes(systemName));
}

/* -------------------------------------------------------------------------- */
/*                                   Records                                  */
/* -------------------------------------------------------------------------- */

const drafts: KnowledgeRecord[] = [];

function add(record: KnowledgeRecord): void {
  drafts.push(record);
}

/* --- Offer (lib/offer.ts is the reconciled source; it wins every conflict) -- */

add({
  id: "offer:free-audit",
  kind: "offer",
  title: AUDIT.label,
  body: [
    AUDIT.supportLine,
    `The site's name for it is the ${AUDIT.name}; it is the free first step of every engagement.`,
    `The button reads "${CTA_LABEL}": there is no scheduler, so the visitor sends a request and a person replies.`,
    `After a request: ${AFTER_ENQUIRY.join(" ")}`,
    `Some older copy said 30 minutes; the reconciled offer is ${AUDIT.durationLong}.`,
  ].join(" "),
  path: "/contact",
  tags: ["audit", "revenue audit", "free", "consultation", "diagnosis", "first step", "call", "meeting", String(AUDIT.minutes), "minutes"],
  confidence: "canonical",
  source: "lib/offer.ts#AUDIT",
});

add({
  id: "offer:discovery-sprint",
  kind: "offer",
  title: `${DISCOVERY.name}: ${DISCOVERY.duration} session, ${DISCOVERY.price}`,
  body: [
    DISCOVERY.summary,
    DISCOVERY.note,
    `It comes after the free ${AUDIT.name}, never instead of it, and only when a build is worth scoping.`,
    TIER_TO_SYSTEM.Enterprise ? `Enterprise: ${TIER_TO_SYSTEM.Enterprise.note}` : "",
    "Where another page quotes a different discovery length or price, this reconciled offer is the current one.",
  ].filter(Boolean).join(" "),
  path: "/pricing#quote",
  tags: ["discovery", "sprint", "paid", "scoping", "blueprint", "credited", "pricing", "cost"],
  confidence: "canonical",
  source: "lib/offer.ts#DISCOVERY",
});

add({
  id: "offer:entry-prices",
  kind: "offer",
  title: "Entry prices: where engagements start",
  body: [
    `A scoped website build starts at ${ENTRY.site.display} (the ${ENTRY.site.tier} tier).`,
    `A complete revenue system starts at ${ENTRY.system.display} (${ENTRY.system.service}).`,
    `Retainers start at ${ENTRY.retainer.display} per ${ENTRY.retainer.per}.`,
    "These buy different things, so a starting price must say which one it means.",
  ].join(" "),
  path: "/pricing",
  tags: ["pricing", "price", "cost", "minimum", "starting price", "budget", "entry", "retainer"],
  confidence: "canonical",
  caveat: PRICE_CAVEAT,
  source: "lib/offer.ts#ENTRY",
});

add({
  id: "offer:tier-to-system",
  kind: "offer",
  title: "How the pricing tiers map to the service systems",
  body: Object.entries(TIER_TO_SYSTEM)
    .map(([tier, { systems, note }]) => `${tier}: ${systems.join(" + ")}. ${sentence(note)}`)
    .join(" "),
  path: "/pricing",
  tags: ["pricing", "tiers", "plans", "systems", "mapping", "cost"],
  confidence: "canonical",
  caveat: PRICE_CAVEAT,
  source: "lib/offer.ts#TIER_TO_SYSTEM",
});

/* --- The six priced service systems (en.json; `outcomes` dropped) ---------- */

for (const item of en.services.items) {
  const tiers = tiersForSystem(item.name);
  const industries = INDUSTRY_SLUGS.filter((slug) => INDUSTRY_DATA[slug].serviceIds.includes(item.id));
  add({
    id: `service_system:${item.id}`,
    kind: "service_system",
    title: `${item.name}: ${item.kicker}`,
    body: [
      stripClaims(item.summary),
      `For: ${sentence(item.for)}`,
      `${SERVICES_EN.deliverables}: ${item.deliverables.join("; ")}.`,
      `${SERVICES_EN.investment}: ${item.investment}.`,
      tiers.length ? `Part of the ${tiers.join(" and ")} pricing tier${tiers.length > 1 ? "s" : ""}.` : "",
    ].filter(Boolean).join(" "),
    path: `/services#${item.id}`,
    tags: [item.id, ...item.id.split("-"), item.name, "service", "system", "investment", ...industries],
    confidence: "published_range",
    caveat: PRICE_CAVEAT,
    source: `locales/en.json#services.items[${item.id}]`,
  });
}

/* --- The eight capabilities (services page) --------------------------------- */

const [problemLabel, buildLabel, howLabel, changeLabel] = SERVICES_EN.detailLabels;
for (const capability of SERVICES_EN.capabilities) {
  add({
    id: `capability:${capability.id}`,
    kind: "capability",
    title: capability.name,
    body: [
      `${problemLabel}: ${capability.problem}`,
      `${buildLabel}: ${capability.build}`,
      `${howLabel}: ${capability.how}`,
      `${changeLabel}: ${capability.outcome}`,
      `Flow: ${capability.flow.join(" → ")}.`,
    ].join(" "),
    path: "/services#service-ecosystem",
    tags: [capability.id, "capability", ...(CAPABILITY_TAGS[capability.id] ?? [])],
    confidence: "canonical",
    source: `components/services/services-copy.ts#SERVICES_EN.capabilities[${capability.id}]`,
  });
}

add({
  id: "capability:ai-workflow",
  kind: "capability",
  title: SERVICES_EN.aiTitle.join(" "),
  body: [
    SERVICES_EN.aiIntro,
    `Pipeline: ${SERVICES_EN.aiLabels.map((label, i) => (SERVICES_EN.aiNotes[i] ? `${label} (${SERVICES_EN.aiNotes[i]})` : label)).join(" → ")}.`,
    SERVICES_EN.aiFoot,
  ].join(" "),
  path: "/services#ai-services-title",
  tags: ["ai", "agents", "automation", "human review", "approval", "mcp", "api", "control"],
  confidence: "canonical",
  source: "components/services/services-copy.ts#SERVICES_EN.aiLabels",
});

add({
  id: "capability:industrial-connectivity",
  kind: "capability",
  title: SERVICES_EN.industrialTitle.join(" "),
  body: [
    SERVICES_EN.industrialIntro,
    `Stages: ${SERVICES_EN.industrialSteps.join(" → ")}.`,
    ...SERVICES_EN.industrialNotes.map((note) => `${note.title}: ${note.body}`),
  ].join(" "),
  path: "/services#industrial-services-title",
  tags: ["industrial", "iot", "machines", "sensors", "shop floor", "plc", "scada", "maintenance"],
  confidence: "canonical",
  caveat: SERVICES_EN.industrialFoot,
  source: "components/services/services-copy.ts#SERVICES_EN.industrialSteps",
});

/* --- Case studies (reported outcomes; quote and author dropped) ------------ */

const [industryLabel, locationLabel, durationLabel, measuresLabel] = CASE_STUDIES_EN.facts;
for (const item of en.caseStudies.items) {
  const copy = (CASE_STUDIES_EN.cases as Partial<Record<string, CaseCopy>>)[item.id];
  const industry = CASE_INDUSTRY[item.id];
  add({
    id: `case_study:${item.id}`,
    kind: "case_study",
    title: `${item.industry} case study (${item.location}): ${item.title}`,
    body: [
      copy ? sentence(copy.headline.join(" ")) : "",
      `${industryLabel}: ${item.industry}. ${locationLabel}: ${item.location}. ${durationLabel}: ${item.duration}.`,
      item.summary,
      copy ? `${CASE_STUDIES_EN.before}: ${copy.before.join(", ")}.` : "",
      copy ? `${copy.system}: ${copy.components.join(", ")}.` : "",
      `${measuresLabel}: ${item.metrics.map((m) => `${m.label} ${m.value} (${m.delta})`).join("; ")}.`,
    ].filter(Boolean).join(" "),
    path: `/case-studies#${item.id}`,
    tags: ["case study", "case", "example", "proof", "client", "results", item.id, ...item.id.split("-"), ...(industry ? [industry] : [])],
    confidence: "reported_outcome",
    caveat: CASE_CAVEAT,
    source: `locales/en.json#caseStudies.items[${item.id}] + components/case-studies/case-studies-copy.ts#CASE_STUDIES_EN.cases`,
  });
}

/* --- Industries (intro, outcome metrics and city callouts dropped) -------- */

for (const slug of INDUSTRY_SLUGS) {
  const data = INDUSTRY_DATA[slug];
  const card = en.industries.items.find((item) => item.id === slug);
  const tags = [slug, ...slug.split("-"), "industry", ...(INDUSTRY_TAGS[slug] ?? [])];
  const services = data.serviceIds.map((id) => SERVICE_NAME.get(id)).filter((name): name is string => Boolean(name));
  // Every industry page features all three cases; only name one that is
  // actually from this industry, so healthcare is not "proven" by skincare.
  const ownCase = en.caseStudies.items.find((item) => CASE_INDUSTRY[item.id] === slug);

  add({
    id: `industry:${slug}`,
    kind: "industry",
    title: card?.name ?? data.serviceType,
    body: [
      // The card description repeats the hero subtitle (with a city list that
      // reads like a client roster), so only the card's audience tag is kept.
      card ? sentence(card.tag) : "",
      stripClaims(data.hero.subtitle),
      `${data.audience.title}: ${data.audience.bullets.join("; ")}.`,
      `${data.pains.title}: ${data.pains.items.map((pain) => `${pain.title}. ${stripClaims(pain.body)}`).join(" ")}`,
      services.length ? `Related service systems: ${services.join(", ")}.` : "",
      ownCase ? `Case study from this industry: ${ownCase.industry}, ${ownCase.location} (search for details).` : "",
    ].filter(Boolean).join(" "),
    path: `/industries/${slug}`,
    tags,
    confidence: "canonical",
    source: `lib/industry-data.ts#INDUSTRY_DATA.${slug} + locales/en.json#industries.items[${slug}]`,
  });

  add({
    id: `industry:${slug}-build`,
    kind: "industry",
    title: `${data.build.title} (${data.serviceType})`,
    body: data.build.deliverables.map((d) => `${d.label}: ${stripClaims(d.description)}`).join(" "),
    path: `/industries/${slug}`,
    tags: [...tags, "deliverables", "build", "scope"],
    confidence: "canonical",
    source: `lib/industry-data.ts#INDUSTRY_DATA.${slug}.build`,
  });

  data.faq.forEach((faq, index) => {
    if (COST_QUESTION.test(faq.q) || FAQ_EXCLUDE.test(faq.q) || FAQ_EXCLUDE.test(faq.a)) return;
    const answer = stripClaims(faq.a);
    if (answer.length < MIN_ANSWER_CHARS) return;
    add({
      id: `industry_faq:${slug}-q${index + 1}`,
      kind: "industry_faq",
      title: clean(faq.q),
      body: answer,
      path: `/industries/${slug}`,
      tags: [slug, ...slug.split("-"), "faq"],
      confidence: "canonical",
      source: `lib/industry-data.ts#INDUSTRY_DATA.${slug}.faq[${index}]`,
    });
  });
}

/* --- Pricing (comparison, advantages, competitor table and badges dropped) - */

PRICING.tiers.forEach((tier, index) => {
  const mapping = TIER_TO_SYSTEM[tier.name];
  const included = tier.groups
    .map((group) => {
      const on = group.items.filter((item) => item.on).map((item) => item.label);
      return on.length ? `${group.heading}: ${on.join(", ")}.` : "";
    })
    .filter(Boolean);
  add({
    id: `pricing_tier:${tier.id}`,
    kind: "pricing_tier",
    title: `${tier.name} plan: ${tier.priceRange}`,
    body: [
      sentence(tier.tagline),
      `${tier.priceLabel}: ${tier.priceRange} (${tier.priceInfo}).`,
      `${PRICING_COPY.scope}: ${sentence(tier.scope)}`,
      tier.costRows.map((row) => `${row.label}: ${row.value}.`).join(" "),
      `${PRICING_COPY.extras}: ${tier.extras.join(", ")}.`,
      included.length ? `${PRICING_COPY.included}: ${included.join(" ")}` : "",
      mapping ? `${PRICING_COPY.systemsLabel}: ${mapping.systems.join(" + ")}. ${sentence(mapping.note)}` : "",
      PRICING_COPY.reasons[index] ? `Fits when: ${PRICING_COPY.reasons[index]}` : "",
    ].filter(Boolean).join(" "),
    path: `/pricing#plan-${tier.id}`,
    tags: ["pricing", "price", "cost", "plan", "tier", "inr", tier.id],
    confidence: "published_range",
    caveat: PRICE_CAVEAT,
    source: `locales/en.json#pricing.tiers[${tier.id}]`,
  });
});

add({
  id: "pricing_tier:how-pricing-works",
  kind: "pricing_tier",
  title: "How pricing works",
  body: [
    PRICING.note,
    PRICING_COPY.plansIntro,
    `${PRICING_COPY.facts.join(" · ")}.`,
    sentence(PRICING_COPY.heroNote),
  ].join(" "),
  path: "/pricing#plans",
  tags: ["pricing", "price", "cost", "quote", "inr", "requirement-based", "budget"],
  confidence: "canonical",
  source: "locales/en.json#pricing.note + components/pricing/copy/pricing-copy.ts",
});

add({
  id: "pricing_tier:plan-picker",
  kind: "pricing_tier",
  title: PRICING_COPY.pickerTitle.join(" "),
  body: [
    PRICING_COPY.pickerIntro,
    ...PRICING_COPY.questions.map(
      (question) =>
        `${question.q} ${question.options
          .map((option) => `${option.label} → ${option.tier === null ? "no preference" : (PRICING.tiers[option.tier]?.name ?? "no preference")}`)
          .join("; ")}.`,
    ),
    sentence(PRICING_COPY.startingPoint),
  ].join(" "),
  path: "/pricing#which-plan",
  tags: ["pricing", "plan", "which plan", "choose", "recommendation", "tier"],
  confidence: "canonical",
  source: "components/pricing/copy/pricing-copy.ts#questions",
});

/* --- Process: four published views of the same engagement ----------------- */

add({
  id: "process_step:engagement",
  kind: "process_step",
  title: `How an engagement runs: ${en.process.title}`,
  body: [
    en.process.subtitle,
    ...en.process.steps.map((step) => `${step.number} ${step.name} (${step.duration}): ${step.description}`),
  ].join(" "),
  // The EN home no longer renders this block; the pricing page's quote path
  // shows the same sequence in every locale.
  path: "/pricing#quote",
  tags: ["process", "steps", "timeline", "weeks", "how it works", "engagement", "audit", "discovery", "build", "launch"],
  confidence: "canonical",
  source: "locales/en.json#process.steps",
});

add({
  id: "process_step:quote-path",
  kind: "process_step",
  title: `${PRICING_COPY.railTitle}: ${PRICING_COPY.quoteTitle.join(" ")}`,
  body: [
    PRICING_COPY.quoteIntro,
    ...PRICING_COPY.steps.map((step) => `${step.label}: ${step.title}. ${step.body}`),
  ].join(" "),
  path: "/pricing#quote",
  tags: ["process", "steps", "quote", "proposal", "fixed price", "demos", "launch", "hosting", "support"],
  confidence: "canonical",
  source: "components/pricing/copy/pricing-copy.ts#steps",
});

add({
  id: "process_step:method",
  kind: "process_step",
  title: EN_ABOUT.processTitle.join(" "),
  body: [
    EN_ABOUT.processIntro,
    ...EN_ABOUT.steps.map((step) => `${step.title}: ${step.short} ${step.body} ${EN_ABOUT.output}: ${step.output}`),
  ].join(" "),
  path: "/about",
  tags: ["process", "method", "approach", "understand", "connect", "automate", "intelligence", "scale"],
  confidence: "canonical",
  source: "components/about/about-copy.ts#EN_ABOUT.steps",
});

add({
  id: "process_step:case-method",
  kind: "process_step",
  title: CASE_STUDIES_EN.methodTitle.join(" "),
  body: [CASE_STUDIES_EN.methodIntro, ...CASE_STUDIES_EN.method.map((step) => `${step.title}: ${step.body}`)].join(" "),
  path: "/case-studies#case-method-title",
  tags: ["process", "method", "baseline", "measure", "constraint", "results"],
  confidence: "canonical",
  source: "components/case-studies/case-studies-copy.ts#CASE_STUDIES_EN.method",
});

add({
  id: "process_step:system-path",
  kind: "process_step",
  title: SERVICES_EN.pathTitle.join(" "),
  body: `${SERVICES_EN.pathIntro} ${SERVICES_EN.path.join(" → ")}.`,
  path: "/services#system-path-title",
  tags: ["process", "path", "bottleneck", "roadmap", "start"],
  confidence: "canonical",
  source: "components/services/services-copy.ts#SERVICES_EN.path",
});

/* --- Principles ------------------------------------------------------------- */

for (const principle of EN_ABOUT.principles) {
  add({
    id: `principle:${slugify(principle.title)}`,
    kind: "principle",
    title: principle.title,
    body: principle.body,
    path: "/about",
    tags: ["principle", "values", "approach", "philosophy"],
    confidence: "canonical",
    source: "components/about/about-copy.ts#EN_ABOUT.principles",
  });
}

/* --- FAQs ------------------------------------------------------------------- */

/** en.json faq items 2 ("ROI in the first 30 days") and 3 (unsourced
 *  overseas clients) are marketing claims; only these indexes are facts. */
const FAQ_ALLOWED = [0, 1, 4, 5] as const;
for (const index of FAQ_ALLOWED) {
  const item = en.faq.items[index];
  if (!item) continue;
  add({
    id: `faq:${slugify(item.q)}`,
    kind: "faq",
    title: clean(item.q),
    body: stripClaims(item.a),
    path: "/pricing#faq",
    tags: ["faq", "question"],
    confidence: "canonical",
    source: `locales/en.json#faq.items[${index}]`,
  });
}

OPERATIONS_FAQ.forEach((item, index) => {
  add({
    id: `faq:${slugify(item.q)}`,
    kind: "faq",
    title: clean(item.q),
    // "In the example above" points at a home-page diagram the visitor may not see.
    body: stripClaims(stripSentences(item.a, [/\bexample above\b/i])),
    path: "",
    tags: ["faq", "question", "operations"],
    confidence: "canonical",
    source: `components/home/home-content.ts#OPERATIONS_FAQ[${index}]`,
  });
});

/* --- Contact and brand ------------------------------------------------------ */

add({
  id: "contact:channels",
  kind: "contact",
  title: "Contact channels: email, WhatsApp and hours",
  body: [
    `${DETAILS.emailLabel}: ${DETAILS.email}.`,
    `${DETAILS.phoneLabel}: ${DETAILS.phone}.`,
    `${DETAILS.hoursLabel}: ${DETAILS.hours}.`,
    `${DETAILS.locationLabel}: ${DETAILS.location}.`,
    "A message reaches Savin only when the visitor sends it on WhatsApp or by email; the contact page lists both.",
  ].join(" "),
  path: "/contact",
  tags: ["contact", "email", "whatsapp", "phone", "hours", "reach", "talk", "message"],
  confidence: "canonical",
  source: "locales/en.json#contact.details",
});

add({
  id: "contact:request-audit",
  kind: "contact",
  title: en.contact.title,
  body: [
    en.contact.subtitle,
    `To request it, message ${DETAILS.phone} on WhatsApp or email ${DETAILS.email}.`,
    AFTER_ENQUIRY[0],
  ].join(" "),
  path: "/contact",
  tags: ["contact", "audit", "request", "start", "enquiry", "get started"],
  confidence: "canonical",
  source: "locales/en.json#contact + lib/offer.ts#AFTER_ENQUIRY",
});

add({
  id: "contact:enquiry-industries",
  kind: "contact",
  title: "Industries listed on the enquiry form",
  body: `${en.contact.form.industries.join(", ")}.`,
  path: "/contact",
  tags: ["industries", "sectors", "who", "serve"],
  confidence: "canonical",
  source: "locales/en.json#contact.form.industries",
});

add({
  id: "brand:savin-group",
  kind: "brand",
  title: BRAND.name,
  body: [
    BRAND.legalNote,
    `Website: ${BASE_URL}.`,
    EN_ABOUT.intro,
    ...EN_ABOUT.identityBody,
    `${EN_ABOUT.teamLabel}: ${EN_ABOUT.roles.join(", ")}.`,
  ].join(" "),
  path: "/about",
  tags: ["savin", "savin group", "about", "company", "who", "brand", "domain"],
  confidence: "canonical",
  source: "lib/constants.ts#BRAND + components/about/about-copy.ts#EN_ABOUT.identityBody",
});

add({
  id: "brand:site-pages",
  kind: "brand",
  title: "Main pages on the site",
  body: `${STATIC_PAGES.map((page) => `/${page}`).join(", ")}; industry pages live under /industries/{industry}.`,
  path: "",
  tags: ["pages", "navigation", "site", "sitemap"],
  confidence: "canonical",
  source: "lib/constants.ts#STATIC_PAGES",
});

/* --- Technology (listed tools, never partnerships) -------------------------- */

add({
  id: "tech:named-technologies",
  kind: "tech",
  title: "Technologies named in the site's copy",
  body: `${en.techStack.items.join(", ")}. Named as tools Savin builds with; this is not a claim of partnership, certification or reseller status.`,
  path: "/services",
  tags: ["technology", "tech stack", "tools", "stack", "frameworks"],
  confidence: "canonical",
  source: "locales/en.json#techStack.items",
});

add({
  id: "tech:layers",
  kind: "tech",
  title: EN_ABOUT.techTitle.join(" "),
  body: [
    EN_ABOUT.techIntro,
    ...EN_ABOUT.techLayers.map((layer, i) => `${layer.title} (${layer.purpose}): ${(EN_ABOUT.technologies[i] ?? []).join(", ")}.`),
    sentence(EN_ABOUT.techNote),
  ].join(" "),
  path: "/about",
  tags: ["technology", "architecture", "layers", "stack"],
  confidence: "canonical",
  source: "components/about/about-copy.ts#EN_ABOUT.techLayers",
});

add({
  id: "tech:ai-models",
  kind: "tech",
  title: "AI models named on the services page",
  body: `${sentence(SERVICES_EN.modelNote)} Listed as options chosen per task; this is not a claim of partnership with any model provider.`,
  path: "/services#ai-services-title",
  tags: ["ai", "models", "llm", "openai", "claude", "grok", "technology"],
  confidence: "canonical",
  source: "components/services/services-copy.ts#SERVICES_EN.modelNote",
});

/* --- Absence: what the site deliberately does not publish ------------------- */

if (TEAM.length === 0) {
  add({
    id: "absence:team",
    kind: "absence",
    title: "No named team members are published",
    body: `The site publishes no names, photos or biographies for anyone at Savin Group, including founders. The About page describes only the working model: ${EN_ABOUT.teamLabel.toLowerCase()} (${EN_ABOUT.roles.join(", ")}). Visitors who want to know who they would work with can ask through the contact channels.`,
    path: "/about",
    tags: ["team", "founder", "owner", "ceo", "people", "staff", "who", "names", "leadership", "employees"],
    confidence: "canonical",
    source: "lib/team.ts#TEAM",
  });
} else {
  add({
    id: "brand:team",
    kind: "brand",
    title: "The team",
    body: TEAM.map((member) => `${member.name}, ${member.role}: ${member.bio}`).join(" "),
    path: "/about",
    tags: ["team", "founder", "people", "who"],
    confidence: "canonical",
    source: "lib/team.ts#TEAM",
  });
}

if (SOCIAL_PROFILES.length === 0) {
  add({
    id: "absence:social",
    kind: "absence",
    title: "No social media profiles are published",
    body: "The site links to no LinkedIn, X, GitHub, Instagram or YouTube profile for Savin Group. The published channels are email and WhatsApp.",
    path: "/contact",
    tags: ["social", "linkedin", "instagram", "twitter", "youtube", "github", "profiles", "follow"],
    confidence: "canonical",
    source: "lib/constants.ts#SOCIAL_PROFILES",
  });
} else {
  add({
    id: "contact:social",
    kind: "contact",
    title: "Social profiles",
    body: SOCIAL_PROFILES.map((profile) => `${profile.platform}: ${profile.url}`).join("; "),
    path: "/contact",
    tags: ["social", "profiles", "follow"],
    confidence: "canonical",
    source: "lib/constants.ts#SOCIAL_PROFILES",
  });
}

add({
  id: "absence:address",
  kind: "absence",
  title: "No street or office address is published",
  body: `The site gives Savin Group's location only as "${DETAILS.location}". No verified street or office address and no company registration details are published beyond: ${BRAND.legalNote}`,
  path: "/contact",
  tags: ["address", "office", "location", "located", "visit", "headquarters", "where", "registered"],
  confidence: "canonical",
  source: "locales/en.json#contact.details.location",
});

add({
  id: "absence:scheduler",
  kind: "absence",
  title: "No online booking or scheduler",
  body: [
    `There is no calendar or booking system on the site. The button reads "${CTA_LABEL}" because the visitor sends a request and a person replies: ${AFTER_ENQUIRY[0]}`,
    "Nothing can be booked, reserved or confirmed through the site.",
    `To request the ${AUDIT.label}, the visitor messages ${DETAILS.phone} on WhatsApp or emails ${DETAILS.email}; the contact page lists both.`,
  ].join(" "),
  path: "/contact",
  tags: ["booking", "book", "schedule", "scheduler", "calendar", "appointment", "slot", "meeting", "call"],
  confidence: "canonical",
  source: "lib/offer.ts#CTA_LABEL",
});

add({
  id: "absence:credentials",
  kind: "absence",
  title: "No certifications, partnerships or awards are published",
  body: "The site publishes no verified certifications, compliance attestations, vendor partnerships, reseller status or awards for Savin Group. Technologies named on the site are tools it builds with, not partnerships.",
  path: "/about",
  tags: ["certification", "certified", "iso", "compliance", "partner", "partnership", "awards", "accreditation"],
  confidence: "canonical",
  source: "none published on the site (lib/constants.ts#BRAND is the only identity record)",
});

add({
  id: "absence:track-record",
  kind: "absence",
  title: "No verified ratings or client counts are published",
  body: `There are no verified client ratings, review scores, client counts, years in business, revenue-impact totals or average results for Savin Group. The only client results that can be cited are the ${en.caseStudies.items.length} anonymised case studies, each a reported outcome of one engagement and not a forecast.`,
  path: "/case-studies",
  tags: ["rating", "reviews", "testimonials", "clients", "how many", "track record", "experience", "years", "reputation"],
  confidence: "canonical",
  source: "components/case-studies/case-studies-copy.ts#CASE_STUDIES_EN.disclaimer",
});

add({
  id: "absence:currency",
  kind: "absence",
  title: "Prices are published in INR only",
  body: "Every published price is an Indian-rupee (INR) starting range. No prices in other currencies are published; a conversion is an estimate, not a Savin quote.",
  path: "/pricing",
  tags: ["currency", "usd", "dollars", "euro", "inr", "rupees", "pricing", "international"],
  confidence: "canonical",
  source: "locales/en.json#pricing.tiers",
});

/* -------------------------------------------------------------------------- */
/*                              Finalized records                             */
/* -------------------------------------------------------------------------- */

function finalize(record: KnowledgeRecord): KnowledgeRecord {
  const tags = Array.from(new Set(record.tags.map((tag) => clean(tag).toLowerCase()).filter(Boolean)));
  const out: KnowledgeRecord = {
    id: record.id,
    kind: record.kind,
    title: clean(record.title),
    body: clean(record.body),
    path: record.path,
    tags: Object.freeze(tags) as string[],
    confidence: record.confidence,
    source: record.source,
  };
  if (record.caveat) out.caveat = clean(record.caveat);
  return Object.freeze(out);
}

export const KNOWLEDGE_RECORDS: readonly KnowledgeRecord[] = Object.freeze(
  drafts.map(finalize).filter((record) => record.body.length > 0 && !isDenied(record)),
);

const BY_ID = new Map<string, KnowledgeRecord>();
for (const record of KNOWLEDGE_RECORDS) if (!BY_ID.has(record.id)) BY_ID.set(record.id, record);

export function getKnowledgeRecord(id: string): KnowledgeRecord | undefined {
  return BY_ID.get(id);
}

/* -------------------------------------------------------------------------- */
/*                                   Search                                   */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set(
  (
    "a an the and or but of to in on for with at by from into about as is are was were be been being it its " +
    "this that these those do does did doing how what which who whom when where why can could would should " +
    "will shall may might must we you your yours our ours us they them their i me my he she his her " +
    "much many any some have has had not no yes so if than then there here also just get got very really " +
    "please tell know want need like more most such only own same too"
  ).split(" "),
);

function undouble(word: string): string {
  return /([b-df-hj-km-np-rtv-z])\1$/.test(word) ? word.slice(0, -1) : word;
}

/**
 * Deliberately light stemming, applied identically to records and queries:
 * plurals, -ing, -ed, then y→i and a dropped final e so "price", "prices"
 * and "pricing" (and "industry"/"industries") meet on one stem.
 */
function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 4 && /(?:ss|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !/(?:ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) w = undouble(w.slice(0, -3));
  else if (w.length > 4 && w.endsWith("ed")) w = undouble(w.slice(0, -2));
  if (w.length > 3 && /[^aeiou]y$/.test(w)) w = `${w.slice(0, -1)}i`;
  if (w.length > 3 && w.endsWith("e")) w = w.slice(0, -1);
  return w;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(stem);
}

/**
 * Visitors describe operations in their own words; the site uses its product
 * names. Each key expands to the listed terms (plus itself) at reduced weight.
 */
const SYNONYM_SOURCE: Record<string, string> = {
  erp: "operateos operate tally inventory erp",
  tally: "tally erp operateos",
  price: "pricing investment price cost",
  pricing: "pricing investment price cost",
  cost: "pricing investment price cost",
  budget: "pricing investment price cost",
  fee: "pricing investment price cost",
  fees: "pricing investment price cost",
  quote: "pricing investment quote",
  expensive: "pricing investment price",
  cheap: "pricing investment price",
  afford: "pricing investment price",
  audit: "audit discovery",
  consultation: "audit discovery",
  consult: "audit discovery",
  call: "audit discovery call",
  meeting: "audit discovery meeting",
  whatsapp: "whatsapp",
  wa: "whatsapp",
  iot: "industrial iot",
  sensor: "industrial iot sensor",
  machine: "industrial iot machine",
  plc: "industrial iot",
  scada: "industrial iot",
  ai: "ai agent",
  agent: "ai agent",
  llm: "ai agent",
  gpt: "ai agent",
  chatgpt: "ai agent",
  claude: "ai agent",
  chatbot: "ai agent",
  stock: "inventory stock",
  warehouse: "inventory godown",
  crm: "autosell crm",
  leads: "autosell crm lead",
  lead: "autosell crm lead",
  website: "revsite website",
  site: "revsite website",
  case: "case",
  example: "case example",
  proof: "case proof",
  client: "case client",
  automate: "automation automate",
  excel: "spreadsheet excel",
  spreadsheet: "spreadsheet excel",
  ecommerce: "ecommerce d2c",
  d2c: "ecommerce d2c",
  founder: "team founder",
  book: "booking scheduler book",
  schedule: "booking scheduler",
};

const SYNONYM_WEIGHT = 0.5;

const SYNONYMS = new Map<string, string[]>();
for (const [word, expansion] of Object.entries(SYNONYM_SOURCE)) {
  for (const key of tokenize(word)) {
    const terms = new Set([...(SYNONYMS.get(key) ?? []), ...tokenize(expansion)]);
    SYNONYMS.set(key, Array.from(terms));
  }
}

/** Query terms with weights: 1 for words the visitor typed, less for expansions. */
function queryTerms(query: string): Map<string, number> {
  const terms = new Map<string, number>();
  for (const token of tokenize(query)) {
    terms.set(token, 1);
    for (const extra of SYNONYMS.get(token) ?? []) {
      if (!terms.has(extra)) terms.set(extra, SYNONYM_WEIGHT);
    }
  }
  return terms;
}

/** BM25F-style field weights: a title hit is worth two body hits. */
const FIELD_WEIGHT = { title: 2, tags: 1.5, body: 1 } as const;
const K1 = 1.2;
/** Softer length normalisation than the usual 0.75: industry records are long
 *  by design (audience + pains), and 0.75 let a short service card outrank the
 *  industry page for "manufacturing erp tally". */
const B = 0.5;
const MAX_QUERY_CHARS = 500;

interface IndexedRecord {
  record: KnowledgeRecord;
  tf: Map<string, number>;
  length: number;
}

const INDEX: readonly IndexedRecord[] = KNOWLEDGE_RECORDS.map((record) => {
  const tf = new Map<string, number>();
  let length = 0;
  const fields: Array<[string[], number]> = [
    [tokenize(record.title), FIELD_WEIGHT.title],
    [tokenize(record.tags.join(" ")), FIELD_WEIGHT.tags],
    [tokenize(record.body), FIELD_WEIGHT.body],
  ];
  for (const [tokens, weight] of fields) {
    length += tokens.length * weight;
    for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + weight);
  }
  return { record, tf, length };
});

const AVG_LENGTH = INDEX.reduce((sum, doc) => sum + doc.length, 0) / Math.max(INDEX.length, 1);

const DOC_FREQ = new Map<string, number>();
for (const doc of INDEX) for (const term of doc.tf.keys()) DOC_FREQ.set(term, (DOC_FREQ.get(term) ?? 0) + 1);

function idf(term: string): number {
  const df = DOC_FREQ.get(term) ?? 0;
  return Math.log(1 + (INDEX.length - df + 0.5) / (df + 0.5));
}

function scoreRecord(doc: IndexedRecord, terms: Map<string, number>): number {
  let score = 0;
  for (const [term, weight] of terms) {
    const tf = doc.tf.get(term);
    if (!tf) continue;
    const norm = tf + K1 * (1 - B + (B * doc.length) / AVG_LENGTH);
    score += weight * idf(term) * ((tf * (K1 + 1)) / norm);
  }
  return score;
}

function clampLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) return 5;
  return Math.min(8, Math.max(1, Math.floor(limit)));
}

/**
 * Deterministic ranked search. `kinds` narrows the candidates before scoring;
 * only records with a positive score are returned, best first, ties by id.
 */
export function searchKnowledge(
  query: string,
  opts?: { kinds?: KnowledgeKind[]; limit?: number },
): KnowledgeRecord[] {
  if (typeof query !== "string" || !query.trim()) return [];
  const terms = queryTerms(query.slice(0, MAX_QUERY_CHARS));
  if (terms.size === 0) return [];
  const kinds = opts?.kinds && opts.kinds.length > 0 ? new Set<KnowledgeKind>(opts.kinds) : null;

  const scored: Array<{ record: KnowledgeRecord; score: number }> = [];
  for (const doc of INDEX) {
    if (kinds && !kinds.has(doc.record.kind)) continue;
    const score = scoreRecord(doc, terms);
    if (score > 0) scored.push({ record: doc.record, score });
  }
  scored.sort((a, b) => b.score - a.score || (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0));
  return scored.slice(0, clampLimit(opts?.limit)).map((entry) => entry.record);
}

/* -------------------------------------------------------------------------- */
/*                               Links and sources                            */
/* -------------------------------------------------------------------------- */

const SEGMENT = /^[a-z]{2}$/;

/**
 * `/{country}/{locale}` + a record path. Anything that is not a two-letter
 * segment falls back to /in/en rather than producing a broken or foreign
 * href; the route has already validated both, so this is only a backstop.
 */
export function localizeHref(path: string, country: string, locale: string): string {
  const c = SEGMENT.test(country.toLowerCase()) ? country.toLowerCase() : "in";
  const l = SEGMENT.test(locale.toLowerCase()) ? locale.toLowerCase() : "en";
  const base = `/${c}/${l}`;
  if (!path || path === "/") return base;
  if (path.startsWith("#")) return base + path;
  if (path.startsWith("/#")) return base + path.slice(1);
  return path.startsWith("/") ? base + path : `${base}/${path}`;
}

export function toKnowledgeSource(record: KnowledgeRecord, country: string, locale: string): KnowledgeSource {
  const source: KnowledgeSource = {
    id: record.id,
    kind: record.kind,
    title: record.title,
    href: localizeHref(record.path, country, locale),
    confidence: record.confidence,
  };
  if (record.caveat) source.caveat = record.caveat;
  return source;
}

/* -------------------------------------------------------------------------- */
/*                                Contact + sheet                             */
/* -------------------------------------------------------------------------- */

export const CONTACT_CHANNELS: Readonly<{
  email: string;
  whatsappDigits: string;
  whatsappDisplay: string;
  hours: string;
}> = Object.freeze({
  email: DETAILS.email,
  whatsappDigits: DETAILS.phone.replace(/\D/g, ""),
  whatsappDisplay: DETAILS.phone,
  hours: DETAILS.hours,
});

/**
 * The system-prompt overview. Built from the same imports as the records and
 * free of clocks or randomness, so the prompt prefix stays byte-identical
 * between requests (and between deploys that do not touch the copy).
 */
function buildFactSheet(): string {
  const tiers = PRICING.tiers.map((tier) => {
    const systems = TIER_TO_SYSTEM[tier.name]?.systems.join(" + ");
    return `- ${tier.name}: ${tier.priceRange}${systems ? ` (${systems})` : ""}`;
  });
  const cases = en.caseStudies.items.map((item) => `- ${item.industry}, ${item.location}: ${item.title}`);
  return [
    `${BRAND.name.toUpperCase()}: VERIFIED FACT SHEET`,
    "Generated from the site's own copy. NOT PUBLISHED lists what the site deliberately leaves out.",
    "",
    "IDENTITY",
    `- ${BRAND.legalNote}`,
    `- ${EN_ABOUT.identityBody[0] ?? EN_ABOUT.intro}`,
    `- Location as published: ${DETAILS.location}.`,
    "",
    `WHAT SAVIN SAYS IT BUILDS (${SERVICES_EN.capabilities.length} capabilities)`,
    ...SERVICES_EN.capabilities.map((capability) => `- ${capability.name}: ${capability.build}`),
    `- Named service systems, each with a published INR range: ${en.services.items.map((item) => item.name).join(", ")} (search for details).`,
    "",
    "HOW AN ENGAGEMENT STARTS",
    `1. ${AUDIT.label} (canonical name: "${AUDIT.name}"). ${AFTER_ENQUIRY[1]} ${AFTER_ENQUIRY[2]}`,
    `2. Only if a build is worth scoping: the ${DISCOVERY.name}, a paid ${DISCOVERY.duration} working session, ${DISCOVERY.price}. ${DISCOVERY.note} It never replaces the free audit.`,
    `- There is no online scheduler; nothing can be booked. The button reads "${CTA_LABEL}". Visitors request the audit themselves on WhatsApp or by email, or from the contact page, which lists both. ${AFTER_ENQUIRY[0]}`,
    "- Older pages may still say 30 minutes or quote other discovery prices; the figures above are the reconciled offer.",
    "",
    "PRICING (published INR starting ranges; the final quote follows the free audit)",
    ...tiers,
    ...(TIER_TO_SYSTEM.Enterprise ? [`- Enterprise scope: ${TIER_TO_SYSTEM.Enterprise.note}`] : []),
    `- Entry points: a scoped site from ${ENTRY.site.display} (${ENTRY.site.tier}); a complete system from ${ENTRY.system.display} (${ENTRY.system.service}); retainers from ${ENTRY.retainer.display} per ${ENTRY.retainer.per}.`,
    "- No prices in other currencies are published.",
    "",
    `CASE STUDIES (${cases.length} anonymised client projects, reported outcomes; search for details)`,
    ...cases,
    `- ${CASE_STUDIES_EN.disclaimer}`,
    "",
    "NOT PUBLISHED (say so plainly; never guess)",
    ...(TEAM.length === 0 ? ["- Named team members, founders or biographies."] : []),
    ...(SOCIAL_PROFILES.length === 0 ? ["- Social media profiles."] : []),
    "- A street or office address.",
    "- Certifications, compliance attestations, partnerships or awards.",
    "- Verified ratings, review scores, client counts or aggregate results.",
    "",
    "CONTACT (the visitor sends the message; nothing is sent for them)",
    `- Email: ${CONTACT_CHANNELS.email}`,
    `- WhatsApp: ${CONTACT_CHANNELS.whatsappDisplay}`,
    `- Hours: ${CONTACT_CHANNELS.hours}`,
    "",
    "Anything not in this sheet must come from search_savin_knowledge; if it is not there either, say you do not have verified information.",
  ].join("\n");
}

export const OPERATOR_FACT_SHEET: string = buildFactSheet();
