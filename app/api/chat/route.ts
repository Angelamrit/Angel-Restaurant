import { getPublicMenu } from "@/lib/menu-repository";
import { AccessError, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { InputError } from "@/lib/menu-validation";
import { gateInput, resolveCta, resolveDateIntent } from "@/lib/chat/gate";
import { resolveDate, formatDate } from "@/lib/chat/dates";
import { getEventDateStatus } from "@/lib/events";
import { buildSystemInstruction, toGeminiContents } from "@/lib/chat/prompt";
import { geminiConfig } from "@/lib/chat/client";
import { trimHistory, validateMessage } from "@/lib/chat/validation";
import { rateLimit, rateLimitKey } from "@/lib/chat/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The upstream call below is given 30 seconds; without this the platform's own
// shorter default would kill the function first and truncate a streamed answer.
export const maxDuration = 30;

const encoder = new TextEncoder();
const UNAVAILABLE = "Please try again shortly.";
// Headroom over the longest legitimate answer (the whole menu, ~2060 tokens).
const MAX_OUTPUT_TOKENS = 3000;
// If the model still runs out of room, say so instead of stopping mid-word.
const TRUNCATED_NOTE = "\n\nThat is as much as I can list in one reply — ask me about a particular part of the menu and I will go through it.";
// Event-date answers are composed here rather than by the model. The status is a
// database fact, and a generated sentence could soften or overstate it; these
// are fixed strings built from the looked-up status and nothing else.
const EVENT_DATE_REPLY = {
  reserved: (date: string) => `${date} is already reserved for an event. If you would like to look at another date, send an event enquiry and the team will follow up.`,
  not_reserved: (date: string) => `I do not have a reserved event recorded for ${date}. That is not a confirmation — send an event enquiry and the team will confirm it with you.`,
  unknown: () => "I cannot confirm that date right now. Send an event enquiry and the restaurant team will follow up with you.",
} as const;
const EVENT_DATE_CLARIFY = "Which month are you thinking of? Give me the full date and I can check whether an event is already held then.";
// The wording fits an ordinary table or a private event equally well, so the
// assistant asks rather than picking one. No database is read and no booking
// route is offered until the visitor says which they mean.
const BOOKING_KIND_CLARIFY = "Are you asking about a regular table or an event?";
// Which onward route the answer offers: "resy" for an ordinary table, "event"
// for a celebration or private-event enquiry the restaurant team handles
// through the existing form, "credit" for a website-credit question. Carried
// on the failure paths too, so neither route disappears when the model is
// unavailable.
type Cta = "resy" | "event" | "credit" | undefined;
const ctaHeader = (cta: Cta): Record<string, string> => (cta ? { "x-chat-cta": cta } : {});

// User-facing envelope. Distinct from apiError()'s `{ error }` shape because the
// widget renders these as ordinary assistant replies rather than failures: a
// blocked question is a normal outcome, not a broken request.
function gateResponse(message: string, gate: string, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify({ type: "gate", message, gate }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

function streamText(response: Response, cta: Cta) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Gemini returned no stream.");
  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let buffer = "";
      let truncated = false;
      const emit = (line: string) => {
        if (!line.startsWith("data:")) return;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;
        const json = JSON.parse(payload) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }> };
        const candidate = json.candidates?.[0];
        // Gemini reports the stop reason on the final chunk. Without reading it
        // a capped answer simply ends mid-word and looks broken.
        if (candidate?.finishReason === "MAX_TOKENS") truncated = true;
        const text = candidate?.content?.parts?.map((part) => part.text || "").join("") || "";
        if (text) controller.enqueue(encoder.encode(text));
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) emit(line);
          if (done) break;
        }
        if (buffer.trim()) emit(buffer);
        if (truncated) controller.enqueue(encoder.encode(TRUNCATED_NOTE));
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
  // The reservation verdict is computed server-side alongside the gate, so the
  // browser never needs the KB-backed intent matcher. A header carries it
  // because the body itself is the streamed answer.
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      ...ctaHeader(cta),
    },
  });
}

export async function POST(request: Request) {
  // Hoisted so every failure path below can still hand back the booking route.
  let cta: Cta;
  try {
    // Public endpoint, so there is no admin cookie to check. Browsers always send
    // Origin on a POST, so the shared same-origin check is what keeps a metered
    // API key from being driven cross-site.
    sameOrigin(request);

    if (!(await rateLimit(rateLimitKey(request)))) return gateResponse(UNAVAILABLE, "rate_limit", 429, { "Retry-After": "60" });

    // readJson() enforces the same 20 KB bounded body as every other route here,
    // rejecting an oversized payload before it is buffered or parsed.
    const body = await readJson(request) as { message?: unknown; history?: unknown };
    let message: string;
    try { message = validateMessage(body.message); } catch { throw new InputError("Please send a message."); }
    const history = trimHistory(body.history);

    const gate = gateInput(message, history);
    if (!gate.allowed) return gateResponse(gate.message, gate.kind, 200, { "x-chat-gate": gate.kind });

    cta = resolveCta(message, history);

    // Event date questions are answered from the event database, not by the
    // model. resolveDateIntent keeps ordinary table talk out of this branch and
    // on its existing Resy route.
    const dateIntent = resolveDateIntent(message, history);
    // "What about October 15?" inside a table thread is still a table request.
    // It names no table of its own, so resolveCta finds no reservation wording
    // and returns nothing — without this the visitor is told to use Resy and
    // given no way to get there.
    if (!cta && dateIntent === "table") cta = "resy";
    // Ambiguous between a table and an event: ask, read nothing, offer nothing.
    if (dateIntent === "clarify") return gateResponse(BOOKING_KIND_CLARIFY, "date_intent_clarify");
    if (dateIntent === "event") {
      const priorUserText = history.filter((turn) => turn.role === "user").map((turn) => turn.text);
      const resolved = resolveDate(message, priorUserText);
      if (resolved.kind === "ambiguous") {
        return gateResponse(EVENT_DATE_CLARIFY, `event_date_${resolved.reason}`, 200, ctaHeader("event"));
      }
      if (resolved.kind === "date") {
        // Only a status crosses this boundary — never a row, an id or a name.
        const { status } = await getEventDateStatus(resolved.iso);
        const reply = status === "unknown"
          ? EVENT_DATE_REPLY.unknown()
          : EVENT_DATE_REPLY[status](formatDate(resolved.iso));
        return gateResponse(reply, `event_date_${status}`, 200, ctaHeader("event"));
      }
    }

    const config = geminiConfig();
    if (!config) return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));

    const menu = await getPublicMenu();
    const promptMenu = { sections: menu.sections.map((section) => ({ title: section.title, kicker: section.kicker, items: section.items.map((item) => ({ name: item.name, price: item.price, description: item.description, vegetarian: item.vegetarian, vegan: item.vegan, tag: item.tag, chefSpecial: item.type === "chef-special", featured: item.featured, featuredDescription: item.featuredDescription })) })) };
    const contents = toGeminiContents(history, message);
    // The key travels in a header rather than the query string, so it cannot be
    // captured by proxy logs or surface in an error carrying the request URL.
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(promptMenu) }] },
        contents,
        // The full menu is 84 dishes and needs ~2060 output tokens to list in
        // full; at 700 the answer stopped mid-price after 28 of them. This is a
        // ceiling, not a reservation — ordinary answers stay short, so raising
        // it costs nothing for them.
        generationConfig: { temperature: 0.2, maxOutputTokens: MAX_OUTPUT_TOKENS, thinkingConfig: { thinkingLevel: "MINIMAL" } },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("Gemini chat error", upstream.status, detail.slice(0, 500));
      return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));
    }

    return streamText(upstream, cta);
  } catch (error) {
    // Rejected origin, oversized body and malformed JSON are request faults and
    // answer in the repository's standard `{ error }` shape; anything else stays
    // a neutral in-conversation reply so the widget never leaks internals.
    if (error instanceof AccessError || error instanceof InputError || error instanceof SyntaxError) return apiError(error);
    console.error("Chat route error", error);
    return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));
  }
}
