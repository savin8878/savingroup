// Wire contract between the Savin Operator panel (client) and
// POST /api/operator (server).
//
// Types plus a handful of constants only — no runtime imports — so both the
// browser bundle and the route handler can depend on it without dragging the
// knowledge index or the Anthropic SDK across the boundary.
//
// Naming: tool INPUTS (what Claude writes) are snake_case and live in
// src/lib/operator/tools.ts. Everything in this file is what the server
// emits AFTER validating and normalizing those inputs, so it is camelCase.

import type { Locale } from "@/lib/i18n";
import type { CapabilityId } from "@/components/services/services-copy";

export type { Locale, CapabilityId };

/** Root-absolute on purpose: a `/{country}/{locale}` prefix would route the
 *  request through the middleware as a page and 404. */
export const OPERATOR_ENDPOINT = "/api/operator";

/**
 * Hard ceilings the server enforces (and the client respects so it never
 * builds a request the server will reject). The route is public and every
 * turn is billed, so these are cost controls as much as sanity checks.
 */
export const OPERATOR_LIMITS = {
  /** Oldest turns beyond this are dropped by the client before sending. */
  maxTurns: 40,
  maxUserChars: 4000,
  /** Replies are meant to be ~150 words. Kept low because assistant turns
   *  come from the client unverified and reach the model as its own words. */
  maxAssistantChars: 4000,
  maxArtifactsPerTurn: 8,
  /** Whole JSON body, measured in bytes on the server. */
  maxBodyBytes: 256_000,
} as const;

/* -------------------------------------------------------------------------- */
/*                                   Pages                                    */
/* -------------------------------------------------------------------------- */

/** The page a visitor was on when they sent a message. Raw pathname,
 *  including the `/{country}/{locale}` prefix; the server re-derives the
 *  topic itself and never trusts a client-supplied label. */
export interface PageRef {
  pathname: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Knowledge                                  */
/* -------------------------------------------------------------------------- */

export type KnowledgeKind =
  | "offer"
  | "service_system"
  | "capability"
  | "case_study"
  | "industry"
  | "industry_faq"
  | "pricing_tier"
  | "process_step"
  | "principle"
  | "faq"
  | "contact"
  | "brand"
  | "tech"
  | "absence";

/**
 * How much weight a record can bear. Only these three exist because the
 * index is an allow-list: anything the site itself flags as illustrative,
 * placeholder or invented never becomes a record at all.
 *  - canonical         reconciled site fact (offer.ts, contact details, …)
 *  - published_range   a price range the site publishes; final quote differs
 *  - reported_outcome  anonymised client result; must carry its caveat
 */
export type KnowledgeConfidence = "canonical" | "published_range" | "reported_outcome";

/** A record as shown to the visitor (a "Sources" link), not the full body. */
export interface KnowledgeSource {
  id: string;
  kind: KnowledgeKind;
  title: string;
  /** Localized, root-absolute site path, e.g. `/in/en/pricing#plans`. */
  href: string;
  confidence: KnowledgeConfidence;
  caveat?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Workflow graphs                               */
/* -------------------------------------------------------------------------- */

export type GraphNodeKind =
  | "trigger"
  | "person"
  | "team"
  | "software"
  | "spreadsheet"
  | "messaging"
  | "data"
  | "machine"
  | "decision"
  | "ai"
  | "action"
  | "result";

/**
 * How work crosses an edge. The visual language is dash pattern, not hue
 * (colour-blind safe, matches About/Home diagrams): manual is dashed and
 * muted, automated/integration is solid accent.
 */
export type GraphEdgeMode =
  | "manual"
  | "automated"
  | "integration"
  | "ai_assisted"
  | "approval"
  | "physical";

export interface GraphNode {
  /** Unique within the graph; lowercase slug. */
  id: string;
  label: string;
  kind: GraphNodeKind;
  detail?: string;
  /** Present when this node is a point of friction. */
  friction?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  mode: GraphEdgeMode;
  label?: string;
  friction?: string;
}

export interface WorkflowGraph {
  title: string;
  /** `current` = how it works today; `proposed` = a possible connected state. */
  view: "current" | "proposed";
  summary?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* -------------------------------------------------------------------------- */
/*                                Simulations                                 */
/* -------------------------------------------------------------------------- */

export type SimActorKind = "person" | "system" | "ai" | "machine" | "external";

export type SimStepKind =
  | "event"
  | "check"
  | "decision"
  | "approval"
  | "action"
  | "alert"
  | "record";

export interface SimStep {
  label: string;
  actor: string;
  actorKind: SimActorKind;
  kind: SimStepKind;
  system?: string;
  detail?: string;
  /** Financial, contractual, production, safety-critical or destructive.
   *  The server rejects a simulation where such a step is not preceded by
   *  an `approval` step, and an `approval` step whose actorKind is not
   *  "person": the panel renders every approval as a human one. */
  consequential?: boolean;
  /** Illustrative sample values shown on the step's record card. */
  sample?: Array<{ key: string; value: string }>;
}

/** Always rendered under a SIMULATION label with a no-live-system disclaimer. */
export interface Simulation {
  title: string;
  scenario: string;
  steps: SimStep[];
  outcome: string;
}

/* -------------------------------------------------------------------------- */
/*                              Impact estimates                              */
/* -------------------------------------------------------------------------- */

/** Where a number came from. Estimates must say which inputs were assumed. */
export type ValueSource = "visitor" | "assumption";

/** The three numbers of an activity, each of which may be the visitor's or assumed. */
export type ImpactField = "people" | "minutesPerOccurrence" | "occurrences";

export interface ImpactActivity {
  label: string;
  people: number;
  minutesPerOccurrence: number;
  /** Occurrences per person per `per`. */
  occurrences: number;
  per: "day" | "week" | "month";
  /** The numbers the visitor did NOT state, in this field order. A visitor
   *  rarely gives all three, so each one is labelled on its own. */
  assumed: ImpactField[];
  /** Summary of `assumed`: "assumption" when any of the three was assumed. */
  source: ValueSource;
}

export interface ImpactInput {
  title: string;
  activities: ImpactActivity[];
  workingDaysPerMonth: { value: number; source: ValueSource };
  /** Share of the time a proposed change could remove, 0–100. */
  reductionPercent?: { value: number; source: ValueSource };
  hourlyCost?: { amount: number; currency: string; source: ValueSource };
}

/** Deterministic arithmetic over ImpactInput — computed by the server, never
 *  by the model — so the numbers on screen are always reproducible. */
export interface ImpactResult {
  input: ImpactInput;
  rows: Array<{ label: string; hoursPerMonth: number }>;
  totalHoursPerMonth: number;
  totalHoursPerYear: number;
  releasedHoursPerMonth?: number;
  monthlyCost?: { amount: number; currency: string };
  releasedMonthlyCost?: { amount: number; currency: string };
  /** English list of every assumed input, for the model. The panel builds
   *  its own localized list from the `assumed` / `source` flags in `input`.
   *  Rows are rounded to one decimal and every total is computed from the
   *  rounded rows, so the figures on the card add up. */
  assumptions: string[];
}

/* -------------------------------------------------------------------------- */
/*                               Business X-Ray                               */
/* -------------------------------------------------------------------------- */

/** `stated` = the visitor said it; `inferred` = the Operator's inference. */
export type Evidence = "stated" | "inferred";

/** Automation opportunity level, 0 (leave manual) … 6 (physical/digital). */
export type AutomationLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BusinessXRay {
  title: string;
  company: {
    industry?: string;
    size?: string;
    locations?: string;
    offering?: string;
  };
  currentWorkflow: string[];
  systems: Array<{ name: string; role: string }>;
  handoffs: string[];
  friction: Array<{ issue: string; evidence: Evidence }>;
  automationPoints: Array<{ point: string; level: AutomationLevel; approach: string }>;
  connectedArchitecture: string;
  verificationQuestions: string[];
  firstExperiment: { name: string; scope: string; successMeasure: string };
}

/* -------------------------------------------------------------------------- */
/*                                Audit brief                                 */
/* -------------------------------------------------------------------------- */

/**
 * The lead handoff. Nothing is transmitted by the server: the panel offers
 * copy / download / "open in WhatsApp" / "open in email", and the visitor
 * sends it themselves. `channels` is filled by the server from the site's
 * published contact details, never by the model.
 */
export interface AuditBrief {
  company?: string;
  /** Only details the visitor volunteered in the conversation. */
  contact?: { name?: string; email?: string; phone?: string; role?: string };
  industry: string;
  currentSystems: string[];
  currentWorkflow: string;
  primaryProblem: string;
  observedFriction: string[];
  desiredOutcome: string;
  potentialArchitecture: string;
  unknowns: string[];
  urgency?: string;
  relevantCapabilities: CapabilityId[];
  summary: string;
  channels: { whatsappDigits: string; email: string };
}

/* -------------------------------------------------------------------------- */
/*                                 Artifacts                                  */
/* -------------------------------------------------------------------------- */

/** A structured visual the panel renders inline. `id` is the tool_use id. */
export type Artifact =
  | { type: "graph"; id: string; graph: WorkflowGraph }
  | { type: "simulation"; id: string; simulation: Simulation }
  | { type: "impact"; id: string; impact: ImpactResult }
  | { type: "xray"; id: string; xray: BusinessXRay }
  | { type: "brief"; id: string; brief: AuditBrief }
  | { type: "sources"; id: string; query: string; sources: KnowledgeSource[] };

export type ArtifactType = Artifact["type"];

/* -------------------------------------------------------------------------- */
/*                               Stream events                                */
/* -------------------------------------------------------------------------- */

/** What the panel shows while no text is streaming. */
export type OperatorStatus =
  | "thinking"
  | "searching"
  | "calculating"
  | "mapping"
  | "simulating"
  | "drafting";

/**
 * `refusal`: the reply was declined, possibly after some text had streamed.
 * That partial must not be resent as an assistant turn (the client owns the
 * history). `truncated`: the reply was cut off before it finished, by
 * max_tokens or by the route's deadline; what already reached the visitor
 * stays valid.
 */
export type OperatorErrorCode =
  | "bad_request"
  | "too_large"
  | "forbidden"
  | "rate_limited"
  | "unavailable"
  | "overloaded"
  | "refusal"
  | "truncated"
  | "upstream"
  | "internal";

/**
 * One JSON object per line (NDJSON) on a 200 response. Errors that happen
 * before the stream opens are plain JSON `{ ok: false, error: OperatorErrorCode }`
 * with a 4xx/5xx status instead.
 */
export type OperatorEvent =
  | { type: "status"; status: OperatorStatus }
  | { type: "text"; delta: string }
  | { type: "artifact"; artifact: Artifact }
  | { type: "done" }
  | { type: "error"; code: OperatorErrorCode };

/* -------------------------------------------------------------------------- */
/*                                  Request                                   */
/* -------------------------------------------------------------------------- */

/**
 * The client owns the transcript (sessionStorage) and resends it each turn.
 * Everything in it is untrusted: the server re-validates every artifact with
 * the same validators it applies to tool input and drops what fails.
 */
export type ClientTurn =
  | { role: "user"; text: string; page: PageRef }
  | { role: "assistant"; text: string; artifacts: Artifact[] };

export interface OperatorRequest {
  locale: string;
  country: string;
  /** Alternates user/assistant, starts and ends with a user turn. */
  turns: ClientTurn[];
}
