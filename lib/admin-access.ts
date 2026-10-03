import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { collections } from "./database";
import { clientSource } from "./client-source";
import { hashPassword, isPasswordHash, verifyPassword } from "./admin-password";
import { passwordProblems } from "./password-policy";
import { InputError } from "./menu-validation";

export const ADMIN_COOKIE = "angel_admin";
export class AccessError extends Error {}
// Sign-in uses the administrator password, stored only as a salted hash in ADMIN_PASSWORD_HASH (lib/admin-password.ts,
// set with `npm run admin:password`). The older shared ADMIN_ACCESS_KEY is honoured ONLY while no hash is set, so
// existing installs keep working until the password is created; once a hash exists the key is ignored entirely, and a
// hash that is set but malformed disables sign-in rather than silently falling back to the key.
const legacyKey = () => { const key = process.env.ADMIN_ACCESS_KEY; return key && key.length >= 32 ? key : undefined; };
export function accessConfigured() {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return hash ? isPasswordHash(hash) : !!legacyKey();
}
export type AccessMode = "password" | "legacy-key" | "none";
export function accessMode(): AccessMode {
  if (!accessConfigured()) return "none";
  return process.env.ADMIN_PASSWORD_HASH ? "password" : "legacy-key";
}
// The credential the environment provides (the hash, else the legacy key). A password changed from the workspace is
// stored in the database and fingerprinted against it, so it only counts while the environment credential is unchanged:
// running `npm run admin:password` on the server (a new hash) always takes over again, which is the recovery path.
const bootstrapFingerprint = () => {
  const secret = process.env.ADMIN_PASSWORD_HASH || legacyKey();
  return secret ? createHash("sha256").update(`angel-admin-bootstrap:${secret}`).digest("hex") : undefined;
};
async function changedPasswordHash() {
  const fingerprint = bootstrapFingerprint();
  if (!fingerprint) return undefined;
  const stored = await collections().adminCredentials.findOne({ _id: "admin" });
  return stored && stored.basedOn === fingerprint && isPasswordHash(stored.hash) ? stored.hash : undefined;
}
export async function checkAdminPassword(input: string) {
  const changed = await changedPasswordHash();
  if (changed) return verifyPassword(input, changed);
  if (process.env.ADMIN_PASSWORD_HASH) return verifyPassword(input, process.env.ADMIN_PASSWORD_HASH);
  const key = legacyKey();
  return !!key && input.length <= 256 && equalSecret(input, key);
}
/**
 * Changes the administrator password. The current password must be right, the new one must meet the rules and differ
 * from it, and every OTHER signed-in session is ended (a session someone else may hold does not survive a change).
 * The caller's own session stays signed in.
 */
export async function changeAdminPassword(current: string, next: string) {
  const fingerprint = bootstrapFingerprint();
  if (!fingerprint) throw new AccessError("Administrator access has not been configured.");
  if (!(await checkAdminPassword(current))) throw new InputError("The current password is incorrect.");
  const problems = passwordProblems(next);
  if (problems.length) throw new InputError(problems.join(" "));
  if (next === current) throw new InputError("Choose a new password that is different from the current one.");
  await collections().adminCredentials.updateOne({ _id: "admin" }, { $set: { hash: hashPassword(next), basedOn: fingerprint, updatedAt: new Date().toISOString() } }, { upsert: true });
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  await collections().adminSessions.deleteMany(token ? { tokenHash: { $ne: hashToken(token) } } : {});
}
export function equalSecret(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}
export class RateLimitError extends AccessError {}
export const SESSION_SECONDS = 8 * 60 * 60;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
// Sessions are random tokens recorded (hashed) in the database, so each one can be revoked
// individually on sign-out and no longer depends on the login key being used as a signing secret.
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await collections().adminSessions.insertOne({ tokenHash: hashToken(token), createdAt: new Date(now).toISOString(), expiresAt: new Date(now + SESSION_SECONDS * 1000) });
  return token;
}
export async function destroySession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await collections().adminSessions.deleteOne({ tokenHash: hashToken(token) });
  store.delete(ADMIN_COOKIE);
}
export async function isAdmin() {
  if (!accessConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  return !!(await collections().adminSessions.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }, { projection: { _id: 1 } }));
}
// Replace this seam with the selected provider's session + restaurant-role check.
export async function requireAdmin() {
  if (!(await isAdmin())) throw new AccessError("Administrator access is required.");
}
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin");
}
// ADMIN_ORIGIN pins the public origin behind a proxy. Anything that is not a valid URL (an empty value, or the
// "[SENSITIVE]" placeholder that `vercel env pull` writes for protected variables) is ignored in favour of the
// request's own origin, instead of rejecting every form post, chat message and login with a 403.
function expectedOrigin(request: Request) {
  try { if (process.env.ADMIN_ORIGIN) return new URL(process.env.ADMIN_ORIGIN).origin; } catch { /* fall through */ }
  return new URL(request.url).origin;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== expectedOrigin(request)) throw new AccessError("This request could not be verified. Reload and try again.");
}
export async function limitAttempts(request: Request, scope = "login") {
  // Per visitor when the proxy's client-address header is configured (CLIENT_IP_HEADER); otherwise one shared bucket.
  const source = clientSource(request.headers);
  const bucket = Math.floor(Date.now() / 600000);
  const key = createHash("sha256").update(scope === "login" ? `${source}:${bucket}` : `${scope}:${source}:${bucket}`).digest("hex");
  const expiresAt = new Date(Date.now() + 600000);
  const row = await collections().rateLimits.findOneAndUpdate(
    { key },
    { $inc: { hits: 1 }, $set: { expiresAt }, $setOnInsert: { key } },
    { upsert: true, returnDocument: "after" },
  );
  if ((row?.hits || 1) > 10) throw new RateLimitError("Too many attempts. Try again in ten minutes.");
}
