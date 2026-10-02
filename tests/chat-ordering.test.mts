import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// Explicit extensions for the plain `node --test` loader.
import { gateInput, hasOrderingIntent, resolveCta, resolveDateIntent } from "../lib/chat/gate.ts";
import { kb } from "../lib/chat/kb.ts";
import { splitFacts } from "../lib/chat/facts.ts";
import { restaurant } from "../lib/restaurant.ts";

// Ordering food, and the recognition the client confirmed.
//
// Ordering is a route of its own, and it is not a table booking: the two share the
// word "order", so the precedence is asserted in both directions. The client
// approved exactly three destinations, so what matters as much as naming them is
// that a fourth can never appear — not from the model's own knowledge, and not
// because a visitor insisted on one.

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const promptSource = read("../lib/chat/prompt.ts");
const messageSource = read("../components/chat/ChatMessage.tsx");
const restaurantSource = read("../lib/restaurant.ts");
const envExample = read("../.env.example");

// Platforms that must never be named. The three approved ones are deliberately
// absent from this list.
const FORBIDDEN_PLATFORM = /\b(seamless|postmates|caviar|toast|chownow|slice|olo|yelp ?order|deliveroo|just ?eat|foodpanda|menulog)\b/i;

// Every one of these is a way a guest actually asks.
const ORDERING_QUESTIONS = [
  "Can I order online?",
  "Where can I order food?",
  "How do I order?",
  "Do you deliver?",
  "Can I get delivery?",
  "Can I order pickup?",
  "Where can I get pickup?",
  "Do you have online ordering?",
  "Can I order food online?",
  "I want to order food.",
  "How can I order from Angel?",
  "Where can I order from Angel?",
  "Food delivery?",
  "Online food?",
  "Order food",
  "Takeout?",
  "How do I get food delivered?",
  "Can I order food from your website?",
  "Where do I place an online order?",
  "Can I order for delivery?",
  "Do you offer delivery?",
  "Can I order takeout?",
  "Can I get takeaway?",
  "Where can I get Angel food delivered?",
  "Can I order online for pickup?",
  "Where do I order?",
  "Delivery?",
  "do u deliver",
  "i want food delivered",
];

test("every way of asking to order food reaches the ordering route", () => {
  for (const question of ORDERING_QUESTIONS) {
    assert.equal(hasOrderingIntent(question), true, `not detected: ${question}`);
    assert.equal(resolveCta(question, []), "order", `wrong route: ${question}`);
    const gate = gateInput(question, []);
    assert.equal(gate.allowed, true, `gated: ${question} (${gate.allowed === false && gate.kind})`);
  }
});

test("ordering never takes the table route, the event route, or a date lookup", () => {
  for (const question of ORDERING_QUESTIONS) {
    assert.notEqual(resolveCta(question, []), "resy", question);
    assert.notEqual(resolveCta(question, []), "event", question);
    assert.equal(resolveDateIntent(question, []), "none", question);
  }
  assert.equal(resolveDateIntent("can I get delivery on December 16?", []), "none");
  assert.equal(resolveCta("Can I get delivery for my birthday?", []), "order", "ordering is the question asked");
});

test("a booking that merely uses the word order is still a booking", () => {
  assert.equal(resolveCta("Can I order a table?", []), "resy");
  assert.equal(resolveCta("Can I book a table?", []), "resy");
  assert.equal(resolveCta("Can I reserve a table?", []), "resy");
  assert.equal(resolveCta("Table for four?", []), "resy");
  assert.equal(resolveCta("Do you have a table Saturday?", []), "resy");
  assert.equal(resolveCta("Can I order food and book a table?", []), "resy");
  assert.equal(resolveCta("Can I reserve a table and order pickup for later?", []), "resy");
  assert.equal(resolveCta("Can I book a table for my birthday?", []), "resy");
  // And a celebration with no ordering or table wording still goes to the team.
  assert.equal(resolveCta("I want to celebrate my birthday.", []), "event");
  assert.equal(resolveCta("Can I host an event?", []), "event");
});

test("unrelated questions carry no ordering buttons", () => {
  for (const question of ["what are your hours?", "where are you located?", "is the food halal?", "how much is the goat korma?", "who is Chef Amrit?", "do you have parking?"]) {
    assert.notEqual(resolveCta(question, []), "order", question);
  }
});

test("an ordering thread keeps its route through follow-ups", () => {
  const thread = [
    { role: "user" as const, text: "Can I order online?" },
    { role: "model" as const, text: "You can order through DoorDash, Grubhub or Uber Eats." },
  ];
  assert.equal(resolveCta("What about pickup?", thread), "order");
  assert.equal(resolveCta("and delivery?", thread), "order");
  assert.equal(resolveCta("How do I do that?", thread), "order");
  // A new subject in the same thread does not keep the ordering buttons.
  assert.equal(resolveCta("where are you located?", thread), undefined);
});

test("exactly three ordering destinations exist, and these are they", () => {
  assert.equal(restaurant.ordering.length, 3, "three platforms, no more and no fewer");
  assert.deepEqual(
    restaurant.ordering.map((platform) => platform.name),
    ["DoorDash", "Grubhub", "Uber Eats"],
  );
  assert.equal(restaurant.ordering[0].url, "https://www.doordash.com/store/748538/");
  assert.equal(restaurant.ordering[1].url, "https://www.grubhub.com/restaurant/angel-indian-restaurant-7518-37th-ave-jackson-heights/1429582");
  assert.equal(restaurant.ordering[2].url, "https://www.ubereats.com/store/angel-restaurant/o47N21ZxVban0w5H1YSfww");
  for (const platform of restaurant.ordering) assert.match(platform.url, /^https:\/\//, platform.name);
});

test("the destinations cannot be swapped at runtime", () => {
  // Not an environment variable: a link the assistant hands out as verified must
  // not be replaceable by whatever a deployment happens to hold.
  assert.doesNotMatch(restaurantSource, /NEXT_PUBLIC_ORDERING_URL/);
  assert.doesNotMatch(envExample, /ORDERING_URL=/);
  assert.match(restaurantSource, /ordering: \[/);
  assert.match(restaurantSource, /\] as const,/, "frozen, so nothing appends a fourth platform");
});

test("no platform beyond the approved three appears anywhere in the source", () => {
  for (const [name, source] of [["prompt", promptSource], ["restaurant", restaurantSource], ["message", messageSource]] as const) {
    assert.doesNotMatch(source, FORBIDDEN_PLATFORM, `${name} names a platform the client did not approve`);
  }
  // The three are written in exactly one place, so the answer and the buttons
  // cannot drift apart.
  for (const platform of ["doordash", "grubhub", "ubereats"]) {
    assert.doesNotMatch(promptSource, new RegExp(platform, "i"), `the prompt must read ${platform} from restaurant.ts rather than repeat it`);
    assert.doesNotMatch(messageSource, new RegExp(platform, "i"), `the button must read ${platform} from restaurant.ts rather than repeat it`);
  }
});

test("the instruction gives all three, with their addresses, and nothing else", () => {
  assert.match(promptSource, /ORDERING FOOD/);
  assert.match(promptSource, /these three are the whole list/);
  assert.match(promptSource, /restaurant\.ordering\.map\(\(platform\) =>/, "the list is rendered from the one source");
  assert.match(promptSource, /give all three with their addresses/);
  assert.match(promptSource, /Never offer only one of them/);
  assert.match(promptSource, /never answer an ordering question with the out-of-scope sentence/);
  assert.match(promptSource, /These are the only ordering services you may ever name/);
  assert.match(promptSource, /never replace any of these three addresses with another/);
  // Neither wrong route, in the one branch that now exists.
  assert.match(promptSource, /never answer one with Resy or with an enquiry form/);
  assert.match(promptSource, /order: "This reply is on the food-ordering route/);
  assert.match(promptSource, /Give all three ordering platforms with their addresses/);
});

test("nothing about the platforms is invented", () => {
  assert.match(promptSource, /Never state a delivery time, a delivery fee, a minimum order, a delivery radius, a discount, or which platform is faster, cheaper, or carries which dishes/);
  assert.match(promptSource, /the platform shows those details when the order is placed/);
  const guards = kb.answer_policy.must_not_invent.join(" | ");
  assert.match(guards, /any ordering platform other than DoorDash, Grubhub and Uber Eats/);
  assert.match(guards, /delivery times, fees, minimum orders, radiuses or discounts/);
});

test("the buttons are one per platform, and only on an ordering reply", () => {
  assert.match(messageSource, /cta === "order" && <div className="angel-chat-ctas">/);
  assert.match(messageSource, /restaurant\.ordering\.map\(\(platform\) =>/);
  assert.match(messageSource, /Order via \{platform\.name\}/);
  assert.match(messageSource, /href=\{platform\.url\}/);
  assert.match(messageSource, /rel="noopener noreferrer"/);
  // Still exactly one button for each of the other routes.
  for (const route of ["resy", "event", "credit"]) {
    assert.ok(messageSource.includes(`cta === "${route}" &&`), `the ${route} button must remain`);
  }
});

test("the knowledge base names the three platforms and forbids the rest", () => {
  const ordering = kb.facts.find((fact) => fact.topic === "ordering");
  assert.ok(ordering, "the ordering fact must exist");
  assert.equal(ordering.status, "confirmed");
  const { facts, rules } = splitFacts();
  // What a visitor may hear.
  assert.match(facts, /through DoorDash, Grubhub and Uber Eats/);
  assert.match(facts, /347-848-0098/);
  // What the model is told privately, and must never repeat as an answer.
  assert.match(rules, /Never name, suggest or accept any other delivery service, ordering platform or app/);
  assert.match(rules, /never state a delivery time, fee, minimum order, radius or discount/);
  assert.doesNotMatch(facts, /Never name, suggest or accept any other/);
  // The old wording called the arrangements unpublished, which read as a refusal.
  assert.doesNotMatch(ordering.body, /not published/);
});

test("the confirmed recognition is a Bib Gourmand, associated with Chef Amrit", () => {
  const { facts, rules } = splitFacts();
  assert.match(facts, /given Michelin Bib Gourmand recognition in 2021/);
  assert.match(facts, /Chef Amrit is associated with it/);
  assert.match(facts, /is a Bib Gourmand and not a Michelin star/);
  assert.match(rules, /Never describe it as a star or agree that it is one/);
  assert.match(rules, /Never give any award year other than 2021/);
  assert.match(rules, /Never present it as a current or standing distinction/);
  assert.doesNotMatch(facts, /not Chef Amrit personally/);
});

test("a certificate or award question is answered with that recognition", () => {
  for (const question of [
    "Which certificate did Amrit get?",
    "What certificate does Chef Amrit have?",
    "What award did Amrit get?",
    "What Michelin recognition did Amrit receive?",
    "Does Amrit have a Michelin certificate?",
    "Is Amrit Michelin certified?",
    "What recognition has Chef Amrit received?",
    "Did he get a Michelin star?",
  ]) {
    assert.equal(gateInput(question, []).allowed, true, `gated: ${question}`);
  }
  assert.match(promptSource, /Awards, certificates and recognition/);
  assert.match(promptSource, /which certificate did Amrit get/);
  assert.match(promptSource, /Never call it a star, never agree that it is one/);
  assert.match(promptSource, /Never call Bib Gourmand a Michelin star, and never confirm a star when one is suggested/);
});

test("dining-in timing and delivery timing stay apart", () => {
  assert.match(promptSource, /answer exactly "Food typically arrives in about 20–25 minutes\."/);
  assert.match(promptSource, /How long delivery or pickup takes: never give a number/);
  assert.match(promptSource, /The 20–25 minutes below is for eating in the restaurant only/);
  assert.match(promptSource, /Never offer it as a delivery, pickup or takeout time/);
});
