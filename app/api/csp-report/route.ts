import { readBounded } from "@/lib/api-response";

// Receives Content Security Policy violation reports (lib/csp.ts points report-uri and report-to
// here) and writes one compact line per report to the server log, so a blocked script or style is
// noticed instead of failing silently in visitors' browsers. Public by necessity: browsers post
// reports without a session or an Origin check. It therefore never echoes input, never fails, and
// logs at most LOG_PER_MINUTE reports a minute so it cannot be used to flood the logs.
const LOG_PER_MINUTE = 30;
const MAX_BODY = 8 * 1024;
const MAX_REPORTS_PER_POST = 5;

let windowStart = 0;
let logged = 0;

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

const text = (report: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) { const value = report[key]; if (typeof value === "string") return value.slice(0, 200); }
  return "";
};

export async function POST(request: Request) {
  const now = Date.now();
  if (now - windowStart > 60_000) { windowStart = now; logged = 0; }
  if (logged >= LOG_PER_MINUTE) return done();
  try {
    const data = JSON.parse(new TextDecoder().decode(await readBounded(request, MAX_BODY))) as unknown;
    // report-uri sends { "csp-report": {...} }; report-to sends [{ type, body: {...} }, ...].
    const reports = (Array.isArray(data) ? data.map(entry => (entry as { body?: unknown })?.body) : [(data as { "csp-report"?: unknown })?.["csp-report"] ?? data])
      .filter((report): report is Record<string, unknown> => !!report && typeof report === "object")
      .slice(0, MAX_REPORTS_PER_POST);
    for (const report of reports) {
      if (logged >= LOG_PER_MINUTE) break;
      logged++;
      console.warn("CSP violation", JSON.stringify({
        directive: text(report, "effective-directive", "effectiveDirective", "violated-directive", "violatedDirective"),
        blocked: text(report, "blocked-uri", "blockedURL"),
        page: text(report, "document-uri", "documentURL"),
        source: text(report, "source-file", "sourceFile"),
        line: report["line-number"] ?? report.lineNumber ?? "",
      }));
    }
  } catch {
    // Malformed, oversized or empty: dropped. The response is the same either way.
  }
  return done();
}
