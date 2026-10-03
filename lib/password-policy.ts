// The rules an administrator password must meet. Pure (no Node or Next imports) so the same rules run on the server
// (lib/admin-password.ts, the change-password API, scripts/admin-password.mts) and in the browser (the live checklist).
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

// A 16-character ceiling is short, so what is allowed inside it is strict: all four character classes, nothing a
// guesser tries first, and nothing built from the restaurant's own name.
const BANNED_PARTS = ["angel", "password", "passw0rd", "admin", "qwerty", "welcome", "letmein", "iloveyou", "12345", "abcde", "restaurant"];

export const passwordRules: { label: string; problem: string; ok: (password: string) => boolean }[] = [
  { label: `${PASSWORD_MIN} to ${PASSWORD_MAX} characters`, problem: `Use ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`, ok: p => p.length >= PASSWORD_MIN && p.length <= PASSWORD_MAX },
  { label: "A lowercase letter", problem: "Add a lowercase letter.", ok: p => /[a-z]/.test(p) },
  { label: "An uppercase letter", problem: "Add an uppercase letter.", ok: p => /[A-Z]/.test(p) },
  { label: "A number", problem: "Add a number.", ok: p => /[0-9]/.test(p) },
  { label: "A symbol such as ! # $ % & * ?", problem: "Add a symbol such as ! # $ % & * ?", ok: p => /[^A-Za-z0-9\s]/.test(p) },
  { label: "No spaces", problem: "Do not use spaces.", ok: p => !/\s/.test(p) },
  { label: "No character three times in a row", problem: "Do not repeat the same character three times in a row.", ok: p => !/(.)\1\1/.test(p) },
  { label: "No common words or the restaurant's name", problem: "Avoid common words, number runs, and the restaurant's name.", ok: p => { const lower = p.toLowerCase(); return !BANNED_PARTS.some(part => lower.includes(part)); } },
];

/** Every rule the password breaks, in a stable order; empty when it is acceptable. */
export function passwordProblems(password: string): string[] {
  return passwordRules.filter(rule => !rule.ok(password)).map(rule => rule.problem);
}
