// lib/operator/history.ts
//
// The client owns the transcript (sessionStorage) and resends it every turn,
// so everything here starts untrusted. Two jobs:
//
//   parseRequest   body → { locale, country, turns } with every limit from
//                  OPERATOR_LIMITS applied and every artifact re-validated.
//   fitHistory     turns → the most recent turns that fit the server's own
//                  budget for model input. Assistant turns arrive unverified
//                  and reach the model as its own words, so their total is
//                  capped here, not only by the client.
//   buildMessages  turns → the Messages API conversation, with page context
//                  (and, once, the opening line the panel showed) as
//                  mid-conversation system messages and earlier visuals
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
// The panel's own copy: the server quotes the opener exactly as the panel
// rendered it. Only fixed keys index it; nothing from the URL is quoted.
import { getOperatorCopy, openerKey } from "@/components/operator/operator-copy";
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
  /**
   * The first turn is the conversation's first message, so the opening line
   * the panel showed above it is quoted to Claude. From fitHistory; false
   * (the default) when earlier turns may have been dropped, where the first
   * turn left is not a reply to it.
   */
  fromStart?: boolean;
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
function pagePrefix(page: PageRef, ctx: HistoryContext): { country: string; locale: Locale } {
  const [first, second] = page.pathname.split(/[?#]/)[0]?.split("/").filter(Boolean) ?? [];
  return { country: resolveCountry(first) ?? ctx.country, locale: isLocale(second) ? second : ctx.locale };
}

export function pageContextText(page: PageRef, ctx: HistoryContext): string {
  const { country, locale } = pagePrefix(page, ctx);
  const { path, topic } = verifiedPage(page.pathname, `/${country}/${locale}`);
  return [
    `CURRENT_PAGE: ${path}`,
    `PAGE_TOPIC: ${topic}`,
    `SITE_LANGUAGE: ${locale}`,
    "Page awareness only — never claim to know who the visitor is or which company they are from.",
  ].join("\n");
}

/**
 * The panel opens every conversation with a page-specific question (e.g.
 * "how many times is the same patient information entered or checked by
 * hand?") that is UI only, never a turn. Without this line a first message
 * of "3 or 4 times" has no referent, and Claude, believing it has not opened
 * yet, asks its own opening question. Chosen exactly as the panel chooses it:
 * from the page and locale the conversation started on.
 */
export function openingShownText(page: PageRef, ctx: HistoryContext): string {
  const { locale } = pagePrefix(page, ctx);
  const opener = getOperatorCopy(locale).openers[openerKey(describePage(page.pathname))];
  return [
    `OPENING_SHOWN: ${opener}`,
    "The panel showed the visitor this question as your opening line, before their first message. You have already opened the conversation: respond to what they wrote rather than opening again.",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/*                              Artifact records                              */
/* -------------------------------------------------------------------------- */

const RECORD_MAX = 1500;
/** The X-Ray's record carries what a later audit brief is built from (see below). */
const XRAY_RECORD_MAX = 3000;

/** Cuts one item of a record, marking the cut. */
function clipItem(value: string, max: number): string {
  return value.length <= max ? value : `${clip(value, max - 1)}…`;
}

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
  let max = RECORD_MAX;
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
      // A later prepare_audit_brief is built from this record, not from the
      // X-Ray itself (only the artifact survives in history). Friction keeps
      // its stated/inferred tag so an inference never becomes "observed
      // friction" in a brief sent to Savin, and the open questions travel
      // with it into the brief's unknowns.
      const { xray } = artifact;
      label = "xray";
      title = xray.title;
      max = XRAY_RECORD_MAX;
      const parts: string[] = [];
      const section = (name: string, items: string[], separator: string) => {
        const text = `${name}: ${items.join(separator)}`;
        if (items.length) parts.push(/[.?!…]$/.test(text) ? text : `${text}.`);
      };
      section("Systems", xray.systems.map((system) => clipItem(system.name, 60)), ", ");
      section("Friction", xray.friction.map((item) => `[${item.evidence}] ${clipItem(item.issue, 110)}`), "; ");
      section("To verify", xray.verificationQuestions.map((question) => clipItem(question, 110)), "; ");
      const experiment = xray.firstExperiment;
      parts.push(
        `First experiment: ${clipItem(experiment.name, 80)} — ${clipItem(experiment.scope, 200)} (success measure: ${clipItem(experiment.successMeasure, 140)})`,
      );
      body = parts.join(" ");
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
  const room = max - head.length - 1;
  const fitted = body.length <= room ? body : `${clip(body, room - 1)}…`;
  return `${head}${fitted}]`;
}

function turnRecords(turn: ClientTurn): string[] {
  return turn.role === "assistant"
    ? turn.artifacts.map(artifactRecord).filter((record): record is string => record !== null)
    : [];
}

/* -------------------------------------------------------------------------- */
/*                                   Budget                                   */
/* -------------------------------------------------------------------------- */

/**
 * Most characters of history (turn text plus artifact records) sent to the
 * model. A real conversation of 20 exchanges with a visual every few turns
 * stays well under it. A forged one cannot use the body cap to send ~250 KB
 * of made-up "Operator" replies, which the model would read as its own words
 * and which would be billed as fresh input on every request.
 */
const HISTORY_CHAR_BUDGET = 48_000;

export interface FittedHistory {
  turns: ClientTurn[];
  /** For HistoryContext.fromStart. */
  fromStart: boolean;
}

/**
 * Trims `turns` to HISTORY_CHAR_BUDGET the way the client trims to the body
 * cap: first the records of the oldest assistant turns (their text still
 * carries the thread), then whole user+assistant pairs from the front, so
 * the conversation still starts with the visitor and alternates. Truncates,
 * never rejects: an honest client that hits the limit keeps working.
 *
 * `fromStart` is false when pairs were dropped here, and also when the
 * client may have dropped them: it cuts to the last maxTurns turns and then
 * drops a leading assistant turn, which always leaves maxTurns - 1.
 */
export function fitHistory(turns: ClientTurn[]): FittedHistory {
  const recordCost = (turn: ClientTurn) => turnRecords(turn).reduce((sum, record) => sum + record.length, 0);
  const cost = (turn: ClientTurn) => turn.text.length + recordCost(turn);
  let total = turns.reduce((sum, turn) => sum + cost(turn), 0);
  let fitted = turns.slice();

  for (let i = 0; total > HISTORY_CHAR_BUDGET && i < fitted.length; i++) {
    const turn = fitted[i];
    if (turn?.role !== "assistant" || !turn.artifacts.length) continue;
    total -= recordCost(turn);
    fitted[i] = { ...turn, artifacts: [] };
  }
  let dropped = 0;
  while (total > HISTORY_CHAR_BUDGET && fitted.length > 2) {
    total -= fitted.slice(0, 2).reduce((sum, turn) => sum + cost(turn), 0);
    fitted = fitted.slice(2);
    dropped += 2;
  }

  return { turns: fitted, fromStart: dropped === 0 && turns.length < OPERATOR_LIMITS.maxTurns - 1 };
}

/* -------------------------------------------------------------------------- */
/*                                  Messages                                  */
/* -------------------------------------------------------------------------- */

/**
 * Turns validated history into the `messages` array. A page-context system
 * message follows the first visitor turn and every later visitor turn whose
 * page context differs from the previous one; it always sits between a user
 * turn and an assistant turn (or at the end), where the API allows it. With
 * `ctx.fromStart`, the first one also quotes the opening line.
 */
export function buildMessages(turns: ClientTurn[], ctx: HistoryContext): BetaMessageParam[] {
  const messages: BetaMessageParam[] = [];
  let previousContext: string | undefined;

  for (const turn of turns) {
    if (turn.role === "user") {
      const first = messages.length === 0;
      messages.push({ role: "user", content: turn.text });
      const context = pageContextText(turn.page, ctx);
      if (first && ctx.fromStart) {
        messages.push({ role: "system", content: `${context}\n${openingShownText(turn.page, ctx)}` });
        previousContext = context;
      } else if (context !== previousContext) {
        messages.push({ role: "system", content: context });
        previousContext = context;
      }
      continue;
    }

    const blocks: BetaTextBlockParam[] = [];
    if (turn.text.trim()) blocks.push({ type: "text", text: turn.text });
    const records = turnRecords(turn);
    if (records.length) blocks.push({ type: "text", text: records.join("\n") });
    // The API rejects empty text blocks; an interrupted reply still needs a turn.
    if (!blocks.length) blocks.push({ type: "text", text: "(no reply)" });
    messages.push({ role: "assistant", content: blocks });
  }

  return messages;
}
