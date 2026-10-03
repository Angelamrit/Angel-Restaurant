import type { NextConfig } from "next";

// The Content Security Policy is NOT set here: proxy.ts builds it per request around a fresh
// nonce (see lib/csp.ts), which is what lets script-src drop 'unsafe-inline'. Only the static
// security headers below live in this file.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Our images, video and scripts may only be embedded by this site itself (stops hot-linking and
  // cross-site reads through <img>/<script>). Search and link-preview crawlers fetch directly, not via a browser embed.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Isolated browser runs use fresh databases and do not need a persistent compiler cache.
  ...(process.env.ANGEL_TEST_BUILD === "true" ? { experimental: { turbopackFileSystemCacheForDev: false } } : {}),
  distDir: process.env.ANGEL_TEST_BUILD === "true" ? ".next-e2e" : ".next",
  serverExternalPackages: ["mongodb", "sharp"],
  images: {
    // Send AVIF to supporting browsers and WebP as the compatibility fallback.
    formats: ["image/avif", "image/webp"],
    // Optimized variants are re-generated from stable source files; keep them for 30 days.
    minimumCacheTTL: 2592000,
    // 75 is the default; 45 is only for the heavily dimmed decorative backgrounds (components/editorial.tsx).
    qualities: [45, 75],
    // Vercel creates BLOB_READ_WRITE_TOKEN automatically, but does not provide a
    // build-time hostname. Keep optimization limited to public menu uploads.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/menu/**" }],
  },
  poweredByHeader: false,
  async headers() {
    // Files in public/ keep stable names, so they are cached for 30 days and revalidated
    // in the background rather than marked immutable; replace a file under a new name to
    // force an immediate change. Vercel's default for these is max-age=0 (recheck every visit).
    const staticCache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/angel/:path*", headers: staticCache },
      { source: "/angel-vps/:path*", headers: staticCache },
      { source: "/videos/:path*", headers: staticCache },
    ];
  },
  async redirects() {
    return [
      // Old site (www.angelindianrestaurant.com) indexed URLs this build does not
      // reproduce 1:1. 308s (permanent: true) so search engines treat them as
      // permanent. See CONTENT_REFERENCE.md for provenance of each old route.
      { source: "/about", destination: "/story", permanent: true },
      { source: "/contact", destination: "/visit", permanent: true },
      { source: "/reservations", destination: "/visit#reserve", permanent: true },
      { source: "/37th-ave", destination: "/", permanent: true },
      { source: "/terms", destination: "/privacy", permanent: true },
      { source: "/full-bar-launch", destination: "/press", permanent: true },
    ];
  },
};

export default nextConfig;
