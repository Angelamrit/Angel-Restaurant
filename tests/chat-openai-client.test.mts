import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The OpenAI integration.
//
// Contract tests, not network tests: they assert how the client is constructed
// and how the route is wired to it, which is what a refactor can silently
// break. lib/chat/client.ts imports `server-only`, which does not resolve under
// plain `node --test`, so the contract is read from the source rather than
// imported — the same constraint that keeps lib/chat/kb.ts free of that import.
// The behaviour on the far side of the wire is covered by the behavioural run.

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const clientSource = read("../lib/chat/client.ts");
const routeSource = read("../app/api/chat/route.ts");
const promptSource = read("../lib/chat/prompt.ts");
const envExample = read("../.env.example");

test("the key is read at call time, never captured at import", () => {
  // Module scope runs once per process. Reading there would bind whatever the
  // environment held at import and ignore anything set afterwards.
  const beforeFactory = clientSource.slice(0, clientSource.indexOf("export function getOpenAIClient"));
  assert.doesNotMatch(beforeFactory, /process\.env\.OPENAI_API_KEY/, "the key must not be read at module scope");
  assert.match(clientSource, /if \(!apiKey\) return null;/, "a missing key degrades to null, never a throw");
});

test("the key cannot reach the browser bundle", () => {
  assert.match(clientSource, /^import "server-only";/m, "client.ts must be server-only");
  assert.doesNotMatch(clientSource, /NEXT_PUBLIC_/, "the key must never be a public variable");
  assert.doesNotMatch(routeSource, /NEXT_PUBLIC_/, "nor in the route");
  assert.match(envExample, /^OPENAI_API_KEY=\r?$/m, "the example env documents the key, empty");
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_OPENAI/, "and never as a public variable");
});

test("the model, reasoning budget and output ceiling are the measured values", () => {
  assert.match(clientSource, /export const CHAT_MODEL = "gpt-5\.4-mini";/);
  assert.match(clientSource, /export const REASONING_EFFORT = "low" as const;/);
  assert.match(clientSource, /export const MAX_OUTPUT_TOKENS = 3000;/, "the full menu needs roughly 2,060 output tokens");
  assert.doesNotMatch(routeSource, /temperature:/, "reasoning models reject temperature with a 400");
});

test("the knowledge base and live menu are what ground the request", () => {
  // The system instruction travels as `instructions`, rebuilt from the KB and
  // the public menu on every request. Nothing else is sent as authority: no
  // retrieval, no tools, no external source.
  assert.match(routeSource, /instructions: buildSystemInstruction\(promptMenu\)/, "the KB plus menu must be the instructions");
  assert.doesNotMatch(routeSource, /\btools:/, "no tools — the model has no outside channel");
  assert.doesNotMatch(routeSource, /web_search|file_search|vector_store|retrieval/i, "no retrieval of any kind");
});

test("visitor text never shares a channel with the rules", () => {
  const call = routeSource.slice(routeSource.indexOf("client.responses.create"), routeSource.indexOf("return streamText(stream, cta)"));
  const instructionsLine = call.slice(call.indexOf("instructions:"), call.indexOf("input:"));
  assert.doesNotMatch(instructionsLine, /\b(message|history)\b/, "no visitor text in the instructions");
  assert.match(call, /input: toResponsesInput\(history, message\)/, "the conversation goes in input");
});

test("our transcript roles are mapped to the roles the API accepts", () => {
  // We call the assistant's turns "model"; the API calls them "assistant". The
  // wire format the browser sends and receives is unchanged either way.
  assert.match(promptSource, /role: turn\.role === "model" \? \("assistant" as const\) : \("user" as const\)/, "history roles must be translated, not passed through");
});

test("nothing is retained on OpenAI's side", () => {
  assert.match(routeSource, /store: false/, "responses must not be stored");
});

test("streaming is requested, forwarded as it arrives, and the abort signal is wired through", () => {
  assert.match(routeSource, /stream: true/, "the reply must stream");
  assert.match(routeSource, /\{ signal: abortSignal \}/, "a disconnect or timeout must cut the call");
  assert.match(routeSource, /AbortSignal\.any\(\[request\.signal, AbortSignal\.timeout\(30_000\)\]\)/);
  const loop = routeSource.slice(routeSource.indexOf("for await (const event of stream)"));
  const enqueueAt = loop.indexOf("controller.enqueue");
  const closeAt = loop.indexOf("controller.close()");
  assert.ok(enqueueAt > -1 && enqueueAt < closeAt, "deltas must be enqueued before the stream closes");
  assert.match(loop.slice(0, enqueueAt), /event\.type === "response\.output_text\.delta"/, "each delta is forwarded directly");
  assert.match(routeSource, /incomplete_details\?\.reason === "max_output_tokens"/, "truncation comes from the terminal event");
});

test("the gate, CTA and event-date paths still run before the model", () => {
  const modelAt = routeSource.indexOf("getOpenAIClient()");
  for (const marker of ["gateInput(message, history)", "resolveCta(message, history)", "resolveDateIntent(message, history)", "getEventDateStatus(resolved.iso)"]) {
    const at = routeSource.indexOf(marker);
    assert.ok(at > -1 && at < modelAt, `${marker} must run before the model is reached`);
  }
  assert.match(routeSource, /"x-chat-cta": cta/, "the booking route still travels in a header");
});

test("no trace of the previous provider remains", () => {
  for (const [name, source] of [["client", clientSource], ["route", routeSource], ["prompt", promptSource], [".env.example", envExample]] as const) {
    assert.doesNotMatch(source, /gemini|genai|generativelanguage/i, `${name} still references the previous provider`);
  }
});
