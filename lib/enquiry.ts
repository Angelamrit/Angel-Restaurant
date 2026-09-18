import { restaurant } from "@/lib/restaurant";

export const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Engagement",
  "Wedding",
  "Corporate event",
  "Family gathering",
  "Other celebration",
] as const;

export const ENQUIRY_FIELDS = ["Name", "Email", "Phone", "Guests", "Date", "Occasion", "Message"] as const;
export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];
export type EnquiryValues = Partial<Record<EnquiryField, string>>;

export type EnquiryState = {
  status: "idle" | "success" | "error";
  code?: "validation" | "rate_limit" | "delivery" | "config";
  fieldErrors?: Partial<Record<EnquiryField, string>>;
  values?: EnquiryValues;
};

export const idleEnquiryState: EnquiryState = { status: "idle" };

type ValidatedEnquiry = Record<EnquiryField, string>;
type ValidationResult =
  | { ok: true; data: ValidatedEnquiry }
  | { ok: false; fieldErrors: Partial<Record<EnquiryField, string>>; values: EnquiryValues };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strips characters that could be used for email-header injection (\r\n) or
// that simply have no business in a subject line or reply-to header.
function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n\x00-\x1f]/g, " ").trim();
}

function readField(formData: FormData, field: EnquiryField): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

// Hand-rolled rather than a schema library: seven fields, one shape, and this
// is the only form on the site — a dependency would cost more than it saves.
export function validateEnquiry(formData: FormData): ValidationResult {
  const raw: EnquiryValues = {};
  for (const field of ENQUIRY_FIELDS) raw[field] = readField(formData, field);

  const fieldErrors: Partial<Record<EnquiryField, string>> = {};

  const name = raw.Name ?? "";
  if (name.length < 1) fieldErrors.Name = "Please tell us your name.";
  else if (name.length > 100) fieldErrors.Name = "Name is too long.";

  const email = raw.Email ?? "";
  if (!EMAIL_RE.test(email) || email.length > 254) fieldErrors.Email = "Please enter a valid email address.";

  const phone = raw.Phone ?? "";
  if (phone.length > 40) fieldErrors.Phone = "Phone number is too long.";

  const guestsNum = Number(raw.Guests);
  if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 1000) {
    fieldErrors.Guests = "Enter a party size between 1 and 1000.";
  }

  const date = raw.Date ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fieldErrors.Date = "Please choose a date.";
  } else {
    const parsed = new Date(`${date}T00:00:00`);
    const today = new Date();
    const todayInNY = new Date(today.toLocaleString("en-US", { timeZone: "America/New_York" }));
    todayInNY.setHours(0, 0, 0, 0);
    const maxDate = new Date(todayInNY);
    maxDate.setMonth(maxDate.getMonth() + 18);
    if (Number.isNaN(parsed.getTime()) || parsed < todayInNY || parsed > maxDate) {
      fieldErrors.Date = "Please choose a date between today and 18 months from now.";
    }
  }

  const occasion = raw.Occasion ?? "";
  if (occasion !== "" && !OCCASIONS.includes(occasion as (typeof OCCASIONS)[number])) {
    fieldErrors.Occasion = "Please choose an occasion from the list.";
  }

  const message = raw.Message ?? "";
  if (message.length > 2000) fieldErrors.Message = "Message is too long.";

  const consent = formData.get("Consent");
  if (consent !== "on") fieldErrors.Message = fieldErrors.Message ?? "Please confirm you agree to be contacted.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, values: raw };
  }

  return {
    ok: true,
    data: {
      Name: sanitizeHeaderValue(name),
      Email: sanitizeHeaderValue(email),
      Phone: phone,
      Guests: String(guestsNum),
      Date: date,
      Occasion: occasion,
      Message: message,
    },
  };
}

// Best-effort, per-warm-instance rate limiting. Serverless functions on Vercel
// can spin up multiple instances, so this catches a burst hitting the same
// instance, not a distributed attacker — see the plan's note on a Vercel WAF
// rate-limit rule as the durable upgrade. Combined with the honeypot and
// minimum-fill-time check in the action, this covers the realistic threat here.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const MAX_TRACKED_IPS = 5000;
const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) {
    hits.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  if (hits.size > MAX_TRACKED_IPS) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) hits.delete(oldestKey);
  }
  return true;
}

export async function deliverEnquiry(data: ValidatedEnquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || restaurant.email;
  if (!apiKey || !from) return false;

  const text = [
    "Private dining enquiry",
    ...ENQUIRY_FIELDS.map((field) => `${field}: ${data[field] || "Not specified"}`),
  ].join("\n\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.Email,
        subject: `Private dining enquiry — ${data.Name} — ${data.Date}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
