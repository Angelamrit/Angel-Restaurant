import test from "node:test";
import assert from "node:assert/strict";
import { REDIRECT, gateInput, hasCelebrationIntent, hasReservationIntent, resolveCta, resolveDateIntent } from "../lib/chat/gate.ts";
import type { ChatTurn } from "../lib/chat/validation.ts";

const allowed = (text: string, history: ChatTurn[] = []) => gateInput(text, history).allowed;
// The redirect copy only exists on a refusal, so reading it through a narrowing
// helper also asserts that the input was in fact refused.
const refusal = (text: string, history: ChatTurn[] = []) => {
  const result = gateInput(text, history);
  return result.allowed ? null : result.message;
};

// The gate is a SAFETY gate now, not a scope gate: it refuses what a model must
// never be asked to adjudicate, and lets real questions through to be judged on
// meaning. Keyboard rolls stay refused; invented-but-pronounceable words are
// deliberately allowed through, because separating them from real words needs a
// dictionary and the model answers them with the same redirect anyway.
test("obvious noise is refused, word-shaped input is not", () => {
  const history: ChatTurn[] = [{ role: "user", text: "What are the hours?" }, { role: "model", text: "Tuesday–Sunday, 12 PM–10 PM." }];
  for (const noise of ["qwerty", "asdfgh", "aaaaaa"]) {
    assert.equal(allowed(noise), false, noise);
    assert.equal(refusal(noise, history), REDIRECT, noise);
  }
  for (const wordish of ["blorptastic", "hekki"]) {
    assert.equal(allowed(wordish), true, `noise check should not guess at: ${wordish}`);
  }
});

test("keeps contextual follow-ups working", () => {
  const history: ChatTurn[] = [{ role: "user", text: "What are the vegetarian dishes?" }, { role: "model", text: "There are several vegetarian dishes." }];
  assert.equal(allowed("which ones?", history), true);
  assert.equal(allowed("the second one?", history), true);
  assert.equal(allowed("those?", history), true);
  // With no conversation behind it the follow-up is still a real question; the
  // model resolves it or answers with the redirect. The gate no longer decides.
  assert.equal(allowed("which ones?", []), true);
});

test("blocks profanity", () => assert.equal(refusal("fuck"), REDIRECT));

// The scope list only held the full phrases ("chef amrit", "angel restaurant"),
// so asking about the subject by its ordinary name was refused as out of scope.
test("bare subject nouns are in scope, not only the full phrases", () => {
  for (const phrase of [
    "tell me about chef",
    "who is amrit?",
    "who is the chef?",
    "tell me about angel",
    "what makes the restaurant special?",
    "chef",
    "amrit",
    "who is chef amrit?",
    "tell me about Chef Amrit Pal Singh",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
  }
});

// Off-topic questions now reach the model, which refuses them with the exact
// out-of-scope sentence. That is the point of the rewrite: relevance is a
// semantic judgement, and the gate was refusing real questions to make it.
test("off-topic questions reach the model rather than the keyword list", () => {
  for (const phrase of [
    "What is the capital of France?",
    "Who won the 2024 World Series?",
    "write me a poem about the sea",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate should defer to the model: ${phrase}`);
  }
});

// The questions the old keyword gate refused, which are the whole reason for it.
test("natural phrasings with no restaurant keyword now reach the model", () => {
  for (const phrase of [
    "Who's behind this place?",
    "What's good here?",
    "Who's running the place?",
    "what u serve",
    "who cooks here",
    "What can you do?",
    "What do you offer?",
    "What can I arrange?",
    "Can I have a private dinner?",
    "what would you recommend",
    "is there anything without dairy",
    "any specials tonight",
    "whats the damage for two people",
    "can i bring my kids",
    "do u take walk ins",
    "wat time u close",
    "whre r u located",
    "parking?",
    "How much is that one?",
    "What about Saturday?",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `still refused: ${phrase}`);
  }
});

test("reservation detection excludes private services", () => {
  assert.equal(hasReservationIntent("Can I book a table for four?"), true);
  assert.equal(hasReservationIntent("Can I reserve dinner?"), true);
  assert.equal(hasReservationIntent("How do I book private dining for a wedding?"), false);
  assert.equal(hasReservationIntent("Can I book a company dinner?"), false);
});

// Natural booking wording must both reach the model and earn the Resy button.
// Before this, "I want to make a booking" carried no in-scope token at all and
// was refused as out of scope on the site's primary conversion path.
test("natural table-booking language is in scope and offers Resy", () => {
  for (const phrase of [
    "I want to make a booking",
    "Can I book?",
    "Do you have availability Saturday?",
    "Can I get a table tonight?",
    "Can I book a table for four?",
    "Do you take reservations?",
    "How do I reserve a table?",
    "Is a table available on Friday?",
    "I need a table for six",
    "book a party of six",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), true, `no Resy CTA: ${phrase}`);
  }
});

test("private-service enquiries stay in scope but never offer Resy", () => {
  for (const phrase of [
    "How do I arrange private dining for a wedding?",
    "Can I book a company dinner?",
    "I want to book a birthday party",
    "Do you do catering?",
    "Can I hire the restaurant for a corporate event?",
    "Can I book the private room?",
    "Do you host wedding receptions?",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), false, `wrongly offered Resy: ${phrase}`);
  }
});

// Celebration, event and catering enquiries go to the site's existing private
// dining enquiry form (app/private-dining, <form id="enquiry">), never to Resy.
test("celebration and event enquiries are in scope and never offer Resy", () => {
  for (const phrase of [
    "I want to celebrate my birthday at Angel",
    "Can I have a birthday dinner there?",
    "I want to plan a birthday celebration",
    "Can I host an anniversary dinner?",
    "Can I organize an anniversary dinner?",
    "I want to host an event",
    "I want a private event",
    "I want to plan a private event",
    "Do you have birthday packages?",
    "Can I have catering for my birthday?",
    "We are planning an engagement party",
    "Can you do a family gathering?",
  ]) {
    assert.equal(gateInput(phrase, []).allowed, true, `gate blocked: ${phrase}`);
    assert.equal(hasCelebrationIntent(phrase), true, `not celebration intent: ${phrase}`);
    assert.equal(hasReservationIntent(phrase), false, `wrongly offered Resy: ${phrase}`);
    assert.equal(resolveCta(phrase, []), "event", `wrong CTA: ${phrase}`);
  }
});

test("an ordinary table request still goes to Resy, even when it names an occasion", () => {
  for (const phrase of [
    "I want to book a table tonight",
    "Can I book a table for my birthday?",
    "Can I reserve a table for our anniversary?",
    "Do you take reservations?",
    "Can I get a table tonight?",
  ]) {
    assert.equal(resolveCta(phrase, []), "resy", `wrong CTA: ${phrase}`);
    assert.equal(hasCelebrationIntent(phrase), false, `wrongly treated as an event: ${phrase}`);
  }
});

test("a bare continuation inherits the intent of the exchange above it", () => {
  const event: ChatTurn[] = [{ role: "user", text: "I want to plan a birthday celebration" }, { role: "model", text: "The team follows up on an event enquiry." }];
  const table: ChatTurn[] = [{ role: "user", text: "I want to book a table tonight" }, { role: "model", text: "Reservations are handled through Resy." }];
  assert.equal(gateInput("How do I do that?", event).allowed, true);
  assert.equal(resolveCta("How do I do that?", event), "event");
  assert.equal(resolveCta("How do I do that?", table), "resy");
  // With no conversation behind it the continuation carries no CTA. It still
  // reaches the model, which asks what "that" refers to or redirects.
  assert.equal(gateInput("How do I do that?", []).allowed, true);
  assert.equal(resolveCta("How do I do that?", []), undefined);
  // And it never lingers over an unrelated later question.
  assert.equal(resolveCta("What are your hours?", event), undefined);
});

// --- event-date routing -----------------------------------------------------
// Three outcomes, not two. "Is October 15 available?" names neither a table nor
// an event, so it must be asked about rather than assumed either way.

test("explicit event wording routes to the event database", () => {
  for (const phrase of [
    "Is October 15 available for an event?",
    "Is October 15 available for a birthday?",
    "Can I host a birthday on October 15?",
    "Is October 15 reserved for an event?",
    "Do you have an event booked on October 15?",
    "Can I host a private event on October 15?",
    "Is October 15 free for a wedding?",
    "Can I organize a corporate event on October 15?",
    "Is October 15 reserved for a birthday?",
    "Can I host a wedding on October 15?",
    "Is October 15 available for my birthday event?",
  ]) {
    assert.equal(resolveDateIntent(phrase, []), "event", phrase);
  }
});

test("explicit table wording keeps the existing Resy route", () => {
  for (const phrase of [
    "Is October 15 available for a table?",
    "Can I book a table on October 15?",
    "Can I reserve a table for October 15?",
    "Do you have a table available on October 15?",
    "Can I book dinner on October 15?",
    "Can I book a table for my birthday?",
    "I want to book a table on Saturday",
  ]) {
    assert.equal(resolveDateIntent(phrase, []), "table", phrase);
  }
});

test("a date question that names neither side asks for clarification", () => {
  for (const phrase of [
    "Is October 15 available?",
    "Is Saturday available?",
    "Is December 24 free?",
    "Can I book the 15th?",
    "Is next Saturday open?",
    "Do you have availability on the 20th?",
  ]) {
    assert.equal(resolveDateIntent(phrase, []), "clarify", phrase);
  }
});

test("an established event thread carries through follow-up dates", () => {
  const birthday: ChatTurn[] = [
    { role: "user", text: "I want to plan a birthday event." },
    { role: "model", text: "Absolutely. What date are you considering?" },
  ];
  const anniversary: ChatTurn[] = [
    { role: "user", text: "I want to host an anniversary dinner." },
    { role: "model", text: "The team follows up on an event enquiry." },
  ];
  const asked: ChatTurn[] = [
    { role: "user", text: "Is October 15 reserved for an event?" },
    { role: "model", text: "15 October 2026 is already reserved for an event." },
  ];
  assert.equal(resolveDateIntent("What about October 15?", birthday), "event");
  assert.equal(resolveDateIntent("October 15.", birthday), "event");
  // The thread is an event thread, so the intent is "event" — but the
  // conversation names no month, so the DATE is what stays ambiguous and the
  // assistant asks which month rather than guessing one.
  assert.equal(resolveDateIntent("What about the 20th?", anniversary), "event");
  assert.equal(resolveDateIntent("What about the 20th?", asked), "event");
  // Once a date question is ambiguous it stays ambiguous without context.
  assert.equal(resolveDateIntent("Is October 15 available?", []), "clarify");
});

// "Do you have availability Saturday?" names neither a table nor an event, so
// it asks. That is only reasonable if the answer then resolves cleanly, which
// is what this checks: the reply routes straight back to the Resy side.
test("the clarification question resolves on the next turn", () => {
  const asked: ChatTurn[] = [
    { role: "user", text: "Do you have availability Saturday?" },
    { role: "model", text: "Are you asking about a regular table or an event?" },
  ];
  assert.equal(resolveDateIntent("Do you have availability Saturday?", []), "clarify");
  assert.equal(resolveDateIntent("a table", asked), "table");
  assert.equal(resolveDateIntent("an event", asked), "event");
  assert.equal(resolveDateIntent("a table please, Saturday", asked), "table");
});

test("an established table thread also carries through", () => {
  const table: ChatTurn[] = [
    { role: "user", text: "I want to book a table" },
    { role: "model", text: "Reservations are handled through Resy." },
  ];
  assert.equal(resolveDateIntent("Is October 15 available?", table), "table");
  assert.equal(resolveDateIntent("What about the 20th?", table), "table");
});

test("messages with no date at all are not date questions", () => {
  assert.equal(resolveDateIntent("What are your hours?", []), "none");
  assert.equal(resolveDateIntent("Who is Chef Amrit?", []), "none");
});

test("the celebration workflow and the Resy route are both unchanged", () => {
  // Birthday table -> Resy.
  assert.equal(resolveCta("Can I book a table for my birthday?", []), "resy");
  assert.equal(resolveDateIntent("Can I book a table for my birthday?", []), "table");
  // Celebration with no date -> the existing event enquiry workflow.
  assert.equal(resolveCta("I want to celebrate my birthday.", []), "event");
  assert.equal(resolveCta("I want to plan a private event.", []), "event");
  assert.equal(hasCelebrationIntent("I want to celebrate my birthday."), true);
  assert.equal(hasReservationIntent("I want to book a table tonight"), true);
});

// --- regressions found by the QA pass ---------------------------------------

// "Are you open Sunday?" names a day and uses "open", so it was landing in the
// table-or-event clarification and never getting an answer about the hours.
test("an opening-hours question is never mistaken for a booking question", () => {
  for (const phrase of [
    "Are you open Sunday?",
    "Is the restaurant open Monday?",
    "are u open tomorrow",
    "what time do you close",
    "How late are you open?",
    "wht time u close",
    "When do you open on Saturday?",
    "What are your opening hours?",
  ]) {
    assert.equal(resolveDateIntent(phrase, []), "none", `wrongly routed as a booking: ${phrase}`);
  }
});

test("genuine booking ambiguity still asks which kind", () => {
  for (const phrase of [
    "Is October 15 available?",
    "Is December 24 free?",
    "Can I book the 15th?",
    "Do you have availability Saturday?",
  ]) {
    assert.equal(resolveDateIntent(phrase, []), "clarify", phrase);
  }
});

// The call to action disappeared mid-conversation: an intervening bare date
// carries no intent of its own, and the scan used to stop at the first user
// turn, so "How do I do that?" ended the thread with no way to act on it.
test("a continuation finds the thread's intent past an intervening date", () => {
  const event: ChatTurn[] = [
    { role: "user", text: "I want to celebrate my birthday." },
    { role: "model", text: "Angel welcomes birthdays; the team follows up on an event enquiry." },
    { role: "user", text: "What about October 15?" },
    { role: "model", text: "15 October 2026 is already reserved for an event." },
  ];
  const table: ChatTurn[] = [
    { role: "user", text: "I want to book a table." },
    { role: "model", text: "Reservations are handled through Resy." },
    { role: "user", text: "What about Saturday?" },
    { role: "model", text: "Reservations are handled through Resy." },
  ];
  assert.equal(resolveCta("How do I do that?", event), "event");
  assert.equal(resolveCta("How do I do that?", table), "resy");
  // Still nothing to inherit when there is no conversation, and still no
  // lingering button over an unrelated later question.
  assert.equal(resolveCta("How do I do that?", []), undefined);
  assert.equal(resolveCta("What are your hours?", event), undefined);
});
