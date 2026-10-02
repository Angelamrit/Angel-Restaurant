import { apiError } from "@/lib/api-response";
import { getTrafficStats } from "@/lib/visitor-analytics";

// Administrator-only traffic summary (the same figures /admin/analytics renders). getTrafficStats() calls
// requireAdmin(), so a request without a valid session gets a 403 and no data.
export async function GET() {
  try {
    return Response.json(await getTrafficStats(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
