// lib/operator/openai-compat.ts
//
// The Operator's transport for every provider except Anthropic: the
// OpenAI-compatible Chat Completions API, streamed. Groq, Cerebras, Gemini,
// Mistral, OpenRouter and most self-hosted servers speak it.
//
// The route's tool loop keeps its conversation in the Anthropic Messages
// shape that history.ts builds (user / assistant / system turns, tool_use and
// tool_result blocks). This module converts that shape on the way out and
// returns each round in the same shape, so one loop serves every provider.
//
// Pure apart from `fetch`: no SDK, no next/*.

import type { ProviderId, ResolvedProvider } from "./providers";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/** A content block as the loop holds it (Anthropic Messages shape, structural). */
export interface LoopBlock {
  type: string;
  [key: string]: unknown;
}

export interface LoopMessage {
  role: "user" | "assistant" | "system";
  content: string | readonly LoopBlock[];
}

export interface ChatToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ChatToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export interface ChatTool {
  type: "function";
  function: { name: string; description?: string; parameters: unknown };
}

/** A tool definition as tools.ts declares it for the Messages API. */
export interface LoopTool {
  name: string;
  description?: string;
  input_schema: unknown;
}

export interface CompatToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface CompatRound {
  /** Mapped onto the Messages API's stop reasons the loop already handles. */
  stopReason: "end_turn" | "tool_use" | "max_tokens" | "refusal";
  text: string;
  toolCalls: CompatToolCall[];
}

/**
 * An HTTP or stream-level failure reported by a provider. (Plain fields, not
 * parameter properties: the offline tests load this file through Node's
 * type stripping, which does not support them.)
 */
export class ProviderError extends Error {
  readonly provider: ProviderId;
  /** HTTP status; undefined for a dropped connection or a mid-stream error. */
  readonly status: number | undefined;
  readonly headers: Headers | undefined;
  /** The provider's error code or type, e.g. "tool_use_failed". */
  readonly code: string | undefined;

  constructor(message: string, provider: ProviderId, status?: number, headers?: Headers, code?: string) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = status;
    this.headers = headers;
    this.code = code;
  }
}

/** A streamed tool call whose arguments are not valid JSON. */
export class ToolCallParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolCallParseError";
  }
}

/* -------------------------------------------------------------------------- */
/*                               Request shaping                              */
/* -------------------------------------------------------------------------- */

/** FNV-1a over the id, as nine base-62 characters: stable within a request. */
export function alnum9(id: string): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x5bd1e995) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 9; i++) {
    const source = i < 5 ? h1 : h2;
    out += alphabet[(source >>> ((i % 5) * 6)) % 62];
  }
  return out;
}

function textOf(content: string | readonly LoopBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n\n");
}

function toolResultText(block: LoopBlock): string {
  const content = block.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .filter((b: LoopBlock) => b?.type === "text")
            .map((b: LoopBlock) => String(b.text ?? ""))
            .join("\n")
        : "";
  return block.is_error ? `Error: ${text}` : text;
}

/**
 * The loop's conversation as Chat Completions messages.
 *
 * Only one system message is sent, first: not every compatible provider keeps
 * later system messages in place. history.ts puts page context in system
 * messages right after a visitor turn; those are appended to that turn inside
 * <website_context> tags (the prompt variant from buildSystemPrompt with
 * `inlineContext` explains them). Any other late system text (the loop's
 * text-only note after tool results) is appended to the leading system
 * message, which also keeps the tool → assistant ordering some providers
 * enforce.
 *
 * Thinking and fallback blocks are Anthropic-only and are dropped.
 */
export function toChatMessages(
  system: string,
  messages: readonly LoopMessage[],
  provider: Pick<ResolvedProvider, "toolCallIds">,
): ChatMessage[] {
  const id = provider.toolCallIds === "alnum9" ? alnum9 : (value: string) => value;
  const lead = { role: "system" as const, content: system };
  const out: ChatMessage[] = [lead];
  const lateNotes: string[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      const text = textOf(message.content).trim();
      if (!text) continue;
      const previous = out.at(-1);
      if (previous?.role === "user") previous.content += `\n\n<website_context>\n${text}\n</website_context>`;
      else lateNotes.push(text);
      continue;
    }

    if (message.role === "user") {
      if (typeof message.content === "string") {
        out.push({ role: "user", content: message.content });
        continue;
      }
      const texts: string[] = [];
      for (const block of message.content) {
        if (block.type === "tool_result") {
          out.push({ role: "tool", tool_call_id: id(String(block.tool_use_id)), content: toolResultText(block) });
        } else if (block.type === "text" && typeof block.text === "string") {
          texts.push(block.text);
        }
      }
      if (texts.length) out.push({ role: "user", content: texts.join("\n\n") });
      continue;
    }

    const blocks = typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content;
    const text = textOf(blocks);
    const calls: ChatToolCall[] = blocks
      .filter((b) => b.type === "tool_use")
      .map((b) => ({
        id: id(String(b.id)),
        type: "function" as const,
        function: { name: String(b.name), arguments: JSON.stringify(b.input ?? {}) },
      }));
    if (!text && !calls.length) continue;
    out.push(calls.length ? { role: "assistant", content: text || null, tool_calls: calls } : { role: "assistant", content: text });
  }

  if (lateNotes.length) lead.content += `\n\n${lateNotes.join("\n\n")}`;
  return out;
}

/**
 * JSON-Schema keywords Gemini's compatibility layer accepts in tool
 * parameters (its OpenAPI-subset Schema); anything else is a 400. Dropping a
 * constraint is safe: validate.ts checks every tool input server-side.
 */
const GEMINI_SCHEMA_KEYS = new Set([
  "type", "format", "title", "description", "nullable", "enum", "properties", "required",
  "items", "minItems", "maxItems", "minLength", "maxLength", "pattern", "minimum", "maximum", "anyOf",
]);

function geminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(geminiSchema);
  if (!schema || typeof schema !== "object") return schema;
  const source = schema as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "properties" && value && typeof value === "object") {
      out.properties = Object.fromEntries(Object.entries(value).map(([name, sub]) => [name, geminiSchema(sub)]));
    } else if (key === "exclusiveMinimum" && typeof value === "number") {
      out.minimum ??= value;
    } else if (key === "exclusiveMaximum" && typeof value === "number") {
      out.maximum ??= value;
    } else if (GEMINI_SCHEMA_KEYS.has(key)) {
      out[key] = key === "items" || key === "anyOf" ? geminiSchema(value) : value;
    }
  }
  return out;
}

/** tools.ts definitions as Chat Completions functions (Anthropic-only fields dropped). */
export function toChatTools(tools: readonly LoopTool[], dialect?: "gemini"): ChatTool[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      ...(tool.description ? { description: tool.description } : {}),
      parameters: dialect === "gemini" ? geminiSchema(tool.input_schema) : tool.input_schema,
    },
  }));
}

/* -------------------------------------------------------------------------- */
/*                               Hidden reasoning                             */
/* -------------------------------------------------------------------------- */

const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";

/** Length of the longest suffix of `text` that is a proper prefix of `tag`. */
function partialTagAt(text: string, tag: string): number {
  for (let n = Math.min(tag.length - 1, text.length); n > 0; n--) {
    if (text.endsWith(tag.slice(0, n))) return n;
  }
  return 0;
}

/**
 * Some reasoning models (Qwen, DeepSeek-R1) stream their reasoning inline as
 * <think>…</think>. The persona forbids showing it, so it is cut from the
 * text stream, including tags split across chunks. `thinking` reports that
 * reasoning is in progress, for the panel's status line.
 */
export function createThinkFilter() {
  let pending = "";
  let inside = false;
  let trimNext = false;
  return {
    get thinking() {
      return inside;
    },
    push(delta: string): string {
      pending += delta;
      let out = "";
      for (;;) {
        // The whitespace a model puts after </think> belongs to the reasoning.
        if (trimNext && !inside) {
          pending = pending.replace(/^\s+/, "");
          if (!pending) break;
          trimNext = false;
        }
        if (!inside) {
          const open = pending.indexOf(THINK_OPEN);
          if (open >= 0) {
            out += pending.slice(0, open);
            pending = pending.slice(open + THINK_OPEN.length);
            inside = true;
            continue;
          }
          const keep = partialTagAt(pending, THINK_OPEN);
          out += pending.slice(0, pending.length - keep);
          pending = pending.slice(pending.length - keep);
          break;
        }
        const close = pending.indexOf(THINK_CLOSE);
        if (close >= 0) {
          pending = pending.slice(close + THINK_CLOSE.length);
          inside = false;
          trimNext = true;
          continue;
        }
        pending = pending.slice(pending.length - partialTagAt(pending, THINK_CLOSE));
        break;
      }
      return out;
    },
    flush(): string {
      const rest = inside ? "" : pending;
      pending = "";
      return rest;
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Streaming                                 */
/* -------------------------------------------------------------------------- */

export interface CompatRequest {
  messages: ChatMessage[];
  tools: ChatTool[];
  /** "none" for a text-only round: the loop's tool budget is spent. */
  toolChoice: "auto" | "none";
}

export interface CompatHandlers {
  signal: AbortSignal;
  onText: (delta: string) => void;
  /** Reasoning is streaming (a `reasoning` field or an inline <think> block). */
  onThinking: () => void;
  /** A tool call's name has arrived; its input is still streaming. */
  onToolStart: (name: string) => void;
}

const MAX_ERROR_BODY = 4096;

function errorDetails(body: string): { message: string; code?: string } {
  try {
    const parsed: unknown = JSON.parse(body);
    // Gemini answers some errors as a one-element array.
    const root = (Array.isArray(parsed) ? parsed[0] : parsed) as Record<string, unknown> | undefined;
    const error = (root?.error ?? root) as Record<string, unknown> | undefined;
    const message = typeof error?.message === "string" ? error.message : "";
    const code = typeof error?.code === "string" ? error.code : typeof error?.type === "string" ? error.type : undefined;
    return { message: message.slice(0, 200), code };
  } catch {
    return { message: body.slice(0, 200) };
  }
}

function newCallId(): string {
  let id = "call_";
  for (let i = 0; i < 9; i++) id += "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)];
  return id;
}

interface PendingCall {
  id: string;
  name: string;
  args: string;
}

/**
 * One streamed Chat Completions call. Text deltas go to `onText` as they
 * arrive (reasoning removed); tool calls are assembled from their argument
 * fragments and parsed once the stream ends.
 *
 * Throws ProviderError for a non-2xx response, an error event or a stream
 * that ends without a finish reason, and ToolCallParseError for arguments
 * that are not JSON (unless the reply was cut off at max_tokens, which the
 * loop reports as truncated).
 */
export async function streamChatCompletion(
  provider: ResolvedProvider,
  request: CompatRequest,
  handlers: CompatHandlers,
): Promise<CompatRound> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    ...provider.headers,
  };
  if (provider.apiKey) headers.Authorization = `Bearer ${provider.apiKey}`;

  const body = {
    model: provider.model,
    messages: request.messages,
    ...(request.tools.length ? { tools: request.tools, tool_choice: request.toolChoice } : {}),
    max_tokens: provider.maxTokens,
    stream: true,
  };

  let res: Response;
  try {
    res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: handlers.signal,
    });
  } catch (err) {
    if (handlers.signal.aborted) throw err;
    throw new ProviderError(`${provider.id}: connection failed (${err instanceof Error ? err.message : String(err)})`, provider.id);
  }

  if (!res.ok || !res.body) {
    const raw = await res.text().catch(() => "");
    const { message, code } = errorDetails(raw.slice(0, MAX_ERROR_BODY));
    throw new ProviderError(`${provider.id}: HTTP ${res.status}${message ? ` ${message}` : ""}`, provider.id, res.status, res.headers, code);
  }

  const filter = createThinkFilter();
  const calls = new Map<number | string, PendingCall>();
  let text = "";
  let finish: string | null = null;
  let done = false;

  const emit = (delta: string) => {
    if (!delta) return;
    text += delta;
    handlers.onText(delta);
  };

  const handleEvent = (data: string) => {
    if (data === "[DONE]") {
      done = true;
      return;
    }
    let chunk: Record<string, unknown>;
    try {
      chunk = JSON.parse(data);
    } catch {
      return; // A keep-alive or a line some proxy injected; the stream goes on.
    }
    if (chunk.error) {
      const { message, code } = errorDetails(JSON.stringify(chunk));
      const status = Number((chunk.error as Record<string, unknown>).status ?? (chunk.error as Record<string, unknown>).code);
      throw new ProviderError(
        `${provider.id}: stream error${message ? ` ${message}` : ""}`,
        provider.id,
        Number.isInteger(status) && status >= 400 ? status : undefined,
        undefined,
        code,
      );
    }
    const choice = (chunk.choices as Array<Record<string, unknown>> | undefined)?.[0];
    if (!choice) return;
    const delta = (choice.delta ?? choice.message ?? {}) as Record<string, unknown>;

    if (delta.reasoning || delta.reasoning_content) handlers.onThinking();
    if (typeof delta.content === "string" && delta.content) {
      const wasThinking = filter.thinking;
      emit(filter.push(delta.content));
      if (filter.thinking && !wasThinking) handlers.onThinking();
    }
    if (Array.isArray(delta.tool_calls)) {
      delta.tool_calls.forEach((raw: Record<string, unknown>, position: number) => {
        const fn = (raw.function ?? {}) as Record<string, unknown>;
        const key = typeof raw.index === "number" ? raw.index : typeof raw.id === "string" && raw.id ? raw.id : position;
        let call = calls.get(key);
        if (!call) {
          call = { id: "", name: "", args: "" };
          calls.set(key, call);
        }
        if (typeof raw.id === "string" && raw.id) call.id = raw.id;
        if (typeof fn.name === "string" && fn.name && !call.name) {
          call.name = fn.name;
          handlers.onToolStart(fn.name);
        }
        if (typeof fn.arguments === "string") call.args += fn.arguments;
        else if (fn.arguments && typeof fn.arguments === "object") call.args = JSON.stringify(fn.arguments);
      });
    }
    if (typeof choice.finish_reason === "string" && choice.finish_reason) finish = choice.finish_reason;
  };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];
  const flushEvent = () => {
    if (dataLines.length) handleEvent(dataLines.join("\n"));
    dataLines = [];
  };

  try {
    while (!done) {
      const { value, done: ended } = await reader.read();
      buffer += ended ? decoder.decode() : decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, "");
        buffer = buffer.slice(newline + 1);
        if (line === "") flushEvent();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
        // "event:", "id:", "retry:" and ": comment" lines carry nothing needed here.
        if (done) break;
      }
      if (ended) {
        if (buffer.startsWith("data:")) dataLines.push(buffer.slice(5).replace(/^ /, ""));
        buffer = "";
        flushEvent();
        break;
      }
    }
  } catch (err) {
    if (handlers.signal.aborted || err instanceof ProviderError) throw err;
    throw new ProviderError(`${provider.id}: stream interrupted (${err instanceof Error ? err.message : String(err)})`, provider.id);
  } finally {
    reader.cancel().catch(() => undefined);
  }

  emit(filter.flush());

  if (finish === "error") throw new ProviderError(`${provider.id}: the model stopped with an error`, provider.id);
  if (!finish && !done) throw new ProviderError(`${provider.id}: stream ended early`, provider.id);

  const truncated = finish === "length";
  const toolCalls: CompatToolCall[] = [];
  for (const call of calls.values()) {
    if (!call.name) continue;
    let input: unknown;
    try {
      input = JSON.parse(call.args.trim() || "{}");
    } catch {
      if (truncated) {
        input = {};
      } else {
        throw new ToolCallParseError(`${provider.id}: tool call ${call.name} has arguments that are not JSON`);
      }
    }
    toolCalls.push({ id: call.id || newCallId(), name: call.name, input });
  }

  const stopReason: CompatRound["stopReason"] = truncated
    ? "max_tokens"
    : finish === "content_filter"
      ? "refusal"
      : toolCalls.length
        ? "tool_use"
        : "end_turn";
  return { stopReason, text, toolCalls };
}
