import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMenuTotal, menuTotal, parseMenuTotalRequest } from "../lib/chat/menu-total.ts";

test("requests to price the whole menu are recognised, with the quantity", () => {
  assert.deepEqual(parseMenuTotalRequest("How much for one of everything?"), { quantity: 1 });
  assert.deepEqual(parseMenuTotalRequest("what would it cost to order two of everything on the menu"), { quantity: 2 });
  assert.deepEqual(parseMenuTotalRequest("Total price if I order 3 of each dish?"), { quantity: 3 });
  assert.deepEqual(parseMenuTotalRequest("how much is the entire menu"), { quantity: 1 });
  assert.deepEqual(parseMenuTotalRequest("cost of 500 of everything"), { quantity: 20 }, "quantity is capped");
});

test("ordinary menu questions are left to the assistant", () => {
  for (const text of ["How much is the butter chicken?", "What is on the menu?", "Do you have vegan dishes?", "Is everything halal?", "Tell me about the whole story of Chef Amrit", "What is the price of the lamb karahi and naan?"])
    assert.equal(parseMenuTotalRequest(text), null, text);
});

test("the total is exact integer arithmetic over priced dishes only", () => {
  const items = [{ name: "A", priceCents: 1099 }, { name: "B", priceCents: 250 }, { name: "Free", priceCents: 0 }];
  assert.deepEqual(menuTotal(items, 1), { dishes: 2, quantity: 1, totalCents: 1349 });
  assert.equal(menuTotal(items, 3).totalCents, 4047);
  assert.equal(formatMenuTotal(menuTotal(items, 1)), "$13.49 for one of every dish on the menu (2 dishes), before tax and tip, added up from the current menu prices.");
  assert.match(formatMenuTotal(menuTotal([], 1)), /could not find any priced dishes/);
});
