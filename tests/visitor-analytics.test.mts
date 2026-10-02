import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, analyticsTimeZone, dayKey, deviceCategory, isBot, isVisitorId, lastDays, monthStart, referrerHost, trackedPath, weekStart } from "../lib/visitor-analytics-core.ts";

const NY = "America/New_York";

test("days are counted in the business timezone, not the server's", () => {
  // 02:30 UTC on 2 October is still the evening of 1 October in New York.
  assert.equal(dayKey(new Date("2026-10-02T02:30:00Z"), NY), "2026-10-01");
  assert.equal(dayKey(new Date("2026-10-02T04:30:00Z"), NY), "2026-10-02");
  assert.equal(dayKey(new Date("2026-10-02T02:30:00Z"), "UTC"), "2026-10-02");
});

test("weeks start on Monday and months on the 1st", () => {
  assert.equal(weekStart("2026-10-02"), "2026-09-28", "Friday belongs to the week starting Monday 28 Sep");
  assert.equal(weekStart("2026-09-28"), "2026-09-28", "Monday starts its own week");
  assert.equal(weekStart("2026-10-04"), "2026-09-28", "Sunday ends the week");
  assert.equal(monthStart("2026-10-02"), "2026-10-01");
  assert.equal(weekStart("2027-01-01"), "2026-12-28", "weeks cross the year boundary");
});

test("the 7-day window is contiguous across month ends and DST changes", () => {
  assert.deepEqual(lastDays("2026-10-02", 7), ["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
  // US clocks go back on 1 November 2026.
  assert.deepEqual(lastDays("2026-11-03", 3), ["2026-11-01", "2026-11-02", "2026-11-03"]);
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});

test("an invalid ANALYTICS_TIMEZONE falls back to the restaurant's timezone", () => {
  assert.equal(analyticsTimeZone(undefined), NY);
  assert.equal(analyticsTimeZone("Europe/London"), "Europe/London");
  const warn = console.warn;
  console.warn = () => {};
  try { assert.equal(analyticsTimeZone("Not/AZone"), NY); } finally { console.warn = warn; }
});

test("only public pages are tracked", () => {
  assert.equal(trackedPath("/"), "/");
  assert.equal(trackedPath("/menu/"), "/menu");
  for (const bad of ["/admin", "/admin/dashboard", "/api/chat", "/menu?x=1", "/does-not-exist", "menu", "", 42, null, "/" + "a".repeat(300)]) assert.equal(trackedPath(bad), null, String(bad));
});

test("visitor IDs must be random v4 UUIDs", () => {
  assert.ok(isVisitorId("3f2b8c1e-4d5a-4b6c-9d7e-8f9a0b1c2d3e"));
  for (const bad of ["", "not-a-uuid", "3F2B8C1E-4D5A-4B6C-9D7E-8F9A0B1C2D3E", "3f2b8c1e-4d5a-1b6c-9d7e-8f9a0b1c2d3e", "jane@example.com", undefined]) assert.equal(isVisitorId(bad), false, String(bad));
});

test("referrers keep only the external site's host", () => {
  assert.equal(referrerHost("https://www.google.com/search?q=angel+restaurant", "www.angelindianrestaurant.com"), "google.com");
  assert.equal(referrerHost("https://www.angelindianrestaurant.com/menu", "www.angelindianrestaurant.com"), "", "internal links are not referrers");
  assert.equal(referrerHost("https://angelindianrestaurant.com/", "www.angelindianrestaurant.com"), "", "www and bare domain are the same site");
  for (const bad of ["", "javascript:alert(1)", "not a url", 5]) assert.equal(referrerHost(bad, "example.com"), "");
});

test("device category and crawler detection", () => {
  assert.equal(deviceCategory("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148"), "mobile");
  assert.equal(deviceCategory("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36"), "mobile");
  assert.equal(deviceCategory("Mozilla/5.0 (Linux; Android 14; SM-X710) Safari/537.36"), "tablet");
  assert.equal(deviceCategory("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)"), "tablet");
  assert.equal(deviceCategory("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0 Safari/537.36"), "desktop");
  assert.ok(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"));
  assert.ok(isBot("Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/140.0 Safari/537.36"));
  assert.ok(isBot(""));
  assert.equal(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0 Safari/537.36"), false);
});
