// lib/operator/tools.ts
//
// The six client tools the Operator can call, and the one function that runs
// them. Definitions are a static, ordered array because they sit at the very
// front of the prompt-cache prefix (tools → system → messages): any change in
// order or wording between requests would be a cache miss on every turn.
//
// Descriptions say WHEN to call, not just what the tool does; recent Opus
// models reach for tools conservatively and trigger conditions measurably
// raise the should-call rate. Every schema limit comes from INPUT_LIMITS so
// the model is told the same ceilings the validators enforce.
//
// Pure: only `import type` from the SDK, so tests load this under Node's type
// stripping with no network and no key.

import type { BetaTool } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { Artifact, Locale, OperatorStatus } from "./protocol";
import { computeImpact } from "./impact";
import { localizeHref, searchKnowledge, toKnowledgeSource } from "./knowledge";
import {
  CAPABILITY_IDS,
  EVIDENCE_KINDS,
  GRAPH_EDGE_MODES,
  GRAPH_NODE_KINDS,
  INPUT_LIMITS,
  KNOWLEDGE_KINDS,
  SIM_ACTOR_KINDS,
  SIM_STEP_KINDS,
  VALUE_SOURCES,
  validateBriefInput,
  validateGraphInput,
  validateImpactInput,
  validateSearchInput,
  validateSimulationInput,
  validateXRayInput,
  withChannels,
} from "./validate";

export type OperatorToolName =
  | "search_savin_knowledge"
  | "calculate_operational_impact"
  | "build_workflow_graph"
  | "simulate_workflow"
  | "prepare_business_xray"
  | "prepare_audit_brief";

/** What the panel shows while a tool's input is being generated. */
export const TOOL_STATUS: Record<OperatorToolName, OperatorStatus> = {
  search_savin_knowledge: "searching",
  calculate_operational_impact: "calculating",
  build_workflow_graph: "mapping",
  simulate_workflow: "simulating",
  prepare_business_xray: "drafting",
  prepare_audit_brief: "drafting",
};

export function isOperatorToolName(name: string): name is OperatorToolName {
  return Object.prototype.hasOwnProperty.call(TOOL_STATUS, name);
}

/* -------------------------------------------------------------------------- */
/*                              Schema fragments                              */
/* -------------------------------------------------------------------------- */

const str = (description: string, maxLength: number) => ({ type: "string", description, maxLength });
const oneOf = (description: string, values: readonly string[]) => ({ type: "string", enum: values, description });
const strList = (description: string, maxItems: number, maxLength: number) => ({
  type: "array",
  description,
  maxItems,
  items: { type: "string", maxLength },
});
const sourceField = oneOf(
  '"visitor" only if the visitor stated this value; "assumption" if you proposed it (it is then listed under the estimate).',
  VALUE_SOURCES,
);

const G = INPUT_LIMITS.graph;
const S = INPUT_LIMITS.simulation;
const I = INPUT_LIMITS.impact;
const X = INPUT_LIMITS.xray;
const B = INPUT_LIMITS.brief;

/* -------------------------------------------------------------------------- */
/*                                Definitions                                 */
/* -------------------------------------------------------------------------- */

export const OPERATOR_TOOLS: BetaTool[] = [
  {
    name: "search_savin_knowledge",
    description:
      "Search Savin Group's verified website knowledge: offers (the free audit, the paid Discovery Sprint), service systems with published INR price ranges, capabilities, anonymised case studies, industries, the engagement process, principles, FAQs, contact details, technologies listed on the site, and records of what Savin does NOT publish. " +
      "Call this BEFORE stating any Savin fact that is not in the fact sheet — a service detail, a price, a case study or result, a process step, a contact detail — and before answering whether Savin has a named team, social profiles, an address, certifications or partnerships (kinds [\"absence\"]). For case studies use kinds [\"case_study\"]. " +
      "Only state what the results say, with each result's caveat. If nothing matches, say you do not have verified information on it; never fill the gap from general knowledge. Each result has a site url you may link.",
    input_schema: {
      type: "object",
      properties: {
        query: str(
          'English keywords for what to look up, e.g. "manufacturing ERP case study" or "discovery sprint price". Translate the visitor\'s words to English first; the index is English.',
          INPUT_LIMITS.search.query,
        ),
        kinds: {
          type: "array",
          description: "Optional filter by record kind. Omit to search everything.",
          items: { type: "string", enum: KNOWLEDGE_KINDS },
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: INPUT_LIMITS.search.maxLimit,
          description: `Maximum results (default ${INPUT_LIMITS.search.defaultLimit}).`,
        },
      },
      required: ["query"],
    },
    eager_input_streaming: true,
  },
  {
    name: "calculate_operational_impact",
    description:
      "Compute the staff-hours (and, only if an hourly cost is supplied, the cost) that manual activities consume each month and year, and how much a proposed change could release. The server does the arithmetic and shows the visitor an estimate card that lists every assumed input. " +
      "Call it only with numbers the visitor gave you, or with assumptions you state openly and mark as source \"assumption\". Ask for the missing variables instead when an estimate would be mostly guesswork. " +
      "Never use it to invent ROI, revenue or savings: omit hourly_cost and reduction_percent unless the visitor gave them or explicitly accepted assumed values. Afterwards present the figures as estimates to verify, never as promised savings.",
    input_schema: {
      type: "object",
      properties: {
        title: str("Short name of what is being estimated, e.g. \"Daily stock reconciliation\".", INPUT_LIMITS.title),
        activities: {
          type: "array",
          minItems: 1,
          maxItems: I.maxActivities,
          description: "Each manual activity to count.",
          items: {
            type: "object",
            properties: {
              label: str("What the activity is, e.g. \"Re-typing WhatsApp orders into Tally\".", I.label),
              people: {
                type: "number",
                minimum: I.people.min,
                maximum: I.people.max,
                description: "How many people do this activity.",
              },
              minutes_per_occurrence: {
                type: "number",
                minimum: I.minutes.min,
                maximum: I.minutes.max,
                description: "Minutes one person spends each time.",
              },
              occurrences: {
                type: "number",
                minimum: I.occurrences.min,
                maximum: I.occurrences.max,
                description: "How many times each person does it per period (see per).",
              },
              per: oneOf("The period that occurrences is counted over.", ["day", "week", "month"]),
              source: sourceField,
            },
            required: ["label", "people", "minutes_per_occurrence", "occurrences", "per", "source"],
          },
        },
        working_days_per_month: {
          type: "object",
          description: "Working days per month, for daily activities. Omit to use 22, which is then listed as an assumption.",
          properties: {
            value: { type: "number", minimum: I.workingDays.min, maximum: I.workingDays.max },
            source: sourceField,
          },
          required: ["value", "source"],
        },
        reduction_percent: {
          type: "object",
          description: "Share of this time (0-100) the proposed change could remove. Omit unless it was discussed.",
          properties: {
            value: { type: "number", minimum: I.reduction.min, maximum: I.reduction.max },
            source: sourceField,
          },
          required: ["value", "source"],
        },
        hourly_cost: {
          type: "object",
          description: "Loaded cost of one staff-hour. Omit unless the visitor gave it or explicitly asked for an assumed figure.",
          properties: {
            amount: { type: "number", exclusiveMinimum: 0, maximum: I.hourlyCost.max },
            currency: str("Currency code, e.g. \"INR\".", I.currency),
            source: sourceField,
          },
          required: ["amount", "currency", "source"],
        },
      },
      required: ["title", "activities"],
    },
    eager_input_streaming: true,
  },
  {
    name: "build_workflow_graph",
    description:
      "Render the visitor's process as a node-and-edge map in the chat panel. Call it when a map would make the process clearer than prose: typically once with view \"current\" after you understand how work flows today (the trigger, who touches it, which software, spreadsheets or WhatsApp groups, where it waits), and again with view \"proposed\" after discussing changes. Reuse the same node ids for things that stay, so the two views line up. " +
      "Put friction on the nodes and edges where it actually occurs. Use mode \"manual\" for re-typing, calls, chasing and WhatsApp handoffs. Add an \"ai\" node only where interpreting unstructured information genuinely needs it; prefer deterministic automation. Never draw diagrams in text instead of calling this.",
    input_schema: {
      type: "object",
      properties: {
        title: str("Short title, e.g. \"Order to dispatch — today\".", INPUT_LIMITS.title),
        view: oneOf('"current" = how it works today; "proposed" = a possible connected state.', ["current", "proposed"]),
        summary: str("One or two sentences on what the map shows.", G.summary),
        nodes: {
          type: "array",
          minItems: G.minNodes,
          maxItems: G.maxNodes,
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                pattern: "^[a-z0-9][a-z0-9_-]{0,31}$",
                description: "Unique lowercase id, e.g. \"order_desk\".",
              },
              label: str("Short visible label.", G.nodeLabel),
              kind: oneOf("What the node is.", GRAPH_NODE_KINDS),
              detail: str("Optional one-line detail.", G.nodeText),
              friction: str("Only if this node is a point of friction: what goes wrong here.", G.nodeText),
            },
            required: ["id", "label", "kind"],
          },
        },
        edges: {
          type: "array",
          minItems: G.minEdges,
          maxItems: G.maxEdges,
          items: {
            type: "object",
            properties: {
              from: { type: "string", description: "Source node id." },
              to: { type: "string", description: "Target node id (not the same as from)." },
              mode: oneOf("How work crosses this edge.", GRAPH_EDGE_MODES),
              label: str("Optional short label, e.g. \"PDF by email\".", G.edgeLabel),
              friction: str("Only if the handoff itself is a point of friction.", G.nodeText),
            },
            required: ["from", "to", "mode"],
          },
        },
      },
      required: ["title", "view", "nodes", "edges"],
    },
    eager_input_streaming: true,
  },
  {
    name: "simulate_workflow",
    description:
      "Render an illustrative step-by-step run of a proposed workflow using clearly fictional sample data (e.g. order SO-1028). The panel always labels it SIMULATION with no live system connected. Call it after a proposed flow has been discussed and seeing it run would help the visitor. " +
      "Any financial, contractual, production, safety-critical or destructive step must set consequential: true AND come after a step of kind \"approval\" performed by a person; the server rejects the simulation otherwise. Never use real company, customer or employee names in sample data.",
    input_schema: {
      type: "object",
      properties: {
        title: str("Short title.", INPUT_LIMITS.title),
        scenario: str("What triggers this run, in one or two sentences.", S.scenario),
        steps: {
          type: "array",
          minItems: S.minSteps,
          maxItems: S.maxSteps,
          items: {
            type: "object",
            properties: {
              label: str("What happens, e.g. \"Component shortage detected\".", S.label),
              actor: str("Who or what performs it, e.g. \"Purchase manager\" or \"ERP\".", S.actor),
              actor_kind: oneOf("Kind of actor.", SIM_ACTOR_KINDS),
              kind: oneOf("Kind of step.", SIM_STEP_KINDS),
              system: str("Optional system involved, e.g. \"Tally\".", S.system),
              detail: str("Optional one-line detail.", S.detail),
              consequential: {
                type: "boolean",
                description: "True for financial, contractual, production, safety-critical or destructive actions.",
              },
              sample: {
                type: "array",
                maxItems: S.maxSample,
                description: "Illustrative sample values shown on the step's record card.",
                items: {
                  type: "object",
                  properties: {
                    key: str("Field name.", S.sampleKey),
                    value: str("Sample value.", S.sampleValue),
                  },
                  required: ["key", "value"],
                },
              },
            },
            required: ["label", "actor", "actor_kind", "kind"],
          },
        },
        outcome: str("What the run ends with.", S.outcome),
      },
      required: ["title", "scenario", "steps", "outcome"],
    },
    eager_input_streaming: true,
  },
  {
    name: "prepare_business_xray",
    description:
      "Render a structured Business X-Ray: current workflow, systems, human handoffs, friction (each marked stated or inferred), automation points with a level, a possible connected architecture, questions that still need verification, and one recommended first experiment. " +
      "Call it only when the visitor has described enough of a real process (at least the trigger, the people and systems involved, and where it hurts) AND has asked for or accepted an X-Ray. Put unknowns in verification_questions; never fill gaps with invented facts. Prefer connecting or extending the existing stack over replacing it. " +
      "Levels: 0 leave manual, 1 simple workflow automation, 2 system integration, 3 operational software/ERP, 4 AI-assisted workflow, 5 agentic workflow with tools, 6 physical/digital (machines, IoT).",
    input_schema: {
      type: "object",
      properties: {
        title: str("Short title, e.g. \"Business X-Ray — order handling\".", INPUT_LIMITS.title),
        company: {
          type: "object",
          description: "Only what the visitor said; omit unknown fields.",
          properties: {
            industry: str("Industry.", X.text),
            size: str("Approximate size.", X.text),
            locations: str("Locations.", X.text),
            offering: str("Products or services.", X.text),
          },
        },
        current_workflow: strList("The workflow today, one step per item, in order.", X.maxItems, X.text),
        systems: {
          type: "array",
          maxItems: X.maxItems,
          items: {
            type: "object",
            properties: { name: str("System name.", X.text), role: str("What it is used for.", X.text) },
            required: ["name", "role"],
          },
        },
        handoffs: strList("Human handoffs between people or systems.", X.maxItems, X.text),
        friction: {
          type: "array",
          maxItems: X.maxItems,
          items: {
            type: "object",
            properties: {
              issue: str("The friction.", X.text),
              evidence: oneOf('"stated" if the visitor said it; "inferred" if it is your inference.', EVIDENCE_KINDS),
            },
            required: ["issue", "evidence"],
          },
        },
        automation_points: {
          type: "array",
          maxItems: X.maxItems,
          items: {
            type: "object",
            properties: {
              point: str("Where.", X.text),
              level: { type: "integer", minimum: 0, maximum: 6, description: "Automation level 0-6 (see tool description)." },
              approach: str("The simplest approach that would work.", X.text),
            },
            required: ["point", "level", "approach"],
          },
        },
        connected_architecture: str("A possible connected architecture, in plain language.", X.text),
        verification_questions: strList("What must be verified before recommending a build.", X.maxItems, X.text),
        first_experiment: {
          type: "object",
          properties: {
            name: str("Name of the experiment.", X.text),
            scope: str("Deliberately small scope.", X.text),
            success_measure: str("How success would be measured.", X.text),
          },
          required: ["name", "scope", "success_measure"],
        },
      },
      required: ["title", "current_workflow", "connected_architecture", "first_experiment"],
    },
    eager_input_streaming: true,
  },
  {
    name: "prepare_audit_brief",
    description:
      "Prepare a structured audit brief that the VISITOR can send to Savin themselves. Call it ONLY after the visitor explicitly says they want to continue with Savin (e.g. \"yes, let's take this to Savin\"); never to nudge them. " +
      "The panel shows the brief with buttons to copy it or open WhatsApp or email with it prefilled. This tool transmits nothing and books nothing. Include only contact details the visitor volunteered in this conversation; do not ask for more than a name and one way to reach them, and only if they want to give them. " +
      "Afterwards ask them to review and send it; never say it was sent, booked, received or saved.",
    input_schema: {
      type: "object",
      properties: {
        company: str("Company name, only if the visitor gave it.", B.short),
        contact: {
          type: "object",
          description: "Only details the visitor volunteered. Omit entirely if none.",
          properties: {
            name: str("Name.", B.contactName),
            email: str("Email, exactly as the visitor typed it.", B.email),
            phone: str("Phone: digits, spaces or \"-\", optional leading \"+\".", B.phone),
            role: str("Role.", B.contactName),
          },
        },
        industry: str("Industry.", B.short),
        current_systems: strList("Systems in use today.", B.maxItems, B.item),
        current_workflow: str("The current workflow, briefly.", B.prose),
        primary_problem: str("The primary problem.", B.prose),
        observed_friction: strList("Observed friction points.", B.maxItems, B.item),
        desired_outcome: str('What the visitor wants to achieve ("Not stated" if unknown).', B.prose),
        potential_architecture: str("The possible architecture discussed, marked as a first pass.", B.prose),
        unknowns: strList("What still needs to be verified.", B.maxItems, B.item),
        urgency: str("Urgency or timeline, only if the visitor gave one.", B.urgency),
        relevant_capabilities: {
          type: "array",
          minItems: 1,
          description: "Savin capability areas relevant to this problem.",
          items: { type: "string", enum: CAPABILITY_IDS },
        },
        summary: str("A short summary of the conversation for the Savin team.", B.summary),
      },
      required: [
        "industry",
        "current_workflow",
        "primary_problem",
        "desired_outcome",
        "potential_architecture",
        "relevant_capabilities",
        "summary",
      ],
    },
    eager_input_streaming: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Execution                                 */
/* -------------------------------------------------------------------------- */

export interface ToolContext {
  /** The tool_use id; becomes the artifact id so the panel can key on it. */
  toolUseId: string;
  country: string;
  locale: Locale;
}

export interface ToolOutcome {
  /** Compact JSON (or an error sentence) for the tool_result block. */
  content: string;
  isError: boolean;
  artifact?: Artifact;
}

/** Sources shown under a reply; more than this is noise in a narrow panel. */
const MAX_SOURCES_SHOWN = 5;

function rendered(what: string, extra = ""): string {
  return JSON.stringify({
    rendered: true,
    note: `The visitor can now see this ${what} in the panel. Refer to it; do not repeat it in full.${extra ? " " + extra : ""}`,
  });
}

function invalid(name: string, error: string): ToolOutcome {
  return { content: `Invalid input for ${name}: ${error} Fix this and call ${name} again.`, isError: true };
}

function runSearch(rawInput: unknown, ctx: ToolContext): ToolOutcome {
  const parsed = validateSearchInput(rawInput);
  if (!parsed.ok) return invalid("search_savin_knowledge", parsed.error);
  const { query, kinds, limit } = parsed.value;
  const records = searchKnowledge(query, kinds ? { kinds, limit } : { limit });
  if (!records.length) {
    return {
      content: JSON.stringify({
        results: [],
        note: "No verified Savin information matched. Say you do not have verified information on this.",
      }),
      isError: false,
    };
  }
  const results = records.map((record) => ({
    id: record.id,
    title: record.title,
    body: record.body,
    url: localizeHref(record.path, ctx.country, ctx.locale),
    confidence: record.confidence,
    ...(record.caveat ? { caveat: record.caveat } : {}),
  }));
  const hasCaveat = records.some((record) => record.caveat);
  return {
    content: JSON.stringify({
      results,
      ...(hasCaveat ? { note: "State each caveat together with the fact it qualifies." } : {}),
    }),
    isError: false,
    artifact: {
      type: "sources",
      id: ctx.toolUseId,
      query,
      sources: records
        .slice(0, MAX_SOURCES_SHOWN)
        .map((record) => toKnowledgeSource(record, ctx.country, ctx.locale)),
    },
  };
}

function execute(name: OperatorToolName, rawInput: unknown, ctx: ToolContext): ToolOutcome {
  const id = ctx.toolUseId;
  switch (name) {
    case "search_savin_knowledge":
      return runSearch(rawInput, ctx);

    case "calculate_operational_impact": {
      const parsed = validateImpactInput(rawInput);
      if (!parsed.ok) return invalid(name, parsed.error);
      const impact = computeImpact(parsed.value);
      // The figures only: echoing the input back would just repeat what the
      // model wrote a moment ago.
      return {
        content: JSON.stringify({
          rendered: true,
          rows: impact.rows,
          totalHoursPerMonth: impact.totalHoursPerMonth,
          totalHoursPerYear: impact.totalHoursPerYear,
          releasedHoursPerMonth: impact.releasedHoursPerMonth,
          monthlyCost: impact.monthlyCost,
          releasedMonthlyCost: impact.releasedMonthlyCost,
          assumptions: impact.assumptions,
          note: "The visitor can now see this estimate card, with every assumed input listed. Quote the figures as estimates to verify, name the assumptions, and do not add any financial value the tool did not compute.",
        }),
        isError: false,
        artifact: { type: "impact", id, impact },
      };
    }

    case "build_workflow_graph": {
      const parsed = validateGraphInput(rawInput);
      if (!parsed.ok) return invalid(name, parsed.error);
      return { content: rendered("graph"), isError: false, artifact: { type: "graph", id, graph: parsed.value } };
    }

    case "simulate_workflow": {
      const parsed = validateSimulationInput(rawInput);
      if (!parsed.ok) return invalid(name, parsed.error);
      return {
        content: rendered(
          "simulation",
          "It is labelled as a simulation with sample data; never present it as their live system.",
        ),
        isError: false,
        artifact: { type: "simulation", id, simulation: parsed.value },
      };
    }

    case "prepare_business_xray": {
      const parsed = validateXRayInput(rawInput);
      if (!parsed.ok) return invalid(name, parsed.error);
      return { content: rendered("Business X-Ray"), isError: false, artifact: { type: "xray", id, xray: parsed.value } };
    }

    case "prepare_audit_brief": {
      const parsed = validateBriefInput(rawInput);
      if (!parsed.ok) return invalid(name, parsed.error);
      return {
        content: JSON.stringify({
          prepared: true,
          sent: false,
          note: "NOTHING HAS BEEN SENT. The visitor now sees the brief in the panel with buttons to send it to Savin themselves via WhatsApp or email, or to copy it. Ask them to review it and send it if they are happy with it. Never say it was sent, booked, saved or received.",
        }),
        isError: false,
        artifact: { type: "brief", id, brief: withChannels(parsed.value) },
      };
    }
  }
}

/**
 * Validates and runs one tool call. Never throws: an unknown tool, invalid
 * input or an unexpected failure all come back as an `is_error` result the
 * model can react to, so one bad call cannot end the visitor's turn.
 */
export function runTool(name: string, rawInput: unknown, ctx: ToolContext): ToolOutcome {
  if (!isOperatorToolName(name)) {
    return {
      content: `Unknown tool "${name}". The available tools are: ${Object.keys(TOOL_STATUS).join(", ")}.`,
      isError: true,
    };
  }
  try {
    return execute(name, rawInput, ctx);
  } catch (err) {
    console.error("Operator endpoint error: tool failed:", name, err);
    return {
      content: `${name} failed unexpectedly. Continue without it and do not claim it returned anything.`,
      isError: true,
    };
  }
}
