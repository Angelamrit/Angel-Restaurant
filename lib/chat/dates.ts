// Natural-language date normalisation for the assistant.
//
// Pure functions: no database, no network, no knowledge base. The result is an
// ISO yyyy-mm-dd string that lib/events.ts binds as a query parameter, or an
// explicit "ambiguous" so the assistant asks instead of guessing.
//
// Every date is handled by the same rules — no month, weekday or holiday is
// special-cased anywhere in this file.

// The restaurant's local day, matching the timezone lib/enquiry.ts validates in.
const TIMEZONE = "America/New_York";
const DAY_MS = 86_400_000;

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export type ResolvedDate =
  | { kind: "date"; iso: string }
  // The visitor named something date-like that cannot be pinned down without
  // more information — a bare day with no month in view, or a whole week.
  | { kind: "ambiguous"; reason: "missing-month" | "range" }
  | { kind: "none" };

/** Today in the restaurant's timezone, as yyyy-mm-dd. */
export function todayInRestaurantTz(now: Date = new Date()): string {
  // en-CA formats as yyyy-mm-dd, which is the shape the rest of the app stores.
  return now.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

// Calendar maths runs in UTC on a date-only value, so daylight-saving shifts in
// the display timezone can never move a date by a day.
const toUtc = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const toIso = (utc: number) => new Date(utc).toISOString().slice(0, 10);

function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/**
 * Pick the year for a month/day given without one: this year if it has not
 * passed, otherwise next year. A stated rule, not a guess — and the same rule
 * for every month.
 */
function nextOccurrenceYear(month: number, day: number, today: string): number {
  const year = Number(today.slice(0, 4));
  if (isRealDate(year, month, day) && toUtc(`${year}-${pad(month)}-${pad(day)}`) >= toUtc(today)) return year;
  return year + 1;
}

const pad = (value: number) => String(value).padStart(2, "0");
const build = (year: number, month: number, day: number): ResolvedDate =>
  isRealDate(year, month, day) ? { kind: "date", iso: `${year}-${pad(month)}-${pad(day)}` } : { kind: "none" };

const monthIndex = (name: string) => MONTHS.indexOf(name.toLowerCase()) + 1;

const MONTH_NAMES = MONTHS.join("|");
const ORDINAL = "(?:st|nd|rd|th)?";

// "October 15", "October 15th", "December 24, 2026", "March 5 2027"
const MONTH_FIRST = new RegExp(`\\b(${MONTH_NAMES})\\s+(\\d{1,2})${ORDINAL}(?:\\s*,?\\s*(\\d{4}))?\\b`, "i");
// "15 October", "15th October 2027"
const DAY_FIRST = new RegExp(`\\b(\\d{1,2})${ORDINAL}\\s+(?:of\\s+)?(${MONTH_NAMES})(?:\\s*,?\\s*(\\d{4}))?\\b`, "i");
// "2026-10-15"
const ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/;
// "the 20th", "on the 3rd" — a day with no month of its own.
const BARE_DAY = /\b(?:the|on)\s+(\d{1,2})(?:st|nd|rd|th)\b|\b(\d{1,2})(?:st|nd|rd|th)\b/i;
const WEEKDAY = new RegExp(`\\b(this|next|coming)?\\s*(${WEEKDAYS.join("|")})\\b`, "i");
const RANGE = /\b(next|this|following)\s+(week|month|weekend)\b|\bsometime\b|\bsoon\b/i;

/**
 * Resolve a date from a message.
 *
 * `context` carries earlier user messages, most recent last, so a bare day
 * ("what about the 20th?") can borrow the month from the exchange above it. It
 * is only ever used to supply a missing month/year — never to invent a day.
 */
export function resolveDate(text: string, context: string[] = [], now: Date = new Date()): ResolvedDate {
  const today = todayInRestaurantTz(now);
  const value = text.toLowerCase();

  const iso = ISO.exec(value);
  if (iso) return build(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const monthFirst = MONTH_FIRST.exec(value);
  if (monthFirst) {
    const month = monthIndex(monthFirst[1]);
    const day = Number(monthFirst[2]);
    const year = monthFirst[3] ? Number(monthFirst[3]) : nextOccurrenceYear(month, day, today);
    return build(year, month, day);
  }

  const dayFirst = DAY_FIRST.exec(value);
  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = monthIndex(dayFirst[2]);
    const year = dayFirst[3] ? Number(dayFirst[3]) : nextOccurrenceYear(month, day, today);
    return build(year, month, day);
  }

  if (/\btoday\b/.test(value)) return { kind: "date", iso: today };
  if (/\btomorrow\b/.test(value)) return { kind: "date", iso: toIso(toUtc(today) + DAY_MS) };

  const weekday = WEEKDAY.exec(value);
  if (weekday) {
    const target = WEEKDAYS.indexOf(weekday[2].toLowerCase());
    const current = new Date(toUtc(today)).getUTCDay();
    // "this Saturday" / bare "Saturday" is the next one on or after today;
    // "next Saturday" is the one after that when today is already that weekday.
    let ahead = (target - current + 7) % 7;
    const qualifier = (weekday[1] || "").toLowerCase();
    if (qualifier === "next" && ahead === 0) ahead = 7;
    return { kind: "date", iso: toIso(toUtc(today) + ahead * DAY_MS) };
  }

  // A whole week or month is a span, not a date the team can be asked about.
  if (RANGE.test(value)) return { kind: "ambiguous", reason: "range" };

  const bare = BARE_DAY.exec(value);
  if (bare) {
    const day = Number(bare[1] ?? bare[2]);
    // Borrow the month from the most recent earlier message that carried one.
    for (let index = context.length - 1; index >= 0; index--) {
      const earlier = resolveDate(context[index], [], now);
      if (earlier.kind !== "date") continue;
      const year = Number(earlier.iso.slice(0, 4));
      const month = Number(earlier.iso.slice(5, 7));
      const resolved = build(year, month, day);
      if (resolved.kind === "date") return resolved;
    }
    return { kind: "ambiguous", reason: "missing-month" };
  }

  return { kind: "none" };
}

/** Human-readable form for the answer, in the restaurant's own voice. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1][0].toUpperCase()}${MONTHS[month - 1].slice(1)} ${year}`;
}
