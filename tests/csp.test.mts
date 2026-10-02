import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsp, makeNonce } from "../lib/csp.ts";

const directive = (policy: string, name: string) => policy.split(";").map(part => part.trim()).find(part => part === name || part.startsWith(name + " "));

test("nonces are unguessable, unique and base64", () => {
  const seen = new Set(Array.from({ length: 200 }, makeNonce));
  assert.equal(seen.size, 200);
  for (const nonce of seen) assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/, "16 random bytes, base64");
});

test("production policy: scripts run only with the request nonce, never from inline markup", () => {
  const nonce = makeNonce();
  const policy = buildCsp({ nonce });
  const script = directive(policy, "script-src")!;
  assert.ok(script.includes(`'nonce-${nonce}'`));
  assert.ok(script.includes("'strict-dynamic'"));
  assert.ok(!script.includes("'unsafe-inline'"), "no unsafe-inline for scripts");
  assert.ok(!script.includes("'unsafe-eval'"), "no eval in production");
  assert.equal(directive(policy, "script-src-attr"), "script-src-attr 'none'", "no onclick= handlers");
  assert.equal(directive(policy, "object-src"), "object-src 'none'");
  assert.equal(directive(policy, "base-uri"), "base-uri 'none'");
  assert.equal(directive(policy, "frame-ancestors"), "frame-ancestors 'none'");
  assert.equal(directive(policy, "frame-src"), "frame-src 'none'");
  assert.equal(directive(policy, "form-action"), "form-action 'self'");
  assert.equal(directive(policy, "upgrade-insecure-requests"), "upgrade-insecure-requests");
  assert.ok(directive(policy, "report-uri")!.includes("/api/csp-report"), "violations are reported");
  assert.ok(directive(policy, "report-to")!.includes("csp"));
});

test("styles: nonced elements, inline style attributes still allowed, fallback for old browsers", () => {
  const nonce = makeNonce();
  const policy = buildCsp({ nonce });
  assert.ok(directive(policy, "style-src-elem")!.includes(`'nonce-${nonce}'`));
  assert.ok(!directive(policy, "style-src-elem")!.includes("'unsafe-inline'"));
  assert.equal(directive(policy, "style-src-attr"), "style-src-attr 'unsafe-inline'");
  assert.equal(directive(policy, "style-src"), "style-src 'self' 'unsafe-inline'");
});

test("development loosens only what dev tooling needs", () => {
  const policy = buildCsp({ nonce: makeNonce(), dev: true });
  assert.ok(directive(policy, "script-src")!.includes("'unsafe-eval'"), "React dev stack traces");
  assert.ok(!directive(policy, "script-src")!.includes("'unsafe-inline'"), "still no inline scripts");
  assert.ok(directive(policy, "connect-src")!.includes("ws:"), "hot reload socket");
  assert.equal(directive(policy, "upgrade-insecure-requests"), undefined, "http://localhost must keep working");
  // The dev-tools overlay injects un-nonced <style> elements; a nonce beside 'unsafe-inline' would make browsers ignore the latter.
  assert.equal(directive(policy, "style-src-elem"), "style-src-elem 'self' 'unsafe-inline'");
});

test("the policy only names the third parties the site really uses", () => {
  const policy = buildCsp({ nonce: makeNonce() });
  const hosts = [...policy.matchAll(/https:\/\/[^\s;]+/g)].map(m => m[0]);
  for (const host of hosts) assert.match(host, /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|public\.blob\.vercel-storage\.com/, host);
  assert.ok(!/vercel\.live|unpkg|jsdelivr|cdnjs/.test(policy));
});

test("a malformed nonce is refused rather than producing a weak policy", () => {
  assert.throws(() => buildCsp({ nonce: "short" }));
  assert.throws(() => buildCsp({ nonce: "has space in it 1234567890" }));
});
