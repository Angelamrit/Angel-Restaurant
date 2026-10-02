// Pure helpers for the first-party visitor analytics (lib/visitor-analytics.ts). No database or
// Next.js imports, so tests/visitor-analytics.test.mts can exercise the date and validation rules directly.

// The restaurant's own timezone, as used by lib/chat/dates.ts and lib/enquiry.ts. ANALYTICS_TIMEZONE overrides it.
const DEFAULT_TIMEZONE = "America/New_York";

export const VISITOR_COOKIE = "angel_vid";
export const VISITOR_COOKIE_SECONDS = 60 * 60 * 24 * 365;
// Raw page views are kept for 13 months; the separate visitors collection keeps the all-time total.
export const PAGE_VIEW_RETENTION_SECONDS = 60 * 60 * 24 * 400;

// The public pages worth counting (the same list as app/sitemap.ts). Anything else (404s, typos, junk
// paths posted by a script) is ignored rather than stored, so it can never pollute "Most viewed page".
export const TRACKED_PATHS = ["/", "/menu", "/story", "/gallery", "/private-dining", "/visit", "/faq", "/press", "/privacy"] as const;
export type TrackedPath = (typeof TRACKED_PATHS)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const isVisitorId = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

export function analyticsTimeZone(value = process.env.ANALYTICS_TIMEZONE) {
  const zone = value?.trim();
  if (!zone) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone;
  } catch {
    console.warn(`ANALYTICS_TIMEZONE "${zone}" is not a valid IANA timezone; using ${DEFAULT_TIMEZONE}.`);
    return DEFAULT_TIMEZONE;
  }
}

/** The calendar day of `at` in `timeZone`, as yyyy-mm-dd (sortable as a string). */
export const dayKey = (at: Date, timeZone: string) => at.toLocaleDateString("en-CA", { timeZone });

// Day keys are calendar dates, so date arithmetic happens on their UTC midnight and never shifts with DST.
const fromKey = (day: string) => new Date(`${day}T00:00:00Z`);
const toKey = (date: Date) => date.toISOString().slice(0, 10);
export function addDays(day: string, amount: number) {
  const date = fromKey(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return toKey(date);
}
/** Monday of the week containing `day`. */
export const weekStart = (day: string) => addDays(day, -((fromKey(day).getUTCDay() + 6) % 7));
/** First day of the month containing `day`. */
export const monthStart = (day: string) => `${day.slice(0, 8)}01`;
/** The `count` days ending with `day`, oldest first. */
export const lastDays = (day: string, count: number) => Array.from({ length: count }, (_, index) => addDays(day, index - count + 1));

/** A tracked pathname, or null when the page is not one the site counts. */
export function trackedPath(value: unknown): TrackedPath | null {
  if (typeof value !== "string" || value.length > 200) return null;
  const path = value.length > 1 ? value.replace(/\/+$/, "") : value;
  return (TRACKED_PATHS as readonly string[]).includes(path) ? path as TrackedPath : null;
}

/** The referring site's host (no path or query), or "" for direct visits, internal links and anything malformed. */
export function referrerHost(value: unknown, siteHost: string) {
  if (typeof value !== "string" || !value || value.length > 2000) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host === siteHost.toLowerCase().replace(/^www\./, "") ? "" : host.slice(0, 100);
  } catch { return ""; }
}

export type Device = "mobile" | "tablet" | "desktop";
export function deviceCategory(userAgent: string): Device {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "mobile";
  return "desktop";
}

// Crawlers that execute JavaScript (Googlebot renders pages) and automated browsers would otherwise count as visitors.
export const isBot = (userAgent: string) => !userAgent || /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|axios|node-fetch|go-http/i.test(userAgent);
