// lib/operator/rate-limit.ts
//
// Per-IP sliding-window limiter for POST /api/operator: a burst window (20
// requests per 10 minutes) and a daily window (150 per 24 hours), both from
// config.ts.
//
// BEST EFFORT, PER INSTANCE. State lives in this module's memory, so every
// serverless instance counts on its own and a cold start forgets everything.
// It stops one browser tab or a naive script from running up the bill; it
// does not stop a distributed attack. The durable control is a Vercel
// Firewall rate-limit rule on /api/operator (see .env.example), which runs
// before the function is invoked and is shared across instances.
//
// `now` is passed in rather than read from the clock so the tests can move
// time without fakes. Pure.

import { OPERATOR_RATE_LIMITS } from "./config";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/** Upper bound on tracked keys, so a spray of spoofed IPs cannot grow memory without limit. */
const MAX_KEYS = 5000;
/** How often (ms) idle keys are swept. */
const PRUNE_EVERY_MS = 60 * 1000;

// Timestamps of ACCEPTED requests per key, oldest first. Rejected requests are
// not recorded, so a client that keeps retrying is not locked out forever.
const hits = new Map<string, number[]>();
let lastPrune = 0;

/** Drops keys with no request inside the day window, then the least recently used beyond MAX_KEYS. */
function prune(now: number): void {
  lastPrune = now;
  const horizon = now - OPERATOR_RATE_LIMITS.dayWindowMs;
  for (const [key, times] of hits) {
    if ((times[times.length - 1] ?? 0) <= horizon) hits.delete(key);
  }
  // Map iteration order is insertion order, and every accepted request
  // re-inserts its key, so the first keys are the least recently used.
  for (const key of hits.keys()) {
    if (hits.size <= MAX_KEYS) break;
    hits.delete(key);
  }
}

/** Seconds until the oldest request inside a window leaves it (at least 1). */
function secondsUntilExpiry(oldest: number, windowMs: number, now: number): number {
  return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
}

/**
 * Records a request for `key` at `now` if it fits both windows; otherwise
 * says how long to wait (for the Retry-After header).
 */
export function checkRateLimit(key: string, now: number): RateLimitResult {
  if (now - lastPrune >= PRUNE_EVERY_MS || hits.size > MAX_KEYS) prune(now);

  const { burstWindowMs, burstMax, dayWindowMs, dayMax } = OPERATOR_RATE_LIMITS;
  const times = (hits.get(key) ?? []).filter((time) => time > now - dayWindowMs);

  if (times.length >= dayMax) {
    return { ok: false, retryAfterSeconds: secondsUntilExpiry(times[times.length - dayMax] ?? now, dayWindowMs, now) };
  }
  const recent = times.filter((time) => time > now - burstWindowMs);
  if (recent.length >= burstMax) {
    return {
      ok: false,
      retryAfterSeconds: secondsUntilExpiry(recent[recent.length - burstMax] ?? now, burstWindowMs, now),
    };
  }

  times.push(now);
  hits.delete(key);
  hits.set(key, times);
  return { ok: true };
}
