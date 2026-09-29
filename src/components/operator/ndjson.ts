// components/operator/ndjson.ts
//
// Incremental reader for the POST /api/operator response body: one JSON
// OperatorEvent per line (NDJSON).
//
// fetch() hands the body over in arbitrary chunks, so a line can arrive split
// across two reads, several lines can share one, and a proxy may rewrite
// "\n" as "\r\n". This buffers until a full line exists, parses it, and emits
// only objects shaped like a known event. Anything else is counted and
// skipped rather than thrown: one bad line must not end a reply the visitor
// is already reading.
//
// Pure (no React, no DOM, type-only imports) so scripts/operator-client.test.mjs
// can load it under Node's type stripping.

import type { Artifact, OperatorErrorCode, OperatorEvent, OperatorStatus } from "@/lib/operator/protocol";

/* Records rather than arrays so the compiler flags a status, code or artifact
   type added to protocol.ts but not here. */
const STATUSES: Record<OperatorStatus, true> = {
  thinking: true,
  searching: true,
  calculating: true,
  mapping: true,
  simulating: true,
  drafting: true,
};

const ERROR_CODES: Record<OperatorErrorCode, true> = {
  bad_request: true,
  too_large: true,
  forbidden: true,
  rate_limited: true,
  unavailable: true,
  overloaded: true,
  refusal: true,
  truncated: true,
  upstream: true,
  internal: true,
};

const ARTIFACT_TYPES: Record<Artifact["type"], true> = {
  graph: true,
  simulation: true,
  impact: true,
  xray: true,
  brief: true,
  sources: true,
};

/**
 * A single line longer than this is a broken stream, not a large artifact
 * (the server caps artifacts far below it). Without a ceiling a response
 * that never sends "\n" would grow the buffer until the tab runs out of
 * memory.
 */
const MAX_LINE_CHARS = 1_000_000;

const own = (record: object, key: string) => Object.prototype.hasOwnProperty.call(record, key);

export function isOperatorStatus(value: unknown): value is OperatorStatus {
  return typeof value === "string" && own(STATUSES, value);
}

export function isOperatorErrorCode(value: unknown): value is OperatorErrorCode {
  return typeof value === "string" && own(ERROR_CODES, value);
}

/**
 * Envelope check only: a known `type` and a string `id`. The server has
 * already validated the payload with the same validators it applies to tool
 * input, and the views render defensively, so re-checking every field here
 * would duplicate the server's schema in the client bundle. Also used to
 * vet artifacts restored from sessionStorage.
 */
export function isArtifactEnvelope(value: unknown): value is Artifact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as { type?: unknown; id?: unknown };
  return typeof v.type === "string" && own(ARTIFACT_TYPES, v.type) && typeof v.id === "string";
}

/**
 * One parsed JSON value → an OperatorEvent, or null when it is not one.
 *
 * Two deliberate normalisations instead of drops: an unknown status becomes
 * "thinking" (a newer server must not blank the status line) and an unknown
 * error code becomes "internal" (an error must never be swallowed, or the
 * panel would wait forever for a reply that is not coming).
 */
export function toOperatorEvent(value: unknown): OperatorEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  switch (v.type) {
    case "status":
      return typeof v.status === "string" ? { type: "status", status: isOperatorStatus(v.status) ? v.status : "thinking" } : null;
    case "text":
      return typeof v.delta === "string" ? { type: "text", delta: v.delta } : null;
    case "artifact":
      return isArtifactEnvelope(v.artifact) ? { type: "artifact", artifact: v.artifact } : null;
    case "done":
      return { type: "done" };
    case "error":
      return { type: "error", code: isOperatorErrorCode(v.code) ? v.code : "internal" };
    default:
      return null;
  }
}

export interface NdjsonParser {
  /** Feed decoded text (use TextDecoder with `{ stream: true }`). */
  push(chunk: string): void;
  /** The body ended: parse whatever is left as a final, unterminated line. */
  end(): void;
  /** Lines that were not JSON, not a known event, or over the size cap. */
  readonly skipped: number;
}

export function createNdjsonParser(onEvent: (event: OperatorEvent) => void): NdjsonParser {
  let buffer = "";
  let skipped = 0;
  let ended = false;
  /** True while dropping the rest of an oversized line up to its "\n". */
  let discarding = false;

  function line(raw: string) {
    const text = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (!text.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      skipped++;
      return;
    }
    const event = toOperatorEvent(parsed);
    if (event) onEvent(event);
    else skipped++;
  }

  return {
    push(chunk: string) {
      if (ended || !chunk) return;
      buffer += chunk;
      let start = 0;
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        if (discarding) discarding = false;
        else line(buffer.slice(start, newline));
        start = newline + 1;
        newline = buffer.indexOf("\n", start);
      }
      buffer = start ? buffer.slice(start) : buffer;
      if (discarding) buffer = "";
      else if (buffer.length > MAX_LINE_CHARS) {
        buffer = "";
        discarding = true;
        skipped++;
      }
    },
    end() {
      if (ended) return;
      ended = true;
      const rest = buffer;
      buffer = "";
      if (!discarding) line(rest);
    },
    get skipped() {
      return skipped;
    },
  };
}
