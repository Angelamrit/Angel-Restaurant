// The rules an administrator password must meet. Pure (no Node or Next imports) so the same rules run on the server
// (lib/admin-password.ts, the change-password API, scripts/admin-password.mts) and in the browser (the live checklist).
export const PASSWORD_MIN = 8;
// Not a strength rule: only a ceiling so an absurdly long input is refused before any costly hashing.
export const PASSWORD_MAX = 128;

export const passwordRules: { label: string; problem: string; ok: (password: string) => boolean }[] = [
  { label: `At least ${PASSWORD_MIN} characters`, problem: `Use at least ${PASSWORD_MIN} characters.`, ok: p => p.length >= PASSWORD_MIN && p.length <= PASSWORD_MAX },
  { label: "A letter", problem: "Add a letter.", ok: p => /[A-Za-z]/.test(p) },
  { label: "A number", problem: "Add a number.", ok: p => /[0-9]/.test(p) },
  { label: "A special character such as ! # $ % & * ?", problem: "Add a special character such as ! # $ % & * ?", ok: p => /[^A-Za-z0-9\s]/.test(p) },
  { label: "No spaces", problem: "Do not use spaces.", ok: p => !/\s/.test(p) },
];

/** Every rule the password breaks, in a stable order; empty when it is acceptable. */
export function passwordProblems(password: string): string[] {
  return passwordRules.filter(rule => !rule.ok(password)).map(rule => rule.problem);
}
