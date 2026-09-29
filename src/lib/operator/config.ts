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
 * Model calls per visitor message. The last one is sent with
 * `tool_choice: none`, so a turn always ends in text even if Claude keeps
 * reaching for tools.
 */
export const OPERATOR_MAX_TOOL_ROUNDS = 6;

/**
 * Wall-clock budget, in ms, after which the next round is forced to answer in
 * text. The route's `maxDuration` is 60 s and covers the WHOLE stream, so a
 * slow tool loop has to be wound down well before Vercel cuts it off.
 */
export const OPERATOR_FORCE_TEXT_AFTER_MS = 30_000;

/**
 * Hard stop for one response, in ms. Past this the upstream call is aborted
 * and the stream ends with an error event, so the panel always receives a
 * terminal event instead of a connection Vercel cut at 60 s.
 */
export const OPERATOR_DEADLINE_MS = 55_000;

/**
 * Consecutive re-issues of one round when a streamed tool input cannot be
 * parsed as JSON (the cost of `eager_input_streaming`). API errors are never
 * retried here; the SDK's own retry policy covers those.
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

/** `OPERATOR_ENABLED=false` hides the launcher and makes the route return 503. */
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
