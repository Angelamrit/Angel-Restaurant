import "server-only";
import { createHash } from "node:crypto";
import { collections } from "./database";

export { clientSource } from "./client-source.ts";

// Counters live in MongoDB (with a TTL index on expiresAt), so the limit holds
// across serverless instances and cold starts. Returns true while under the limit.
// `failOpen` decides what happens if the database is unreachable.
export async function withinLimit(scope: string, source: string, windowMs: number, max: number, failOpen: boolean) {
  const bucket = Math.floor(Date.now() / windowMs);
  const key = createHash("sha256").update(`${scope}:${source}:${bucket}`).digest("hex");
  try {
    const row = await collections().rateLimits.findOneAndUpdate(
      { key },
      { $inc: { hits: 1 }, $set: { expiresAt: new Date((bucket + 1) * windowMs + 60_000) }, $setOnInsert: { key } },
      { upsert: true, returnDocument: "after" },
    );
    return (row?.hits ?? 1) <= max;
  } catch (error) {
    console.error("Rate limit store unavailable", error instanceof Error ? error.message : error);
    return failOpen;
  }
}
