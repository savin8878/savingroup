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
//   <PREFIX>_MODEL, <PREFIX>_MAX_TOKENS         optional overrides
//   <PREFIX>_BASE_URL                           optional; required for `custom`
// Without OPERATOR_PROVIDERS, every provider with credentials is used in
// DEFAULT_ORDER. The route falls down the chain when a provider fails before
// the visitor has seen anything (rate limit, quota, outage, bad key).
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
  model?: string;
  maxTokens: number;
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
 * Defaults as of September 2026, each overridable with <PREFIX>_MODEL. They
 * are models that support tool calling on the provider's free tier; model
 * catalogues change, and a retired model answers 404, which the route logs
 * and skips (see `failureCooldownMs`).
 *
 * One Operator request carries ~6k tokens of system prompt and ~4.5k of tool
 * schemas before the conversation. Free tiers with a tokens-per-minute limit
 * near that (Groq's free tier) reject it or allow one call a minute; the chain
 * then moves on to the next provider.
 */
const PRESETS: Record<ProviderId, ProviderPreset> = {
  anthropic: {
    label: "Anthropic",
    kind: "anthropic",
    envPrefix: "ANTHROPIC",
    keyEnv: ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"],
    model: OPERATOR_MODEL,
    maxTokens: OPERATOR_MAX_TOKENS,
  },
  groq: {
    label: "Groq",
    kind: "openai",
    envPrefix: "GROQ",
    keyEnv: ["GROQ_API_KEY"],
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    // Groq counts the requested completion budget against the per-minute
    // token limit, so a large max_tokens alone can make a request too large.
    maxTokens: 4096,
  },
  cerebras: {
    label: "Cerebras",
    kind: "openai",
    envPrefix: "CEREBRAS",
    keyEnv: ["CEREBRAS_API_KEY"],
    baseUrl: "https://api.cerebras.ai/v1",
    model: "gpt-oss-120b",
    maxTokens: 8192,
  },
  gemini: {
    label: "Google Gemini",
    kind: "openai",
    envPrefix: "GEMINI",
    keyEnv: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    // Google's alias for the current Flash release.
    model: "gemini-flash-latest",
    maxTokens: 8192,
    schemaDialect: "gemini",
  },
  mistral: {
    label: "Mistral AI",
    kind: "openai",
    envPrefix: "MISTRAL",
    keyEnv: ["MISTRAL_API_KEY"],
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-small-latest",
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
    model: "openai/gpt-oss-120b:free",
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
    maxTokens: 8192,
  },
};

/** Order used when OPERATOR_PROVIDERS is not set: fastest first, then the most generous free tiers. */
export const DEFAULT_ORDER: readonly ProviderId[] = ["anthropic", "groq", "cerebras", "gemini", "mistral", "openrouter", "custom"];

export function isProviderId(value: string): value is ProviderId {
  return Object.prototype.hasOwnProperty.call(PRESETS, value);
}

export interface ResolvedProvider {
  id: ProviderId;
  label: string;
  kind: ProviderKind;
  model: string;
  maxTokens: number;
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

function resolveOne(id: ProviderId, env: Env): ResolvedProvider | null {
  const preset = PRESETS[id];
  const prefix = preset.envPrefix;
  const apiKey = preset.keyEnv.map((name) => read(env, name)).find(Boolean) ?? "";
  const baseUrl = (read(env, `${prefix}_BASE_URL`) ?? preset.baseUrl ?? "").replace(/\/+$/, "");
  const model = read(env, `${prefix}_MODEL`) ?? preset.model ?? "";

  if (preset.kind === "anthropic") {
    // The Anthropic SDK reads its own credentials and ANTHROPIC_BASE_URL.
    if (!apiKey) return null;
  } else if (!baseUrl || !model || (!apiKey && !preset.keyOptional)) {
    return null;
  }

  let label = preset.label;
  if (id === "custom") {
    label = read(env, "OPENAI_COMPATIBLE_NAME") ?? hostOf(baseUrl);
  }

  return {
    id,
    label,
    kind: preset.kind,
    model,
    maxTokens: positiveInt(read(env, `${prefix}_MAX_TOKENS`)) ?? preset.maxTokens,
    baseUrl,
    apiKey,
    schemaDialect: preset.schemaDialect,
    toolCallIds: preset.toolCallIds,
    headers: { ...preset.headers },
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "an OpenAI-compatible provider";
  }
}

export interface ProviderChain {
  providers: ResolvedProvider[];
  /** OPERATOR_PROVIDERS entries that are unknown or have no credentials. */
  skipped: string[];
}

/**
 * The providers the Operator may call, in order. An explicit
 * OPERATOR_PROVIDERS list is honoured as given (duplicates dropped); entries
 * that are unknown or lack credentials are reported in `skipped` so the route
 * can log them once.
 */
export function resolveProviderChain(env: Env = process.env): ProviderChain {
  const explicit = read(env, "OPERATOR_PROVIDERS");
  const wanted = explicit
    ? [...new Set(explicit.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))]
    : DEFAULT_ORDER;
  const providers: ResolvedProvider[] = [];
  const skipped: string[] = [];
  for (const id of wanted) {
    const resolved = isProviderId(id) ? resolveOne(id, env) : null;
    if (resolved) providers.push(resolved);
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
 * How long to route around a provider after a failure, in ms, or 0 to keep
 * trying it. Per instance and best effort, like the rate limiter: it spares
 * the next visitors a wait on a provider that just said no.
 *
 *  - quota / rate limit (429): the wait the provider named, within [5 s, 60 s]
 *  - request too large (413), bad key (401/403), unknown model (404): 10 min;
 *    these only change with a config change or a new quota window
 *  - 5xx and dropped connections: 10 s
 */
export function failureCooldownMs(status: number | undefined, retryAfterMs: number | undefined): number {
  if (status === 429) return Math.min(60_000, Math.max(5_000, retryAfterMs ?? 20_000));
  if (status === 401 || status === 403 || status === 404 || status === 413) return 10 * 60_000;
  if (status === undefined || status >= 500) return 10_000;
  return 0;
}

/**
 * The chain for one request: providers not cooling down keep their order and
 * go first; those cooling down follow, soonest-available first, as a last
 * resort rather than being dropped.
 */
export function orderForRequest(
  providers: readonly ResolvedProvider[],
  coolingUntil: ReadonlyMap<ProviderId, number>,
  now: number,
): ResolvedProvider[] {
  const until = (p: ResolvedProvider) => coolingUntil.get(p.id) ?? 0;
  const ready = providers.filter((p) => until(p) <= now);
  const cooling = providers.filter((p) => until(p) > now).sort((a, b) => until(a) - until(b));
  return [...ready, ...cooling];
}
