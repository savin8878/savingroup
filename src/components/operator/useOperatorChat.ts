"use client";

// components/operator/useOperatorChat.ts
//
// Conversation state and the streaming client for POST /api/operator.
//
// The client owns the transcript. Each send rebuilds OperatorRequest.turns
// from the visible messages, trimmed to what the server accepts
// (transcript.ts, tested against the server's parseRequest), and reads the
// NDJSON reply incrementally. Text deltas are
// buffered in a ref and committed to React state at most once per animation
// frame, so a fast stream costs one render per frame, not one per token.
//
// The transcript survives reloads and full-page navigations in
// sessionStorage ("savin-operator:v1"): tab-scoped on purpose, so nothing
// outlives the visit or leaks into another tab. Every storage access is
// wrapped, because private modes and blocked storage throw.
//
// Nothing here ever claims a message was delivered anywhere: the only
// network call is to the Operator route itself.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { OPERATOR_ENDPOINT } from "@/lib/operator/protocol";
import type { OperatorErrorCode, OperatorEvent, OperatorStatus } from "@/lib/operator/protocol";
import { createNdjsonParser, isArtifactEnvelope, isOperatorErrorCode } from "./ndjson";
import { buildRequest, cleanUserText, hasContent, type UIMessage, type UIPart } from "./transcript";

export type { UIMessage, UIPart } from "./transcript";

export interface OperatorChatError {
  code: OperatorErrorCode;
  /** Seconds, from a 429's Retry-After header. */
  retryAfter?: number;
}

export interface OperatorChatState {
  messages: UIMessage[];
  streaming: boolean;
  /** Latest status event while no text is flowing; null once text streams. */
  status: OperatorStatus | null;
  error: OperatorChatError | null;
}

export interface OperatorChat extends OperatorChatState {
  send: (text: string) => void;
  stop: () => void;
  /** Re-send the last user message (dropping any partial reply to it). */
  retry: () => void;
  reset: () => void;
}

export const STORAGE_KEY = "savin-operator:v1";
const SAVE_DELAY_MS = 400;
/** UTF-16 code units; well under the ~5M sessionStorage quota. */
const MAX_STORED_CHARS = 400_000;

type Outcome = { kind: "done" } | { kind: "error"; code: OperatorErrorCode; retryAfter?: number };

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

let idCounter = 0;

/** Counter + random, never the clock: two messages in the same millisecond
 *  (a retry, a restored transcript) must still get distinct React keys. */
function newId(prefix: string): string {
  idCounter += 1;
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}-${idCounter}-${random}`;
}

function fallbackCode(status: number): OperatorErrorCode {
  switch (status) {
    case 400:
      return "bad_request";
    case 403:
      return "forbidden";
    case 413:
      return "too_large";
    case 429:
      return "rate_limited";
    case 404:
    case 501:
    case 503:
      return "unavailable";
    case 529:
      return "overloaded";
    default:
      return "internal";
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = /^\s*\d+\s*$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 3600) : undefined;
}

/** A pre-stream failure: `{ ok: false, error }` JSON with a 4xx/5xx status. */
async function readFailure(res: Response): Promise<Outcome> {
  let code: OperatorErrorCode | null = null;
  try {
    const body: unknown = await res.json();
    const error = body && typeof body === "object" ? (body as { error?: unknown }).error : undefined;
    if (isOperatorErrorCode(error)) code = error;
  } catch {
    // Not JSON (a proxy's HTML error page, an empty body): use the status.
  }
  return { kind: "error", code: code ?? fallbackCode(res.status), retryAfter: parseRetryAfter(res.headers.get("Retry-After")) };
}

const requestFrame = (callback: () => void): number =>
  typeof requestAnimationFrame === "function" ? requestAnimationFrame(callback) : (setTimeout(callback, 16) as unknown as number);
const cancelFrame = (handle: number) => {
  if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(handle);
  clearTimeout(handle);
};

/* -------------------------------------------------------------------------- */
/*                                 Persistence                                */
/* -------------------------------------------------------------------------- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isPart(value: unknown): value is UIPart {
  if (!isRecord(value)) return false;
  if (value.kind === "text") return typeof value.text === "string";
  return value.kind === "artifact" && isArtifactEnvelope(value.artifact);
}

/** Loose shape check: enough that rendering cannot throw. */
function isUIMessage(value: unknown): value is UIMessage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    Array.isArray(value.parts) &&
    value.parts.every(isPart) &&
    (value.page === undefined || (isRecord(value.page) && typeof value.page.pathname === "string")) &&
    (value.stopped === undefined || typeof value.stopped === "boolean")
  );
}

function restoreMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (isRecord(data) && data.v === 1 && Array.isArray(data.messages) && data.messages.every(isUIMessage)) {
      return data.messages;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Unreadable or blocked storage: start fresh.
  }
  return [];
}

/** Drop the oldest exchange, keeping the list starting on a user message. */
function dropOldest(messages: UIMessage[]): UIMessage[] {
  let i = 1;
  while (i < messages.length && messages[i].role !== "user") i++;
  return messages.slice(i);
}

function persist(messages: UIMessage[], streaming: boolean) {
  try {
    if (!messages.length) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    // A snapshot taken mid-stream is only ever restored after a reload,
    // when that reply can no longer finish: mark it as cut short.
    let list = messages;
    const last = list[list.length - 1];
    if (streaming && last.role === "assistant") list = [...list.slice(0, -1), { ...last, stopped: true }];
    const serialize = (value: UIMessage[]) => JSON.stringify({ v: 1, messages: value });
    let json = serialize(list);
    while (json.length > MAX_STORED_CHARS && list.length > 1) {
      list = dropOldest(list);
      json = serialize(list);
    }
    if (json.length > MAX_STORED_CHARS) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, json);
  } catch {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable; the conversation just won't survive a reload.
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Hook                                    */
/* -------------------------------------------------------------------------- */

export function useOperatorChat({ locale, country }: { locale: string; country: string }): OperatorChat {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // The panel is client-only (next/dynamic, ssr:false), so reading storage
  // in the initializer cannot cause a hydration mismatch and avoids a flash
  // of the empty state.
  const [messages, setMessages] = useState<UIMessage[]>(restoreMessages);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<OperatorStatus | null>(null);
  const [error, setError] = useState<OperatorChatError | null>(null);

  // Refs mirror what async code must read without waiting for a render.
  const messagesRef = useRef(messages);
  const streamingRef = useRef(false);
  const statusRef = useRef<OperatorStatus | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);
  /** Incremented per request and on reset; a stale run must not touch state. */
  const runRef = useRef(0);
  /** The reply being streamed; created on its first text or artifact. */
  const draftRef = useRef<UIMessage | null>(null);
  const frameRef = useRef<number | null>(null);

  const commit = useCallback((next: UIMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const track = useCallback((next: OperatorStatus | null) => {
    if (statusRef.current === next) return;
    statusRef.current = next;
    setStatus(next);
  }, []);

  /** Commit the draft now (cancelling any pending frame). */
  const flush = useCallback(() => {
    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }
    const draft = draftRef.current;
    if (!draft) return;
    const snapshot: UIMessage = { ...draft, parts: draft.parts.slice() };
    const list = messagesRef.current;
    commit(list[list.length - 1]?.id === draft.id ? [...list.slice(0, -1), snapshot] : [...list, snapshot]);
  }, [commit]);

  const scheduleFlush = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestFrame(() => {
      frameRef.current = null;
      flush();
    });
  }, [flush]);

  const handleEvent = useCallback(
    (event: OperatorEvent) => {
      if (event.type === "status") {
        track(event.status);
        return;
      }
      if (event.type !== "text" && event.type !== "artifact") return;
      if (event.type === "text" && !event.delta) return;
      const draft = (draftRef.current ??= { id: newId("a"), role: "assistant", parts: [] });
      const parts = draft.parts;
      if (event.type === "text") {
        const last = parts[parts.length - 1];
        // Replace rather than mutate: the Markdown for earlier parts is
        // memoised on its string, and only this part's string changes.
        if (last?.kind === "text") parts[parts.length - 1] = { kind: "text", text: last.text + event.delta };
        else parts.push({ kind: "text", text: event.delta });
        track(null);
      } else {
        // The same tool_use id twice would collide as a React key; the
        // later version wins in place.
        const at = parts.findIndex((part) => part.kind === "artifact" && part.artifact.id === event.artifact.id);
        if (at === -1) parts.push({ kind: "artifact", artifact: event.artifact });
        else parts[at] = { kind: "artifact", artifact: event.artifact };
        // The model keeps going after a tool result; show that it has not
        // stalled until its next status or text arrives.
        track("thinking");
      }
      scheduleFlush();
    },
    [scheduleFlush, track],
  );

  const settle = useCallback(() => {
    draftRef.current = null;
    abortRef.current = null;
    streamingRef.current = false;
    setStreaming(false);
    track(null);
  }, [track]);

  const finish = useCallback(
    (outcome: Outcome) => {
      flush();
      const draft = draftRef.current;
      const complete = draft !== null && hasContent(draft);
      if (draft && !complete) commit(messagesRef.current.filter((m) => m.id !== draft.id));
      if (outcome.kind === "error") setError({ code: outcome.code, retryAfter: outcome.retryAfter });
      else if (!complete) setError({ code: "upstream" }); // "done" with nothing in it
      settle();
    },
    [commit, flush, settle],
  );

  /** The visitor pressed Stop: keep whatever arrived and mark it. */
  const finishStopped = useCallback(() => {
    flush();
    const draft = draftRef.current;
    const list = messagesRef.current;
    if (draft) commit(list.map((m) => (m.id === draft.id ? { ...m, stopped: true } : m)));
    else commit([...list, { id: newId("a"), role: "assistant", parts: [], stopped: true }]);
    settle();
  }, [commit, flush, settle]);

  const run = useCallback(
    async (history: UIMessage[]) => {
      const runId = ++runRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      stoppedRef.current = false;
      draftRef.current = null;
      streamingRef.current = true;
      setStreaming(true);
      setError(null);
      track("thinking");

      const request = buildRequest(history, { locale, country, fallbackPathname: pathnameRef.current || "/" });
      // An object, not a `let`: it is assigned inside the parser callback,
      // where TypeScript's narrowing cannot follow.
      const result: { outcome: Outcome | null } = { outcome: null };
      try {
        if (!request.turns.length) {
          // Only a restored transcript with no usable visitor text gets
          // here; the server would answer 400, so skip the request.
          result.outcome = { kind: "error", code: "bad_request" };
        } else {
          const res = await fetch(OPERATOR_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
            signal: controller.signal,
            cache: "no-store",
          });
          if (res.status !== 200 || !res.body) {
            result.outcome = await readFailure(res);
          } else {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            const parser = createNdjsonParser((event) => {
              if (runId !== runRef.current || result.outcome) return;
              if (event.type === "done") result.outcome = { kind: "done" };
              else if (event.type === "error") result.outcome = { kind: "error", code: event.code };
              else handleEvent(event);
            });
            while (!result.outcome) {
              const { done, value } = await reader.read();
              if (done) {
                parser.push(decoder.decode());
                parser.end();
                break;
              }
              parser.push(decoder.decode(value, { stream: true }));
            }
            // "done"/"error" is final even if the server keeps the socket open.
            if (result.outcome) reader.cancel().catch(() => {});
          }
        }
      } catch {
        // Aborted (Stop, reset, unmount) or a network failure; told apart below.
      }

      if (runId !== runRef.current) return; // reset() or a newer run owns the state
      if (result.outcome) finish(result.outcome);
      else if (stoppedRef.current) finishStopped();
      else finish({ kind: "error", code: "upstream" }); // the stream ended without "done"
    },
    [country, finish, finishStopped, handleEvent, locale, track],
  );

  const send = useCallback(
    (raw: string) => {
      // Cleaned exactly as the server will clean it, so what the visitor sees
      // in their bubble is what the Operator receives.
      const text = cleanUserText(raw);
      if (!text || streamingRef.current) return;
      const message: UIMessage = {
        id: newId("u"),
        role: "user",
        parts: [{ kind: "text", text }],
        page: { pathname: pathnameRef.current || "/" },
      };
      const next = [...messagesRef.current, message];
      commit(next);
      void run(next);
    },
    [commit, run],
  );

  const stop = useCallback(() => {
    if (!streamingRef.current) return;
    stoppedRef.current = true;
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    if (streamingRef.current) return;
    const list = messagesRef.current;
    let lastUser = list.length - 1;
    while (lastUser >= 0 && list[lastUser].role !== "user") lastUser--;
    if (lastUser < 0) return;
    const next = list.slice(0, lastUser + 1);
    commit(next);
    void run(next);
  }, [commit, run]);

  const reset = useCallback(() => {
    runRef.current++;
    abortRef.current?.abort();
    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }
    stoppedRef.current = false;
    commit([]);
    setError(null);
    settle();
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  }, [commit, settle]);

  // Debounced save; `pagehide` catches a reload or navigation inside the
  // debounce window (it also fires where `unload` never does, e.g. bfcache).
  useEffect(() => {
    const timer = setTimeout(() => persist(messagesRef.current, streamingRef.current), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const save = () => persist(messagesRef.current, streamingRef.current);
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  // Unmount: orphan and abort any request still in flight.
  useEffect(
    () => () => {
      runRef.current++;
      abortRef.current?.abort();
      if (frameRef.current !== null) cancelFrame(frameRef.current);
    },
    [],
  );

  return { messages, streaming, status, error, send, stop, retry, reset };
}
