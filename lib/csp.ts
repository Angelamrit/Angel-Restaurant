// Content Security Policy, built per request by proxy.ts around a fresh nonce.
// Pure (no Next imports) so tests/csp.test.mts can check the policy directly.
//
// The policy is strict about scripts, which is where XSS lives: only a <script> carrying this
// request's nonce runs, plus anything such a script loads itself ('strict-dynamic'). Inline
// event handlers (onclick="...") are refused outright. There is no 'unsafe-inline' for scripts.
//
// Styles are nonced at the element level (<style>, <link>). Inline style="" attributes stay
// allowed: React sets CSS custom properties through them, attributes cannot carry a nonce, and
// a style attribute cannot run script. The plain style-src line is the fallback for browsers
// that do not know the -elem/-attr split.

export type CspOptions = {
  nonce: string;
  /** Development needs eval (React's debugging stack traces) and the HMR websocket. */
  dev?: boolean;
};

const SELF = "'self'";
const GOOGLE_TAG = "https://www.googletagmanager.com";

export function buildCsp({ nonce, dev = false }: CspOptions): string {
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) throw new Error("A CSP nonce must be a base64 string of at least 16 characters.");
  const directives: [string, string[]][] = [
    ["default-src", [SELF]],
    // The host list after 'strict-dynamic' is ignored by browsers that support it and is only the
    // fallback for older ones.
    ["script-src", [SELF, `'nonce-${nonce}'`, "'strict-dynamic'", GOOGLE_TAG, ...(dev ? ["'unsafe-eval'"] : [])]],
    ["script-src-attr", ["'none'"]],
    ["style-src", [SELF, "'unsafe-inline'"]],
    // In development Next's dev-tools overlay injects un-nonced <style> elements, so the element rule
    // allows inline styles there. It cannot simply add 'unsafe-inline' beside the nonce: a browser
    // ignores 'unsafe-inline' in any directive that also carries a nonce.
    ["style-src-elem", dev ? [SELF, "'unsafe-inline'"] : [SELF, `'nonce-${nonce}'`]],
    ["style-src-attr", ["'unsafe-inline'"]],
    // data: and blob: are what next/image uses for placeholders; the blob host is the optional dish-photo store.
    ["img-src", [SELF, "data:", "blob:", "https://*.public.blob.vercel-storage.com", "https://www.google-analytics.com", GOOGLE_TAG]],
    ["font-src", [SELF]],
    ["media-src", [SELF]],
    ["connect-src", [SELF, "https://*.google-analytics.com", "https://*.analytics.google.com", GOOGLE_TAG, ...(dev ? ["ws:", "wss:"] : [])]],
    ["worker-src", [SELF]],
    ["manifest-src", [SELF]],
    ["frame-src", ["'none'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'none'"]],
    ["form-action", [SELF]],
    ["frame-ancestors", ["'none'"]],
    // Violations are posted to app/api/csp-report/route.ts (report-uri for every browser, report-to for new ones).
    ["report-uri", ["/api/csp-report"]],
    ["report-to", ["csp"]],
    ...(dev ? [] : [["upgrade-insecure-requests", []] as [string, string[]]]),
  ];
  return directives.map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name)).join("; ");
}

/** 128 random bits, base64: unguessable and unique per request. Works in Node and edge runtimes. */
export function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
