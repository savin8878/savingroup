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
// Pure (type-only imports, no React, no DOM) so Node's type stripping can
// load it in the tests.

import type { Artifact, ClientTurn, OperatorRequest, PageRef } from "@/lib/operator/protocol";
import { OPERATOR_LIMITS } from "@/lib/operator/protocol";

export type UIPart = { kind: "text"; text: string } | { kind: "artifact"; artifact: Artifact };

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: UIPart[];
  /** User messages: the page the visitor was on when they sent it. */
  page?: PageRef;
  /** Assistant messages the visitor stopped mid-stream. */
  stopped?: boolean;
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
 */
export function buildTurns(messages: UIMessage[], fallbackPathname: string): ClientTurn[] {
  const turns: ClientTurn[] = [];
  for (const message of messages) {
    const previous = turns[turns.length - 1];
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
