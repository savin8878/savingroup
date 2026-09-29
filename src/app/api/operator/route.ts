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
// Needs ANTHROPIC_API_KEY (server-only). OPERATOR_ENABLED="false" turns the
// route off. The in-memory rate limit is per instance; the real ceiling is a
// Vercel Firewall rule on /api/operator (see .env.example).

import Anthropic from "@anthropic-ai/sdk";
import type {
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
  OPERATOR_FORCE_TEXT_AFTER_MS,
  OPERATOR_MAX_JSON_RETRIES,
  OPERATOR_MAX_TOKENS,
  OPERATOR_MAX_TOOL_ROUNDS,
  OPERATOR_MODEL,
  hasCredentials,
  isOperatorEnabled,
} from "@/lib/operator/config";
import { buildMessages, parseRequest } from "@/lib/operator/history";
import {
  OPERATOR_LIMITS,
  type Locale,
  type OperatorErrorCode,
  type OperatorEvent,
  type OperatorStatus,
} from "@/lib/operator/protocol";
import { checkRateLimit } from "@/lib/operator/rate-limit";
import { OPERATOR_SYSTEM_PROMPT } from "@/lib/operator/system-prompt";
import { OPERATOR_TOOLS, TOOL_STATUS, isOperatorToolName, runTool } from "@/lib/operator/tools";

// Node, not edge: the knowledge index and the SDK are large bundles, and the
// tool loop can run for tens of seconds.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 60 s is valid on every Vercel plan and mode. It covers the WHOLE stream, so
// the tool loop must finish inside it (config.ts forces a text-only round
// after OPERATOR_FORCE_TEXT_AFTER_MS). Raise only after confirming Fluid
// compute in the Vercel dashboard.
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
 * ANTHROPIC_AUTH_TOKEN. One SDK retry absorbs a transient 429/529/5xx
 * without eating much of the 60 s budget.
 */
function getClient(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1 });
  return client;
}

let warnedMissingKey = false;

/**
 * Maps a failure inside the stream to the code the panel shows. Messages are
 * logged, never sent. Returns null for a client disconnect: nobody is left
 * to tell.
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
    console.error("Operator endpoint error: Anthropic rejected the credentials", err.status);
    return "unavailable";
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error("Operator endpoint error: upstream rejected the request:", err.message);
    return "upstream";
  }
  if (err instanceof Anthropic.APIConnectionError) return "upstream";
  // Other API failures (5xx, an `api_error` event mid-stream) are upstream
  // too; "internal" is kept for bugs in this handler.
  if (err instanceof Anthropic.APIError) {
    console.error("Operator endpoint error: upstream failure", err.status, err.message);
    return "upstream";
  }
  console.error("Operator endpoint error:", err);
  return "internal";
}

/* -------------------------------------------------------------------------- */
/*                                 Tool loop                                  */
/* -------------------------------------------------------------------------- */

interface LoopContext {
  messages: BetaMessageParam[];
  country: string;
  locale: Locale;
  signal: AbortSignal;
  emit: (event: OperatorEvent) => void;
}

interface RoundCallbacks {
  onStatus: (status: OperatorStatus) => void;
  onText: (delta: string) => void;
  /** An earlier round already put text on screen: open this round's text with a paragraph break. */
  separate: boolean;
}

/**
 * One model call, streamed. Text deltas go straight to the visitor.
 *
 * With `eager_input_streaming` the SDK parses each tool input when its block
 * closes, and input it cannot parse at all rejects the iteration with a
 * plain AnthropicError. That case (only) re-issues the same round, up to
 * OPERATOR_MAX_JSON_RETRIES consecutive times; API errors are rethrown for
 * toErrorCode. Text the failed attempt already streamed cannot be taken back,
 * so the retry suppresses its own text while it repeats what is on screen
 * and only emits from where it diverges.
 */
async function streamRound(
  params: BetaMessageStreamParams,
  signal: AbortSignal,
  callbacks: RoundCallbacks,
): Promise<BetaMessage> {
  let shown = "";
  let separated = false;
  const write = (delta: string) => {
    if (!delta) return;
    if (callbacks.separate && !separated) {
      separated = true;
      callbacks.onText("\n\n");
    }
    shown += delta;
    callbacks.onText(delta);
  };

  for (let attempt = 0; ; attempt++) {
    let replaying = shown.length > 0;
    let replayed = "";
    try {
      const stream = getClient().beta.messages.stream(params, { signal });
      for await (const event of stream) {
        if (event.type === "content_block_start") {
          const block = event.content_block;
          if (block.type === "thinking" || block.type === "redacted_thinking") callbacks.onStatus("thinking");
          else if (block.type === "tool_use") {
            callbacks.onStatus(isOperatorToolName(block.name) ? TOOL_STATUS[block.name] : "thinking");
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
      if (err instanceof Anthropic.APIError || signal.aborted || attempt >= OPERATOR_MAX_JSON_RETRIES) throw err;
      console.error("Operator endpoint error: unparseable tool input, re-issuing the round");
    }
  }
}

/**
 * The manual agentic loop (streaming variant). Emits status/text/artifact
 * events as it goes and ends with exactly one done or error event; throws
 * for anything toErrorCode should classify.
 */
async function runOperator({ messages, country, locale, signal, emit }: LoopContext): Promise<void> {
  const startedAt = Date.now();
  let lastStatus: OperatorStatus | null = null;
  let anyText = false;

  const onStatus = (status: OperatorStatus) => {
    if (status === lastStatus) return;
    lastStatus = status;
    emit({ type: "status", status });
  };
  const onText = (delta: string) => {
    anyText = true;
    lastStatus = null; // text hides the status line; the next status must be sent again
    emit({ type: "text", delta });
  };

  // Something on screen before the first upstream byte.
  onStatus("thinking");

  for (let round = 0; round < OPERATOR_MAX_TOOL_ROUNDS; round++) {
    if (signal.aborted) return;
    // After a tool round the status would still read "mapping" etc. while
    // Claude considers the result; the model may not open a thinking block.
    if (round > 0) onStatus("thinking");
    // The last round cannot call tools, so the visitor always gets an answer
    // in text; the same applies once the time budget is mostly spent.
    const finalRound = round === OPERATOR_MAX_TOOL_ROUNDS - 1 || Date.now() - startedAt > OPERATOR_FORCE_TEXT_AFTER_MS;

    const params: BetaMessageStreamParams = {
      model: OPERATOR_MODEL,
      max_tokens: OPERATOR_MAX_TOKENS,
      // Static prompt, cached. Together with the tool definitions ahead of it
      // this is the stable prefix every conversation shares.
      system: [{ type: "text", text: OPERATOR_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: OPERATOR_TOOLS,
      messages,
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
      ...(finalRound ? { tool_choice: { type: "none" as const } } : {}),
    };

    const message = await streamRound(params, signal, { onStatus, onText, separate: anyText });

    // A refusal can cut a tool_use off mid-input; never run that round's tools.
    if (message.stop_reason === "refusal") {
      emit({ type: "error", code: "refusal" });
      return;
    }
    const toolUses = message.content.filter((block): block is BetaToolUseBlock => block.type === "tool_use");
    // A tool input cut off at max_tokens usually still parses as a valid
    // partial object, so this is what catches it.
    if (message.stop_reason === "max_tokens" && toolUses.length) {
      emit({ type: "error", code: "truncated" });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    if (!toolUses.length) {
      emit({ type: "done" });
      return;
    }

    // Unchanged: thinking blocks (and any fallback blocks) must round-trip.
    messages.push({ role: "assistant", content: message.content });
    const results: BetaToolResultBlockParam[] = [];
    for (const block of toolUses) {
      const outcome = runTool(block.name, block.input, { toolUseId: block.id, country, locale });
      if (outcome.artifact) emit({ type: "artifact", artifact: outcome.artifact });
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

    if (!hasCredentials()) {
      if (!warnedMissingKey) {
        warnedMissingKey = true;
        console.error("Operator endpoint error: ANTHROPIC_API_KEY is not set");
      }
      return fail(503, "unavailable");
    }

    const { locale, country, turns } = parsed.value;
    const messages = buildMessages(turns, { locale, country });

    // Aborts the upstream call when the visitor closes the panel or navigates
    // away (req.signal) or when the response stream is cancelled.
    const upstream = new AbortController();
    const abortUpstream = () => upstream.abort();
    if (req.signal.aborted) upstream.abort();
    else req.signal.addEventListener("abort", abortUpstream, { once: true });
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;
        // Exactly one done/error per response: anything after the first
        // terminal event is dropped here, whatever path produced it.
        let terminal = false;
        const emit = (event: OperatorEvent) => {
          if (closed || terminal) return;
          if (event.type === "done" || event.type === "error") terminal = true;
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
          await runOperator({ messages, country, locale, signal: upstream.signal, emit });
        } catch (err) {
          // An abort (disconnect or deadline) surfaces as an SDK abort error:
          // nothing to classify or log.
          const code = upstream.signal.aborted ? null : toErrorCode(err);
          if (code) emit({ type: "error", code });
        } finally {
          clearTimeout(deadline);
          if (timedOut) emit({ type: "error", code: "upstream" });
          req.signal.removeEventListener("abort", abortUpstream);
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
    console.error("Operator endpoint error:", err);
    return fail(500, "internal");
  }
}
