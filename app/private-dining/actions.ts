"use server";

import { headers } from "next/headers";
import { isRecentDuplicate, markEnquiryEmailFailed, markEnquiryEmailed, saveEnquiry } from "@/lib/enquiry-store";
import { clientSource, withinLimit } from "@/lib/rate-limit";
import { deliverEnquiry, validateEnquiry, type EnquiryState } from "@/lib/enquiry";
import { getEventDateStatus, recordEventReservation } from "@/lib/events";

// Every export from a "use server" file becomes a public POST endpoint
// (node_modules/next/dist/docs/01-app/02-guides/server-actions.md, "Security"),
// so validation/rate-limiting/delivery helpers live in lib/enquiry.ts instead —
// this file exports only the one action the form actually calls.
export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: a real visitor never fills this hidden field. Fail silently
  // (report success) so a bot gets no signal that it was caught.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot !== "") return { status: "success" };

  // Minimum fill time: a submission faster than a human can plausibly type
  // this form is almost certainly scripted. The timestamp is only set once
  // the client has mounted (see components/enquiry-form.tsx), so a genuine
  // no-JS submission carries no timestamp and skips this check entirely.
  const startedAt = Number(formData.get("_t"));
  // A timestamp from the future is as telling as one that is too recent: nothing real produces it.
  if (startedAt > 0 && (Date.now() - startedAt < 3000 || startedAt > Date.now() + 60_000)) return { status: "success" };

  const requestHeaders = await headers();
  // Fails open: if the counter store is down the enquiry is still worth taking.
  if (!(await withinLimit("enquiry", clientSource(requestHeaders), 10 * 60_000, 3, true))) {
    return { status: "error", code: "rate_limit" };
  }

  // Circuit breaker for the whole form. The per-visitor limit above cannot stop a bot that rotates addresses; this
  // caps what can reach the restaurant's inbox and database in an hour, however many addresses it uses.
  if (!(await withinLimit("enquiry-all", "everyone", 60 * 60_000, 40, true))) {
    return { status: "error", code: "rate_limit" };
  }

  const result = validateEnquiry(formData);
  if (!result.ok) {
    return { status: "error", code: "validation", fieldErrors: result.fieldErrors, values: result.values };
  }

  // The same enquiry sent twice in ten minutes (a double click, a refresh, a retry after a slow response) is
  // answered with the same success but stored and emailed once.
  if (await isRecentDuplicate(result.data)) return { status: "success" };

  // The same lookup the assistant uses, so the form and the chat can never
  // disagree about whether a date is free. Date is already ISO yyyy-mm-dd here:
  // validateEnquiry rejects anything else.
  const { status } = await getEventDateStatus(result.data.Date);
  if (status === "reserved") {
    return { status: "error", code: "date_taken", values: result.data };
  }

  // Store first so the lead survives an email failure; email is then best-effort.
  const stored = await saveEnquiry(result.data);

  // Recorded as "pending" deliberately: an enquiry is not a booking, so it must
  // not block the date for the next visitor. The team promotes it to confirmed
  // or reserved in their own workflow. Best-effort, a storage failure must never lose the enquiry.
  await recordEventReservation({ date: result.data.Date, type: result.data.Occasion, status: "pending" });

  const delivery = await deliverEnquiry(result.data);
  if (stored) await (delivery.ok ? markEnquiryEmailed(stored.id) : markEnquiryEmailFailed(stored.id, delivery.reason));
  if (!stored && !delivery.ok) {
    return { status: "error", code: "delivery", values: result.data };
  }

  // `emailed` is the truth about the notification, so the form never claims an email went out when it did not.
  return { status: "success", emailed: delivery.ok };
}
