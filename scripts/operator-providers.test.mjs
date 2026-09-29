/**
 * Offline tests for the Operator's non-Anthropic providers: the provider
 * chain read from the environment, the Messages-shape → Chat Completions
 * conversion, the streamed-response parser, and the route end to end against
 * a local mock of an OpenAI-compatible API playing Groq and Gemini.
 *
 *   node --test scripts/operator-providers.test.mjs
 *
 * Nothing here needs an API key or leaves the machine.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequire, register } from "node:module";

// Resolve the `@/` alias and extensionless imports inside src/, and load the
// locale JSON files as modules (they are imported without import attributes).
const SRC = new URL("../src/", import.meta.url).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const SRC = ${JSON.stringify(SRC)};
function withExtension(href) {
  if (/\\.(ts|tsx|mjs|js|json)$/.test(href)) return href;
  for (const ext of [".ts", ".tsx", "/index.ts"]) {
    if (existsSync(fileURLToPath(href + ext))) return href + ext;
  }
  return href;
}
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) return next(withExtension(new URL(specifier.slice(2), SRC).href), context);
  if (specifier.startsWith(".") && context.parentURL?.startsWith(SRC)) {
    return next(withExtension(new URL(specifier, context.parentURL).href), context);
  }
  try {
    return await next(specifier, context);
  } catch (err) {
    // Package subpaths without an exports map (next/cache) need the extension under ESM.
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^[@\\w]/.test(specifier) && !/\\.\\w+$/.test(specifier)) {
      return next(specifier + ".js", context);
    }
    throw err;
  }
}
export async function load(url, context, next) {
  if (url.startsWith(SRC) && url.endsWith(".json")) {
    return { format: "module", source: "export default " + (await readFile(new URL(url), "utf8")) + ";", shortCircuit: true };
  }
  return next(url, context);
}
`),
);

const providers = await import("../src/lib/operator/providers.ts");
const compat = await import("../src/lib/operator/openai-compat.ts");
const { buildSystemPrompt, OPERATOR_SYSTEM_PROMPT } = await import("../src/lib/operator/system-prompt.ts");
const { OPERATOR_TOOLS } = await import("../src/lib/operator/tools.ts");
const policy = await import("../src/lib/operator/loop-policy.ts");
const config = await import("../src/lib/operator/config.ts");

/* ------------------------------- provider chain ------------------------------- */

test("the chain is every provider with credentials, in the default order", () => {
  assert.deepEqual(providers.resolveProviderChain({}).providers, []);
  assert.equal(providers.hasCredentials({}), false);
  assert.equal(providers.hasCredentials({ GROQ_API_KEY: "   " }), false, "a blank key is no key");

  const { providers: chain, skipped } = providers.resolveProviderChain({ GEMINI_API_KEY: "g", GROQ_API_KEY: "q" });
  assert.deepEqual(chain.map((p) => p.id), ["groq", "gemini"]);
  assert.deepEqual(skipped, []);
  const [groq, gemini] = chain;
  assert.equal(groq.baseUrl, "https://api.groq.com/openai/v1");
  assert.equal(groq.model, "llama-3.3-70b-versatile");
  assert.equal(groq.kind, "openai");
  assert.equal(gemini.baseUrl, "https://generativelanguage.googleapis.com/v1beta/openai");
  assert.equal(gemini.model, "gemini-flash-latest");
  assert.equal(gemini.schemaDialect, "gemini");
  assert.equal(providers.resolveProviderChain({ GOOGLE_API_KEY: "g" }).providers[0]?.id, "gemini", "GOOGLE_API_KEY works too");

  const anthropic = providers.resolveProviderChain({ ANTHROPIC_API_KEY: "a", GROQ_API_KEY: "q" }).providers;
  assert.deepEqual(anthropic.map((p) => [p.id, p.kind]), [["anthropic", "anthropic"], ["groq", "openai"]]);
  assert.equal(anthropic[0].model, config.OPERATOR_MODEL);
  assert.equal(anthropic[0].maxTokens, config.OPERATOR_MAX_TOKENS);
});

test("OPERATOR_PROVIDERS sets the order; unusable entries are reported, overrides apply", () => {
  const env = {
    OPERATOR_PROVIDERS: " Gemini , groq,nope,mistral,groq",
    GEMINI_API_KEY: "g",
    GROQ_API_KEY: "q",
    GROQ_MODEL: "openai/gpt-oss-120b",
    GROQ_MAX_TOKENS: "2048",
    GEMINI_MAX_TOKENS: "lots",
    GEMINI_BASE_URL: "https://proxy.example/v1/",
  };
  const { providers: chain, skipped } = providers.resolveProviderChain(env);
  assert.deepEqual(chain.map((p) => p.id), ["gemini", "groq"]);
  assert.deepEqual(skipped, ["nope", "mistral"]);
  assert.equal(chain[1].model, "openai/gpt-oss-120b");
  assert.equal(chain[1].maxTokens, 2048);
  assert.equal(chain[0].maxTokens, 8192, "a malformed override is ignored");
  assert.equal(chain[0].baseUrl, "https://proxy.example/v1", "trailing slash dropped");
});

test("a custom OpenAI-compatible endpoint needs a base URL and a model, not necessarily a key", () => {
  assert.deepEqual(providers.resolveProviderChain({ OPENAI_COMPATIBLE_MODEL: "llama3.3" }).providers, []);
  const [local] = providers.resolveProviderChain({
    OPENAI_COMPATIBLE_BASE_URL: "http://localhost:11434/v1",
    OPENAI_COMPATIBLE_MODEL: "llama3.3",
  }).providers;
  assert.equal(local.id, "custom");
  assert.equal(local.apiKey, "");
  assert.equal(local.label, "localhost", "named after its host by default");
  const [named] = providers.resolveProviderChain({
    OPENAI_COMPATIBLE_BASE_URL: "https://api.together.xyz/v1",
    OPENAI_COMPATIBLE_MODEL: "m",
    OPENAI_COMPATIBLE_NAME: "Together AI",
  }).providers;
  assert.equal(named.label, "Together AI");
});

test("cooldowns: rate limits follow Retry-After within bounds, config errors wait long, 400s never", () => {
  const { failureCooldownMs } = providers;
  assert.equal(failureCooldownMs(429, 30_000), 30_000);
  assert.equal(failureCooldownMs(429, 500), 5_000);
  assert.equal(failureCooldownMs(429, 600_000), 60_000);
  assert.equal(failureCooldownMs(429, undefined), 20_000);
  for (const status of [401, 403, 404, 413]) assert.equal(failureCooldownMs(status, undefined), 600_000, String(status));
  assert.equal(failureCooldownMs(503, undefined), 10_000);
  assert.equal(failureCooldownMs(undefined, undefined), 10_000, "dropped connection");
  assert.equal(failureCooldownMs(400, undefined), 0);

  const chain = providers.resolveProviderChain({ GROQ_API_KEY: "q", CEREBRAS_API_KEY: "c", GEMINI_API_KEY: "g" }).providers;
  const cooling = new Map([["groq", 5_000], ["cerebras", 2_000]]);
  assert.deepEqual(providers.orderForRequest(chain, cooling, 1_000).map((p) => p.id), ["gemini", "cerebras", "groq"], "cooling ones last, soonest first");
  assert.deepEqual(providers.orderForRequest(chain, cooling, 9_000).map((p) => p.id), ["groq", "cerebras", "gemini"]);
});

/* ------------------------------- system prompt ------------------------------- */

test("the system prompt names the providers in use and explains inline page context", () => {
  assert.equal(buildSystemPrompt({ processors: ["Anthropic"], inlineContext: false }), OPERATOR_SYSTEM_PROMPT);
  const prompt = buildSystemPrompt({ processors: ["Groq", "Cerebras", "Google Gemini", "Groq"], inlineContext: true });
  assert.doesNotMatch(prompt, /Anthropic/);
  assert.match(prompt, /the API of a third-party AI provider \(Groq, Cerebras or Google Gemini\)/);
  assert.match(prompt, /no promises about what the AI provider does with the text/);
  assert.match(prompt, /<website_context> blocks that the website appends/);
  assert.doesNotMatch(prompt, /Page context arrives as system messages/);
  assert.match(buildSystemPrompt({ processors: ["Groq"], inlineContext: true }), /provider \(Groq\), which/);
  assert.equal(
    buildSystemPrompt({ processors: ["Groq"], inlineContext: true }),
    buildSystemPrompt({ processors: ["Groq"], inlineContext: true }),
    "byte-identical per chain",
  );
});

/* -------------------------------- conversion -------------------------------- */

test("messages: one leading system message; page context rides on the visitor turn; tool rounds map to tool_calls", () => {
  const messages = [
    { role: "user", content: "How do I cut rework?" },
    { role: "system", content: "CURRENT_PAGE: /in/en/industries/manufacturing" },
    { role: "assistant", content: [{ type: "text", text: "Earlier reply." }, { type: "text", text: "[Visual rendered earlier in this conversation: graph]" }] },
    { role: "user", content: "Map it" },
    {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "hidden", signature: "s" },
        { type: "text", text: "Mapping." },
        { type: "tool_use", id: "toolu_01", name: "build_workflow_graph", input: { title: "Rework" } },
      ],
    },
    { role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_01", content: "rendered", is_error: true }] },
    { role: "system", content: policy.TEXT_ONLY_NOTE },
  ];
  const out = compat.toChatMessages("SYSTEM", messages, {});
  assert.deepEqual(out.map((m) => m.role), ["system", "user", "assistant", "user", "assistant", "tool"]);
  assert.equal(out[0].content, `SYSTEM\n\n${policy.TEXT_ONLY_NOTE}`, "late system text joins the leading message");
  assert.equal(out[1].content, "How do I cut rework?\n\n<website_context>\nCURRENT_PAGE: /in/en/industries/manufacturing\n</website_context>");
  assert.equal(out[2].content, "Earlier reply.\n\n[Visual rendered earlier in this conversation: graph]");
  assert.deepEqual(out[4], {
    role: "assistant",
    content: "Mapping.",
    tool_calls: [{ id: "toolu_01", type: "function", function: { name: "build_workflow_graph", arguments: '{"title":"Rework"}' } }],
  });
  assert.deepEqual(out[5], { role: "tool", tool_call_id: "toolu_01", content: "Error: rendered" });
  assert.ok(!JSON.stringify(out).includes("hidden"), "thinking never leaves");

  // Mistral takes only nine-character alphanumeric ids; both sides map alike.
  const mistral = compat.toChatMessages("S", messages, { toolCallIds: "alnum9" });
  const callId = mistral[4].tool_calls[0].id;
  assert.match(callId, /^[a-zA-Z0-9]{9}$/);
  assert.equal(mistral[5].tool_call_id, callId);
  assert.notEqual(compat.alnum9("call_a"), compat.alnum9("call_b"));
});

test("tools: Anthropic-only fields dropped; Gemini gets its schema subset", () => {
  const plain = compat.toChatTools(OPERATOR_TOOLS);
  assert.equal(plain.length, OPERATOR_TOOLS.length);
  plain.forEach((tool, i) => {
    assert.equal(tool.type, "function");
    assert.equal(tool.function.name, OPERATOR_TOOLS[i].name);
    assert.deepEqual(tool.function.parameters, OPERATOR_TOOLS[i].input_schema);
  });
  assert.ok(!JSON.stringify(plain).includes("eager_input_streaming"));

  const gemini = JSON.stringify(compat.toChatTools(OPERATOR_TOOLS, "gemini"));
  assert.ok(JSON.stringify(OPERATOR_TOOLS).includes("exclusiveMinimum"), "fixture still exercises the conversion");
  assert.ok(!gemini.includes("exclusiveMinimum"));
  const impact = compat.toChatTools(OPERATOR_TOOLS, "gemini").find((t) => t.function.name === "calculate_operational_impact");
  assert.match(JSON.stringify(impact), /"amount":\{"type":"number","minimum":0/);
});

test("inline <think> reasoning is cut from the text, even split across chunks", () => {
  const run = (chunks) => {
    const filter = compat.createThinkFilter();
    return chunks.map((c) => filter.push(c)).join("") + filter.flush();
  };
  assert.equal(run(["<think>plan</think>\n\nAnswer."]), "Answer.");
  assert.equal(run(["<th", "ink>pl", "an</th", "ink>", "\n", "Ans", "wer."]), "Answer.");
  assert.equal(run(["a < b and x<t"]), "a < b and x<t", "a lone < survives");
  assert.equal(run(["Before. <think>x</think> After."]), "Before. After.");
  assert.equal(run(["<think>never closed"]), "");
});

/* ------------------------------ mock provider API ----------------------------- */

const chunk = (delta, finish = null) =>
  `data: ${JSON.stringify({ id: "c", object: "chat.completion.chunk", choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
const DONE = "data: [DONE]\n\n";
const textReply = (text) => chunk({ role: "assistant", content: "" }) + chunk({ content: text }) + chunk({}, "stop") + DONE;
const toolReply = (id, name, args) =>
  chunk({ tool_calls: [{ index: 0, id, type: "function", function: { name, arguments: "" } }] }) +
  chunk({ tool_calls: [{ index: 0, function: { arguments: args.slice(0, 5) } }] }) +
  chunk({ tool_calls: [{ index: 0, function: { arguments: args.slice(5) } }] }) +
  chunk({}, "tool_calls") +
  DONE;

const calls = [];
const mock = http.createServer(async (req, res) => {
  let raw = "";
  for await (const part of req) raw += part;
  const body = JSON.parse(raw);
  const [, provider, unit] = /^\/(\w+)(?:\/(\w+))?\/chat\/completions$/.exec(req.url) ?? [];
  const firstUser = body.messages.find((m) => m.role === "user")?.content ?? "";
  const scenario = unit ?? /SCENARIO:(\w+)/.exec(firstUser)?.[1];
  const earlier = calls.filter((c) => c.scenario === scenario && c.provider === provider).length;
  calls.push({ provider, scenario, body, headers: req.headers });
  const sse = (payload, headers = {}) => {
    res.writeHead(200, { "content-type": "text/event-stream", ...headers });
    res.end(payload);
  };
  const error = (status, payload, headers = {}) => {
    res.writeHead(status, { "content-type": "application/json", ...headers });
    res.end(JSON.stringify(payload));
  };
  const afterTools = body.messages.at(-1).role === "tool";

  switch (scenario) {
    // --- unit cases for streamChatCompletion ---
    case "crlf":
      return sse(textReply("Hi.").replaceAll("\n", "\r\n"));
    case "split": // tool arguments in fragments, text with inline reasoning, a keep-alive comment
      return sse(
        ": keep-alive\n\n" +
          chunk({ content: "<think>x</think>Sure. " }) +
          chunk({ reasoning: "..." }) +
          toolReply("call_9", "search_savin_knowledge", '{"query":"discovery sprint"}'),
      );
    case "noid": // Gemini-style: the whole call in one chunk, no index, no id
      return sse(chunk({ tool_calls: [{ function: { name: "search_savin_knowledge", arguments: '{"query":"x"}' } }] }) + chunk({}, "stop") + DONE);
    case "badargs":
      return sse(toolReply("call_1", "build_workflow_graph", '{"title": ,,, }'));
    case "cutoff":
      return sse(
        chunk({ tool_calls: [{ index: 0, id: "c", function: { name: "build_workflow_graph", arguments: '{"title": "Rew' } }] }) +
          chunk({}, "length") +
          DONE,
      );
    case "limited":
      return error(429, { error: { message: "Rate limit reached for tokens per minute", type: "tokens", code: "rate_limit_exceeded" } }, { "retry-after": "7" });
    case "midstream":
      return sse(chunk({ content: "Part" }) + `data: ${JSON.stringify({ error: { message: "upstream overloaded", code: 503 } })}\n\n`);
    case "truncated":
      res.writeHead(200, { "content-type": "text/event-stream" });
      return res.end(chunk({ content: "Half" }));

    // --- route scenarios ---
    case "hello":
      return sse(textReply(`Hello from ${provider}.`));
    case "tool":
      if (afterTools) return sse(textReply("Found it."));
      return sse(toolReply("call_s1", "search_savin_knowledge", '{"query":"discovery sprint"}'));
    case "think":
      return sse(chunk({ content: "<thi" }) + chunk({ content: "nk>private plan</th" }) + chunk({ content: "ink>\n\nAnswer." }) + chunk({}, "stop") + DONE);
    case "badjson":
      if (earlier === 0) return sse(toolReply("call_b", "build_workflow_graph", '{"title": ,,, }'));
      return sse(textReply("Fixed."));
    case "loop":
      if (body.tool_choice === "none") return sse(textReply("Final answer."));
      return sse(toolReply(`call_l${earlier}`, "search_savin_knowledge", '{"query":"discovery sprint"}'));
    case "groq429":
      if (provider === "groq") return error(429, { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }, { "retry-after": "30" });
      return sse(textReply(`Hello from ${provider}.`));
    case "allfail":
      return error(503, { error: { message: "Service unavailable" } });
    default:
      return error(404, { error: { message: `no scenario ${scenario}` } });
  }
});

const listening = new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
const base = async () => {
  await listening;
  return `http://127.0.0.1:${mock.address().port}`;
};
const unitProvider = async (name) => ({
  id: "groq",
  label: "Groq",
  kind: "openai",
  model: "test-model",
  maxTokens: 100,
  baseUrl: `${await base()}/groq/${name}`,
  apiKey: "k",
  headers: {},
});
const stream = async (name) => {
  const text = [];
  const events = [];
  const round = await compat.streamChatCompletion(
    await unitProvider(name),
    { messages: [{ role: "system", content: "S" }, { role: "user", content: "hi" }], tools: [], toolChoice: "auto" },
    {
      signal: new AbortController().signal,
      onText: (d) => text.push(d),
      onThinking: () => events.push("thinking"),
      onToolStart: (n) => events.push(`tool:${n}`),
    },
  );
  return { round, text: text.join(""), events };
};

test("streamChatCompletion, and the route end to end, against a local OpenAI-compatible mock", async (t) => {
  t.after(() => {
    mock.closeAllConnections?.();
    mock.close();
  });

  await t.test("CRLF line endings", async () => {
    const { round, text } = await stream("crlf");
    assert.equal(text, "Hi.");
    assert.deepEqual(round, { stopReason: "end_turn", text: "Hi.", toolCalls: [] });
  });

  await t.test("argument fragments, inline and separate reasoning, keep-alive comments", async () => {
    const { round, text, events } = await stream("split");
    assert.equal(text, "Sure. ");
    assert.equal(round.stopReason, "tool_use");
    assert.deepEqual(round.toolCalls, [{ id: "call_9", name: "search_savin_knowledge", input: { query: "discovery sprint" } }]);
    assert.ok(events.includes("thinking"));
    assert.ok(events.includes("tool:search_savin_knowledge"));
    const sent = calls.findLast((c) => c.scenario === "split");
    assert.equal(sent.headers.authorization, "Bearer k");
    assert.equal(sent.body.stream, true);
    assert.equal(sent.body.max_tokens, 100);
    assert.equal(sent.body.model, "test-model");
    assert.equal(sent.body.tools, undefined, "no empty tools array");
  });

  await t.test("a tool call without index or id, and finish_reason stop, is still a tool call", async () => {
    const { round } = await stream("noid");
    assert.equal(round.stopReason, "tool_use");
    assert.equal(round.toolCalls[0].name, "search_savin_knowledge");
    assert.match(round.toolCalls[0].id, /^call_[a-z0-9]{9}$/);
  });

  await t.test("arguments that are not JSON throw ToolCallParseError, unless cut off at max_tokens", async () => {
    await assert.rejects(stream("badargs"), (err) => err instanceof compat.ToolCallParseError && !/,,,/.test(err.message));
    const { round } = await stream("cutoff");
    assert.equal(round.stopReason, "max_tokens");
  });

  await t.test("HTTP errors, mid-stream errors and dropped streams are ProviderErrors", async () => {
    await assert.rejects(stream("limited"), (err) => {
      assert.ok(err instanceof compat.ProviderError);
      assert.equal(err.status, 429);
      assert.equal(err.code, "rate_limit_exceeded");
      assert.equal(err.headers.get("retry-after"), "7");
      assert.equal(err.provider, "groq");
      return true;
    });
    await assert.rejects(stream("midstream"), (err) => err instanceof compat.ProviderError && err.status === 503);
    await assert.rejects(stream("truncated"), (err) => err instanceof compat.ProviderError && /ended early/.test(err.message));
  });

  /* --------------------------------- the route -------------------------------- */

  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.OPERATOR_ENABLED;
  delete process.env.OPERATOR_PROVIDERS;
  process.env.GROQ_API_KEY = "groq-key";
  process.env.GROQ_BASE_URL = `${await base()}/groq`;
  process.env.GEMINI_API_KEY = "gemini-key";
  process.env.GEMINI_BASE_URL = `${await base()}/gemini`;
  const route = await import("../src/app/api/operator/route.ts");
  const { NextRequest } = createRequire(import.meta.url)("next/server");

  let visitor = 0;
  const callRoute = async (scenario) => {
    visitor++;
    const before = calls.length;
    const res = await route.POST(
      new NextRequest("http://localhost:3000/api/operator", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "sec-fetch-site": "same-origin",
          "x-forwarded-for": `10.88.${Math.floor(visitor / 250)}.${visitor % 250}`,
        },
        body: JSON.stringify({
          locale: "en",
          country: "in",
          turns: [{ role: "user", text: `SCENARIO:${scenario} hello`, page: { pathname: "/in/en/industries/manufacturing" } }],
        }),
      }),
    );
    assert.equal(res.status, 200);
    const events = (await res.text()).trim().split("\n").map((line) => JSON.parse(line));
    const terminal = events.filter((e) => e.type === "done" || e.type === "error");
    assert.equal(terminal.length, 1, "exactly one terminal event");
    assert.equal(events.at(-1), terminal[0], "and it is last");
    return {
      events,
      text: events.filter((e) => e.type === "text").map((e) => e.delta).join(""),
      artifacts: events.filter((e) => e.type === "artifact").map((e) => e.artifact),
      upstream: calls.slice(before),
    };
  };

  await t.test("route: the first provider answers with a well-formed Chat Completions call", async () => {
    const { text, events, upstream } = await callRoute("hello");
    assert.equal(text, "Hello from groq.");
    assert.deepEqual(events.at(-1), { type: "done" });
    assert.equal(upstream.length, 1);
    const { body, headers } = upstream[0];
    assert.equal(headers.authorization, "Bearer groq-key");
    assert.equal(body.model, "llama-3.3-70b-versatile");
    assert.equal(body.max_tokens, 4096);
    assert.equal(body.tool_choice, "auto");
    assert.deepEqual(body.tools.map((tool) => tool.function.name), OPERATOR_TOOLS.map((tool) => tool.name));
    assert.deepEqual(body.messages.map((m) => m.role), ["system", "user"]);
    assert.match(body.messages[0].content, /provider \(Groq or Google Gemini\)/, "visitors are told where messages go");
    assert.doesNotMatch(body.messages[0].content, /Anthropic/);
    assert.match(body.messages[1].content, /^SCENARIO:hello hello\n\n<website_context>\n/);
    assert.match(body.messages[1].content, /OPENING_SHOWN: /);
  });

  await t.test("route: a tool round runs the tool and sends its result back as a tool message", async () => {
    const { text, artifacts, upstream } = await callRoute("tool");
    assert.deepEqual(artifacts.map((a) => [a.type, a.id]), [["sources", "call_s1"]]);
    assert.equal(text, "Found it.");
    assert.equal(upstream.length, 2);
    const second = upstream[1].body.messages;
    assert.deepEqual(second.at(-2).tool_calls.map((c) => [c.id, c.function.name]), [["call_s1", "search_savin_knowledge"]]);
    assert.equal(second.at(-1).role, "tool");
    assert.equal(second.at(-1).tool_call_id, "call_s1");
  });

  await t.test("route: inline reasoning never reaches the visitor", async () => {
    const { text } = await callRoute("think");
    assert.equal(text, "Answer.");
  });

  await t.test("route: a malformed tool call re-issues the round on the same provider", async () => {
    const { text, artifacts, upstream } = await callRoute("badjson");
    assert.equal(text, "Fixed.");
    assert.equal(artifacts.length, 0);
    assert.deepEqual(upstream.map((c) => c.provider), ["groq", "groq"]);
  });

  await t.test("route: the last round has tools off (tool_choice none plus the note in the system message)", async () => {
    const { text, artifacts, upstream } = await callRoute("loop");
    assert.equal(upstream.length, config.OPERATOR_MAX_TOOL_ROUNDS);
    assert.equal(artifacts.length, config.OPERATOR_MAX_TOOL_ROUNDS - 1);
    assert.equal(text, "Final answer.");
    const last = upstream.at(-1).body;
    assert.equal(last.tool_choice, "none");
    assert.ok(last.messages[0].content.endsWith(policy.TEXT_ONLY_NOTE));
    assert.ok(last.messages.slice(1).every((m) => m.role !== "system"), "no system message after the first");
    assert.ok(upstream.slice(0, -1).every((c) => c.body.tool_choice === "auto"));
  });

  await t.test("route: a rate-limited provider hands over, and is routed around afterwards", async () => {
    const first = await callRoute("groq429");
    assert.equal(first.text, "Hello from gemini.");
    assert.deepEqual(first.upstream.map((c) => c.provider), ["groq", "gemini"]);
    const gemini = first.upstream[1].body;
    assert.equal(gemini.model, "gemini-flash-latest");
    assert.ok(!JSON.stringify(gemini.tools).includes("exclusiveMinimum"), "Gemini gets its schema dialect");

    const next = await callRoute("hello");
    assert.deepEqual(next.upstream.map((c) => c.provider), ["gemini"], "groq is cooling down (Retry-After 30 s)");
    assert.equal(next.text, "Hello from gemini.");
  });

  await t.test("route: when every provider fails, the visitor gets one error event", async () => {
    const { events, text, upstream } = await callRoute("allfail");
    assert.equal(text, "");
    assert.deepEqual(events.at(-1), { type: "error", code: "upstream" });
    assert.deepEqual([...new Set(upstream.map((c) => c.provider))].sort(), ["gemini", "groq"]);
  });

  await t.test("route: GET reports unavailable when no provider is configured", async () => {
    assert.equal((await route.GET()).status, 204);
    const keys = { GROQ_API_KEY: process.env.GROQ_API_KEY, GEMINI_API_KEY: process.env.GEMINI_API_KEY };
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      assert.equal((await route.GET()).status, 503);
    } finally {
      Object.assign(process.env, keys);
    }
  });
});
