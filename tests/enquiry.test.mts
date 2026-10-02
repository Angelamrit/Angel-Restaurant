import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../lib/enquiry.ts";
import { restaurant } from "../lib/restaurant.ts";

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
function form(patch: Record<string, string | null> = {}) {
  const base: Record<string, string> = { Name: "Asha", Email: "asha@example.com", Phone: "", Guests: "12", Date: inDays(30), Occasion: "Birthday", Message: "", Consent: "on" };
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...patch })) if (value !== null) data.set(key, value);
  return data;
}

test("a complete enquiry is accepted and trimmed", () => {
  const result = validateEnquiry(form({ Name: "  Asha  " }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.Name, "Asha");
});

test("missing consent is reported on its own field, not on Message", () => {
  const result = validateEnquiry(form({ Consent: null }));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.fieldErrors.Consent);
    assert.equal(result.fieldErrors.Message, undefined);
  }
});

test("missing occasion is rejected on its own field", () => {
  const result = validateEnquiry(form({ Occasion: "" }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.fieldErrors.Occasion);
});

test("invalid occasion, party size, email, phone and dates are rejected", () => {
  const patches: Record<string, string>[] = [{ Occasion: "Coup" }, { Guests: "0" }, { Guests: "1.5" }, { Email: "nope" }, { Phone: "abc" }, { Phone: "123" }, { Date: inDays(-2) }, { Date: inDays(900) }, { Date: "2026-02-31" }];
  for (const patch of patches) {
    assert.equal(validateEnquiry(form(patch)).ok, false, JSON.stringify(patch));
  }
});

test("header-injection characters are stripped from name and email", () => {
  const result = validateEnquiry(form({ Name: "Asha\r\nBcc: x@y.com" }));
  assert.equal(result.ok, true);
  if (result.ok) assert.doesNotMatch(result.data.Name, /[\r\n]/);
});

test("addresses that could carry mailto parameters or extra recipients are rejected", () => {
  for (const Email of ["a@b.co?bcc=x@y.com", "a@b.co&cc=x@y.com", "a@b.co,x@y.com", "a b@c.com", "<a@b.com>", "a@b", "a@@b.com"])
    assert.equal(validateEnquiry(form({ Email })).ok, false, Email);
  for (const Email of ["asha@example.com", "asha.k+dining@mail.example.co.uk", "o'brien@example.com"])
    assert.equal(validateEnquiry(form({ Email })).ok, true, Email);
});

test("link-stuffed messages and names are rejected, a single link is allowed", () => {
  const spam = validateEnquiry(form({ Message: "Cheap deals http://spam.example and www.more-spam.example" }));
  assert.equal(spam.ok, false);
  if (!spam.ok) assert.ok(spam.fieldErrors.Message);
  assert.equal(validateEnquiry(form({ Name: "Buy now http://x.example" })).ok, false);
  assert.equal(validateEnquiry(form({ Name: "<b>Asha</b>" })).ok, false);
  assert.equal(validateEnquiry(form({ Message: "Here is our venue brief: https://example.com/brief" })).ok, true);
  assert.equal(validateEnquiry(form({ Message: "Twelve of us, Mr. Singh's 50th. Vegetarian options please." })).ok, true);
});

test("control characters are stripped from stored text but newlines are kept", () => {
  const result = validateEnquiry(form({ Message: "Line one\nLine two\u0007\u0000 end", Name: "As\u0001ha" }));
  assert.equal(result.ok, true);
  if (result.ok) { assert.equal(result.data.Message, "Line one\nLine two end"); assert.equal(result.data.Name, "Asha"); }
});

test("the notification email reports success or the exact reason it failed", async () => {
  const { deliverEnquiry } = await import("../lib/enquiry.ts");
  const result = validateEnquiry(form({ Name: "Asha\r\nBcc: evil@example.com" }));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const names = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const;
  const saved = { fetch: globalThis.fetch, error: console.error, env: Object.fromEntries(names.map(k => [k, process.env[k]])) };
  console.error = () => {};
  try {
    process.env.RESEND_API_KEY = "re_test"; process.env.CONTACT_FROM_EMAIL = "Angel <enquiries@example.com>"; delete process.env.CONTACT_TO_EMAIL;
    let sent: { to: string[]; reply_to: string; subject: string; text: string } | undefined;
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => { sent = JSON.parse(String(init?.body)); return new Response("{}", { status: 200 }); }) as typeof fetch;
    assert.deepEqual(await deliverEnquiry(result.data), { ok: true });
    assert.equal(sent?.reply_to, "asha@example.com");
    // The public address and the inbox are the same Gmail address, so it appears once, not twice.
    assert.equal(restaurant.email, restaurant.inbox);
    assert.deepEqual(sent?.to, [restaurant.inbox]);
    assert.ok(!/[\r\n]/.test(sent?.subject ?? ""), "no header injection through the name");
    assert.match(sent?.text ?? "", /Guests: 12/);
    process.env.CONTACT_TO_EMAIL = "team@example.org";
    await deliverEnquiry(result.data);
    assert.deepEqual(sent?.to, ["team@example.org", restaurant.inbox], "the configured recipient and the restaurant inbox both receive the notification, once each");
    process.env.CONTACT_TO_EMAIL = "not an address";
    await deliverEnquiry(result.data);
    assert.notEqual(sent?.to[0], "not an address", "an invalid CONTACT_TO_EMAIL falls back to the restaurant inbox");
    globalThis.fetch = (async () => new Response(JSON.stringify({ name: "validation_error", message: "The example.com domain is not verified." }), { status: 403 })) as typeof fetch;
    const rejected = await deliverEnquiry(result.data);
    assert.equal(rejected.ok, false);
    if (!rejected.ok) assert.match(rejected.reason, /Resend rejected the email \(403 validation_error\): The example.com domain is not verified/);
    globalThis.fetch = (async () => { throw new Error("network"); }) as typeof fetch;
    const down = await deliverEnquiry(result.data);
    assert.ok(!down.ok && /could not be reached/.test(down.reason));
    process.env.RESEND_API_KEY = "[SENSITIVE]";
    const placeholder = await deliverEnquiry(result.data);
    assert.ok(!placeholder.ok && /RESEND_API_KEY/.test(placeholder.reason), "a placeholder key counts as missing, and says which setting");
  } finally {
    globalThis.fetch = saved.fetch; console.error = saved.error;
    for (const k of names) { const v = saved.env[k]; if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
});
