import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// A real migrated database, driven through the same scripts/database.mts the
// application uses. Set before lib/database.ts is imported, because query()
// reads these the first time it runs.
const directory = mkdtempSync(join(tmpdir(), "angel-events-test-"));
process.env.DATABASE_URL = "";
process.env.LOCAL_DATABASE_PATH = join(directory, "events.sqlite");
process.env.VERCEL = "";
const migrate = spawnSync(process.execPath, ["scripts/database.mts", "migrate"], {
  env: { ...process.env, NODE_ENV: "test" }, encoding: "utf8",
});
assert.equal(migrate.status, 0, migrate.stderr);

const { getEventDateStatus, recordEventReservation, isCalendarDate, BLOCKING_STATUSES } = await import("../lib/events.ts");

// Deliberately spread across months and years. The point of the suite is that
// ONE code path serves all of them — no date here is special to the production
// code, and these literals exist only in this file.
const RESERVED = ["2026-10-15", "2026-12-24", "2027-03-05"];
const FREE = ["2027-01-12", "2028-07-04", "2026-11-30"];

test("the same generic insert stores arbitrary dates across months and years", async () => {
  for (const date of RESERVED) {
    assert.equal(await recordEventReservation({ date, type: "Birthday", status: "reserved" }), true);
  }
  assert.equal(await recordEventReservation({ date: "2027-06-18", type: "Wedding", status: "confirmed" }), true);
  assert.equal(await recordEventReservation({ date: "2027-06-19", type: "Anniversary", status: "pending" }), true);
  assert.equal(await recordEventReservation({ date: "2027-06-20", type: "Corporate event", status: "cancelled" }), true);
});

test("every reserved date reads back as reserved through one function", async () => {
  for (const date of RESERVED) {
    assert.deepEqual(await getEventDateStatus(date), { status: "reserved" }, date);
  }
});

test("dates with no record read as not_reserved", async () => {
  for (const date of FREE) {
    assert.deepEqual(await getEventDateStatus(date), { status: "not_reserved" }, date);
  }
});

test("confirmed blocks, pending does not, cancelled releases", async () => {
  assert.deepEqual(await getEventDateStatus("2027-06-18"), { status: "reserved" }, "confirmed must block");
  assert.deepEqual(await getEventDateStatus("2027-06-19"), { status: "not_reserved" }, "pending must not block");
  assert.deepEqual(await getEventDateStatus("2027-06-20"), { status: "not_reserved" }, "cancelled must not block");
});

test("only confirmed and reserved are blocking statuses", () => {
  assert.deepEqual([...BLOCKING_STATUSES], ["confirmed", "reserved"]);
});

test("a cancelled event on an otherwise reserved date still leaves it reserved", async () => {
  await recordEventReservation({ date: "2026-10-15", type: "Other celebration", status: "cancelled" });
  assert.deepEqual(await getEventDateStatus("2026-10-15"), { status: "reserved" });
});

test("invalid and impossible dates are unknown, never free", async () => {
  for (const bad of ["", "not-a-date", "2027-13-01", "2027-02-31", "15-10-2026", "2027-1-5"]) {
    assert.deepEqual(await getEventDateStatus(bad), { status: "unknown" }, bad);
  }
});

test("calendar validation rejects impossible days", () => {
  assert.equal(isCalendarDate("2027-02-28"), true);
  assert.equal(isCalendarDate("2028-02-29"), true, "2028 is a leap year");
  assert.equal(isCalendarDate("2027-02-29"), false, "2027 is not");
  assert.equal(isCalendarDate("2027-04-31"), false);
});

test("the date is bound as a parameter, so SQL cannot be injected through it", async () => {
  const injection = "2026-10-15' OR '1'='1";
  assert.deepEqual(await getEventDateStatus(injection), { status: "unknown" });
  // And a well-formed date that merely looks hostile still behaves normally.
  assert.deepEqual(await getEventDateStatus("2027-01-12"), { status: "not_reserved" });
});

test("the service returns a status and nothing else — no rows, ids or customer data", async () => {
  const result = await getEventDateStatus("2026-10-15");
  assert.deepEqual(Object.keys(result), ["status"]);
  assert.equal(typeof result.status, "string");
});
