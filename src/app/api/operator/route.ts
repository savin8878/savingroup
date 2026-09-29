// app/api/operator/route.ts
//
// The Savin Operator's streaming endpoint. The chat panel calls
//   POST /api/operator   (root-absolute: a /{country}/{locale} prefix would
//                         send it through the middleware as a page and 404)
// with an OperatorRequest body (lib/operator/protocol.ts): the whole
// transcript, which the client owns and resends every turn.
//
// 200 → NDJSON, one OperatorEvent per line: status / text / artifact, then
// exactly one done or error. Failures before the stream opens are plain JSON
// { ok: false, error: OperatorErrorCode } with a 4xx/5xx status; 429 carries
// Retry-After. Error messages never reach the client, only codes.
//
// GET /api/operator answers 204 when the Operator can take requests and 503
// when it cannot, for a launcher baked into a prerendered page before the
// kill switch was flipped.
//
// Needs at least one model provider's key (server-only): ANTHROPIC_API_KEY,
// or GROQ_API_KEY, CEREBRAS_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY,
// OPENROUTER_API_KEY or an OPENAI_COMPATIBLE_* endpoint (lib/operator/
// providers.ts). Anthropic is called through its SDK; the others through the
// OpenAI-compatible Chat Completions API (lib/operator/openai-compat.ts). A
// provider that fails before the visitor sees anything hands the round to the
// next one. OPERATOR_ENABLED="false" turns the route off. The in-memory rate
// limit is per instance; the real ceiling is a Vercel Firewall rule on
// /api/operator (see .env.example).

import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessageStream } from "@anthropic-ai/sdk/lib/BetaMessageStream";
import type {
  BetaContentBlock,
  BetaMessage,
  BetaMessageParam,
  BetaMessageStreamParams,
  BetaToolResultBlockParam,
  BetaToolUseBlock,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { ipAddress } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import {
  FALLBACK_BETA,
  OPERATOR_DEADLINE_MS,
  OPERATOR_EFFORT,
  OPERATOR_MAX_JSON_RETRIES,
  OPERATOR_MAX_TOOL_ROUNDS,
  OPERATOR_MIN_ROUND_MS,
  isOperatorEnabled,
} from "@/lib/operator/config";
import { buildMessages, fitHistory, parseRequest } from "@/lib/operator/history";
import { logOperatorError } from "@/lib/operator/log";
import { TEXT_ONLY_NOTE, mayRetryTransient, planRound, retryWaitMs, splitAtFallback } from "@/lib/operator/loop-policy";
import {
  ProviderError,
  ToolCallParseError,
  streamChatCompletion,
  toChatMessages,
  toChatTools,
  type ChatTool,
  type LoopMessage,
} from "@/lib/operator/openai-compat";
import {
  failureCooldownMs,
  hasCredentials,
  orderForRequest,
  resolveProviderChain,
  type ProviderId,
  type ResolvedProvider,
} from "@/lib/operator/providers";
import {
  OPERATOR_LIMITS,
  type Artifact,
  type Locale,
  type OperatorErrorCode,
  type OperatorEvent,
  type OperatorStatus,
} from "@/lib/operator/protocol";
import { checkRateLimit } from "@/lib/operator/rate-limit";
import { buildSystemPrompt } from "@/lib/operator/system-prompt";
import { OPERATOR_TOOLS, TOOL_STATUS, isOperatorToolName, runTool } from "@/lib/operator/tools";

// Node, not edge: the knowledge index and the SDK are large bundles, and the
// tool loop can run for tens of seconds.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Must equal OPERATOR_MAX_DURATION_S in lib/operator/config.ts, which every
// time budget of the tool loop is derived from (Next.js only reads this
// export as a literal; a test keeps the two equal). It covers the WHOLE
// stream. Raise both only after confirming Fluid compute in the Vercel
// dashboard.
export const maxDuration = 60;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function fail(status: number, error: OperatorErrorCode, headers?: Record<string, string>) {
  return NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/**
 * Browsers cannot send a cross-origin JSON POST without CORS (none is
 * configured), but they can send a "simple" text/plain one, and other sites
 * could otherwise spend this endpoint's budget from their visitors' browsers.
 * Fetch metadata and Origin close that; non-browser clients are left to the
 * rate limiter and the firewall.
 */
function isCrossSite(req: NextRequest): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return true; // "null" (sandboxed frames, file://) and garbage
  }
  const hosts = [req.headers.get("host"), req.headers.get("x-forwarded-host")?.split(",")[0]?.trim()];
  return !hosts.some((host) => host && host.toLowerCase() === originHost.toLowerCase());
}

/**
 * Reads the body with a hard byte cap. `req.text()` would buffer whatever a
 * chunked request sends before we could measure it; this stops at the cap.
 * Returns null when the body is too large.
 */
async function readBodyCapped(req: NextRequest, maxBytes: number): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function clientKey(req: NextRequest): string {
  return ipAddress(req) ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
}

let client: Anthropic | undefined;

/**
 * One client per instance. Credentials resolve from ANTHROPIC_API_KEY or
 * ANTHROPIC_AUTH_TOKEN. The SDK's own retries are OFF: it honours whatever
 * Retry-After the API sends, uncapped, so one 429 carrying "retry-after: 40"
 * would hold the visitor on "thinking" until the deadline and then end in a
 * generic error. streamRound makes the one retry that fits the time budget
 * (OPERATOR_TRANSIENT_RETRY in config.ts) and fails fast otherwise.
 */
function getClient(): Anthropic {
  client ??= new Anthropic({ maxRetries: 0 });
  return client;
}

let warnedMissingKey = false;
let warnedSkipped = false;

/**
 * Maps a failure inside the stream to the code the panel shows. Messages are
 * logged redacted (log.ts), never sent. Returns null for a client
 * disconnect: nobody is left to tell.
 */
function toErrorCode(err: unknown): OperatorErrorCode | null {
  if (err instanceof Anthropic.APIUserAbortError) return null;
  if (
    err instanceof Anthropic.RateLimitError ||
    (err instanceof Anthropic.APIError &&
      (err.status === 529 || err.type === "overloaded_error" || err.type === "rate_limit_error"))
  ) {
    return "overloaded";
  }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    logOperatorError("Anthropic rejected the credentials", undefined, err.status);
    return "unavailable";
  }
  if (err instanceof Anthropic.BadRequestError) {
    logOperatorError("upstream rejected the request:", err);
    return "upstream";
  }
  if (err instanceof Anthropic.APIConnectionError) return "upstream";
  // Other API failures (5xx, an `api_error` event mid-stream) are upstream
  // too; "internal" is kept for bugs in this handler.
  if (err instanceof Anthropic.APIError) {
    logOperatorError("upstream failure", err, err.status);
    return "upstream";
  }
  if (err instanceof ProviderError) {
    if (err.status === 429) return "overloaded";
    if (err.status === 401 || err.status === 403) {
      logOperatorError(`${err.provider} rejected the credentials`, undefined, err.status);
      return "unavailable";
    }
    logOperatorError(`${err.provider} failure`, err, err.status);
    return "upstream";
  }
  if (err instanceof ToolCallParseError) {
    logOperatorError("unparseable tool call after the last re-issue:", err);
    return "upstream";
  }
  // Includes the SDK's tool-input parse error after the last re-issue, whose
  // message ends with the model's whole tool input: logOperatorError cuts it.
  logOperatorError("unexpected failure:", err);
  return "internal";
}

/**
 * Failures worth one more attempt: rate limits, overloads, 5xx and dropped
 * connections, unless the API says not to retry. A mid-stream `error` event
 * carries no status, only the error type.
 */
function isTransient(err: InstanceType<typeof Anthropic.APIError>): boolean {
  if (err instanceof Anthropic.APIUserAbortError) return false;
  if (err.headers?.get("x-should-retry") === "false") return false;
  if (err instanceof Anthropic.APIConnectionError) return true;
  const { status } = err;
  if (status === undefined) {
    return err.type === "overloaded_error" || err.type === "api_error" || err.type === "rate_limit_error";
  }
  return status === 429 || status >= 500;
}

/** Resolves after `ms`, or at once when `signal` aborts. */
function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener("abort", done, { once: true });
  });
}

function hasText(content: readonly BetaContentBlock[]): boolean {
  return content.some((block) => block.type === "text" && block.text.trim() !== "");
}

/* -------------------------------------------------------------------------- */
/*                                 Providers                                  */
/* -------------------------------------------------------------------------- */

/** One round's inputs, whichever provider serves it. */
interface RoundInput {
  messages: BetaMessageParam[];
  /** Tools are off for this round (loop-policy.ts). */
  textOnly: boolean;
  /** The one re-ask after a text-only round came back with only tool calls. */
  forceNoTools?: boolean;
}

/** One round's result in the Messages API shape the loop works on. */
interface RoundResult {
  stop_reason: string | null;
  content: BetaContentBlock[];
}

const promptCache = new Map<string, string>();

/**
 * The system prompt for a provider. It names every provider of the
 * configured chain (not just this one) so it stays identical across rounds,
 * turns and fallbacks: a stable, cacheable prefix. With an Anthropic-only
 * chain it is exactly OPERATOR_SYSTEM_PROMPT.
 */
function systemPromptFor(provider: ResolvedProvider, processors: readonly string[]): string {
  const inlineContext = provider.kind === "openai";
  const key = `${inlineContext}\u0000${processors.join("\u0000")}`;
  let prompt = promptCache.get(key);
  if (prompt === undefined) {
    prompt = buildSystemPrompt({ processors, inlineContext });
    promptCache.set(key, prompt);
  }
  return prompt;
}

const chatToolCache = new Map<string, ChatTool[]>();

function chatToolsFor(provider: ResolvedProvider): ChatTool[] {
  const key = provider.schemaDialect ?? "";
  let tools = chatToolCache.get(key);
  if (!tools) {
    tools = toChatTools(OPERATOR_TOOLS, provider.schemaDialect);
    chatToolCache.set(key, tools);
  }
  return tools;
}

/** Until when (epoch ms) each provider is routed around after a failure. Per instance. */
const coolingUntil = new Map<ProviderId, number>();

function failureOf(err: unknown): { status?: number; headers?: { get(name: string): string | null } | null } | null {
  if (err instanceof ProviderError) return { status: err.status, headers: err.headers };
  if (err instanceof Anthropic.APIError) return { status: err.status, headers: err.headers };
  return null;
}

function coolDown(provider: ResolvedProvider, err: unknown): void {
  const failure = failureOf(err);
  if (!failure) return;
  const named = failure.headers?.get("retry-after-ms") ?? failure.headers?.get("retry-after");
  const ms = failureCooldownMs(failure.status, named ? retryWaitMs(failure.headers) : undefined);
  if (ms > 0) coolingUntil.set(provider.id, Date.now() + ms);
}

const isTransientStatus = (status: number | undefined) => status === undefined || status === 429 || status >= 500;

/**
 * One round on an OpenAI-compatible provider. A tool call whose arguments
 * are not JSON (or Groq's `tool_use_failed`, the same failure caught
 * server-side) re-issues the round, like streamRound does for Anthropic, but
 * only while nothing of it is on screen: without Anthropic's replay there is
 * no way to take the text back.
 */
async function streamCompatRound(
  provider: ResolvedProvider,
  input: RoundInput,
  options: RoundOptions,
  processors: readonly string[],
): Promise<RoundResult> {
  const { signal, deadlineAt, onStatus, onText, separate } = options;
  const request = {
    messages: toChatMessages(systemPromptFor(provider, processors), input.messages as unknown as LoopMessage[], provider),
    tools: chatToolsFor(provider),
    toolChoice: input.textOnly || input.forceNoTools ? ("none" as const) : ("auto" as const),
  };

  for (let jsonRetries = 0; ; ) {
    let wrote = false;
    try {
      const round = await streamChatCompletion(provider, request, {
        signal,
        onText: (delta) => {
          if (separate && !wrote) onText("\n\n");
          wrote = true;
          onText(delta);
        },
        onThinking: () => onStatus("thinking"),
        onToolStart: (name) => onStatus(isOperatorToolName(name) ? TOOL_STATUS[name] : "thinking"),
      });
      const content = [
        ...(round.text ? [{ type: "text", text: round.text, citations: null }] : []),
        ...round.toolCalls.map((call) => ({ type: "tool_use", id: call.id, name: call.name, input: call.input })),
      ] as unknown as BetaContentBlock[];
      return { stop_reason: round.stopReason, content };
    } catch (err) {
      if (signal.aborted) throw err;
      const malformed = err instanceof ToolCallParseError || (err instanceof ProviderError && err.code === "tool_use_failed");
      if (!malformed || wrote || jsonRetries >= OPERATOR_MAX_JSON_RETRIES || deadlineAt - Date.now() < OPERATOR_MIN_ROUND_MS) {
        throw err;
      }
      jsonRetries++;
      logOperatorError(`${provider.id}: malformed tool call, re-issuing the round`);
    }
  }
}

/** One round on one provider. */
function callProvider(
  provider: ResolvedProvider,
  input: RoundInput,
  options: RoundOptions,
  processors: readonly string[],
): Promise<RoundResult> {
  if (provider.kind === "openai") return streamCompatRound(provider, input, options, processors);

  const params: BetaMessageStreamParams = {
    model: provider.model,
    max_tokens: provider.maxTokens,
    // Static prompt, cached. Together with the tool definitions ahead of it
    // this is the stable prefix every conversation shares.
    system: [{ type: "text", text: systemPromptFor(provider, processors), cache_control: { type: "ephemeral" } }],
    tools: OPERATOR_TOOLS,
    messages: input.messages,
    // Top-level automatic caching: the growing conversation is re-read from
    // cache by each later round and each later turn.
    cache_control: { type: "ephemeral" },
    // Adaptive thinking with the default display (omitted on this model):
    // the persona forbids exposing internal reasoning, and only a
    // "thinking" status ever reaches the panel.
    thinking: { type: "adaptive" },
    output_config: { effort: OPERATOR_EFFORT },
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    // tool_choice otherwise stays unset: changing it invalidates the cached
    // conversation, so only the one forced re-ask pays that.
    ...(input.forceNoTools ? { tool_choice: { type: "none" as const } } : {}),
  };
  return streamRound(params, options);
}

/**
 * Runs a round on the first provider that serves it. A provider that fails
 * before any of this round reached the visitor (quota, rate limit, outage,
 * bad key, unknown model, a schema it rejects) hands the round to the next
 * one and is routed around for a while (failureCooldownMs). The last
 * provider gets the one short transient retry streamRound gives Anthropic.
 */
async function roundWithFallback(
  providers: readonly ResolvedProvider[],
  input: RoundInput,
  options: RoundOptions,
  processors: readonly string[],
): Promise<{ message: RoundResult; provider: ResolvedProvider }> {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    let wrote = false;
    const attempt: RoundOptions = {
      ...options,
      onText: (delta) => {
        wrote = true;
        options.onText(delta);
      },
    };
    try {
      return { message: await callProvider(provider, input, attempt, processors), provider };
    } catch (err) {
      if (options.signal.aborted) throw err;
      coolDown(provider, err);
      const next = providers[i + 1];
      const timeLeft = options.deadlineAt - Date.now();
      if (!wrote && next && timeLeft >= OPERATOR_MIN_ROUND_MS) {
        logOperatorError(`${provider.id} failed, handing the round to ${next.id}:`, err, failureOf(err)?.status);
        continue;
      }
      if (
        !wrote &&
        !next &&
        err instanceof ProviderError &&
        isTransientStatus(err.status) &&
        !options.retry.used
      ) {
        const wait = retryWaitMs(err.headers);
        if (mayRetryTransient(wait, timeLeft)) {
          options.retry.used = true;
          logOperatorError("transient upstream failure, retrying once after", undefined, `${Math.round(wait)} ms`, err.status);
          await pause(wait, options.signal);
          if (options.signal.aborted) throw err;
          i--;
          continue;
        }
      }
      throw err;
    }
  }
  throw new Error("no model provider can serve this round");
}

/* -------------------------------------------------------------------------- */
/*                                 Tool loop                                  */
/* -------------------------------------------------------------------------- */

interface LoopContext {
  messages: BetaMessageParam[];
  country: string;
  locale: Locale;
  signal: AbortSignal;
  /** When the response stream started; the deadline counts from here. */
  startedAt: number;
  emit: (event: OperatorEvent) => void;
  /** The configured provider chain, in order (providers.ts). */
  providers: readonly ResolvedProvider[];
}

interface RoundOptions {
  signal: AbortSignal;
  /** Epoch ms at which the route aborts; a retry must leave room before it. */
  deadlineAt: number;
  /** Shared by every round of one visitor message: one transient retry in all. */
  retry: { used: boolean };
  onStatus: (status: OperatorStatus) => void;
  onText: (delta: string) => void;
  /** An earlier round already put text on screen: open this round's text with a paragraph break. */
  separate: boolean;
}

/**
 * One model call, streamed. Text deltas go straight to the visitor.
 *
 * Two kinds of failure re-issue the same call:
 *  - A tool input the SDK cannot parse at all (the cost of
 *    `eager_input_streaming`): it rejects the iteration with a plain
 *    AnthropicError, up to OPERATOR_MAX_JSON_RETRIES consecutive times.
 *  - A transient API failure, once per visitor message, only before this
 *    attempt has shown any text and only when the wait fits the deadline.
 * Everything else is rethrown for toErrorCode. Text a failed attempt already
 * streamed cannot be taken back, so a retry suppresses its own text while it
 * repeats what is on screen and only emits from where it diverges.
 */
async function streamRound(params: BetaMessageStreamParams, options: RoundOptions): Promise<BetaMessage> {
  const { signal, deadlineAt, retry, onStatus, onText, separate } = options;
  let shown = "";
  let separated = false;
  // Whether the current attempt has put new text on screen.
  let wrote = false;
  const write = (delta: string) => {
    if (!delta) return;
    if (separate && !separated) {
      separated = true;
      onText("\n\n");
    }
    shown += delta;
    wrote = true;
    onText(delta);
  };

  for (let jsonRetries = 0; ; ) {
    let replaying = shown.length > 0;
    let replayed = "";
    wrote = false;
    let stream: BetaMessageStream | undefined;
    try {
      stream = getClient().beta.messages.stream(params, { signal });
      for await (const event of stream) {
        if (event.type === "content_block_start") {
          const block = event.content_block;
          if (block.type === "thinking" || block.type === "redacted_thinking") onStatus("thinking");
          else if (block.type === "tool_use") {
            onStatus(isOperatorToolName(block.name) ? TOOL_STATUS[block.name] : "thinking");
          }
        } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          if (!replaying) {
            write(event.delta.text);
            continue;
          }
          replayed += event.delta.text;
          if (shown.startsWith(replayed)) continue;
          replaying = false;
          write(replayed.startsWith(shown) ? replayed.slice(shown.length) : `\n\n${replayed}`);
        }
      }
      return await stream.finalMessage();
    } catch (err) {
      // Stop the failed attempt before anything else. A tool-input parse
      // failure ends the iteration WITHOUT aborting the request: the SDK
      // keeps reading the rest of the message, which the API keeps
      // generating and billing, alongside the retry. abort() on a finished
      // stream is a no-op.
      stream?.abort();
      if (signal.aborted) throw err;
      if (err instanceof Anthropic.APIError) {
        const wait = isTransient(err) && !retry.used && !wrote ? retryWaitMs(err.headers) : null;
        if (wait === null || !mayRetryTransient(wait, deadlineAt - Date.now())) throw err;
        retry.used = true;
        logOperatorError("transient upstream failure, retrying once after", undefined, `${Math.round(wait)} ms`, err.status);
        await pause(wait, signal);
        if (signal.aborted) throw err;
        continue;
      }
      // A re-issue the deadline would cut off anyway is only cost.
      if (jsonRetries >= OPERATOR_MAX_JSON_RETRIES || deadlineAt - Date.now() < OPERATOR_MIN_ROUND_MS) throw err;
      jsonRetries++;
      logOperatorError("unparseable tool input, re-issuing the round");
    }
  }
}

/**
 * The manual agentic loop (streaming variant). Emits status/text/artifact
 * events as it goes and ends with exactly one done or error event; throws
 * for anything toErrorCode should classify.
 */
async function runOperator({ messages, country, locale, signal, startedAt, emit, providers }: LoopContext): Promise<void> {
  const deadlineAt = startedAt + OPERATOR_DEADLINE_MS;
  const retry = { used: false };
  const processors = providers.map((provider) => provider.label);
  // The provider that served the previous round goes first in the next one.
  let servedBy: ResolvedProvider | undefined;
  const candidates = (round: number): ResolvedProvider[] => {
    const ordered = orderForRequest(providers, coolingUntil, Date.now());
    const list = servedBy ? [servedBy, ...ordered.filter((provider) => provider !== servedBy)] : ordered;
    // Claude continues a tool loop only with its own thinking blocks, which
    // rounds another model served do not have: it can start a turn, or take
    // over from itself, but not take over from another provider.
    return round > 0 && servedBy?.kind !== "anthropic" ? list.filter((provider) => provider.kind !== "anthropic") : list;
  };
  let lastStatus: OperatorStatus | null = null;
  let anyText = false;
  // Text or a visual has reached the visitor this turn.
  let shown = false;
  let noted = false;

  const onStatus = (status: OperatorStatus) => {
    if (status === lastStatus) return;
    lastStatus = status;
    emit({ type: "status", status });
  };
  const onText = (delta: string) => {
    anyText = true;
    shown = true;
    lastStatus = null; // text hides the status line; the next status must be sent again
    emit({ type: "text", delta });
  };
  const onArtifact = (artifact: Artifact) => {
    shown = true;
    emit({ type: "artifact", artifact });
  };

  // Something on screen before the first upstream byte.
  onStatus("thinking");

  for (let round = 0; round < OPERATOR_MAX_TOOL_ROUNDS; round++) {
    if (signal.aborted) return;
    // From the time LEFT: a round that starts is only bounded by the deadline.
    const plan = planRound(round, Date.now() - startedAt, shown);
    if (plan === "stop") {
      emit({ type: "done" });
      return;
    }
    // After a tool round the status would still read "mapping" etc. while
    // Claude considers the result; the model may not open a thinking block.
    if (round > 0) onStatus("thinking");
    const textOnly = plan === "text";
    // Tell the model its tools are off, once, where the API takes a system
    // message: right after the tool results. (Not after a pause_turn
    // continuation, where an assistant turn is last.) For Claude, tool_choice
    // stays as it is: changing it invalidates the cached conversation. The
    // OpenAI-compatible providers also get tool_choice "none" (callProvider).
    if (textOnly && !noted && messages.at(-1)?.role === "user") {
      messages.push({ role: "system", content: TEXT_ONLY_NOTE });
      noted = true;
    }

    const input: RoundInput = { messages, textOnly };
    const roundOptions: RoundOptions = { signal, deadlineAt, retry, onStatus, onText, separate: anyText };

    const { message, provider } = await roundWithFallback(candidates(round), input, roundOptions, processors);
    servedBy = provider;

    // The chain as a whole declined (the fallback model too, or none ran).
    if (message.stop_reason === "refusal") {
      emit({ type: "error", code: "refusal" });
      return;
    }
    // After a mid-output fallback, only the serving model's tool calls exist.
    const { echoed, served } = splitAtFallback(message.content);
    const toolUses = served.filter((block): block is BetaToolUseBlock => block.type === "tool_use");

    if (textOnly && toolUses.length) {
      // Tools are off in this round whatever the model does: nothing runs. If
      // it also said nothing, ask once more with tool_choice "none", the one
      // place where paying the cache miss is worth it.
      if (!hasText(message.content) && deadlineAt - Date.now() >= OPERATOR_MIN_ROUND_MS) {
        const forced = await callProvider(provider, { ...input, forceNoTools: true }, roundOptions, processors);
        if (forced.stop_reason === "refusal") {
          emit({ type: "error", code: "refusal" });
          return;
        }
      }
      emit({ type: "done" });
      return;
    }
    // A tool input cut off at max_tokens usually still parses as a valid
    // partial object, so this is what catches it.
    if (message.stop_reason === "max_tokens" && toolUses.length) {
      emit({ type: "error", code: "truncated" });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: echoed });
      continue;
    }
    if (!toolUses.length) {
      emit({ type: "done" });
      return;
    }

    // Thinking blocks round-trip unchanged; after a fallback, only the text
    // of the declined partial does (splitAtFallback).
    messages.push({ role: "assistant", content: echoed });
    const results: BetaToolResultBlockParam[] = [];
    for (const block of toolUses) {
      const outcome = runTool(block.name, block.input, { toolUseId: block.id, country, locale });
      if (outcome.artifact) onArtifact(outcome.artifact);
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: outcome.content,
        ...(outcome.isError ? { is_error: true } : {}),
      });
    }
    // Every result for the round in ONE user message.
    messages.push({ role: "user", content: results });
  }

  emit({ type: "done" });
}

/* -------------------------------------------------------------------------- */
/*                                   Route                                    */
/* -------------------------------------------------------------------------- */

/**
 * Whether the Operator can take requests right now: 204 or 503, no body.
 * OPERATOR_ENABLED is read per request here, while the launcher is baked
 * into prerendered and ISR pages at build or revalidate time; the panel can
 * ask this before it opens.
 */
export async function GET() {
  return new Response(null, {
    status: isOperatorEnabled() && hasCredentials() ? 204 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isOperatorEnabled()) return fail(503, "unavailable");
    if (isCrossSite(req)) return fail(403, "forbidden");

    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > OPERATOR_LIMITS.maxBodyBytes) return fail(413, "too_large");
    const raw = await readBodyCapped(req, OPERATOR_LIMITS.maxBodyBytes);
    if (raw === null) return fail(413, "too_large");

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return fail(400, "bad_request");
    }
    const parsed = parseRequest(body);
    if (!parsed.ok) return fail(400, parsed.code);

    const limit = checkRateLimit(clientKey(req), Date.now());
    if (!limit.ok) return fail(429, "rate_limited", { "Retry-After": String(limit.retryAfterSeconds) });

    const chain = resolveProviderChain();
    if (chain.skipped.length && !warnedSkipped) {
      warnedSkipped = true;
      logOperatorError("OPERATOR_PROVIDERS entries skipped (unknown, or no key/model/base URL):", undefined, chain.skipped.join(", "));
    }
    if (!chain.providers.length) {
      if (!warnedMissingKey) {
        warnedMissingKey = true;
        logOperatorError("no model provider is configured: set GROQ_API_KEY, GEMINI_API_KEY, CEREBRAS_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY, OPENAI_COMPATIBLE_* or ANTHROPIC_API_KEY");
      }
      return fail(503, "unavailable");
    }

    const { locale, country } = parsed.value;
    const { turns, fromStart } = fitHistory(parsed.value.turns);
    const messages = buildMessages(turns, { locale, country, fromStart });

    // Aborts the upstream call when the visitor closes the panel or navigates
    // away (req.signal) or when the response stream is cancelled.
    const upstream = new AbortController();
    const abortUpstream = () => upstream.abort();
    if (req.signal.aborted) upstream.abort();
    else req.signal.addEventListener("abort", abortUpstream, { once: true });
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const startedAt = Date.now();
        let closed = false;
        // Exactly one done/error per response: anything after the first
        // terminal event is dropped here, whatever path produced it.
        let terminal = false;
        // Whether text or a visual reached the visitor: decides what a
        // deadline means to them.
        let shown = false;
        const emit = (event: OperatorEvent) => {
          if (closed || terminal) return;
          if (event.type === "done" || event.type === "error") terminal = true;
          if (event.type === "text" || event.type === "artifact") shown = true;
          try {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          } catch {
            // The consumer is gone; stop paying for tokens nobody will read.
            closed = true;
            upstream.abort();
          }
        };
        // Our own deadline also aborts upstream, but unlike a disconnect the
        // visitor is still there and gets an error event.
        let timedOut = false;
        const deadline = setTimeout(() => {
          timedOut = true;
          upstream.abort();
        }, OPERATOR_DEADLINE_MS);
        try {
          await runOperator({ messages, country, locale, signal: upstream.signal, startedAt, emit, providers: chain.providers });
        } catch (err) {
          // An abort (disconnect or deadline) surfaces as an SDK abort error:
          // nothing to classify or log.
          const code = upstream.signal.aborted ? null : toErrorCode(err);
          if (code) emit({ type: "error", code });
        } finally {
          clearTimeout(deadline);
          // With part of the reply on screen the deadline cut it off: what
          // is there stays valid ("truncated"). With nothing, the upstream
          // call stalled and a plain retry is the right offer.
          if (timedOut) emit({ type: "error", code: shown ? "truncated" : "upstream" });
          req.signal.removeEventListener("abort", abortUpstream);
          // No upstream request outlives the response, including a failed
          // attempt the SDK is still reading. A no-op when nothing is open.
          upstream.abort();
          if (!closed) {
            closed = true;
            try {
              controller.close();
            } catch {
              // Already cancelled by the consumer.
            }
          }
        }
      },
      cancel() {
        upstream.abort();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        // no-transform keeps compression layers from buffering the stream.
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    logOperatorError("request failed:", err);
    return fail(500, "internal");
  }
}
