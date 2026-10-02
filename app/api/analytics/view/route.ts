import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sameOrigin } from "@/lib/admin-access";
import { apiError, readBounded } from "@/lib/api-response";
import { recordPageView } from "@/lib/visitor-analytics";
import { VISITOR_COOKIE, VISITOR_COOKIE_SECONDS, deviceCategory, isBot, isVisitorId, referrerHost, trackedPath } from "@/lib/visitor-analytics-core";

// Records one anonymous page view from components/page-view-tracker.tsx. Anything that should not be counted
// (crawlers, Do Not Track, administrators, pages outside the public site) gets the same empty 204 as a recorded view.
const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const userAgent = request.headers.get("user-agent") || "";
    if (request.headers.get("dnt") === "1" || isBot(userAgent)) return done();
    const store = await cookies();
    if (/^[a-f0-9]{64}$/.test(store.get(ADMIN_COOKIE)?.value || "")) return done();

    const input = JSON.parse(new TextDecoder().decode(await readBounded(request, 1024))) as { path?: unknown; referrer?: unknown } | null;
    const path = trackedPath(input?.path);
    if (!path) return done();

    const existing = store.get(VISITOR_COOKIE)?.value;
    const visitorId = isVisitorId(existing) ? existing : randomUUID();
    // Set (and so renewed) by the server: Safari caps cookies written from JavaScript at seven days.
    store.set(VISITOR_COOKIE, visitorId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: VISITOR_COOKIE_SECONDS });
    const siteHost = new URL(request.headers.get("origin")!).hostname;
    await recordPageView({ visitorId, path, device: deviceCategory(userAgent), referrer: referrerHost(input?.referrer, siteHost) });
    return done();
  } catch (error) { return apiError(error); }
}
