// Conversation memory for the chat widget, kept in sessionStorage so a full navigation (which remounts
// the widget) does not empty a transcript the visitor can still see. Client-safe: it must not import
// lib/chat/gate.ts, whose scope lexicon reads the knowledge base and would ship it to the browser, so the
// route union below repeats gate.ts's `Cta`.
export type ChatCta = "resy" | "event" | "credit" | "order";
export type MemoryTurn = { role: "user" | "model"; text: string; cta?: ChatCta };

export const MEMORY_KEY = "angel-chat-memory-v1";
// Same limits as the widget and the server (components/chat/ChatWidget.tsx, lib/chat/validation.ts).
const MAX_TURNS = 20;
const MAX_TEXT = 8000;

const CTAS: readonly string[] = ["resy", "event", "credit", "order"];
export const isChatCta = (value: unknown): value is ChatCta => typeof value === "string" && CTAS.includes(value);

/** The turns worth keeping: newest MAX_TURNS, non-empty, bounded in size. */
export function encodeMemory(turns: MemoryTurn[]): string {
  const kept = turns
    .filter(turn => (turn.role === "user" || turn.role === "model") && typeof turn.text === "string" && turn.text.trim())
    .slice(-MAX_TURNS)
    .map(({ role, text, cta }) => ({ role, text: text.slice(0, MAX_TEXT), ...(isChatCta(cta) ? { cta } : {}) }));
  return JSON.stringify(kept);
}

/** Stored memory back into turns. Anything missing, corrupt or tampered with yields fewer turns, never an error. */
export function decodeMemory(stored: string | null | undefined): MemoryTurn[] {
  if (!stored) return [];
  let data: unknown;
  try { data = JSON.parse(stored); } catch { return []; }
  if (!Array.isArray(data)) return [];
  const turns: MemoryTurn[] = [];
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const { role, text, cta } = entry as Record<string, unknown>;
    if ((role !== "user" && role !== "model") || typeof text !== "string" || !text.trim()) continue;
    turns.push({ role, text: text.slice(0, MAX_TEXT), ...(isChatCta(cta) ? { cta } : {}) });
  }
  return turns.slice(-MAX_TURNS);
}
