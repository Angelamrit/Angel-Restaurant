"use server";

import { headers } from "next/headers";
import { checkRateLimit, deliverEnquiry, validateEnquiry, type EnquiryState } from "@/lib/enquiry";
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
  if (startedAt > 0 && Date.now() - startedAt < 3000) return { status: "success" };

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (!checkRateLimit(ip)) {
    return { status: "error", code: "rate_limit" };
  }

  const result = validateEnquiry(formData);
  if (!result.ok) {
    return { status: "error", code: "validation", fieldErrors: result.fieldErrors, values: result.values };
  }

  // The same lookup the assistant uses, so the form and the chat can never
  // disagree about whether a date is free. Date is already ISO yyyy-mm-dd here:
  // validateEnquiry rejects anything else.
  const { status } = await getEventDateStatus(result.data.Date);
  if (status === "reserved") {
    return { status: "error", code: "date_taken", values: result.data };
  }

  // Recorded as "pending" deliberately: an enquiry is not a booking, so it must
  // not block the date for the next visitor. The team promotes it to confirmed
  // or reserved in their own workflow. Best-effort — a storage failure must
  // never lose the enquiry itself, which the email below carries.
  await recordEventReservation({ date: result.data.Date, type: result.data.Occasion, status: "pending" });

  const delivered = await deliverEnquiry(result.data);
  if (!delivered) {
    return { status: "error", code: "delivery", values: result.data };
  }

  return { status: "success" };
}
