// Server infrastructure. Imported by the CLI as well as the server-only repository.
import postgres from "postgres";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";

type Value = string | number | null;
type Row = Record<string, unknown>;
const state = globalThis as typeof globalThis & { angelSql?: ReturnType<typeof postgres>; angelLocal?: DatabaseSync };

export async function query<T extends Row = Row>(text: string, values: Value[] = []): Promise<T[]> {
  if (process.env.DATABASE_URL) {
    state.angelSql ??= postgres(process.env.DATABASE_URL, { max: Number(process.env.DB_POOL_MAX || 3), prepare: false, idle_timeout: 20, connect_timeout: 10 });
    let index = 0;
    const statement = text.replace(/\?/g, () => `$${++index}`);
    return await state.angelSql.unsafe(statement, values) as unknown as T[];
  }
  if (process.env.VERCEL || (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_DATABASE !== "true")) {
    throw new Error("DATABASE_URL is required for production.");
  }
  if (!state.angelLocal) {
    const { DatabaseSync } = await import("node:sqlite");
    const filename = resolve(/* turbopackIgnore: true */ process.env.LOCAL_DATABASE_PATH || ".data/angel.sqlite");
    mkdirSync(dirname(filename), { recursive: true });
    state.angelLocal = new DatabaseSync(filename);
    state.angelLocal.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  }
  return state.angelLocal.prepare(text).all(...values) as T[];
}

export async function closeDatabase() {
  await state.angelSql?.end();
  state.angelLocal?.close();
  delete state.angelSql;
  delete state.angelLocal;
}
