import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { validateMenu } from "../lib/menu-validation.ts";
const valid = () => ({ id: randomUUID(), name: "Test dish", description: "Description", priceCents: 1299, categoryId: "mains", type: "regular", image: "", available: true, visible: true, sortOrder: 0, vegetarian: false, vegan: false, tag: "", featured: false, featuredDescription: "" });
test("regular dishes need no photograph; monetary precision is retained", () => { assert.equal(validateMenu(valid(), ["mains"]).priceCents, 1299); });
test("reject invalid prices, categories, booleans, names, types and sort orders", () => {
  for (const patch of [{ priceCents: -1 }, { priceCents: 1.5 }, { priceCents: Infinity }, { priceCents: 1000001 }, { categoryId: "injected" }, { available: "false" }, { name: "  " }, { name: "x".repeat(121) }, { type: "other" }, { sortOrder: 0.5 }, { id: "../path" }]) assert.throws(() => validateMenu({ ...valid(), ...patch }, ["mains"]));
});
test("specials and featured regular dishes require photographs", () => {
  assert.throws(() => validateMenu({ ...valid(), type: "chef-special" }, ["mains"]));
  assert.throws(() => validateMenu({ ...valid(), featured: true }, ["mains"]));
});
test("vegan records also receive the vegetarian flag", () => { assert.equal(validateMenu({ ...valid(), vegan: true }, ["mains"]).vegetarian, true); });
