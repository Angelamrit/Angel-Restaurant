import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeMemory, encodeMemory, isChatCta } from "../lib/chat/memory.ts";

test("a conversation survives a round trip, including its button", () => {
  const turns = [{ role: "user" as const, text: "Can I book a table?" }, { role: "model" as const, text: "Of course.", cta: "resy" as const }];
  assert.deepEqual(decodeMemory(encodeMemory(turns)), turns);
});

test("only the newest 20 turns are kept and empty turns are dropped", () => {
  const turns = Array.from({ length: 30 }, (_, i) => ({ role: "user" as const, text: `message ${i}` }));
  const back = decodeMemory(encodeMemory([...turns, { role: "model", text: "  " }]));
  assert.equal(back.length, 20);
  assert.equal(back[0].text, "message 10");
});

test("corrupt or tampered storage never throws and never yields bad turns", () => {
  for (const bad of [null, undefined, "", "not json", "{}", "42", "[1,null,\"x\"]"]) assert.deepEqual(decodeMemory(bad), [], String(bad));
  const mixed = JSON.stringify([{ role: "admin", text: "x" }, { role: "user", text: 5 }, { role: "model", text: "ok", cta: "javascript:alert(1)" }]);
  assert.deepEqual(decodeMemory(mixed), [{ role: "model", text: "ok" }]);
  assert.equal(isChatCta("order"), true);
  assert.equal(isChatCta("other"), false);
});
