import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDate, formatDate, todayInRestaurantTz } from "../lib/chat/dates.ts";

// A fixed "now" so weekday and year-rollover rules are deterministic.
// 2026-09-28 in New York is a Monday.
const NOW = new Date("2026-09-28T15:00:00Z");
const iso = (text: string, context: string[] = []) => {
  const result = resolveDate(text, context, NOW);
  return result.kind === "date" ? result.iso : result.kind;
};

test("today is read in the restaurant's timezone", () => {
  assert.equal(todayInRestaurantTz(NOW), "2026-09-28");
});

test("month-name dates parse in every written form", () => {
  assert.equal(iso("Is October 15 available for a birthday?"), "2026-10-15");
  assert.equal(iso("October 15th"), "2026-10-15");
  assert.equal(iso("15 October"), "2026-10-15");
  assert.equal(iso("15th of October"), "2026-10-15");
  assert.equal(iso("December 24, 2026"), "2026-12-24");
  assert.equal(iso("March 5 2027"), "2027-03-05");
  assert.equal(iso("5 March 2027"), "2027-03-05");
  assert.equal(iso("2027-03-05"), "2027-03-05");
});

test("the same date reached through different wording resolves identically", () => {
  const forms = ["December 24, 2026", "24 December 2026", "2026-12-24", "december 24th 2026"];
  for (const form of forms) assert.equal(iso(form), "2026-12-24", form);
});

test("a month/day already past rolls to next year, by rule and not by month", () => {
  // NOW is 28 September 2026.
  assert.equal(iso("October 15"), "2026-10-15", "still ahead this year");
  assert.equal(iso("March 5"), "2027-03-05", "already past, so next year");
  assert.equal(iso("September 28"), "2026-09-28", "today counts as this year");
  assert.equal(iso("September 27"), "2027-09-27", "yesterday rolls forward");
});

test("relative expressions resolve against the restaurant's today", () => {
  assert.equal(iso("today"), "2026-09-28");
  assert.equal(iso("tomorrow"), "2026-09-29");
  assert.equal(iso("this Saturday"), "2026-10-03");
  assert.equal(iso("next Saturday"), "2026-10-03");
  assert.equal(iso("Saturday"), "2026-10-03");
  assert.equal(iso("this Monday"), "2026-09-28", "today, when today is that weekday");
  assert.equal(iso("next Monday"), "2026-10-05", "the following one");
});

test("a span is ambiguous — it is not a date the team can be asked about", () => {
  assert.equal(iso("next week"), "ambiguous");
  assert.equal(iso("next month"), "ambiguous");
  assert.equal(iso("sometime in the future"), "ambiguous");
});

test("a bare day with no month in view is ambiguous, never guessed", () => {
  assert.equal(iso("what about the 20th?"), "ambiguous");
  assert.equal(iso("the 3rd"), "ambiguous");
});

test("a bare day borrows the month from the exchange above it", () => {
  assert.equal(iso("what about the 20th?", ["Is October 15 reserved?"]), "2026-10-20");
  assert.equal(iso("and the 5th?", ["I want a birthday on March 5 2027"]), "2027-03-05");
  // The most recent dated message wins.
  assert.equal(iso("the 2nd?", ["October 15", "December 24, 2026"]), "2026-12-02");
});

test("context supplies only the month — never a day of its own", () => {
  assert.equal(iso("I want to host a birthday", ["October 15"]), "none");
});

test("messages with no date at all resolve to none", () => {
  assert.equal(iso("I want to host a birthday event"), "none");
  assert.equal(iso("do you have a private room?"), "none");
  assert.equal(iso("a table for 20 people"), "none", "a party size is not a date");
});

test("impossible calendar dates do not resolve", () => {
  assert.equal(iso("February 30"), "none");
  assert.equal(iso("2027-02-31"), "none");
});

test("dates far in another year are handled by the same path", () => {
  assert.equal(iso("March 5, 2029"), "2029-03-05");
  assert.equal(iso("1 January 2030"), "2030-01-01");
});

test("the human-readable form matches the resolved date", () => {
  assert.equal(formatDate("2026-10-15"), "15 October 2026");
  assert.equal(formatDate("2027-03-05"), "5 March 2027");
});

// --- forms the event-date pass found unresolved ------------------------------

// A visitor typing 01/15/2027 was getting "which month?" even though the month
// was right there. Month-first, because the restaurant and the site are en-US.
test("numeric dates resolve month-first", () => {
  assert.equal(iso("01/15/2027"), "2027-01-15");
  assert.equal(iso("Is 01/15/2027 available for an event?"), "2027-01-15");
  assert.equal(iso("12/25/26"), "2026-12-25", "two-digit year");
  assert.equal(iso("1/5"), "2027-01-05", "no year -> next occurrence");
});

test("a day-first numeric date is reported ambiguous, never re-read as month-first", () => {
  assert.equal(iso("15/01/2027"), "ambiguous");
  assert.equal(iso("31/12/2026"), "ambiguous");
});

test("relative offsets resolve against the restaurant's today", () => {
  // NOW is 28 September 2026.
  assert.equal(iso("two weeks from now"), "2026-10-12");
  assert.equal(iso("in two weeks"), "2026-10-12");
  assert.equal(iso("in 10 days"), "2026-10-08");
  assert.equal(iso("three days from now"), "2026-10-01");
  assert.equal(iso("a month later"), "2026-10-28");
  assert.equal(iso("in 2 months"), "2026-11-28");
});

test("a bare day borrows a month named on its own earlier in the thread", () => {
  assert.equal(iso("What about the 25th?", ["I want to host an event in December."]), "2026-12-25");
  assert.equal(iso("the 5th?", ["something in March 2027"]), "2027-03-05");
  // Still ambiguous when no month is anywhere in view.
  assert.equal(iso("What about the 20th?", ["I want to host a birthday event."]), "ambiguous");
});
