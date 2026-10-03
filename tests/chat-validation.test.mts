import { test } from "node:test";
import assert from "node:assert/strict";
import { InputError } from "../lib/menu-validation.ts";
import { parseChatRequest } from "../lib/chat/validation.ts";

test("chat requests require a non-empty message", () => {
  for (const input of [{}, { history: [] }, null, [], { message: "   " }, { message: 42 }]) {
    assert.throws(() => parseChatRequest(input), InputError);
  }
});

test("chat requests trim the message and keep only valid history", () => {
  assert.deepEqual(parseChatRequest({ message: "  Hello  ", history: [{ role: "user", text: " Hi " }, { role: "admin", text: "ignored" }] }), {
    message: "Hello",
    history: [{ role: "user", text: "Hi" }],
  });
});
