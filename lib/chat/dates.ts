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
// "01/15/2027", "1/5", "01/15/27". Read month-first: the restaurant is in New
// York and the whole site is en-US, so 01/15 is 15 January. A first number
// above 12 cannot be a month, and rather than silently switching to day-first
// that is reported as ambiguous.
const NUMERIC = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?\b/;
// "in two weeks", "three days from now", "a month later".
const QUANTITIES = new Map([
  ["a", 1], ["an", 1], ["one", 1], ["two", 2], ["three", 3], ["four", 4], ["five", 5],
  ["six", 6], ["seven", 7], ["eight", 8], ["nine", 9], ["ten", 10], ["eleven", 11], ["twelve", 12],
]);
const QUANTITY = "\\d{1,3}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve";
const OFFSET_IN = new RegExp(`\\bin\\s+(${QUANTITY})\\s+(day|week|month)s?\\b`, "i");
const OFFSET_FROM = new RegExp(`\\b(${QUANTITY})\\s+(day|week|month)s?\\s+(?:from\\s+(?:now|today)|later|ahead)\\b`, "i");
// A month named on its own, used only to supply the month a bare day is missing
// ("an event in December" ... "what about the 25th?").
const MONTH_ONLY = new RegExp(`\\b(${MONTH_NAMES})\\b(?:\\s*,?\\s*(\\d{4}))?`, "i");
// Spelled-out ordinals. A visitor who types "the twentieth of December" means the
// same day as "the 20th", and the date patterns below only read digits, so the
// words are rewritten to digits first. Longest names are listed first so
// "twenty-first" is never matched as "first".
const ORDINAL_WORDS = new Map([
  ["twenty-first", 21], ["twenty first", 21], ["twenty-second", 22], ["twenty second", 22],
  ["twenty-third", 23], ["twenty third", 23], ["twenty-fourth", 24], ["twenty fourth", 24],
  ["twenty-fifth", 25], ["twenty fifth", 25], ["twenty-sixth", 26], ["twenty sixth", 26],
  ["twenty-seventh", 27], ["twenty seventh", 27], ["twenty-eighth", 28], ["twenty eighth", 28],
  ["twenty-ninth", 29], ["twenty ninth", 29], ["thirty-first", 31], ["thirty first", 31],
  ["thirtieth", 30], ["twentieth", 20], ["nineteenth", 19], ["eighteenth", 18],
  ["seventeenth", 17], ["sixteenth", 16], ["fifteenth", 15], ["fourteenth", 14],
  ["thirteenth", 13], ["twelfth", 12], ["eleventh", 11], ["tenth", 10], ["ninth", 9],
  ["eighth", 8], ["seventh", 7], ["sixth", 6], ["fifth", 5], ["fourth", 4],
  ["third", 3], ["second", 2], ["first", 1],
]);
const ORDINAL_WORD = new RegExp(String.raw`\b(${[...ORDINAL_WORDS.keys()].join("|")})\b`, "gi");
const suffix = (day: number) => (day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th");
const MONTH_IN_VIEW = new RegExp(String.raw`\b(?:${MONTHS.join("|")})\b`, "i");
// "Oct 15", "Dec. 24", "5th Sept", "in Nov": the abbreviations visitors actually
// type. They are expanded to the full name before any pattern runs, but only in
// a date-like position — next to a day number, or after "in", "for", "on",
// "this", "next", "early", "mid", "late", "of" — so an ordinary word is never
// mistaken for a month. "May" needs no abbreviation and is left alone.
const MONTH_ABBREVIATIONS = new Map([
  ["jan", "january"], ["feb", "february"], ["mar", "march"], ["apr", "april"],
  ["jun", "june"], ["jul", "july"], ["aug", "august"], ["sep", "september"], ["sept", "september"],
  ["oct", "october"], ["nov", "november"], ["dec", "december"],
]);
const ABBREVIATION = [...MONTH_ABBREVIATIONS.keys()].join("|");
const ABBREVIATION_BEFORE_DAY = new RegExp(String.raw`\b(${ABBREVIATION})\.?(?=\s*\d{1,2}(?:st|nd|rd|th)?\b)`, "gi");
const ABBREVIATION_AFTER_DAY = new RegExp(String.raw`(\b\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?)(${ABBREVIATION})\.?\b`, "gi");
const ABBREVIATION_AFTER_WORD = new RegExp(String.raw`(\b(?:in|for|on|this|next|early|mid|late|of|during)\s+)(${ABBREVIATION})\.?\b`, "gi");
const expandMonthAbbreviations = (text: string) =>
  text
    .replace(ABBREVIATION_BEFORE_DAY, (_match, abbr: string) => MONTH_ABBREVIATIONS.get(abbr.toLowerCase()) ?? abbr)
    .replace(ABBREVIATION_AFTER_DAY, (_match, lead: string, abbr: string) => lead + (MONTH_ABBREVIATIONS.get(abbr.toLowerCase()) ?? abbr))
    .replace(ABBREVIATION_AFTER_WORD, (_match, lead: string, abbr: string) => lead + (MONTH_ABBREVIATIONS.get(abbr.toLowerCase()) ?? abbr));
// Below this, an ordinal word is everyday speech more often than it is a date.
const AMBIGUOUS_BELOW = 10;
const digitiseOrdinals = (text: string) => {
  const monthInView = MONTH_IN_VIEW.test(text);
  return text.replace(ORDINAL_WORD, (word) => {
    const day = ORDINAL_WORDS.get(word.toLowerCase());
    if (!day) return word;
    if (!monthInView && day < AMBIGUOUS_BELOW) return word;
    return `${day}${suffix(day)}`;
  });
};

// An ordinal that counts years, not days. "I want to host my 40th birthday"
// used to resolve "40th" as a bare day, so the assistant answered "Which month
// are you thinking of?" to a message that named no date at all. Three shapes are
// stripped before any date pattern runs:
//   an ordinal above 31, which cannot be a day in any month ("40th", "50th");
//   an ordinal that an occasion follows ("21st birthday", "25th anniversary");
//   an ordinal the visitor claims as their own ("my 40th", "my 21st").
// "the 16th", "on the 16th" and "16th October" are untouched.
const AGE_ORDINAL = /\b(?:3[2-9]|[4-9]\d|\d{3,})(?:st|nd|rd|th)\b|\b\d{1,3}(?:st|nd|rd|th)\s+(?:birthdays?|b-?days?|anniversar(?:y|ies)|weddings?|celebrations?)\b|\bmy\s+\d{1,3}(?:st|nd|rd|th)\b/gi;

// "the 20th", "on the 3rd" — a day with no month of its own.
// An ordinal followed by one of these words is an age or a count ("her 21st birthday"), not a day of the month.
const NOT_A_DAY = "(?!\\s+(?:birthday|bday|b-day|anniversary|wedding|reunion|time|visit|year|floor))";
const BARE_DAY = new RegExp(`\\b(?:the|on)\\s+(\\d{1,2})(?:st|nd|rd|th)\\b${NOT_A_DAY}|\\b(\\d{1,2})(?:st|nd|rd|th)\\b${NOT_A_DAY}`, "i");
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
  // An age is removed before anything looks for a date, so "my 40th birthday for
  // 30 guests" carries no date and is never sent back as "which month?".
  const value = digitiseOrdinals(expandMonthAbbreviations(text.toLowerCase())).replace(AGE_ORDINAL, " ");

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

  const numeric = NUMERIC.exec(value);
  if (numeric) {
    const month = Number(numeric[1]);
    const day = Number(numeric[2]);
    // Day-first input ("15/01") cannot be read as month-first, and guessing
    // which convention the visitor meant is exactly what must not happen.
    if (month > 12) return { kind: "ambiguous", reason: "missing-month" };
    const raw = numeric[3];
    const year = raw ? (raw.length === 2 ? 2000 + Number(raw) : Number(raw)) : nextOccurrenceYear(month, day, today);
    return build(year, month, day);
  }

  const offset = OFFSET_IN.exec(value) ?? OFFSET_FROM.exec(value);
  if (offset) {
    const amount = QUANTITIES.get(offset[1].toLowerCase()) ?? Number(offset[1]);
    const unit = offset[2].toLowerCase();
    if (Number.isFinite(amount)) {
      if (unit === "month") {
        // Month arithmetic through Date.UTC so month-end rolls correctly.
        const shifted = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + amount, Number(today.slice(8, 10))));
        return { kind: "date", iso: shifted.toISOString().slice(0, 10) };
      }
      return { kind: "date", iso: toIso(toUtc(today) + amount * (unit === "week" ? 7 : 1) * DAY_MS) };
    }
  }

  // Past references must never fall through to a future date ("last Friday" is not the coming Friday).
  if (new RegExp(`\\b(yesterday|(?:last|previous|past)\\s+(?:night|${WEEKDAYS.join("|")}))\\b`).test(value)) return { kind: "none" };
  // "Tonight" and "this evening" are today's date: a table tonight is checked
  // against today exactly as "today" is.
  if (/\btoday\b|\btonight\b|\bthis\s+evening\b/.test(value)) return { kind: "date", iso: today };
  // Checked before "tomorrow", which is a substring of it.
  if (/\bday\s+after\s+(?:tomorrow|tmrw)\b|\bovermorrow\b/.test(value)) return { kind: "date", iso: toIso(toUtc(today) + 2 * DAY_MS) };
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
  // 1-31 only: "the 40th" cannot be a day, so it must not trigger a "which month?" question.
  if (bare && Number(bare[1] ?? bare[2]) >= 1 && Number(bare[1] ?? bare[2]) <= 31) {
    const day = Number(bare[1] ?? bare[2]);
    // Borrow the month from the most recent earlier message that carried one,
    // either as a full date ("October 15") or as a bare month name on its own
    // ("I want to host an event in December").
    for (let index = context.length - 1; index >= 0; index--) {
      const earlier = resolveDate(context[index], [], now);
      if (earlier.kind === "date") {
        const resolved = build(Number(earlier.iso.slice(0, 4)), Number(earlier.iso.slice(5, 7)), day);
        if (resolved.kind === "date") return resolved;
        continue;
      }
      const named = MONTH_ONLY.exec(expandMonthAbbreviations(context[index].toLowerCase()));
      if (!named) continue;
      const month = monthIndex(named[1]);
      const year = named[2] ? Number(named[2]) : nextOccurrenceYear(month, day, today);
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
