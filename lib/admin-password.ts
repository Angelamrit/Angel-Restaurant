// Administrator password: the rules a password must meet, and how it is stored and checked.
// Pure Node (no Next imports) so scripts/admin-password.mts and tests/admin-password.test.mts can use it.
//
// Only a salted scrypt hash is ever stored (ADMIN_PASSWORD_HASH); the password itself is never kept or logged.
// Format: scrypt:<N>:<r>:<p>:<salt>:<hash>, base64url fields, no "$" so Next's env loader never expands it.
import { randomBytes, scrypt as scryptCallback, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;

import { PASSWORD_MAX, PASSWORD_MIN, passwordProblems } from "./password-policy.ts";
export { PASSWORD_MAX, PASSWORD_MIN, passwordProblems };

// Cost parameters for new hashes (OWASP's scrypt guidance: N=2^16, r=8, p=1 is about 64 MiB and ~150 ms).
// Verification reads the parameters back from the stored hash, so they can be raised later without a migration.
const COST = { N: 65536, r: 8, p: 1 };
const KEY_BYTES = 32;
const SALT_BYTES = 16;
const maxmemFor = (N: number, r: number) => 256 * N * r;

export function isPasswordHash(value: string | undefined): value is string {
  return !!value && parse(value) !== null;
}

function parse(stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [N, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  const ok = Number.isInteger(N) && N >= 16384 && N <= 1 << 20 && (N & (N - 1)) === 0 && Number.isInteger(r) && r >= 1 && r <= 16 && Number.isInteger(p) && p >= 1 && p <= 4;
  if (!ok) return null;
  const salt = Buffer.from(parts[4], "base64url"), hash = Buffer.from(parts[5], "base64url");
  if (salt.length < 8 || hash.length < 16 || hash.length > 128) return null;
  return { N, r, p, salt, hash };
}

/** Hashes a password that already meets the policy. Throws with the reasons if it does not. */
export function hashPassword(password: string): string {
  const problems = passwordProblems(password);
  if (problems.length) throw new Error(problems.join(" "));
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEY_BYTES, { ...COST, maxmem: maxmemFor(COST.N, COST.r) });
  return ["scrypt", COST.N, COST.r, COST.p, salt.toString("base64url"), hash.toString("base64url")].join(":");
}

// Compared against when the stored value is unusable, so a misconfiguration does not answer faster than a wrong password.
const DUMMY = { ...COST, salt: randomBytes(SALT_BYTES), hash: randomBytes(KEY_BYTES) };

/** True when `password` matches the stored hash. Never throws; anything unusable is simply "no". */
export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const parsed = stored ? parse(stored) : null;
  const target = parsed ?? DUMMY;
  // Passwords outside the allowed length can never have been set, so they are refused before any costly hashing.
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return false;
  try {
    const candidate = await scrypt(password, target.salt, target.hash.length, { N: target.N, r: target.r, p: target.p, maxmem: maxmemFor(target.N, target.r) });
    return timingSafeEqual(candidate, target.hash) && parsed !== null;
  } catch {
    return false;
  }
}
