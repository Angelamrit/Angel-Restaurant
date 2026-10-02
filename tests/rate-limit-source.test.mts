import { test } from "node:test";
import assert from "node:assert/strict";
import { clientSource } from "../lib/client-source.ts";

const withEnv = (env: Record<string, string | undefined>, run: () => void) => {
  const saved = { VERCEL: process.env.VERCEL, CLIENT_IP_HEADER: process.env.CLIENT_IP_HEADER };
  for (const [key, value] of Object.entries(env)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  try { run(); } finally { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
};

test("off Vercel with no trusted header configured, everyone shares one bucket", () => {
  withEnv({ VERCEL: undefined, CLIENT_IP_HEADER: undefined }, () => assert.equal(clientSource(new Headers({ "x-real-ip": "1.2.3.4" })), "local"));
});

test("a configured proxy header gives each visitor their own bucket, using the last (proxy-appended) entry", () => {
  withEnv({ VERCEL: undefined, CLIENT_IP_HEADER: "X-Forwarded-For" }, () => {
    assert.equal(clientSource(new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" })), "203.0.113.9", "a forged first entry is ignored");
    assert.equal(clientSource(new Headers()), "local", "header absent falls back safely");
    assert.equal(clientSource(new Headers({ "x-forwarded-for": "x".repeat(200) })), "local", "oversized values are not trusted");
  });
});

test("on Vercel only Vercel's own header is used", () => {
  withEnv({ VERCEL: "1", CLIENT_IP_HEADER: "x-real-ip" }, () => {
    assert.equal(clientSource(new Headers({ "x-vercel-forwarded-for": "198.51.100.7", "x-real-ip": "9.9.9.9" })), "198.51.100.7");
    assert.equal(clientSource(new Headers()), "unknown");
  });
});
