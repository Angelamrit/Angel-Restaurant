import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, makeNonce } from "@/lib/csp";

// Runs before every page request: mints a fresh nonce, builds the strict Content Security Policy
// around it (lib/csp.ts) and sends the policy on the response. The same value goes on the request
// as x-nonce: Next reads it to tag its own scripts, and app/layout.tsx passes it to the Google
// Analytics loader and the JSON-LD block. The other security headers live in next.config.ts.
export function proxy(request: NextRequest) {
  // Behind a TLS-terminating reverse proxy, trust its original-protocol header
  // (the proxy must overwrite this header with the connection's scheme).
  const originalProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase()
    || request.nextUrl.protocol.replace(":", "");
  if (process.env.NODE_ENV === "production" && originalProtocol !== "https") {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 308);
  }

  const nonce = makeNonce();
  const csp = buildCsp({ nonce, dev: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  // Named endpoint for the report-to directive; report-uri in the policy covers older browsers.
  response.headers.set("Reporting-Endpoints", 'csp="/api/csp-report"');
  return response;
}

export const config = {
  // Pages only. API routes, Next's build output, image optimisation and the public media folders
  // never render HTML, so they need no nonce. Router prefetches are skipped as the docs recommend.
  matcher: [
    {
      source: "/((?!api/|_next/static|_next/image|favicon.ico|angel/|angel-vps/|videos/|Certificates/|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
