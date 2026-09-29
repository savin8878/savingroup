// lib/operator/config.ts
//
// Server-side knobs for the Savin Operator. Pure (no SDK, no next/*) so the
// rate limiter and the tests can import it under Node's type stripping.
//
// The route is public and every request is billed, so most of these numbers
// are cost and abuse ceilings first and quality settings second.

/** The model behind the Operator. */
export const OPERATOR_MODEL = "claude-opus-5";

/**
 * Reasoning effort. `medium` rather than the model's `high` default: this is
 * a chat panel on a marketing site, where time-to-first-token is what the
 * visitor feels, and the hard reasoning (arithmetic, graph validity) is done
 * deterministically by the server's tools anyway.
 */
export const OPERATOR_EFFORT = "medium" as const;

/**
 * Per-round output ceiling. A cost ceiling for a public endpoint rather than
 * a quality target: replies are meant to be short, and 16k still leaves room
 * for adaptive thinking plus one large tool input (a full X-Ray or brief).
 * Streaming is always on, so the SDK's long-request guard never applies.
 */
export const OPERATOR_MAX_TOKENS = 16000;

/**
 * Model calls per visitor message. The last one cannot call tools (see
 * loop-policy.ts), so a turn always ends in text even if Claude keeps
 * reaching for them.
 */
export const OPERATOR_MAX_TOOL_ROUNDS = 6;

/**
 * The route's `maxDuration`, in seconds. Next.js only reads that export as a
 * literal, so app/api/operator/route.ts repeats the number and a test keeps
 * the two equal. 60 is valid on every Vercel plan and mode; raise both only
 * after confirming Fluid compute in the Vercel dashboard. Every budget below
 * follows from it.
 */
export const OPERATOR_MAX_DURATION_S = 60;

/**
 * Hard stop for one response, in ms. Past this the upstream call is aborted
 * and the stream ends with an error event, so the panel always receives a
 * terminal event instead of a connection Vercel cut at maxDuration.
 */
export const OPERATOR_DEADLINE_MS = OPERATOR_MAX_DURATION_S * 1000 - 5_000;

/**
 * A round may call tools only while at least this much of the deadline is
 * left. The budget is checked between rounds, never inside one, so it has to
 * cover the worst round that can still start: adaptive thinking plus the
 * largest tool input (a full X-Ray or brief), then the text round that must
 * follow it. With less left, the round is told to answer in text.
 */
export const OPERATOR_TOOL_ROUND_RESERVE_MS = 30_000;

/**
 * With less than this left, a new round would most likely be cut off
 * mid-sentence. Once the visitor has something on screen the turn ends there
 * instead of starting it.
 */
export const OPERATOR_MIN_ROUND_MS = 8_000;

/**
 * The one retry of a transient API failure (429, 5xx, 529, dropped
 * connection) allowed per visitor message. The SDK's own retries are off:
 * they honour any Retry-After, however long, and would sleep through the
 * deadline. Here a retry happens only when the API asks for a short wait and
 * enough of the deadline is left for the round to finish afterwards;
 * otherwise the visitor is told "busy" at once.
 */
export const OPERATOR_TRANSIENT_RETRY = {
  /** Used when the response names no wait (5xx, a dropped connection). */
  defaultWaitMs: 1_000,
  maxWaitMs: 2_000,
  minRemainingMs: 25_000,
} as const;

/**
 * Consecutive re-issues of one round when a streamed tool input cannot be
 * parsed as JSON (the cost of `eager_input_streaming`). API errors are not
 * counted here; OPERATOR_TRANSIENT_RETRY covers those.
 */
export const OPERATOR_MAX_JSON_RETRIES = 2;

/**
 * Server-side refusal fallback. The scalar `fallbacks: "default"` form pairs
 * with this exact header; the array form uses an older one and mixing the two
 * is a 400.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

/**
 * Per-IP request budget, enforced by `rate-limit.ts` as two sliding windows.
 * Generous for a person having a real conversation (a message every 30 s for
 * ten minutes), tight for a script.
 */
export const OPERATOR_RATE_LIMITS = {
  burstWindowMs: 10 * 60 * 1000,
  burstMax: 20,
  dayWindowMs: 24 * 60 * 60 * 1000,
  dayMax: 150,
} as const;

/**
 * `OPERATOR_ENABLED=false` makes POST /api/operator return 503 and GET report
 * the Operator as off, on every request. The launcher is rendered by the
 * locale layout, so prerendered and ISR pages keep it until they are rebuilt
 * or revalidated; force-dynamic pages drop it at once.
 */
export function isOperatorEnabled(): boolean {
  return process.env.OPERATOR_ENABLED !== "false";
}

/**
 * Whether the Anthropic client can authenticate. Checked before the stream
 * opens so a missing key is a clean 503 ("unavailable"), not a stream that
 * starts and then errors.
 */
export function hasCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
