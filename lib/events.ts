// Event date service — the single source of truth for whether a date is taken.
//
// Both callers go through this module, so the assistant and the enquiry form can
// never disagree about a date:
//   app/api/chat/route.ts       asks getEventDateStatus() before answering
//   app/private-dining/actions.ts  asks the same function before accepting a form
//
// SERVER-BOUND BY CONVENTION. Nothing under components/ may import this. It
// deliberately does not `import "server-only"`, because tests/events.test.mts
// loads it under plain `node --test`, where that package does not resolve — the
// same reasoning as lib/chat/kb.ts.
// Explicit extension for that same loader.
import { collections } from "./database.ts";

export type EventStatus = "pending" | "confirmed" | "reserved" | "cancelled";
export type EventDateStatus = "reserved" | "not_reserved" | "unknown";

// Only these hold a date. "pending" is an enquiry the team has not acted on yet,
// so it must NOT block another enquiry; "cancelled" releases the date.
export const BLOCKING_STATUSES = ["confirmed", "reserved"] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date, not merely ISO-shaped (rejects 2027-02-31). */
export function isCalendarDate(date: string): boolean {
  if (!ISO_DATE.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/**
 * Is this date already held by an event? Works for any valid date — the date is
 * a validated ISO string used as a plain equality value, never built into a query
 * expression, and no date is special-cased.
 *
 * Returns a status and nothing else. No rows, no ids, no customer data ever
 * leaves this function, so a caller cannot forward what it never received.
 */
export async function getEventDateStatus(date: string): Promise<{ status: EventDateStatus }> {
  if (!isCalendarDate(date)) return { status: "unknown" };
  try {
    const hit = await collections().eventReservations.findOne({ eventDate: date, status: { $in: [...BLOCKING_STATUSES] } }, { projection: { _id: 1 } });
    return { status: hit ? "reserved" : "not_reserved" };
  } catch (error) {
    // A database that cannot be reached must never read as "free". "unknown"
    // sends the visitor to the enquiry rather than implying availability.
    console.error("Event date lookup failed", error);
    return { status: "unknown" };
  }
}

/**
 * Record an event against a date. The enquiry form stores "pending": the team
 * promotes it to confirmed/reserved in their own workflow, so submitting a form
 * never blocks the date for anyone else.
 */
export async function recordEventReservation(input: { date: string; type?: string; status?: EventStatus }): Promise<boolean> {
  if (!isCalendarDate(input.date)) return false;
  try {
    await collections().eventReservations.insertOne({ id: crypto.randomUUID(), eventDate: input.date, eventType: input.type ?? "", status: input.status ?? "pending", createdAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error("Event reservation insert failed", error);
    return false;
  }
}
