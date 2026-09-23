import { spawnSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
mkdirSync(".data", { recursive: true });
const directory = mkdtempSync(resolve(".data", "e2e-"));
const env = { ...process.env, DATABASE_URL: "", LOCAL_DATABASE_PATH: resolve(directory, "test.sqlite"), ADMIN_ACCESS_KEY: "angel-local-e2e-only-access-key-2026", ADMIN_ORIGIN: "http://127.0.0.1:3100", BLOB_READ_WRITE_TOKEN: "", BLOB_PUBLIC_HOST: "", ANGEL_TEST_BUILD: "true", NODE_ENV: "development" as const, VERCEL: "", VERCEL_ENV: "" };
for (const mode of ["migrate", "seed"]) {
  const result = spawnSync(process.execPath, ["scripts/database.mts", mode], { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3100"], { env, stdio: "inherit" });
child.on("exit", code => process.exit(code || 0));
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
