// Rate-limit identity. Only Vercel's own proxy header may be trusted: x-real-ip
// and x-forwarded-for are ordinary request headers, so a caller can rotate them
// per request and defeat the limiter. Off Vercel there is no trusted source, so
// every caller shares one bucket.
//
// Self-hosted behind your own reverse proxy: set CLIENT_IP_HEADER to the header that proxy OVERWRITES with the real
// client address on every request (for nginx: `proxy_set_header X-Real-IP $remote_addr;` and CLIENT_IP_HEADER=x-real-ip).
// Only set it when the proxy really replaces the header; if clients can reach the app directly they could forge it.
// The last comma-separated entry is used, which is the one the nearest proxy appended. Unset keeps the single bucket.
export function clientSource(headers: Headers) {
  if (process.env.VERCEL) return headers.get("x-vercel-forwarded-for")?.trim() || "unknown";
  const name = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (name) {
    const value = headers.get(name)?.split(",").pop()?.trim();
    if (value && value.length <= 64) return value;
  }
  return "local";
}
