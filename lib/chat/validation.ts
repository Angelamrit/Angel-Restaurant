import { InputError } from "../menu-validation.ts";

export type ChatRole = "user" | "model";
export type ChatTurn = { role: ChatRole; text: string };

const MAX_MESSAGE = 1200;
const MAX_TURNS = 20;
// There is no server-side session: the client posts the whole conversation on
// every request, so history is UNTRUSTED INPUT rather than a record of what was
// actually said. A caller can fabricate turns of either role.
//
// The intent machinery is already immune to that — gateInput, resolveCta and
// resolveDateIntent all read `role === "user"` turns only, so a forged assistant
// turn cannot steer routing. The one place forged text still lands is the
// conversation handed to the model, where an assistant turn carries implicit
// authority. That is bounded here and neutralised in lib/chat/gate.ts.
const MAX_HISTORY_CHARS = 8000;

export function validateMessage(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid message.");
  const text = value.trim();
  if (!text || text.length > MAX_MESSAGE) throw new Error("Invalid message.");
  return text;
}

export function parseChatRequest(value: unknown): { message: string; history: ChatTurn[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError("Please send a message.");
  }
  const body = value as { message?: unknown; history?: unknown };
  let message: string;
  try {
    message = validateMessage(body.message);
  } catch {
    throw new InputError("Please send a message.");
  }
  return { message, history: trimHistory(body.history) };
}

export function trimHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  const turns = value.flatMap((turn) => {
    if (!turn || typeof turn !== "object") return [];
    const role = (turn as { role?: unknown }).role;
    const text = (turn as { text?: unknown }).text;
    if ((role !== "user" && role !== "model") || typeof text !== "string") return [];
    const clean = text.trim();
    if (!clean || clean.length > MAX_MESSAGE) return [];
    return [{ role, text: clean } as ChatTurn];
  });

  // Newest-first budget, so a long conversation keeps the turns that matter and
  // an oversized one cannot push the knowledge base out of the model's window.
  // Independent of readJson's 20 KB body cap: this bounds what is forwarded,
  // not merely what is accepted.
  const recent = turns.slice(-MAX_TURNS);
  const bounded: ChatTurn[] = [];
  let budget = MAX_HISTORY_CHARS;
  for (let index = recent.length - 1; index >= 0; index--) {
    budget -= recent[index].text.length;
    if (budget < 0) break;
    bounded.unshift(recent[index]);
  }
  return bounded;
}

export { MAX_MESSAGE, MAX_TURNS, MAX_HISTORY_CHARS };
