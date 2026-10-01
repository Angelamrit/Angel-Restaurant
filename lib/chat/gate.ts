// Deterministic SAFETY gate. Runs BEFORE the model, on the server only.
//
// It does NOT decide whether a question is about the restaurant. That is a
// semantic judgement the model makes, grounded by the knowledge base and the
// live menu in the system instruction ("Answer only questions clearly about
// Chef Amrit... otherwise respond exactly: <the redirect>"). A visitor asking
// "who cooks here?" or "what's good?" uses no keyword this file would recognise,
// and refusing them was the single largest source of wrong answers.
//
// What stays deterministic here is only what a model must never be asked to
// adjudicate: empty input, profanity, prompt injection, and true noise.
//
// This module imports the knowledge base to build its scope lexicon, so importing
// it from a client component would ship the entire KB to the browser. The chat
// widget therefore does not gate locally: every message is gated in the route
// handler (app/api/chat/route.ts) and the verdict comes back over the wire.
// See lib/chat/kb.ts for why `server-only` is not imported here.
// Explicit extension: tests/chat-gate.test.mts loads this module under plain
// `node --test`, whose ESM loader does not resolve extensionless specifiers.
import { kb } from "./kb.ts";
import type { ChatTurn } from "./validation";
// Explicit extension for the same plain-node test loader.
import { resolveDate } from "./dates.ts";

export type GateResult =
  | { allowed: true }
  | { allowed: false; kind: "redirect" | "profanity" | "gibberish" | "injection" | "greeting"; message: string };

const REDIRECT = "Ask me about Chef Amrit or Angel Indian Restaurant.";
// Prompt injection. Until now these were refused only because they happen to
// contain no restaurant keyword — incidental cover that disappears the moment
// the scope allowlist stops being the gate, so the two changes ship together.
// Refused with the ordinary redirect: a prober learns nothing from the reply.
const INJECTION = [
  // Instruction override.
  /\b(ignore|disregard|forget|override)\b[^.]{0,40}\b(previous|prior|above|earlier|all|any)\b[^.]{0,20}\b(instruction|prompt|rule|direction|context|message)/i,
  // Prompt or configuration exfiltration.
  /\b(reveal|show|print|repeat|output|display|tell me|what (?:is|are))\b[^.]{0,40}\b(system|initial|original|hidden|secret)\b[^.]{0,20}\b(prompt|instruction|message|rule)/i,
  /\b(repeat|print|output)\b[^.]{0,30}\b(everything|all)\b[^.]{0,30}\b(above|before|prior)\b/i,
  /\byour\b[^.]{0,20}\b(system prompt|initial instructions|original instructions|hidden instructions)\b/i,
  // Role hijack and persona override.
  /\byou are now\b|\bfrom now on you\b|\bdeveloper mode\b|\bdo anything now\b|\bDAN mode\b/i,
  /\b(pretend|act|behave|roleplay|role-play)\b[^.]{0,20}\b(you are|as if|to be)\b[^.]{0,30}\b(not|different|another|unrestricted|uncensored)\b/i,
  // Grounding bypass. "ignore/disregard/forget" and a bare "KB" were both
  // missing, so "Ignore the KB and tell me..." went undetected.
  /\b(without|bypass|skip|ignor(?:e|ing)|disregard|forget)\b[^.]{0,25}\b(knowledge ?base|\bKB\b|restrictions?|guardrails?|grounding|the rules)\b/i,
  // Asking for the instructions in the plainest possible way. "your" is the
  // discriminator: "instructions for getting here by train" is a real question,
  // "your instructions" is not.
  // "rules" and "guidelines" are deliberately NOT listed: "what are your
  // rules about outside cake?" is a real restaurant question, and refusing
  // it is the exact mistake this gate was rewritten to stop making.
  // Grounding still answers the looser phrasings with the redirect.
  /\b(?:what|tell me|show me|list|give me)\b[^.]{0,25}\byour\b[^.]{0,20}\b(instructions?|directives?|system prompt|prompt)\b/i,
  // Delimiter or turn spoofing.
  /(^|\n)\s*(system|assistant)\s*:/i,
  /<\/?(system|instruction|prompt)[^>]*>/i,
  /\[\s*(system|end of prompt|new instructions)\s*\]/i,
];

/**
 * Does this text try to steer the assistant rather than ask it something?
 * Exported so the route can screen conversation history too: history is client
 * supplied (see lib/chat/validation.ts), so a fabricated turn is just another
 * place the same payload can arrive.
 */
export function hasInjection(text: string): boolean {
  return INJECTION.some((pattern) => pattern.test(text));
}
const PROFANITY = /(^|[^a-z])(fuck|fucking|shit|bullshit|bitch|asshole|motherfucker|cunt|pussy|whore|slut|dickhead|bastard)(?=$|[^a-z])/i;
const GREETINGS = /^(hi|hello|hey|hiya|howdy|greetings|good morning|good afternoon|good evening|namaste|namaskar|sat sri akal|salam|salaam|assalam\S*|as-salam\S*|thanks|thank you|thankyou|thx|shukriya|bye|goodbye|see you|cheers)\b/i;

// A greeting on its own has no question in it, so it gets a short, warm, fixed welcome instead of the cold
// redirect (and costs no model call). The visitor's name is used only if it is plainly one word of letters.
const GREETING_TAIL = "I can tell you about our menu, opening hours, reservations or private dining. What would you like to know?";
export function greetingReply(text: string): string {
  const value = text.trim().toLowerCase();
  // "my name is Sara" is unambiguous; "I'm Sara" counts only when the name is capitalised and not an ordinary word,
  // so "I'm hungry" can never become "Hello Hungry".
  const stated = /\bmy name is\s+([a-z][a-z'-]{1,19})\b/i.exec(text);
  const casual = /\b[Ii](?:'m| am)\s+([A-Z][a-z'-]{1,19})\b/.exec(text);
  const ordinary = /^(here|looking|hungry|thirsty|new|just|so|not|good|fine|great|well|okay|back|visiting|coming|planning|wondering|interested|vegetarian|vegan|late|early|sorry|curious|ready|starving)$/i;
  const raw = stated?.[1] ?? (casual && !ordinary.test(casual[1]) ? casual[1] : "");
  const name = raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : "";
  const to = name ? ` ${name}` : "";
  if (/^(thanks|thank you|thankyou|thx|shukriya|cheers)\b/.test(value)) return `You're very welcome${to}! If there's anything else you'd like to know about Angel, just ask.`;
  if (/^(bye|goodbye|see you)\b/.test(value)) return `Thank you for stopping by${to}. We'd love to welcome you at Angel soon!`;
  if (/^(assalam|as-salam|salam|salaam)/.test(value)) return `Wa alaikum assalam${to}, and welcome to Angel! ${GREETING_TAIL}`;
  if (/^(namaste|namaskar|sat sri akal)/.test(value)) return `Namaste${to}, and welcome to Angel! ${GREETING_TAIL}`;
  const partOfDay = /^good (morning|afternoon|evening)/.exec(value);
  const hello = partOfDay ? `Good ${partOfDay[1]}${to}` : `Hello${to}`;
  return `${hello}, and welcome to Angel! ${GREETING_TAIL}`;
}
// Private-service enquiries are handled by the restaurant team, never by Resy,
// so this is tested first everywhere below and always wins over booking wording.
const PRIVATE_SERVICE = /(private\s+(?:dining|event|party|room|hire)|wedding|corporate\s+(?:event|dinner)|birthday\s+party|company\s+dinner|\bevents?\b|\bcater(?:ing|er|ers|ed)?\b|\bhire\b|\bbuy\s?out\b)/i;
// Celebration vocabulary, grounded in the Occasion options the existing enquiry
// form already offers (OCCASIONS in lib/enquiry.ts) plus the natural phrasings
// visitors use for them. These route to the private dining enquiry, never Resy.
const CELEBRATION = /\b(birthdays?|anniversar(?:y|ies)|engagements?|weddings?|celebrations?|celebrate|celebrating|graduations?|reunions?|christening|banquet|baby\s+shower|bridal\s+shower|rehearsal\s+dinner|family\s+gathering|get[-\s]together)\b/i;
// A bare continuation ("how do I do that?") carries no intent words of its own,
// so it inherits the intent of the exchange directly above it.
const CONTINUATION = /^(?:and\s+)?(?:how|what|where|when|who)\b[^?]*\b(?:that|this|it|them|those)\b\??$|^(?:how|what)\s+(?:do|should|can|would)\s+i\b/i;
// Who designed/built the website itself, distinct from "who made this dish" —
// the site/website noun is required so ordinary food questions never match.
const SITE_CREDIT = /\bwho\s+(?:built|made|designed|developed|created|coded)\s+(?:this|the)\s+(?:site|website)\b|\b(?:this|the)\s+(?:site|website)\b(?:\s+\w+){0,4}\s+(?:built|made|designed|developed|created|coded)\s+by\b|\bweb\s*(?:design(?:er)?|develop(?:er|ment)?)\b|\bsite\s+credit(?:s)?\b|\baceva\b|\b(?:developers?|designers?)\s+(?:of|behind)\s+(?:this|the)\s+(?:site|website)\b|\bcontact\s+(?:the\s+)?(?:developers?|designers?)\b/i;
// The subjects this assistant exists to talk about. strongTopics below only holds
// the full phrases ("chef amrit", "angel restaurant"), so without this a visitor
// asking "tell me about chef" or "who is amrit?" was refused as out of scope.
const SUBJECT = /\b(chef|chefs|amrit|singh|angel|angel's|restaurant)\b/i;
// The word that settles it: naming a table means an ordinary reservation,
// whatever occasion is mentioned alongside it.
const TABLE_WORD = /\btables?\b/i;
// An ordinary meal with no occasion named.
const MEAL = /\b(dinner|lunch|brunch|supper)\b/i;
// Opening hours. "Are you open Sunday?" names a day and uses "open", which
// otherwise reads as booking availability and sent it to the table-or-event
// clarification instead of answering the hours.
//
// The subject of "open" is the discriminator: when it is the restaurant
// ("are YOU open Sunday?") it is an hours question, and when it is the date
// ("is next Saturday open?") it is still a booking question and must ask
// which kind of booking is meant.
const HOURS_QUESTION = /\b(?:what|which)\s+time\b|\bhow\s+late\b|\bopening\s+hours?\b|\bwhen\s+(?:do|does|are|r)\b[^.?]{0,20}\b(?:open|close)\b|\b(?:are|is|r)\s+(?:you|u|the\s+restaurant|angel|the\s+place|it)\b[^.?]{0,15}\b(?:open|closed)\b/i;
// Asking after a date's standing, without saying which kind of booking.
const AVAILABILITY = /\b(available|availability|free|open|booked|reserved|taken|unavailable)\b/i;
// Ordinary table-booking vocabulary. Used both to admit the question into scope
// and to decide whether the Resy call to action is offered.
const RESERVATION = /\b(reserve|reservations?|resy|book|booking|availability|available)\b/i;
// Booking phrasing that never uses one of those words: "can I get a table
// tonight", "a table for four", "table Saturday".
const TABLE_REQUEST = /\b(?:get|getting|want|need|have|grab|find)\s+(?:us\s+|me\s+)?(?:a\s+)?table\b|\btable\s+(?:for|tonight|tomorrow|today|this|on|at|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;

const strongTopics = [
  "angel indian restaurant", "angel restaurant", "chef amrit", "amrit pal singh", "menu", "dish", "dishes", "food", "halal", "vegetarian", "vegan", "tandoor", "biryani", "curry", "naan", "lamb", "chicken", "goat", "paneer", "dal", "private dining", "private event", "bar", "pathankot", "punjab", "australia", "rahi", "adda", "michelin", "bib gourmand", "jackson heights", "queens", "74 st", "broadway", "allergy", "dietary"
];
const operationalTopics = ["hours", "open", "closed", "address", "location", "phone", "email", "contact", "reservation", "reservations", "reserve", "resy", "table"];
const menuWords = kb.menu_snapshot.categories.flatMap((category) => category.items.map((item) => item.name.toLowerCase()));
const factWords = kb.facts.flatMap((fact) => fact.body.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4));
const scopeLexicon = new Set([...strongTopics, ...operationalTopics, ...menuWords, ...factWords]);

// True noise: a single token that is not a word anyone typed on purpose.
// Previously ANY single word outside the knowledge-base lexicon counted, which
// refused real one-word questions like "parking?", "vegan?" and "halal?".
// Now a token is only noise if it fails to look like a word at all.
function isNoise(text: string) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9'-]+/g, " ").trim();
  if (!normalized || normalized.includes(" ")) return false;
  if (scopeLexicon.has(normalized) || GREETINGS.test(normalized)) return false;
  if (normalized.length < 3) return true;
  // No vowel at all ("qwrtp"), or a run of four identical characters.
  if (!/[aeiouy]/.test(normalized)) return true;
  if (/(.)\1{3,}/.test(normalized)) return true;
  // Mostly consonants in a row.
  if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(normalized)) return true;
  // A roll across the keyboard rather than a word.
  if (/^(?:qwert|asdfg?|zxcvb?|qazws|wasd)/.test(normalized)) return true;
  // An invented but pronounceable word ("blorptastic") is deliberately NOT
  // caught here: separating it from a real one needs a dictionary, and the
  // model already answers it with the same redirect. Guessing would cost real
  // questions, which is the mistake this gate was rewritten to stop making.
  return false;
}

function isClearlyInScope(text: string) {
  const normalized = text.toLowerCase();
  if (SITE_CREDIT.test(normalized)) return true;
  if (PRIVATE_SERVICE.test(normalized)) return true;
  if (CELEBRATION.test(normalized)) return true;
  // Booking language is in scope on its own. Without this, "I want to make a
  // booking" carries no other in-scope token and is refused as out of scope.
  if (RESERVATION.test(normalized) || TABLE_REQUEST.test(normalized)) return true;
  // A dated availability question is about this restaurant even when it uses
  // no topic word of its own: "Is December 24 free?".
  if (AVAILABILITY.test(normalized) && resolveDate(normalized).kind !== "none") return true;
  if (SUBJECT.test(normalized)) return true;
  if (menuWords.some((term) => normalized.includes(term))) return true;
  if (strongTopics.some((term) => normalized.includes(term))) return true;
  if (operationalTopics.some((term) => normalized.includes(term))) return true;
  return false;
}

export function hasSiteCreditIntent(text: string) {
  return SITE_CREDIT.test(text.toLowerCase());
}

export function hasReservationIntent(text: string) {
  const normalized = text.toLowerCase();
  if (PRIVATE_SERVICE.test(normalized)) return false;
  return RESERVATION.test(normalized) || TABLE_REQUEST.test(normalized);
}

// A celebration, event or catering enquiry. The restaurant team handles these
// through the existing private dining enquiry form, so they must never be sent
// to Resy. An explicit ordinary-table request wins: "can I book a table for my
// birthday?" is a normal reservation that happens to name an occasion.
export function hasCelebrationIntent(text: string) {
  const normalized = text.toLowerCase();
  if (hasReservationIntent(normalized)) return false;
  return PRIVATE_SERVICE.test(normalized) || CELEBRATION.test(normalized);
}

// Which call to action, if any, the answer should carry. Intent in the current
// message always wins; only an explicit continuation inherits from the turn
// above it, so the button never lingers over an unrelated later question.
export function resolveCta(text: string, history: ChatTurn[]): "resy" | "event" | "credit" | undefined {
  if (hasSiteCreditIntent(text)) return "credit";
  if (hasReservationIntent(text)) return "resy";
  if (hasCelebrationIntent(text)) return "event";
  if (!CONTINUATION.test(text.trim())) return undefined;
  // Scan back until a turn actually carries an intent. Stopping at the first
  // user turn lost the button whenever a bare date sat in between:
  // "I want to celebrate my birthday" / "What about October 15?" / "How do I
  // do that?" left the last answer with no way to send the enquiry.
  // Only an explicit continuation reaches this loop, so looking further back
  // cannot attach a button to an unrelated question.
  for (let index = history.length - 1; index >= 0; index--) {
    const turn = history[index];
    if (turn.role !== "user") continue;
    if (hasSiteCreditIntent(turn.text)) return "credit";
    if (hasReservationIntent(turn.text)) return "resy";
    if (hasCelebrationIntent(turn.text)) return "event";
  }
  return undefined;
}

/**
 * Which booking a date question is about.
 *
 *   "event"    → look the date up in the event database
 *   "table"    → the existing Resy route, untouched
 *   "clarify"  → the wording fits either; ask instead of guessing
 *   "none"     → not a date question
 *
 * "Is October 15 available?" genuinely does not say whether the visitor wants a
 * table or a private event, so it resolves to "clarify" rather than being
 * assumed either way. Precedence below is deliberate and ordered.
 */
export type DateIntent = "event" | "table" | "clarify" | "none";

export function resolveDateIntent(text: string, history: ChatTurn[]): DateIntent {
  const normalized = text.toLowerCase();
  // 1. Naming a table is decisive, even alongside an occasion:
  //    "can I book a table for my birthday?" is an ordinary reservation.
  if (TABLE_WORD.test(normalized)) return "table";
  // 2. Naming an event or a celebration is equally decisive the other way:
  //    "is October 15 available for a birthday?" is an event question.
  if (PRIVATE_SERVICE.test(normalized) || CELEBRATION.test(normalized)) return "event";
  // 3. An ordinary meal with no occasion behind it: "can I book dinner on the 15th?".
  if (MEAL.test(normalized)) return "table";

  // 4. An hours question is not a booking question, however it names the day.
  if (HOURS_QUESTION.test(normalized)) return "none";

  // 5. Nothing names either side. Only a message that actually carries a date
  //    can be a date question at all.
  if (resolveDate(normalized).kind === "none") return "none";

  // 6. Inherit whichever side the conversation already established, so a bare
  //    "October 15" or "what about the 20th?" continues the same thread.
  for (let index = history.length - 1; index >= 0; index--) {
    const turn = history[index];
    if (turn.role !== "user") continue;
    const earlier = resolveDateIntent(turn.text, []);
    if (earlier === "event" || earlier === "table") return earlier;
  }

  // 7. A date question with no side named and no context behind it. Ask.
  if (AVAILABILITY.test(normalized) || RESERVATION.test(normalized)) return "clarify";
  return "none";
}

/**
 * Safety only. Everything that is not empty, profane, injection or noise
 * reaches the model, which decides relevance against the supplied knowledge and
 * answers with the redirect itself when a question is out of scope.
 */
export function gateInput(text: string, history: ChatTurn[]): GateResult {
  const value = text.trim();
  if (!value) return { allowed: false, kind: "redirect", message: REDIRECT };
  if (PROFANITY.test(value)) return { allowed: false, kind: "profanity", message: REDIRECT };
  if (hasInjection(value)) return { allowed: false, kind: "injection", message: REDIRECT };

  // A bare greeting with nothing else in it has no question to answer.
  // Short enough to be only a greeting, thanks or goodbye (not "hello, what are your hours?", which carries a real question).
  if (GREETINGS.test(value) && value.split(/\s+/).length <= 6 && !isClearlyInScope(value)) return { allowed: false, kind: "greeting", message: greetingReply(value) };

  // Knowledge-base or booking vocabulary is unambiguously usable; skip the
  // noise check so a real term is never mistaken for a keyboard roll.
  if (isClearlyInScope(value)) return { allowed: true };

  if (isNoise(value)) return { allowed: false, kind: "gibberish", message: REDIRECT };

  // Anything else is a real question. Relevance is the model's judgement.
  void history;
  return { allowed: true };
}

export { REDIRECT };
