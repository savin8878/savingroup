// lib/operator/validate.ts
//
// Turns untrusted input into protocol types. Two callers, one set of rules:
//
//   - Tool input from Claude (snake_case). With `eager_input_streaming` the
//     API no longer validates tool parameters, and the SDK's tolerant parser
//     can hand back a silently truncated object, so nothing is rendered or
//     computed until it passes here. A failure returns a message ADDRESSED TO
//     THE MODEL saying exactly what to fix; the route sends it back as an
//     `is_error` tool_result and Claude retries.
//   - Artifacts inside client-held history (camelCase protocol shapes). The
//     transcript lives in the visitor's sessionStorage, so every artifact is
//     re-validated with the same limits, impact numbers are recomputed, brief
//     channels are overwritten and sources are rebuilt from the index.
//     Anything that fails is dropped, never repaired into something the
//     Operator did not say.
//
// Policy on over-long text: short fields that must fit a layout (titles,
// labels, ids, actors) are REJECTED so the model rewrites them; long prose
// fields (details, summaries, X-Ray and brief text) are TRUNCATED, because a
// paragraph a little over the cap is not worth a billed round-trip.
//
// Pure: validators throw a private InputError internally and convert it to a
// result at their boundary; no SDK, React or next/* imports.

import type {
  Artifact,
  AuditBrief,
  AutomationLevel,
  BusinessXRay,
  CapabilityId,
  Evidence,
  GraphEdge,
  GraphEdgeMode,
  GraphNode,
  GraphNodeKind,
  ImpactActivity,
  ImpactInput,
  KnowledgeKind,
  KnowledgeSource,
  SimActorKind,
  SimStep,
  SimStepKind,
  Simulation,
  ValueSource,
  WorkflowGraph,
} from "./protocol";
import { computeImpact } from "./impact";
import { CONTACT_CHANNELS, getKnowledgeRecord, toKnowledgeSource } from "./knowledge";

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

/* -------------------------------------------------------------------------- */
/*                              Enums and limits                              */
/* -------------------------------------------------------------------------- */

// Runtime copies of the protocol's string unions. `satisfies` would be nicer
// but the explicit annotation keeps a missing member a compile error too.
export const GRAPH_NODE_KINDS: readonly GraphNodeKind[] = [
  "trigger", "person", "team", "software", "spreadsheet", "messaging",
  "data", "machine", "decision", "ai", "action", "result",
];
export const GRAPH_EDGE_MODES: readonly GraphEdgeMode[] = [
  "manual", "automated", "integration", "ai_assisted", "approval", "physical",
];
export const SIM_ACTOR_KINDS: readonly SimActorKind[] = ["person", "system", "ai", "machine", "external"];
export const SIM_STEP_KINDS: readonly SimStepKind[] = [
  "event", "check", "decision", "approval", "action", "alert", "record",
];
export const VALUE_SOURCES: readonly ValueSource[] = ["visitor", "assumption"];
export const EVIDENCE_KINDS: readonly Evidence[] = ["stated", "inferred"];
export const CAPABILITY_IDS: readonly CapabilityId[] = [
  "ai", "automation", "erp", "industrial", "software", "integrations", "data", "platforms",
];
export const KNOWLEDGE_KINDS: readonly KnowledgeKind[] = [
  "offer", "service_system", "capability", "case_study", "industry", "industry_faq",
  "pricing_tier", "process_step", "principle", "faq", "contact", "brand", "tech", "absence",
];

/**
 * Every ceiling the validators enforce. `tools.ts` reads the same numbers
 * into the JSON Schemas it sends, so the model is told the limits up front
 * and the two can never drift apart.
 */
export const INPUT_LIMITS = {
  title: 90,
  search: { query: 200, defaultLimit: 5, maxLimit: 8 },
  graph: {
    minNodes: 2, maxNodes: 16, minEdges: 1, maxEdges: 24,
    nodeLabel: 60, nodeText: 160, edgeLabel: 40, summary: 300,
  },
  simulation: {
    minSteps: 2, maxSteps: 14, label: 80, actor: 40, system: 40, detail: 200,
    scenario: 300, outcome: 300, maxSample: 6, sampleKey: 24, sampleValue: 60,
  },
  impact: {
    maxActivities: 8, label: 80,
    people: { min: 1, max: 100_000 },
    minutes: { min: 0.1, max: 1440 },
    occurrences: { min: 0.01, max: 1000 },
    workingDays: { min: 1, max: 31, fallback: 22 },
    reduction: { min: 0, max: 100 },
    hourlyCost: { max: 1_000_000 },
    currency: 5,
  },
  xray: { maxItems: 12, text: 400 },
  brief: {
    maxItems: 12, item: 200, short: 120, prose: 600, summary: 1000,
    contactName: 80, email: 254, phone: 24, urgency: 200,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                                   Guards                                   */
/* -------------------------------------------------------------------------- */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `null` counts as absent: tolerant parsers and JSON clients both produce it. */
function isAbsent(value: unknown): boolean {
  return value === undefined || value === null;
}

/** Private: only ever thrown and caught inside this module. */
class InputError extends Error {}

function fail(message: string): never {
  throw new InputError(message);
}

function run<T>(build: () => T): Validation<T> {
  try {
    return { ok: true, value: build() };
  } catch (err) {
    if (err instanceof InputError) return { ok: false, error: err.message };
    throw err;
  }
}

/** Which spelling the input uses: tool input (snake_case) or wire (camelCase). */
type Style = "tool" | "wire";

/** Reads `snake` from tool input or `camel` from a wire artifact; returns the value and its name for messages. */
function field(record: Record<string, unknown>, style: Style, snake: string, camel: string): [unknown, string] {
  const key = style === "tool" ? snake : camel;
  return [record[key], key];
}

/* -------------------------------------------------------------------------- */
/*                                   Readers                                  */
/* -------------------------------------------------------------------------- */

// C0 controls except \t and \n, plus DEL. \r is normalized away first.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normalizes line endings and removes control characters, keeping \n and \t
 * and every other character as typed (pasted spreadsheet rows keep their
 * tabs). Trimmed.
 */
export function stripControlChars(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "").trim();
}

/** Strips control characters and normalizes whitespace; `multiline` keeps paragraph breaks. */
export function sanitizeText(value: string, multiline = false): string {
  const stripped = stripControlChars(value);
  if (!multiline) return stripped.replace(/\s+/g, " ").trim();
  return stripped
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Cuts at a word boundary when one is reasonably close, and never splits a surrogate pair. */
function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  let cut = value.slice(0, max - 1);
  const lastCode = cut.charCodeAt(cut.length - 1);
  if (lastCode >= 0xd800 && lastCode <= 0xdbff) cut = cut.slice(0, -1);
  const space = cut.lastIndexOf(" ");
  if (space > max * 0.6) cut = cut.slice(0, space);
  return cut.trimEnd() + "…";
}

interface TextRule {
  max: number;
  optional?: boolean;
  /** Prose: cut to fit instead of rejecting. */
  truncate?: boolean;
  multiline?: boolean;
}

function readText(value: unknown, path: string, rule: TextRule & { optional: true }): string | undefined;
function readText(value: unknown, path: string, rule: TextRule): string;
function readText(value: unknown, path: string, rule: TextRule): string | undefined {
  const text =
    typeof value === "string" ? sanitizeText(value, rule.multiline)
    : typeof value === "number" && Number.isFinite(value) ? String(value)
    : isAbsent(value) ? ""
    : fail(`${path} must be a string.`);
  if (!text) {
    if (rule.optional) return undefined;
    fail(`${path} is required: a non-empty string of at most ${rule.max} characters.`);
  }
  if (text.length <= rule.max) return text;
  if (rule.truncate) return truncate(text, rule.max);
  fail(`${path} is ${text.length} characters long; shorten it to at most ${rule.max}.`);
}

const NUMERIC = /^-?\d+(?:\.\d+)?$/;

interface NumberRule {
  min: number;
  max: number;
  integer?: boolean;
  /** Strictly greater than `min`. */
  exclusiveMin?: boolean;
}

function readNumber(value: unknown, path: string, rule: NumberRule): number {
  const range = `${rule.exclusiveMin ? "greater than" : "from"} ${rule.min} ${rule.exclusiveMin ? "and at most" : "to"} ${rule.max}`;
  if (isAbsent(value)) fail(`${path} is required: a number ${range}.`);
  // Eager input streaming infers types on the fly, so "5" can arrive as a string.
  const n =
    typeof value === "number" ? value
    : typeof value === "string" && NUMERIC.test(value.trim()) ? Number(value.trim())
    : NaN;
  if (!Number.isFinite(n)) fail(`${path} must be a number ${range}.`);
  if (rule.integer && !Number.isInteger(n)) fail(`${path} must be a whole number ${range}.`);
  const tooLow = rule.exclusiveMin ? n <= rule.min : n < rule.min;
  if (tooLow || n > rule.max) fail(`${path} is ${n}; it must be ${range}.`);
  return n;
}

function readEnum<T extends string>(value: unknown, path: string, allowed: readonly T[]): T {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : value;
  if (typeof candidate === "string" && (allowed as readonly string[]).includes(candidate)) {
    return candidate as T;
  }
  fail(`${path} must be one of: ${allowed.join(", ")}.`);
}

function readBoolean(value: unknown, path: string): boolean | undefined {
  if (isAbsent(value)) return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  fail(`${path} must be true or false.`);
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
  if (isRecord(value)) return value;
  fail(path === "input" ? "The tool input must be a JSON object." : `${path} must be an object.`);
}

interface ListRule {
  min: number;
  max: number;
  /** Drop items past `max` instead of rejecting (prose lists). */
  truncate?: boolean;
}

function readList(value: unknown, path: string, rule: ListRule): unknown[] {
  if (isAbsent(value)) {
    if (rule.min === 0) return [];
    fail(`${path} is required: a list of ${rule.min} to ${rule.max} items.`);
  }
  if (!Array.isArray(value)) fail(`${path} must be a list.`);
  if (value.length < rule.min) fail(`${path} has ${value.length} item(s); it needs at least ${rule.min}.`);
  if (value.length > rule.max) {
    if (rule.truncate) return value.slice(0, rule.max);
    fail(`${path} has ${value.length} items; the maximum is ${rule.max}. Merge or drop the least important ones.`);
  }
  return value;
}

/** A list of prose strings: blanks dropped, each item truncated, extras cut. */
function readTextList(value: unknown, path: string, maxItems: number, maxLength: number, min = 0): string[] {
  const items = readList(value, path, { min: 0, max: maxItems, truncate: true })
    .map((item, index) => readText(item, `${path}[${index}]`, { max: maxLength, optional: true, truncate: true }))
    .filter((item): item is string => item !== undefined);
  if (items.length < min) fail(`${path} needs at least ${min} non-empty item(s).`);
  return items;
}

const NODE_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/;

function readNodeId(value: unknown, path: string): string {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (NODE_ID.test(id)) return id;
  fail(
    `${path} must be a short lowercase id (a-z, 0-9, "_" or "-", at most 32 characters, starting with a letter or digit), e.g. "order_desk".`,
  );
}

function readSource(value: unknown, path: string): ValueSource {
  return readEnum(value, path, VALUE_SOURCES);
}

/* -------------------------------------------------------------------------- */
/*                               Workflow graph                               */
/* -------------------------------------------------------------------------- */

// Graph field names are identical in tool input and on the wire.
function graphFrom(raw: unknown): WorkflowGraph {
  const L = INPUT_LIMITS.graph;
  const input = readRecord(raw, "input");
  const graph: WorkflowGraph = {
    title: readText(input.title, "title", { max: INPUT_LIMITS.title }),
    view: readEnum(input.view, "view", ["current", "proposed"] as const),
    nodes: [],
    edges: [],
  };
  const summary = readText(input.summary, "summary", { max: L.summary, optional: true, truncate: true });
  if (summary) graph.summary = summary;

  const ids = new Set<string>();
  readList(input.nodes, "nodes", { min: L.minNodes, max: L.maxNodes }).forEach((rawNode, i) => {
    const path = `nodes[${i}]`;
    const node = readRecord(rawNode, path);
    const id = readNodeId(node.id, `${path}.id`);
    if (ids.has(id)) fail(`${path}.id "${id}" is used by another node; every node id must be unique.`);
    ids.add(id);
    const out: GraphNode = {
      id,
      label: readText(node.label, `${path}.label`, { max: L.nodeLabel }),
      kind: readEnum(node.kind, `${path}.kind`, GRAPH_NODE_KINDS),
    };
    const detail = readText(node.detail, `${path}.detail`, { max: L.nodeText, optional: true, truncate: true });
    if (detail) out.detail = detail;
    const friction = readText(node.friction, `${path}.friction`, { max: L.nodeText, optional: true, truncate: true });
    if (friction) out.friction = friction;
    graph.nodes.push(out);
  });

  const pairs = new Set<string>();
  const known = () => Array.from(ids).join(", ");
  readList(input.edges, "edges", { min: L.minEdges, max: L.maxEdges }).forEach((rawEdge, i) => {
    const path = `edges[${i}]`;
    const edge = readRecord(rawEdge, path);
    const from = readNodeId(edge.from, `${path}.from`);
    const to = readNodeId(edge.to, `${path}.to`);
    if (!ids.has(from)) fail(`${path}.from "${from}" is not a node id. Use one of: ${known()}.`);
    if (!ids.has(to)) fail(`${path}.to "${to}" is not a node id. Use one of: ${known()}.`);
    if (from === to) fail(`${path} connects "${from}" to itself; remove it or point it at a different node.`);
    const pair = `${from}\u0000${to}`;
    if (pairs.has(pair)) {
      fail(`${path} repeats the edge ${from} → ${to}; keep one edge per pair and put extra detail in its label.`);
    }
    pairs.add(pair);
    const out: GraphEdge = { from, to, mode: readEnum(edge.mode, `${path}.mode`, GRAPH_EDGE_MODES) };
    const label = readText(edge.label, `${path}.label`, { max: L.edgeLabel, optional: true });
    if (label) out.label = label;
    const friction = readText(edge.friction, `${path}.friction`, { max: L.nodeText, optional: true, truncate: true });
    if (friction) out.friction = friction;
    graph.edges.push(out);
  });

  return graph;
}

/* -------------------------------------------------------------------------- */
/*                                 Simulation                                 */
/* -------------------------------------------------------------------------- */

function simulationFrom(raw: unknown, style: Style): Simulation {
  const L = INPUT_LIMITS.simulation;
  const input = readRecord(raw, "input");
  const simulation: Simulation = {
    title: readText(input.title, "title", { max: INPUT_LIMITS.title }),
    scenario: readText(input.scenario, "scenario", { max: L.scenario, truncate: true }),
    steps: [],
    outcome: "",
  };

  let approvalSeen = false;
  readList(input.steps, "steps", { min: L.minSteps, max: L.maxSteps }).forEach((rawStep, i) => {
    const path = `steps[${i}]`;
    const step = readRecord(rawStep, path);
    const [actorKind, actorKindKey] = field(step, style, "actor_kind", "actorKind");
    const out: SimStep = {
      label: readText(step.label, `${path}.label`, { max: L.label }),
      actor: readText(step.actor, `${path}.actor`, { max: L.actor }),
      actorKind: readEnum(actorKind, `${path}.${actorKindKey}`, SIM_ACTOR_KINDS),
      kind: readEnum(step.kind, `${path}.kind`, SIM_STEP_KINDS),
    };
    const system = readText(step.system, `${path}.system`, { max: L.system, optional: true });
    if (system) out.system = system;
    const detail = readText(step.detail, `${path}.detail`, { max: L.detail, optional: true, truncate: true });
    if (detail) out.detail = detail;

    // The persona's hard rule, enforced rather than requested: nothing
    // financial, contractual, production, safety-critical or destructive
    // happens in a simulation without a human approval before it.
    const consequential = readBoolean(step.consequential, `${path}.consequential`);
    if (consequential) {
      if (!approvalSeen) fail(`Step ${i + 1} is consequential; add a human approval step before it.`);
      out.consequential = true;
    }
    if (out.kind === "approval") approvalSeen = true;

    const sample = readList(step.sample, `${path}.sample`, { min: 0, max: L.maxSample, truncate: true }).map(
      (rawEntry, j) => {
        const entry = readRecord(rawEntry, `${path}.sample[${j}]`);
        return {
          key: readText(entry.key, `${path}.sample[${j}].key`, { max: L.sampleKey }),
          value: readText(entry.value, `${path}.sample[${j}].value`, { max: L.sampleValue, truncate: true }),
        };
      },
    );
    if (sample.length) out.sample = sample;
    simulation.steps.push(out);
  });

  simulation.outcome = readText(input.outcome, "outcome", { max: L.outcome, truncate: true });
  return simulation;
}

/* -------------------------------------------------------------------------- */
/*                                   Impact                                   */
/* -------------------------------------------------------------------------- */

function impactFrom(raw: unknown, style: Style): ImpactInput {
  const L = INPUT_LIMITS.impact;
  const input = readRecord(raw, "input");
  const activities: ImpactActivity[] = readList(input.activities, "activities", {
    min: 1,
    max: L.maxActivities,
  }).map((rawActivity, i) => {
    const path = `activities[${i}]`;
    const activity = readRecord(rawActivity, path);
    const [minutes, minutesKey] = field(activity, style, "minutes_per_occurrence", "minutesPerOccurrence");
    return {
      label: readText(activity.label, `${path}.label`, { max: L.label }),
      people: readNumber(activity.people, `${path}.people`, L.people),
      minutesPerOccurrence: readNumber(minutes, `${path}.${minutesKey}`, L.minutes),
      occurrences: readNumber(activity.occurrences, `${path}.occurrences`, L.occurrences),
      per: readEnum(activity.per, `${path}.per`, ["day", "week", "month"] as const),
      source: readSource(activity.source, `${path}.source`),
    };
  });

  const [days, daysKey] = field(input, style, "working_days_per_month", "workingDaysPerMonth");
  let workingDaysPerMonth: ImpactInput["workingDaysPerMonth"] = {
    value: L.workingDays.fallback,
    source: "assumption",
  };
  if (!isAbsent(days)) {
    const record = readRecord(days, daysKey);
    workingDaysPerMonth = {
      value: readNumber(record.value, `${daysKey}.value`, L.workingDays),
      source: readSource(record.source, `${daysKey}.source`),
    };
  }

  const result: ImpactInput = {
    title: readText(input.title, "title", { max: INPUT_LIMITS.title }),
    activities,
    workingDaysPerMonth,
  };

  const [reduction, reductionKey] = field(input, style, "reduction_percent", "reductionPercent");
  if (!isAbsent(reduction)) {
    const record = readRecord(reduction, reductionKey);
    result.reductionPercent = {
      value: readNumber(record.value, `${reductionKey}.value`, L.reduction),
      source: readSource(record.source, `${reductionKey}.source`),
    };
  }

  const [cost, costKey] = field(input, style, "hourly_cost", "hourlyCost");
  if (!isAbsent(cost)) {
    const record = readRecord(cost, costKey);
    result.hourlyCost = {
      amount: readNumber(record.amount, `${costKey}.amount`, { min: 0, max: L.hourlyCost.max, exclusiveMin: true }),
      currency: readText(record.currency, `${costKey}.currency`, { max: L.currency }).toUpperCase(),
      source: readSource(record.source, `${costKey}.source`),
    };
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                               Business X-Ray                               */
/* -------------------------------------------------------------------------- */

function xrayFrom(raw: unknown, style: Style): BusinessXRay {
  const { maxItems, text: max } = INPUT_LIMITS.xray;
  const prose = { max, truncate: true } as const;
  const input = readRecord(raw, "input");

  const company: BusinessXRay["company"] = {};
  if (!isAbsent(input.company)) {
    const record = readRecord(input.company, "company");
    for (const key of ["industry", "size", "locations", "offering"] as const) {
      const value = readText(record[key], `company.${key}`, { ...prose, optional: true });
      if (value) company[key] = value;
    }
  }

  const [workflow, workflowKey] = field(input, style, "current_workflow", "currentWorkflow");
  const [points, pointsKey] = field(input, style, "automation_points", "automationPoints");
  const [architecture, architectureKey] = field(input, style, "connected_architecture", "connectedArchitecture");
  const [questions, questionsKey] = field(input, style, "verification_questions", "verificationQuestions");
  const [experiment, experimentKey] = field(input, style, "first_experiment", "firstExperiment");

  const firstExperiment = readRecord(experiment, experimentKey);
  const [measure, measureKey] = field(firstExperiment, style, "success_measure", "successMeasure");

  return {
    title: readText(input.title, "title", { max: INPUT_LIMITS.title }),
    company,
    currentWorkflow: readTextList(workflow, workflowKey, maxItems, max, 1),
    systems: readList(input.systems, "systems", { min: 0, max: maxItems, truncate: true }).map((rawSystem, i) => {
      const system = readRecord(rawSystem, `systems[${i}]`);
      return {
        name: readText(system.name, `systems[${i}].name`, prose),
        role: readText(system.role, `systems[${i}].role`, prose),
      };
    }),
    handoffs: readTextList(input.handoffs, "handoffs", maxItems, max),
    friction: readList(input.friction, "friction", { min: 0, max: maxItems, truncate: true }).map((rawItem, i) => {
      const item = readRecord(rawItem, `friction[${i}]`);
      return {
        issue: readText(item.issue, `friction[${i}].issue`, prose),
        evidence: readEnum(item.evidence, `friction[${i}].evidence`, EVIDENCE_KINDS),
      };
    }),
    automationPoints: readList(points, pointsKey, { min: 0, max: maxItems, truncate: true }).map((rawPoint, i) => {
      const point = readRecord(rawPoint, `${pointsKey}[${i}]`);
      return {
        point: readText(point.point, `${pointsKey}[${i}].point`, prose),
        level: readNumber(point.level, `${pointsKey}[${i}].level`, { min: 0, max: 6, integer: true }) as AutomationLevel,
        approach: readText(point.approach, `${pointsKey}[${i}].approach`, prose),
      };
    }),
    connectedArchitecture: readText(architecture, architectureKey, { ...prose, multiline: true }),
    verificationQuestions: readTextList(questions, questionsKey, maxItems, max),
    firstExperiment: {
      name: readText(firstExperiment.name, `${experimentKey}.name`, prose),
      scope: readText(firstExperiment.scope, `${experimentKey}.scope`, prose),
      successMeasure: readText(measure, `${experimentKey}.${measureKey}`, prose),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                 Audit brief                                */
/* -------------------------------------------------------------------------- */

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const PHONE = /^\+?[0-9][0-9 -]*[0-9]$/;

export type BriefWithoutChannels = Omit<AuditBrief, "channels">;

function briefFrom(raw: unknown, style: Style): BriefWithoutChannels {
  const L = INPUT_LIMITS.brief;
  const prose = { max: L.prose, truncate: true, multiline: true } as const;
  const input = readRecord(raw, "input");

  const [capabilities, capabilitiesKey] = field(input, style, "relevant_capabilities", "relevantCapabilities");
  // Unknown ids are dropped rather than rejected: the list is a hint for the
  // Savin team, and a near-miss ("iot") should not cost the visitor a retry.
  const relevantCapabilities: CapabilityId[] = [];
  for (const item of readList(capabilities, capabilitiesKey, { min: 0, max: 32, truncate: true })) {
    const id = typeof item === "string" ? item.trim().toLowerCase() : "";
    if ((CAPABILITY_IDS as readonly string[]).includes(id) && !relevantCapabilities.includes(id as CapabilityId)) {
      relevantCapabilities.push(id as CapabilityId);
    }
  }
  if (!relevantCapabilities.length) {
    fail(`${capabilitiesKey} must include at least one of: ${CAPABILITY_IDS.join(", ")}.`);
  }

  const [systems, systemsKey] = field(input, style, "current_systems", "currentSystems");
  const [workflow, workflowKey] = field(input, style, "current_workflow", "currentWorkflow");
  const [problem, problemKey] = field(input, style, "primary_problem", "primaryProblem");
  const [friction, frictionKey] = field(input, style, "observed_friction", "observedFriction");
  const [outcome, outcomeKey] = field(input, style, "desired_outcome", "desiredOutcome");
  const [architecture, architectureKey] = field(input, style, "potential_architecture", "potentialArchitecture");

  const brief: BriefWithoutChannels = {
    industry: readText(input.industry, "industry", { max: L.short, truncate: true }),
    currentSystems: readTextList(systems, systemsKey, L.maxItems, L.item),
    currentWorkflow: readText(workflow, workflowKey, prose),
    primaryProblem: readText(problem, problemKey, prose),
    observedFriction: readTextList(friction, frictionKey, L.maxItems, L.item),
    desiredOutcome: readText(outcome, outcomeKey, prose),
    potentialArchitecture: readText(architecture, architectureKey, prose),
    unknowns: readTextList(input.unknowns, "unknowns", L.maxItems, L.item),
    relevantCapabilities,
    summary: readText(input.summary, "summary", { ...prose, max: L.summary }),
  };

  const company = readText(input.company, "company", { max: L.short, optional: true, truncate: true });
  if (company) brief.company = company;
  const urgency = readText(input.urgency, "urgency", { max: L.urgency, optional: true, truncate: true });
  if (urgency) brief.urgency = urgency;

  if (!isAbsent(input.contact)) {
    const record = readRecord(input.contact, "contact");
    const contact: NonNullable<AuditBrief["contact"]> = {};
    const name = readText(record.name, "contact.name", { max: L.contactName, optional: true, truncate: true });
    if (name) contact.name = name;
    const role = readText(record.role, "contact.role", { max: L.contactName, optional: true, truncate: true });
    if (role) contact.role = role;
    const email = readText(record.email, "contact.email", { max: L.email, optional: true });
    if (email) {
      if (!EMAIL.test(email)) {
        fail("contact.email is not a valid email address. Include it only exactly as the visitor typed it, or leave it out.");
      }
      contact.email = email;
    }
    const phone = readText(record.phone, "contact.phone", { max: L.phone, optional: true });
    if (phone) {
      if (!PHONE.test(phone) || phone.replace(/\D/g, "").length < 6) {
        fail('contact.phone must use only digits, spaces and "-", with an optional leading "+". Leave it out if the visitor did not give one.');
      }
      contact.phone = phone;
    }
    if (Object.keys(contact).length) brief.contact = contact;
  }

  return brief;
}

/** Published contact details, from the knowledge index — never from the model or the client. */
function briefChannels(): AuditBrief["channels"] {
  return { whatsappDigits: CONTACT_CHANNELS.whatsappDigits, email: CONTACT_CHANNELS.email };
}

/* -------------------------------------------------------------------------- */
/*                               Search (input)                               */
/* -------------------------------------------------------------------------- */

export interface SearchInput {
  query: string;
  kinds?: KnowledgeKind[];
  limit: number;
}

function searchFrom(raw: unknown): SearchInput {
  const L = INPUT_LIMITS.search;
  const input = readRecord(raw, "input");
  const search: SearchInput = {
    query: readText(input.query, "query", { max: L.query, truncate: true }),
    limit: L.defaultLimit,
  };
  // Unknown kinds are dropped; an empty filter means "search everything".
  const kinds = readList(input.kinds, "kinds", { min: 0, max: KNOWLEDGE_KINDS.length, truncate: true })
    .map((kind) => (typeof kind === "string" ? kind.trim().toLowerCase() : ""))
    .filter((kind): kind is KnowledgeKind => (KNOWLEDGE_KINDS as readonly string[]).includes(kind));
  if (kinds.length) search.kinds = Array.from(new Set(kinds));
  if (!isAbsent(input.limit)) {
    const limit = Number(input.limit);
    if (Number.isFinite(limit)) search.limit = Math.min(L.maxLimit, Math.max(1, Math.round(limit)));
  }
  return search;
}

/* -------------------------------------------------------------------------- */
/*                             Public: tool input                             */
/* -------------------------------------------------------------------------- */

export function validateSearchInput(raw: unknown): Validation<SearchInput> {
  return run(() => searchFrom(raw));
}

export function validateGraphInput(raw: unknown): Validation<WorkflowGraph> {
  return run(() => graphFrom(raw));
}

export function validateSimulationInput(raw: unknown): Validation<Simulation> {
  return run(() => simulationFrom(raw, "tool"));
}

export function validateImpactInput(raw: unknown): Validation<ImpactInput> {
  return run(() => impactFrom(raw, "tool"));
}

export function validateXRayInput(raw: unknown): Validation<BusinessXRay> {
  return run(() => xrayFrom(raw, "tool"));
}

/** The brief without `channels`; the caller adds them from CONTACT_CHANNELS. */
export function validateBriefInput(raw: unknown): Validation<BriefWithoutChannels> {
  return run(() => briefFrom(raw, "tool"));
}

/* -------------------------------------------------------------------------- */
/*                      Public: artifacts from client history                 */
/* -------------------------------------------------------------------------- */

/** Tool-use ids (`toolu_…`) are what the server issues as artifact ids. */
const ARTIFACT_ID = /^[A-Za-z0-9_-]{1,128}$/;

function sourcesFrom(
  raw: Record<string, unknown>,
  id: string,
  ctx: { country: string; locale: string },
): Artifact | null {
  const query = readText(raw.query, "query", { max: INPUT_LIMITS.search.query, truncate: true });
  const seen = new Set<string>();
  const sources: KnowledgeSource[] = [];
  for (const item of readList(raw.sources, "sources", { min: 0, max: INPUT_LIMITS.search.maxLimit, truncate: true })) {
    const sourceId = isRecord(item) && typeof item.id === "string" ? item.id : "";
    const record = sourceId && !seen.has(sourceId) ? getKnowledgeRecord(sourceId) : undefined;
    if (!record) continue;
    seen.add(sourceId);
    // Rebuilt from the index: titles, hrefs and caveats are never the client's.
    sources.push(toKnowledgeSource(record, ctx.country, ctx.locale));
  }
  return sources.length ? { type: "sources", id, query, sources } : null;
}

/**
 * Re-validates one artifact from client-held history (camelCase shapes).
 * Returns null for anything that fails; never throws on bad input.
 *
 * `ctx` localizes rebuilt source links; it defaults to the site default
 * (/in/en) for callers that do not render them.
 */
export function validateArtifact(
  raw: unknown,
  ctx: { country: string; locale: string } = { country: "in", locale: "en" },
): Artifact | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || !ARTIFACT_ID.test(raw.id)) return null;
  const id = raw.id;
  try {
    switch (raw.type) {
      case "graph":
        return { type: "graph", id, graph: graphFrom(raw.graph) };
      case "simulation":
        return { type: "simulation", id, simulation: simulationFrom(raw.simulation, "wire") };
      case "impact": {
        // Only the INPUT is trusted (after validation); every number shown is
        // recomputed here, so a tampered total never reaches the model.
        const impact = readRecord(raw.impact, "impact");
        return { type: "impact", id, impact: computeImpact(impactFrom(impact.input, "wire")) };
      }
      case "xray":
        return { type: "xray", id, xray: xrayFrom(raw.xray, "wire") };
      case "brief":
        return { type: "brief", id, brief: { ...briefFrom(raw.brief, "wire"), channels: briefChannels() } };
      case "sources":
        return sourcesFrom(raw, id, ctx);
      default:
        return null;
    }
  } catch (err) {
    if (err instanceof InputError) return null;
    throw err;
  }
}

/** For `tools.ts`: the brief as rendered, with the published channels attached. */
export function withChannels(brief: BriefWithoutChannels): AuditBrief {
  return { ...brief, channels: briefChannels() };
}
