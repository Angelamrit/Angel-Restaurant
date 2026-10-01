import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { MongoClient } from "mongodb";

// A real migrated MongoDB database, driven through the same scripts/database.mts the application uses.
// Needs TEST_MONGODB_URI (a non-production cluster); a short throwaway database name is used because
// Atlas limits names to 38 bytes, and it is emptied afterwards. Without the variable the suite is skipped.
const uri = process.env.TEST_MONGODB_URI;
const skip = !uri && "Set TEST_MONGODB_URI to run the MongoDB event-date coverage.";
const databaseName = `angel-ev-${randomUUID().slice(0, 8)}`;
let events: typeof import("../lib/events.ts") | undefined;
if (uri) {
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB = databaseName;
  process.env.VERCEL = "";
  const migrate = spawnSync(process.execPath, ["scripts/database.mts", "migrate"], { env: { ...process.env, NODE_ENV: "test" }, encoding: "utf8" });
  assert.equal(migrate.status, 0, migrate.stderr);
  events = await import("../lib/events.ts");
}
const ev = () => events!;
const isCalendarDate = (d: string) => ev().isCalendarDate(d);
const getEventDateStatus = (d: string) => ev().getEventDateStatus(d);
const recordEventReservation = (i: Parameters<typeof import("../lib/events.ts").recordEventReservation>[0]) => ev().recordEventReservation(i);
const check = (name: string, fn: () => void | Promise<void>) => test(name, { skip }, fn);

after(async () => {
  if (!uri) return;
  await (await import("../lib/database.ts")).closeDatabase();
  const client = new MongoClient(uri);
  try {
    const scratch = client.db(databaseName);
    for (const { name } of await scratch.listCollections().toArray()) await scratch.collection(name).drop();
  } finally { await client.close(); }
});

// Deliberately spread across months and years. The point of the suite is that
// ONE code path serves all of them — no date here is special to the production
// code, and these literals exist only in this file.
const RESERVED = ["2026-10-15", "2026-12-24", "2027-03-05"];
const FREE = ["2027-01-12", "2028-07-04", "2026-11-30"];

check("the same generic insert stores arbitrary dates across months and years", async () => {
  for (const date of RESERVED) {
    assert.equal(await recordEventReservation({ date, type: "Birthday", status: "reserved" }), true);
  }
  assert.equal(await recordEventReservation({ date: "2027-06-18", type: "Wedding", status: "confirmed" }), true);
  assert.equal(await recordEventReservation({ date: "2027-06-19", type: "Anniversary", status: "pending" }), true);
  assert.equal(await recordEventReservation({ date: "2027-06-20", type: "Corporate event", status: "cancelled" }), true);
});

check("every reserved date reads back as reserved through one function", async () => {
  for (const date of RESERVED) {
    assert.deepEqual(await getEventDateStatus(date), { status: "reserved" }, date);
  }
});

check("dates with no record read as not_reserved", async () => {
  for (const date of FREE) {
    assert.deepEqual(await getEventDateStatus(date), { status: "not_reserved" }, date);
  }
});

check("confirmed blocks, pending does not, cancelled releases", async () => {
  assert.deepEqual(await getEventDateStatus("2027-06-18"), { status: "reserved" }, "confirmed must block");
  assert.deepEqual(await getEventDateStatus("2027-06-19"), { status: "not_reserved" }, "pending must not block");
  assert.deepEqual(await getEventDateStatus("2027-06-20"), { status: "not_reserved" }, "cancelled must not block");
});

check("only confirmed and reserved are blocking statuses", () => {
  assert.deepEqual([...ev().BLOCKING_STATUSES], ["confirmed", "reserved"]);
});

check("a cancelled event on an otherwise reserved date still leaves it reserved", async () => {
  await recordEventReservation({ date: "2026-10-15", type: "Other celebration", status: "cancelled" });
  assert.deepEqual(await getEventDateStatus("2026-10-15"), { status: "reserved" });
});

check("invalid and impossible dates are unknown, never free", async () => {
  for (const bad of ["", "not-a-date", "2027-13-01", "2027-02-31", "15-10-2026", "2027-1-5"]) {
    assert.deepEqual(await getEventDateStatus(bad), { status: "unknown" }, bad);
  }
});

check("calendar validation rejects impossible days", () => {
  assert.equal(isCalendarDate("2027-02-28"), true);
  assert.equal(isCalendarDate("2028-02-29"), true, "2028 is a leap year");
  assert.equal(isCalendarDate("2027-02-29"), false, "2027 is not");
  assert.equal(isCalendarDate("2027-04-31"), false);
});

check("an injection-style date string is rejected as unknown and a well-formed date still behaves normally", async () => {
  const injection = "2026-10-15' OR '1'='1";
  assert.deepEqual(await getEventDateStatus(injection), { status: "unknown" });
  // A well-formed date still behaves normally afterwards.
  assert.deepEqual(await getEventDateStatus("2027-01-12"), { status: "not_reserved" });
});

check("the service returns a status and nothing else — no rows, ids or customer data", async () => {
  const result = await getEventDateStatus("2026-10-15");
  assert.deepEqual(Object.keys(result), ["status"]);
  assert.equal(typeof result.status, "string");
});
