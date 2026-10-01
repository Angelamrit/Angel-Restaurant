import { getDatabase } from "@/lib/database";

// A deployment self-check that reveals no secrets and no data: only yes/no answers about configuration,
// whether the database answers a ping, and which commit is running. Open it in a browser after each deploy.
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let database: "ok" | "unreachable" | "not_configured" = "not_configured";
  if (process.env.MONGODB_URI) {
    try { await getDatabase().command({ ping: 1 }); database = "ok"; }
    catch (error) { console.error("Health check: database unreachable", error instanceof Error ? error.message : error); database = "unreachable"; }
  }
  const validOrigin = (() => { try { return Boolean(process.env.ADMIN_ORIGIN && new URL(process.env.ADMIN_ORIGIN)); } catch { return false; } })();
  return Response.json({
    database,
    databaseName: process.env.MONGODB_DB ? "custom" : "default",
    databaseMs: Date.now() - started,
    openaiKey: Boolean(process.env.OPENAI_API_KEY),
    resendKey: Boolean(process.env.RESEND_API_KEY),
    adminKey: Boolean(process.env.ADMIN_ACCESS_KEY),
    adminOrigin: process.env.ADMIN_ORIGIN ? (validOrigin ? "valid" : "invalid") : "unset (falls back to request origin)",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "unset",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
    repo: process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}` : "unknown",
  }, { headers: { "Cache-Control": "no-store" } });
}
