// lib/operator/loop-policy.ts
//
// The decisions the route's tool loop makes between model calls, pulled out
// of app/api/operator/route.ts so they can be tested offline: whether the
// next round may call tools, which blocks of a reply are echoed back and run
// after a server-side fallback, and whether a transient API failure is worth
// its one retry.
//
// Pure: no SDK, no next/*. Block and header shapes are structural.

import {
  OPERATOR_DEADLINE_MS,
  OPERATOR_MAX_TOOL_ROUNDS,
  OPERATOR_MIN_ROUND_MS,
  OPERATOR_TOOL_ROUND_RESERVE_MS,
  OPERATOR_TRANSIENT_RETRY,
} from "./config";

/* -------------------------------------------------------------------------- */
/*                                 Time budget                                */
/* -------------------------------------------------------------------------- */

/**
 *  - tools  a normal round
 *  - text   tools are off: the last round, or too little of the deadline is
 *           left for a tool round and the text round after it
 *  - stop   too little is left for any round; the visitor already has
 *           something on screen, so the turn ends with `done`
 */
export type RoundPlan = "tools" | "text" | "stop";

/**
 * Decided before each round from the time LEFT, not the time spent: nothing
 * bounds a round once it has started except max_tokens and the deadline, so
 * the question is whether the worst round that could start now still fits.
 *
 * `shown` is whether any text or visual has reached the visitor this turn.
 * Without it the turn never stops early: a short text round is still the
 * visitor's best chance of an answer.
 */
export function planRound(round: number, elapsedMs: number, shown: boolean): RoundPlan {
  const remaining = OPERATOR_DEADLINE_MS - elapsedMs;
  if (round > 0 && shown && remaining < OPERATOR_MIN_ROUND_MS) return "stop";
  if (round >= OPERATOR_MAX_TOOL_ROUNDS - 1 || remaining < OPERATOR_TOOL_ROUND_RESERVE_MS) return "text";
  return "tools";
}

/**
 * Sent as a mid-conversation system message after the tool results when a
 * round is told to answer in text. Without it Claude only notices that it
 * cannot call a tool after announcing one ("let me redraw the map"), and the
 * visitor waits for a visual that never comes. Phrased as context, not as an
 * override: the model guide warns that command-style system text is treated
 * with suspicion.
 */
export const TEXT_ONLY_NOTE =
  "Tool calls are switched off for the rest of this reply: the time or step budget for tools in this turn is used up. " +
  "The visitor is waiting for an answer in text, based on the results above. " +
  "Anything not rendered yet will not appear in this reply, so if a visual would still help, offer to draw it in your next reply rather than announcing it now.";

/* -------------------------------------------------------------------------- */
/*                             Server-side fallback                           */
/* -------------------------------------------------------------------------- */

/**
 * With `fallbacks: "default"` a model that declines MID-OUTPUT keeps its
 * partial in `content`, a `fallback` block marks the switch, and the next
 * model continues after it; the final `stop_reason` is that model's, so a
 * refusal check never sees the decline. Only the partial's TEXT reached the
 * model that continued (as continuation context). Everything else before the
 * last boundary was written by a model that no longer serves this turn:
 *
 *  - echoed  what goes back into `messages`: text before the boundary, and
 *            the boundary plus everything after it. thinking,
 *            redacted_thinking, tool_use and unknown internal blocks before
 *            it are dropped, as the fallback docs require. The boundary
 *            block itself is kept: the server uses it to tell thinking runs
 *            on either side apart.
 *  - served  the blocks the serving model wrote. Only its tool_use blocks may
 *            run: a pre-boundary tool_use was cut off mid-input, and the
 *            SDK's tolerant parser hands it over as a silently truncated
 *            object that can still pass validation.
 *
 * Without a boundary both are the whole content.
 */
export function splitAtFallback<Block extends { type: string }>(
  content: readonly Block[],
): { echoed: Block[]; served: Block[] } {
  const boundary = content.findLastIndex((block) => block.type === "fallback");
  if (boundary < 0) return { echoed: [...content], served: [...content] };
  return {
    echoed: content.filter((block, index) => index >= boundary || block.type === "text"),
    served: content.slice(boundary + 1),
  };
}

/* -------------------------------------------------------------------------- */
/*                               Transient retry                              */
/* -------------------------------------------------------------------------- */

export interface HeaderReader {
  get(name: string): string | null;
}

/**
 * How long the API asked us to wait before retrying: `retry-after-ms`, else
 * `retry-after` in seconds or as an HTTP date, the same precedence the SDK
 * uses. Falls back to OPERATOR_TRANSIENT_RETRY.defaultWaitMs when the
 * response names no usable wait.
 */
export function retryWaitMs(headers: HeaderReader | null | undefined, now = Date.now()): number {
  const fallback = OPERATOR_TRANSIENT_RETRY.defaultWaitMs;
  const ms = Number.parseFloat(headers?.get("retry-after-ms") ?? "");
  if (Number.isFinite(ms) && ms > 0) return ms;
  const raw = headers?.get("retry-after")?.trim();
  if (!raw) return fallback;
  const seconds = Number.parseFloat(raw);
  if (Number.isFinite(seconds)) return seconds > 0 ? seconds * 1000 : fallback;
  const date = Date.parse(raw) - now;
  return Number.isFinite(date) && date > 0 ? date : fallback;
}

/**
 * A retry is worth it only when the wait is short and the round can still
 * finish inside the deadline afterwards. Otherwise failing fast is kinder:
 * the visitor sees "busy" at once instead of a long "thinking" that ends in
 * the same error.
 */
export function mayRetryTransient(waitMs: number, remainingMs: number): boolean {
  return waitMs <= OPERATOR_TRANSIENT_RETRY.maxWaitMs && remainingMs - waitMs >= OPERATOR_TRANSIENT_RETRY.minRemainingMs;
}
