// lib/operator/history.ts
//
// The client owns the transcript (sessionStorage) and resends it every turn,
// so everything here starts untrusted. Two jobs:
//
//   parseRequest   body → { locale, country, turns } with every limit from
//                  OPERATOR_LIMITS applied and every artifact re-validated.
//   buildMessages  turns → the Messages API conversation, with page context
//                  as mid-conversation system messages and earlier visuals
//                  folded into compact text records.
//
// buildMessages is deterministic on purpose: the same turns always produce
// byte-identical messages, so each new turn extends the previous request's
// prompt-cache prefix instead of invalidating it.
//
// Pure: `import type` only from the SDK.

import type { BetaMessageParam, BetaTextBlockParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { Locale } from "@/lib/i18n";
import { LOCALE_CODES } from "@/lib/i18n";
import { isResolvableCountry } from "@/lib/constants";
import { isIndustrySlug } from "@/lib/industry-data";
import { isValidCitySlug } from "@/lib/cities";
import type { Artifact, ClientTurn, PageRef } from "./protocol";
import { OPERATOR_LIMITS } from "./protocol";
import { describePage } from "./page-context";
import { isRecord, stripControlChars, validateArtifact } from "./validate";

export interface ParsedRequest {
  locale: Locale;
  country: string;
  turns: ClientTurn[];
}

export type ParseResult = { ok: true; value: ParsedRequest } | { ok: false; code: "bad_request" };

export interface HistoryContext {
  locale: Locale;
  country: string;
}

const DEFAULT_COUNTRY = "in";
const MAX_PATHNAME = 300;

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALE_CODES as readonly string[]).includes(value);
}

function resolveCountry(value: unknown): string | undefined {
  const code = typeof value === "string" ? value.trim().toLowerCase() : "";
  return code && isResolvableCountry(code) ? code : undefined;
}

/** Cuts to `max` UTF-16 units without leaving half a surrogate pair. */
function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  let cut = value.slice(0, max);
  const lastCode = cut.charCodeAt(cut.length - 1);
  if (lastCode >= 0xd800 && lastCode <= 0xdbff) cut = cut.slice(0, -1);
  return cut;
}

function readPage(value: unknown): PageRef {
  const pathname = isRecord(value) ? value.pathname : undefined;
  return typeof pathname === "string" && pathname.length <= MAX_PATHNAME && pathname.startsWith("/")
    ? { pathname }
    : { pathname: "/" };
}

/* -------------------------------------------------------------------------- */
/*                                   Parsing                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validates a POST /api/operator body. Structural problems (roles out of
 * order, an over-long or empty visitor message, too many turns) reject the
 * whole request — the client enforces the same limits, so only a buggy or
 * hostile client hits them. Content problems inside assistant turns are
 * repaired quietly: over-long text is truncated and invalid artifacts are
 * dropped.
 */
export function parseRequest(body: unknown): ParseResult {
  const bad = { ok: false, code: "bad_request" } as const;
  if (!isRecord(body)) return bad;

  const locale: Locale = isLocale(body.locale) ? body.locale : "en";
  const country = resolveCountry(body.country) ?? DEFAULT_COUNTRY;

  const raw = body.turns;
  // Alternating and starting with the visitor means an odd count ends with them too.
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > OPERATOR_LIMITS.maxTurns || raw.length % 2 === 0) {
    return bad;
  }

  const turns: ClientTurn[] = [];
  for (let i = 0; i < raw.length; i++) {
    const turn = raw[i];
    if (!isRecord(turn)) return bad;

    if (i % 2 === 0) {
      if (turn.role !== "user" || typeof turn.text !== "string") return bad;
      const text = stripControlChars(turn.text);
      if (!text || text.length > OPERATOR_LIMITS.maxUserChars) return bad;
      turns.push({ role: "user", text, page: readPage(turn.page) });
      continue;
    }

    if (turn.role !== "assistant") return bad;
    const text = typeof turn.text === "string" ? clip(stripControlChars(turn.text), OPERATOR_LIMITS.maxAssistantChars) : "";
    const artifacts: Artifact[] = [];
    if (Array.isArray(turn.artifacts)) {
      for (const candidate of turn.artifacts.slice(0, OPERATOR_LIMITS.maxArtifactsPerTurn)) {
        const artifact = validateArtifact(candidate, { country, locale });
        if (artifact) artifacts.push(artifact);
      }
    }
    turns.push({ role: "assistant", text, artifacts });
  }

  return { ok: true, value: { locale, country, turns } };
}

/* -------------------------------------------------------------------------- */
/*                                Page context                                */
/* -------------------------------------------------------------------------- */

const CITY_SUB_PAGES = new Set(["about", "services", "process", "case-studies", "contact", "blog"]);

const SECTION_LABELS: Record<string, string> = {
  services: "Services overview",
  industries: "Industries overview",
  "case-studies": "Case studies",
  pricing: "Pricing",
  about: "About Savin Group",
  contact: "Contact page",
  cities: "Cities overview",
  blogs: "Blog",
  newsroom: "Newsroom",
  privacy: "Privacy policy",
  terms: "Terms of service",
};

/**
 * CURRENT_PAGE and PAGE_TOPIC are rebuilt ONLY from parts the server can
 * verify (a known section, an industry or city slug that exists). The
 * pathname is visitor-controlled, and these lines are sent with system
 * authority, so free text from the URL — a blog slug, an unknown segment —
 * never reaches them.
 */
function verifiedPage(pathname: string, prefix: string): { path: string; topic: string } {
  const page = describePage(pathname);
  const section = page.rest.split("/")[0] ?? "";
  switch (page.topic) {
    case "home":
      return { path: prefix, topic: "Home page" };
    case "industry":
      return page.slug && isIndustrySlug(page.slug)
        ? { path: `${prefix}/industries/${page.slug}`, topic: `Industry page: ${page.slug}` }
        : { path: `${prefix}/industries`, topic: SECTION_LABELS.industries };
    case "city": {
      if (!page.slug || !isValidCitySlug(page.slug)) return { path: `${prefix}/cities`, topic: SECTION_LABELS.cities };
      const sub = page.subPage && CITY_SUB_PAGES.has(page.subPage) ? page.subPage : undefined;
      return {
        path: `${prefix}/cities/${page.slug}${sub ? `/${sub}` : ""}`,
        topic: `City page: ${page.slug}${sub ? ` (${sub})` : ""}`,
      };
    }
    case "blog":
      return { path: `${prefix}/blogs`, topic: page.slug ? "Blog article" : SECTION_LABELS.blogs };
    case "other":
      return { path: "(not one of the site's main pages)", topic: "Other page" };
    default: {
      const label = SECTION_LABELS[section];
      return label ? { path: `${prefix}/${section}`, topic: label } : { path: prefix, topic: "Other page" };
    }
  }
}

/**
 * The system message that tells Claude where the visitor is. Country and
 * language come from the page's own `/{country}/{locale}` prefix when valid
 * (so an earlier turn's message never changes when the visitor later
 * switches language), else from the request.
 */
export function pageContextText(page: PageRef, ctx: HistoryContext): string {
  const [first, second] = page.pathname.split(/[?#]/)[0]?.split("/").filter(Boolean) ?? [];
  const country = resolveCountry(first) ?? ctx.country;
  const locale = isLocale(second) ? second : ctx.locale;
  const { path, topic } = verifiedPage(page.pathname, `/${country}/${locale}`);
  return [
    `CURRENT_PAGE: ${path}`,
    `PAGE_TOPIC: ${topic}`,
    `SITE_LANGUAGE: ${locale}`,
    "Page awareness only — never claim to know who the visitor is or which company they are from.",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/*                              Artifact records                              */
/* -------------------------------------------------------------------------- */

const RECORD_MAX = 1500;

function formatAmount(money: { amount: number; currency: string }): string {
  return `${money.currency} ${money.amount}`;
}

/**
 * A compact text record of a visual Claude rendered in an earlier turn. The
 * client only resends validated artifacts, not the original tool calls, so
 * this is how Claude remembers what the visitor has already seen. Sources
 * are not recorded: the facts they point to are in the reply text itself.
 */
function artifactRecord(artifact: Artifact): string | null {
  let label: string;
  let title: string;
  let body: string;
  switch (artifact.type) {
    case "graph": {
      const { graph } = artifact;
      label = `graph (${graph.view})`;
      title = graph.title;
      const nodes = graph.nodes
        .map((node) => `${node.id} "${node.label}" (${node.kind}${node.friction ? `; friction: ${node.friction}` : ""})`)
        .join("; ");
      const edges = graph.edges
        .map((edge) => `${edge.from}→${edge.to} ${edge.mode}${edge.label ? ` "${edge.label}"` : ""}`)
        .join("; ");
      body = `Nodes: ${nodes}. Edges: ${edges}.`;
      break;
    }
    case "simulation": {
      const { simulation } = artifact;
      label = "simulation";
      title = simulation.title;
      body = `Steps: ${simulation.steps.map((step, i) => `${i + 1}. ${step.label}`).join("; ")}. Outcome: ${simulation.outcome}`;
      break;
    }
    case "impact": {
      const { impact } = artifact;
      label = "impact estimate";
      title = impact.input.title;
      const parts = [`Total ${impact.totalHoursPerMonth} staff-hours/month (${impact.totalHoursPerYear}/year)`];
      if (impact.releasedHoursPerMonth !== undefined) parts.push(`could release ${impact.releasedHoursPerMonth} h/month`);
      if (impact.monthlyCost) parts.push(`cost ${formatAmount(impact.monthlyCost)}/month`);
      if (impact.releasedMonthlyCost) parts.push(`released cost ${formatAmount(impact.releasedMonthlyCost)}/month`);
      body = `${parts.join("; ")}. Assumptions: ${impact.assumptions.length ? impact.assumptions.join("; ") : "none"}.`;
      break;
    }
    case "xray": {
      const { xray } = artifact;
      label = "xray";
      title = xray.title;
      const experiment = xray.firstExperiment;
      body = `First experiment: ${experiment.name} — ${experiment.scope} (success measure: ${experiment.successMeasure})`;
      break;
    }
    case "brief": {
      const { brief } = artifact;
      label = "brief";
      title = brief.company ? `Audit brief for ${brief.company}` : `Audit brief (${brief.industry})`;
      body = `Primary problem: ${brief.primaryProblem}. Prepared for the visitor to send themselves; nothing was sent.`;
      break;
    }
    case "sources":
      return null;
  }
  const head = `[Visual rendered earlier in this conversation — ${label}: ${title}. `;
  const room = RECORD_MAX - head.length - 1;
  const fitted = body.length <= room ? body : `${clip(body, room - 1)}…`;
  return `${head}${fitted}]`;
}

/* -------------------------------------------------------------------------- */
/*                                  Messages                                  */
/* -------------------------------------------------------------------------- */

/**
 * Turns validated history into the `messages` array. A page-context system
 * message follows the first visitor turn and every later visitor turn whose
 * page context differs from the previous one; it always sits between a user
 * turn and an assistant turn (or at the end), where the API allows it.
 */
export function buildMessages(turns: ClientTurn[], ctx: HistoryContext): BetaMessageParam[] {
  const messages: BetaMessageParam[] = [];
  let previousContext: string | undefined;

  for (const turn of turns) {
    if (turn.role === "user") {
      messages.push({ role: "user", content: turn.text });
      const context = pageContextText(turn.page, ctx);
      if (context !== previousContext) {
        messages.push({ role: "system", content: context });
        previousContext = context;
      }
      continue;
    }

    const blocks: BetaTextBlockParam[] = [];
    if (turn.text.trim()) blocks.push({ type: "text", text: turn.text });
    const records = turn.artifacts.map(artifactRecord).filter((record): record is string => record !== null);
    if (records.length) blocks.push({ type: "text", text: records.join("\n") });
    // The API rejects empty text blocks; an interrupted reply still needs a turn.
    if (!blocks.length) blocks.push({ type: "text", text: "(no reply)" });
    messages.push({ role: "assistant", content: blocks });
  }

  return messages;
}
