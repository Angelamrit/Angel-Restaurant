// Creates the administrator password hash.
//
//   npm run admin:password             prints  ADMIN_PASSWORD_HASH=...  to copy into your environment
//   npm run admin:password -- --write  also puts it into .env.local (replacing any existing hash)
//
// The password is typed (hidden) twice, checked against the rules in lib/admin-password.ts (at least 8 characters with
// upper case, lower case, a number and a symbol), and only its salted hash is written. The password itself is never
// printed, stored or logged, and is never accepted on the command line, where shell history would keep it.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { hashPassword, passwordProblems, PASSWORD_MAX, PASSWORD_MIN } from "../lib/admin-password.ts";

const write = process.argv.includes("--write");

function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const { stdin } = process;
  if (!stdin.isTTY) {
    // Piped input (automation): one line per answer, nothing hidden because nothing is echoed.
    return new Promise(resolve => {
      let data = "";
      const onData = (chunk: Buffer) => {
        data += chunk.toString("utf8");
        const newline = data.indexOf("\n");
        if (newline >= 0) { stdin.off("data", onData); stdin.pause(); stdin.unshift(Buffer.from(data.slice(newline + 1))); process.stdout.write("\n"); resolve(data.slice(0, newline).replace(/\r$/, "")); }
      };
      stdin.on("data", onData); stdin.resume();
    });
  }
  return new Promise(resolve => {
    let typed = "";
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\u0003") { stdin.setRawMode(false); process.stdout.write("\n"); process.exit(130); }
        if (ch === "\r" || ch === "\n") { stdin.setRawMode(false); stdin.pause(); stdin.off("data", onData); process.stdout.write("\n"); resolve(typed); return; }
        if (ch === "\u007f" || ch === "\b") typed = typed.slice(0, -1);
        else if (ch >= " ") typed += ch;
      }
    };
    stdin.on("data", onData);
  });
}

console.log(`Choose the administrator password: at least ${PASSWORD_MIN} characters, with a letter, a number and a special character.\n`);
const password = await ask("New password: ");
const problems = passwordProblems(password);
if (problems.length) {
  console.error("\nThat password cannot be used:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
if ((await ask("Repeat it:    ")) !== password) { console.error("\nThe two entries do not match. Nothing was changed."); process.exit(1); }

const line = `ADMIN_PASSWORD_HASH=${hashPassword(password)}`;
if (write) {
  const file = ".env.local";
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  const eol = current.includes("\r\n") ? "\r\n" : "\n";
  const lines = current.split(/\r?\n/);
  const at = lines.findIndex(entry => entry.startsWith("ADMIN_PASSWORD_HASH="));
  if (at >= 0) lines[at] = line; else { if (lines.at(-1) === "") lines.pop(); lines.push(line, ""); }
  writeFileSync(file, lines.join(eol));
  console.log(`\nSaved to ${file}. Restart the server to use it.`);
} else {
  console.log(`\nAdd this line to your environment (.env.local, or the server's environment file), then restart:\n\n${line}\n`);
}
console.log("ADMIN_ACCESS_KEY is ignored from now on and can be removed from the environment.");
