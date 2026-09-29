// components/operator/transcript.ts
//
// The visible conversation (UIMessage[]) → the OperatorRequest the server
// accepts. Split out of useOperatorChat so it can be tested against the
// server's own parser: every request this module builds must pass
// lib/operator/history.ts#parseRequest, which rejects the WHOLE request on a
// structural problem (roles out of order, an even turn count, a blank or
// over-long visitor message, more than OPERATOR_LIMITS.maxTurns turns).
// scripts/operator-client.test.mjs holds that guarantee in place.
//
// Also the stored form of the conversation (sessionStorage) and what a
// restore makes of it.
//
// Pure (no React, no DOM; ./ndjson is pure too) so Node's type stripping can
// load it in the tests.

import type { Artifact, ClientTurn, OperatorRequest, PageRef } from "@/lib/operator/protocol";
import { OPERATOR_LIMITS } from "@/lib/operator/protocol";
import { isArtifactEnvelope } from "./ndjson";

export type UIPart = { kind: "text"; text: string } | { kind: "artifact"; artifact: Artifact };

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: UIPart[];
  /** User messages: the page the visitor was on when they sent it. */
  page?: PageRef;
  /** Assistant messages the visitor stopped mid-stream. */
  stopped?: boolean;
  /**
   * Assistant messages cut off by a reload or navigation mid-stream (set
   * only in the stored copy). Not "stopped": the visitor pressed nothing, so
   * the restored panel offers Retry instead of saying they stopped it.
   */
  interrupted?: boolean;
  /**
   * Assistant messages that ended in the "refusal" error: the AI service
   * declined the reply. A marker only; useOperatorChat empties its parts, so
   * nothing that streamed before the decline is kept. It is stored like any
   * message, so the decline survives a reload, and buildTurns leaves the
   * declined exchange out of every later request.
   */
  refused?: boolean;
}

/** Cut to `max` UTF-16 units without splitting a surrogate pair. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const code = text.charCodeAt(max - 1);
  return text.slice(0, code >= 0xd800 && code <= 0xdbff ? max - 1 : max);
}

// Same set as lib/operator/validate.ts#stripControlChars (C0 controls except
// \t and \n, plus DEL; \r normalized away first). Mirrored rather than
// imported because validate.ts pulls in the knowledge index. The server
// rejects a visitor message that is blank AFTER this cleaning, so the client
// must clean first or a message of stray control characters would turn the
// whole conversation into a 400.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** A visitor message as the server will see it: control characters out, trimmed, within the cap. */
export function cleanUserText(raw: string): string {
  const text = raw.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "").trim();
  return clip(text, OPERATOR_LIMITS.maxUserChars).trim();
}

export function messageText(message: UIMessage): string {
  return message.parts
    .flatMap((part) => (part.kind === "text" && part.text.trim() ? [part.text.trim()] : []))
    .join("\n\n");
}

export function messageArtifacts(message: UIMessage): Artifact[] {
  return message.parts.flatMap((part) => (part.kind === "artifact" ? [part.artifact] : []));
}

export function hasContent(message: UIMessage): boolean {
  return message.parts.some((part) => (part.kind === "text" ? part.text.trim() !== "" : true));
}

/**
 * At most `cap` artifacts, newest kept. "sources" go first when something
 * must give: they only list what was cited, while a graph or brief is the
 * context the next turn is most likely to refer back to.
 */
export function capArtifacts(artifacts: Artifact[], cap: number): Artifact[] {
  if (artifacts.length <= cap) return artifacts;
  const heavy = artifacts.filter((a) => a.type !== "sources");
  if (heavy.length >= cap) return heavy.slice(-cap);
  const keepSources = cap - heavy.length;
  let sourcesSeen = artifacts.length - heavy.length;
  return artifacts.filter((a) => a.type !== "sources" || sourcesSeen-- <= keepSources);
}

/**
 * Visible messages → the turns the server accepts: alternating, starting and
 * ending with a user turn, at most `maxTurns`, every field within limits.
 * Empty assistant messages (an error before any output, a stop before the
 * first token) are skipped; the two user turns that then meet are merged.
 * A declined (`refused`) reply is dropped together with the visitor turn it
 * answered.
 */
export function buildTurns(messages: UIMessage[], fallbackPathname: string): ClientTurn[] {
  const turns: ClientTurn[] = [];
  for (const message of messages) {
    const previous = turns[turns.length - 1];
    if (message.role === "assistant" && message.refused) {
      // Never resent, whatever it holds: output cut off by a decline is
      // incomplete and is discarded, not treated as an answer (Anthropic's
      // refusal guidance). Nor is the visitor turn it declined, which was
      // everything unanswered since the last reply: kept, it would be merged
      // into their next message like any unanswered text, most likely be
      // declined again, and take every later turn down with it, leaving "New
      // conversation" as the only way out. Dropping the pair keeps the turns
      // alternating; the visitor still sees their message and the decline.
      if (previous?.role === "user") turns.pop();
      continue;
    }
    if (message.role === "user") {
      const text = cleanUserText(messageText(message));
      if (!text) continue;
      const page = message.page ?? { pathname: fallbackPathname };
      if (previous?.role === "user") {
        // An unanswered message followed by a new one: send both, unless
        // that no longer fits, in which case the newer one wins.
        const merged = `${previous.text}\n\n${text}`;
        previous.text = merged.length <= OPERATOR_LIMITS.maxUserChars ? merged : text;
        previous.page = page;
      } else {
        turns.push({ role: "user", text, page });
      }
      continue;
    }
    const text = messageText(message);
    const artifacts = messageArtifacts(message);
    if (!text && !artifacts.length) continue;
    if (!previous) continue; // an assistant turn can never open the transcript
    if (previous.role === "assistant") {
      previous.text = clip([previous.text, text].filter(Boolean).join("\n\n"), OPERATOR_LIMITS.maxAssistantChars);
      previous.artifacts = capArtifacts([...previous.artifacts, ...artifacts], OPERATOR_LIMITS.maxArtifactsPerTurn);
    } else {
      turns.push({
        role: "assistant",
        text: clip(text, OPERATOR_LIMITS.maxAssistantChars),
        artifacts: capArtifacts(artifacts, OPERATOR_LIMITS.maxArtifactsPerTurn),
      });
    }
  }
  while (turns.length && turns[turns.length - 1].role !== "user") turns.pop();
  let recent = turns.slice(-OPERATOR_LIMITS.maxTurns);
  if (recent[0]?.role !== "user") recent = recent.slice(1);
  return recent;
}

const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const byteLength = (value: string) => (encoder ? encoder.encode(value).length : value.length * 3);

/**
 * Keep the JSON body under the server's byte ceiling: first drop the
 * artifacts of the oldest assistant turns (their text still carries the
 * thread), then whole user+assistant pairs from the front.
 */
export function fitRequest(request: OperatorRequest): OperatorRequest {
  let turns = request.turns;
  const size = () => byteLength(JSON.stringify({ ...request, turns }));
  while (turns.length > 1 && size() > OPERATOR_LIMITS.maxBodyBytes) {
    const heavy = turns.findIndex((turn) => turn.role === "assistant" && turn.artifacts.length > 0);
    turns = heavy === -1 ? turns.slice(2) : turns.map((turn, i) => (i === heavy ? { ...turn, artifacts: [] } : turn));
  }
  return { ...request, turns };
}

/** The request body for the conversation so far; `turns` is empty only when no visitor message survives cleaning. */
export function buildRequest(
  messages: UIMessage[],
  { locale, country, fallbackPathname }: { locale: string; country: string; fallbackPathname: string },
): OperatorRequest {
  return fitRequest({ locale, country, turns: buildTurns(messages, fallbackPathname) });
}

/* -------------------------------------------------------------------------- */
/*                              Stored transcript                             */
/* -------------------------------------------------------------------------- */
// The shape useOperatorChat keeps in sessionStorage, and what a restore makes
// of it. Here rather than in the hook so the tests can hold it in place.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isPart(value: unknown): value is UIPart {
  if (!isRecord(value)) return false;
  if (value.kind === "text") return typeof value.text === "string";
  return value.kind === "artifact" && isArtifactEnvelope(value.artifact);
}

/** Loose shape check: enough that rendering cannot throw. */
export function isUIMessage(value: unknown): value is UIMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    Array.isArray(value.parts) &&
    value.parts.every(isPart) &&
    (value.page === undefined || (isRecord(value.page) && typeof value.page.pathname === "string")) &&
    (value.stopped === undefined || typeof value.stopped === "boolean") &&
    (value.interrupted === undefined || typeof value.interrupted === "boolean") &&
    (value.refused === undefined || typeof value.refused === "boolean")
  );
}

/** A stored `{ v: 1, messages }` payload, or null when it is missing, unreadable or of another shape. */
export function parseStoredTranscript(raw: string | null): UIMessage[] | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (isRecord(data) && data.v === 1 && Array.isArray(data.messages) && data.messages.every(isUIMessage)) return data.messages;
  } catch {
    // Not JSON: treated like any other foreign shape.
  }
  return null;
}

/**
 * What to store for `messages`. A snapshot taken mid-stream is only ever
 * restored after a reload or navigation, when that reply can no longer
 * finish: its partial reply is marked interrupted (not stopped: the visitor
 * pressed nothing).
 */
export function storedMessages(messages: UIMessage[], streaming: boolean): UIMessage[] {
  const last = messages[messages.length - 1];
  if (!streaming || last?.role !== "assistant") return messages;
  return [...messages.slice(0, -1), { ...last, interrupted: true }];
}

/**
 * A restored thread whose last exchange never finished: it ends on the
 * visitor's own message (the tab went away before the first token, or an
 * error arrived before any output and was never stored) or on an
 * interrupted reply. The panel shows the "upstream" error for it, whose
 * copy reads "The connection was interrupted…", so Retry is one press away
 * instead of a question left hanging with no answer and no way to re-ask.
 */
export function isUnfinished(messages: UIMessage[]): boolean {
  const last = messages[messages.length - 1];
  return last !== undefined && !last.refused && (last.role === "user" || last.interrupted === true);
}

/**
 * The error a restored thread reopens with (errors themselves are never
 * stored): "upstream" for an unfinished exchange (see isUnfinished), and
 * "refusal" for one that ended in a decline, so its explanation and Retry
 * come back after a reload instead of a bare "(reply declined)" marker.
 */
export function restoredError(messages: UIMessage[]): "upstream" | "refusal" | null {
  if (messages[messages.length - 1]?.refused) return "refusal";
  return isUnfinished(messages) ? "upstream" : null;
}
