import { test } from "node:test";
import assert from "node:assert/strict";
import { methodNotAllowed, optionsAllowed } from "../lib/api-methods.ts";

test("unsupported methods return 405 and advertise only supported methods", () => {
  const response = methodNotAllowed("POST, OPTIONS");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST, OPTIONS");
});

test("OPTIONS advertises the supported methods without a body", async () => {
  const response = optionsAllowed("POST, OPTIONS");
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("allow"), "POST, OPTIONS");
  assert.equal(await response.text(), "");
});
