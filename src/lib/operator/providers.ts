// lib/operator/providers.ts
//
// Which model APIs the Operator may call, and in what order. Anthropic keeps
// its native Messages API path (adaptive thinking, prompt caching, the
// server-side refusal fallback). Every other provider is spoken to through
// the OpenAI-compatible Chat Completions API (openai-compat.ts), which Groq,
// Cerebras, Gemini, Mistral and OpenRouter all serve, as do Together,
// DeepSeek, Ollama and LM Studio through the `custom` entry.
//
// The chain is read from the environment:
//   OPERATOR_PROVIDERS="groq,gemini,cerebras"   explicit order (optional)
//   <PREFIX>_API_KEY                            credentials; a provider without them is skipped
//   <PREFIX>_MODEL                              one model, or several comma-separated, tried in order
//   <PREFIX>_MAX_TOKENS, _REASONING_EFFORT      optional
//   <PREFIX>_BASE_URL                           optional; required for `custom`
// Without OPERATOR_PROVIDERS, every provider with credentials is used in
// DEFAULT_ORDER. Each provider × model is one entry of the chain: the route
// moves to the next entry when one fails before the visitor has seen
// anything (rate limit, quota, overload, bad key, retired model).
//
// Pure: no SDK, no next/*.

import { BASE_URL } from "@/lib/constants";
import { OPERATOR_MAX_TOKENS, OPERATOR_MODEL } from "./config";

export type ProviderId = "anthropic" | "groq" | "cerebras" | "gemini" | "mistral" | "openrouter" | "custom";

export type ProviderKind = "anthropic" | "openai";

interface ProviderPreset {
  /** Named to visitors who ask where their messages go (system-prompt.ts). */
  label: string;
  kind: ProviderKind;
  /** Env var prefix for _API_KEY, _MODEL, _MAX_TOKENS and _BASE_URL. */
  envPrefix: string;
  /** Credential variables, first one set wins. */
  keyEnv: readonly string[];
  /** `custom` may point at a local server (Ollama, LM Studio) that takes no key. */
  keyOptional?: boolean;
  baseUrl?: string;
  /** Tried in order; overridden as a whole by <PREFIX>_MODEL. */
  models: readonly string[];
  maxTokens: number;
  /** Sent as reasoning_effort. <PREFIX>_REASONING_EFFORT overrides it; "default" leaves it out. */
  reasoningEffort?: string;
  /**
   * Tool-schema dialect. Gemini's compatibility layer rejects JSON-Schema
   * keywords outside the OpenAPI subset it supports (openai-compat.ts).
   */
  schemaDialect?: "gemini";
  /** Mistral only accepts tool-call ids of exactly nine [a-zA-Z0-9] characters. */
  toolCallIds?: "alnum9";
  headers?: Record<string, string>;
}

/**
 * Defaults checked against the providers' live model lists in September
 * 2026: tool-calling models open to a free account. Catalogues change; a
 * retired model answers 404, which the route logs and routes around for ten
 * minutes (failureCooldownMs), so set <PREFIX>_MODEL when that shows up.
 *
 * One Operator request carries the system prompt and six tool schemas
 * before the conversation: ~9.8k tokens as Groq counts them. Groq's free
 * tier allows 8k tokens a minute per model, so it answers every Operator
 * request with 413 and the chain moves on (after one 413 it is skipped for
 * ten minutes). Groq's paid Developer tier has no such problem.
 */
const PRESETS: Record<ProviderId, ProviderPreset> = {
  anthropic: {
    label: "Anthropic",
    kind: "anthropic",
    envPrefix: "ANTHROPIC",
    keyEnv: ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"],
    models: [OPERATOR_MODEL],
    maxTokens: OPERATOR_MAX_TOKENS,
  },
  groq: {
    label: "Groq",
    kind: "openai",
    envPrefix: "GROQ",
    keyEnv: ["GROQ_API_KEY"],
    baseUrl: "https://api.groq.com/openai/v1",
    models: ["openai/gpt-oss-120b"],
    maxTokens: 8192,
  },
  cerebras: {
    label: "Cerebras",
    kind: "openai",
    envPrefix: "CEREBRAS",
    keyEnv: ["CEREBRAS_API_KEY"],
    baseUrl: "https://api.cerebras.ai/v1",
    models: ["gpt-oss-120b"],
    maxTokens: 8192,
  },
  gemini: {
    label: "Google Gemini",
    kind: "openai",
    envPrefix: "GEMINI",
    keyEnv: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    // Google's aliases for the current Flash and Flash-Lite releases. Flash
    // answers 503 "high demand" at busy times; Flash-Lite then takes over.
    models: ["gemini-flash-latest", "gemini-flash-lite-latest"],
    maxTokens: 8192,
    // Gemini 3 thinks at length by default (6 s before a one-line answer);
    // "low" keeps the panel responsive. The Claude path makes the same
    // trade-off with effort "medium" (config.ts).
    reasoningEffort: "low",
    schemaDialect: "gemini",
  },
  mistral: {
    label: "Mistral AI",
    kind: "openai",
    envPrefix: "MISTRAL",
    keyEnv: ["MISTRAL_API_KEY"],
    baseUrl: "https://api.mistral.ai/v1",
    models: ["mistral-small-latest"],
    maxTokens: 8192,
    toolCallIds: "alnum9",
  },
  openrouter: {
    label: "OpenRouter",
    kind: "openai",
    envPrefix: "OPENROUTER",
    keyEnv: ["OPENROUTER_API_KEY"],
    baseUrl: "https://openrouter.ai/api/v1",
    // Free variants end in ":free" and rotate often: check
    // openrouter.ai/models?q=free for one that lists tool support.
    models: ["openai/gpt-oss-120b:free"],
    maxTokens: 8192,
    // Optional attribution headers OpenRouter documents for app listings.
    headers: { "HTTP-Referer": BASE_URL, "X-Title": "Savin Operator" },
  },
  custom: {
    label: "",
    kind: "openai",
    envPrefix: "OPENAI_COMPATIBLE",
    keyEnv: ["OPENAI_COMPATIBLE_API_KEY"],
    keyOptional: true,
    models: [],
    maxTokens: 8192,
  },
};

/** Order used when OPERATOR_PROVIDERS is not set: fastest first, then the most generous free tiers. */
export const DEFAULT_ORDER: readonly ProviderId[] = ["anthropic", "groq", "cerebras", "gemini", "mistral", "openrouter", "custom"];

export function isProviderId(value: string): value is ProviderId {
  return Object.prototype.hasOwnProperty.call(PRESETS, value);
}

/** One entry of the chain: a provider with one of its models. */
export interface ResolvedProvider {
  id: ProviderId;
  /** `id/model`: what cooldowns and logs refer to. */
  key: string;
  label: string;
  kind: ProviderKind;
  model: string;
  maxTokens: number;
  reasoningEffort?: string;
  /** OpenAI-compatible providers: the API root, without /chat/completions. */
  baseUrl: string;
  /** Empty for a keyless `custom` endpoint. Never logged. */
  apiKey: string;
  schemaDialect?: "gemini";
  toolCallIds?: "alnum9";
  headers: Record<string, string>;
}

type Env = Record<string, string | undefined>;

const read = (env: Env, name: string) => env[name]?.trim() || undefined;

function positiveInt(value: string | undefined): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "an OpenAI-compatible provider";
  }
}

function resolveOne(id: ProviderId, env: Env): ResolvedProvider[] {
  const preset = PRESETS[id];
  const prefix = preset.envPrefix;
  const apiKey = preset.keyEnv.map((name) => read(env, name)).find(Boolean) ?? "";
  const baseUrl = (read(env, `${prefix}_BASE_URL`) ?? preset.baseUrl ?? "").replace(/\/+$/, "");
  const override = read(env, `${prefix}_MODEL`);
  const models = [...new Set(override ? override.split(",").map((m) => m.trim()).filter(Boolean) : preset.models)];

  if (!models.length) return [];
  if (preset.kind === "anthropic") {
    // The Anthropic SDK reads its own credentials and ANTHROPIC_BASE_URL.
    if (!apiKey) return [];
  } else if (!baseUrl || (!apiKey && !preset.keyOptional)) {
    return [];
  }

  const label = id === "custom" ? (read(env, "OPENAI_COMPATIBLE_NAME") ?? hostOf(baseUrl)) : preset.label;
  const maxTokens = positiveInt(read(env, `${prefix}_MAX_TOKENS`)) ?? preset.maxTokens;
  const effort = read(env, `${prefix}_REASONING_EFFORT`) ?? preset.reasoningEffort;
  const reasoningEffort = effort && effort !== "default" ? effort : undefined;
  return models.map((model) => ({
    id,
    key: `${id}/${model}`,
    label,
    kind: preset.kind,
    model,
    maxTokens,
    reasoningEffort,
    baseUrl,
    apiKey,
    schemaDialect: preset.schemaDialect,
    toolCallIds: preset.toolCallIds,
    headers: { ...preset.headers },
  }));
}

export interface ProviderChain {
  providers: ResolvedProvider[];
  /** OPERATOR_PROVIDERS entries that are unknown or not fully configured. */
  skipped: string[];
}

/**
 * The chain the Operator may call, in order. An explicit OPERATOR_PROVIDERS
 * list is honoured as given (duplicates dropped); entries that are unknown
 * or not configured are reported in `skipped` so the route can log them once.
 */
export function resolveProviderChain(env: Env = process.env): ProviderChain {
  const explicit = read(env, "OPERATOR_PROVIDERS");
  const wanted = explicit
    ? [...new Set(explicit.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))]
    : DEFAULT_ORDER;
  const providers: ResolvedProvider[] = [];
  const skipped: string[] = [];
  for (const id of wanted) {
    const resolved = isProviderId(id) ? resolveOne(id, env) : [];
    if (resolved.length) providers.push(...resolved);
    else if (explicit) skipped.push(id);
  }
  return { providers, skipped };
}

/**
 * Whether any provider can authenticate. Checked before the stream opens so a
 * missing key is a clean 503 ("unavailable"), not a stream that starts and
 * then errors.
 */
export function hasCredentials(env: Env = process.env): boolean {
  return resolveProviderChain(env).providers.length > 0;
}

/* -------------------------------------------------------------------------- */
/*                                  Cooldowns                                 */
/* -------------------------------------------------------------------------- */

/**
 * How long to route around a chain entry after a failure, in ms, or 0 to
 * keep trying it. Per instance and best effort, like the rate limiter: it
 * spares the next visitors a wait on a model that just said no.
 *
 *  - quota / rate limit (429): the wait the provider named, within [5 s, 60 s]
 *  - request too large (413), bad key (401/403), unknown model (404): 10 min;
 *    these only change with a config change or a new quota window
 *  - 503 (Gemini's "high demand" takes seconds to arrive): 30 s
 *  - other 5xx and dropped connections: 10 s
 */
export function failureCooldownMs(status: number | undefined, retryAfterMs: number | undefined): number {
  if (status === 429) return Math.min(60_000, Math.max(5_000, retryAfterMs ?? 20_000));
  if (status === 401 || status === 403 || status === 404 || status === 413) return 10 * 60_000;
  if (status === 503) return 30_000;
  if (status === undefined || status >= 500) return 10_000;
  return 0;
}

/**
 * The chain for one request: entries not cooling down keep their order and
 * go first; those cooling down follow, soonest-available first, as a last
 * resort rather than being dropped.
 */
export function orderForRequest(
  providers: readonly ResolvedProvider[],
  coolingUntil: ReadonlyMap<string, number>,
  now: number,
): ResolvedProvider[] {
  const until = (p: ResolvedProvider) => coolingUntil.get(p.key) ?? 0;
  const ready = providers.filter((p) => until(p) <= now);
  const cooling = providers.filter((p) => until(p) > now).sort((a, b) => until(a) - until(b));
  return [...ready, ...cooling];
}
