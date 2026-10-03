import { test } from "node:test";
import assert from "node:assert/strict";
import { PASSWORD_MAX, PASSWORD_MIN, hashPassword, isPasswordHash, passwordProblems, verifyPassword } from "../lib/admin-password.ts";

const GOOD = "Tk7#mQz2$Lx9";

test("length is 8 to 16 characters, inclusive", () => {
  assert.equal(PASSWORD_MIN, 8);
  assert.equal(PASSWORD_MAX, 16);
  assert.ok(passwordProblems("Ab1#xyz").some(p => p.includes("8 to 16")), "7 characters is too short");
  assert.deepEqual(passwordProblems("Tk7#mQz2"), [], "8 characters is accepted");
  assert.deepEqual(passwordProblems("Tk7#mQz2$Lx9Bn4!"), [], "16 characters is accepted");
  assert.ok(passwordProblems("Tk7#mQz2$Lx9Bn4!x").some(p => p.includes("8 to 16")), "17 characters is too long");
  assert.ok(passwordProblems("").some(p => p.includes("8 to 16")));
});

test("every character class is required, and each missing one is named", () => {
  assert.ok(passwordProblems("tk7#mqz2$lx9").includes("Add an uppercase letter."));
  assert.ok(passwordProblems("TK7#MQZ2$LX9").includes("Add a lowercase letter."));
  assert.ok(passwordProblems("Tk#mQzx$LxBn").includes("Add a number."));
  assert.ok(passwordProblems("Tk7mQz2xLx9B").includes("Add a symbol such as ! # $ % & * ?"));
  assert.ok(passwordProblems("Tk7 mQz2 Lx9#").includes("Do not use spaces."));
  assert.ok(passwordProblems("Tk7#mQzzz9$L").some(p => p.includes("three times")));
});

test("guessable passwords are refused even when they satisfy the character rules", () => {
  for (const weak of ["Password1!", "Admin@2026x", "Angel@2026!", "Qwerty@12345", "Welcome#1Ab", "Restaurant1!"]) {
    assert.ok(passwordProblems(weak).some(p => p.includes("common words")), weak);
  }
  assert.deepEqual(passwordProblems(GOOD), []);
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
  assert.throws(() => hashPassword("Sh1!"), /8 to 16/);
  assert.throws(() => hashPassword("alllowercase"), /uppercase/);
});

test("unusable stored values never authenticate and never throw", async () => {
  for (const bad of [undefined, "", "plaintext", "scrypt:1:1:1:a:b", "scrypt:65536:8:1::", "bcrypt:65536:8:1:abc:def", "scrypt:100:8:1:AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"]) {
    assert.equal(await verifyPassword(GOOD, bad), false, String(bad));
    assert.equal(isPasswordHash(bad), false, String(bad));
  }
});
