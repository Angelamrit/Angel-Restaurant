import { test } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD_MAX, PASSWORD_MIN, hashPassword, isPasswordHash, passwordProblems, verifyPassword } from "../lib/admin-password.ts";

const GOOD = "Tk7#mQz2$Lx9";

test("length is at least 8 characters", () => {
  assert.equal(PASSWORD_MIN, 8);
  assert.ok(passwordProblems("Ab1#xyz").some(p => p.includes("at least 8")), "7 characters is too short");
  assert.deepEqual(passwordProblems("Tk7#mQz2"), [], "8 characters is accepted");
  assert.deepEqual(passwordProblems("Tk7#mQz2$Lx9Bn4!x"), [], "longer than 16 is accepted");
  assert.ok(passwordProblems("A1#" + "a".repeat(PASSWORD_MAX)).some(p => p.includes("at least 8")), "absurdly long input is refused");
  assert.ok(passwordProblems("").some(p => p.includes("at least 8")));
});

test("a letter, a number and a special character are required, and each missing one is named", () => {
  assert.ok(passwordProblems("12345678#!").includes("Add a letter."));
  assert.ok(passwordProblems("Tk#mQzx$LxBn").includes("Add a number."));
  assert.ok(passwordProblems("Tk7mQz2xLx9B").includes("Add a special character such as ! # $ % & * ?"));
  assert.ok(passwordProblems("Tk7 mQz2 Lx9#").includes("Do not use spaces."));
});

test("letter case is not enforced", () => {
  assert.deepEqual(passwordProblems("tk7#mqz2$lx9"), []);
  assert.deepEqual(passwordProblems("Angel@2026"), []);
});

test("a hash verifies only the password it was made from", async () => {
  const stored = hashPassword(GOOD);
  assert.equal(await verifyPassword(GOOD, stored), true);
  assert.equal(await verifyPassword(GOOD + "x", stored), false);
  assert.equal(await verifyPassword("tk7#mqz2$lx9", stored), false, "case matters");
  assert.equal(await verifyPassword("", stored), false);
  assert.equal(await verifyPassword("A".repeat(5000), stored), false, "oversized input is refused without hashing it");
});

test("the stored value is salted, contains no plaintext, and is safe in an env file", () => {
  const a = hashPassword(GOOD), b = hashPassword(GOOD);
  assert.notEqual(a, b, "a fresh salt per hash");
  assert.ok(!a.includes(GOOD));
  assert.ok(!a.includes("$"), "dotenv would expand a $ sequence");
  assert.match(a, /^scrypt:65536:8:1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
  assert.equal(isPasswordHash(a), true);
});

test("hashing refuses a password that breaks the policy", () => {
  assert.throws(() => hashPassword("Sh1!"), /at least 8/);
  assert.throws(() => hashPassword("alllowercase"), /number/);
});

test("unusable stored values never authenticate and never throw", async () => {
  for (const bad of [undefined, "", "plaintext", "scrypt:1:1:1:a:b", "scrypt:65536:8:1::", "bcrypt:65536:8:1:abc:def", "scrypt:100:8:1:AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"]) {
    assert.equal(await verifyPassword(GOOD, bad), false, String(bad));
    assert.equal(isPasswordHash(bad), false, String(bad));
  }
});
