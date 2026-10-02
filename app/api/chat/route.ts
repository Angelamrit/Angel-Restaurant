import { getPublicMenu } from "@/lib/menu-repository";
import { AccessError, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { InputError } from "@/lib/menu-validation";
import { gateInput, resolveCta, resolveDateIntent, type Cta } from "@/lib/chat/gate";
import { resolveDate, formatDate } from "@/lib/chat/dates";
import { getEventDateStatus } from "@/lib/events";
import { buildSystemInstruction, toResponsesInput } from "@/lib/chat/prompt";
import { CHAT_MODEL, MAX_OUTPUT_TOKENS, REASONING_EFFORT, getOpenAIClient } from "@/lib/chat/client";
import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import { formatMenuTotal, menuTotal, parseMenuTotalRequest } from "@/lib/chat/menu-total";
import { trimHistory, validateMessage } from "@/lib/chat/validation";
import { rateLimit, rateLimitKey } from "@/lib/chat/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The upstream call below is given 30 seconds; without this the platform's own
// shorter default would kill the function first and truncate a streamed answer.
export const maxDuration = 30;

const encoder = new TextEncoder();
const UNAVAILABLE = "Please try again shortly.";
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
// through the existing form, "credit" for a website-credit question, "order"
// for a food order through one of the approved platforms. Carried on the failure
// paths too, so no route disappears when the model is unavailable.
type Route = Cta | undefined;
const ctaHeader = (cta: Route): Record<string, string> => (cta ? { "x-chat-cta": cta } : {});

// User-facing envelope. Distinct from apiError()'s `{ error }` shape because the
// widget renders these as ordinary assistant replies rather than failures: a
// blocked question is a normal outcome, not a broken request.
function gateResponse(message: string, gate: string, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify({ type: "gate", message, gate }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

function streamText(stream: AsyncIterable<ResponseStreamEvent>, cta: Route) {
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Set from the terminal event rather than inferred: the API says so
      // explicitly when the answer was cut at the token ceiling. Without reading
      // it a capped answer simply ends mid-word and looks broken.
      let truncated = false;
      try {
        for await (const event of stream) {
          // Each text delta is forwarded the moment it arrives. Collecting them
          // first would add the whole generation to the visible wait.
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(event.delta));
          } else if (event.type === "response.incomplete") {
            truncated = event.response.incomplete_details?.reason === "max_output_tokens";
          }
        }
        if (truncated) controller.enqueue(encoder.encode(TRUNCATED_NOTE));
        controller.close();
      } catch (error) {
        // A mid-stream failure must not leave the client hanging.
        console.error("Chat stream error", error);
        controller.error(error);
      }
    },
  });
  // The reservation verdict is computed server-side alongside the gate, so the
  // browser never needs the KB-backed intent matcher. A header carries it
  // because the body itself is the streamed answer.
  return new Response(body, {
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
  let cta: Route;
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

    // "How much for one of everything?" is arithmetic over the live menu, so it is
    // answered from the menu itself rather than by the model: 84 prices summed in
    // a context window is a number nobody can check. No button: it is
    // information, not a route.
    const totalRequest = parseMenuTotalRequest(message);
    if (totalRequest) {
      const priced = await getPublicMenu();
      const total = menuTotal(priced.items.map((dish) => ({ name: dish.name, priceCents: dish.priceCents })), totalRequest.quantity);
      return gateResponse(formatMenuTotal(total), "menu_total");
    }

    const client = getOpenAIClient();
    if (!client) return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));

    const menu = await getPublicMenu();
    const promptMenu = { sections: menu.sections.map((section) => ({ title: section.title, kicker: section.kicker, items: section.items.map((item) => ({ name: item.name, price: item.price, description: item.description, vegetarian: item.vegetarian, vegan: item.vegan, tag: item.tag, chefSpecial: item.type === "chef-special", featured: item.featured, featuredDescription: item.featuredDescription })) })) };
    // Either the visitor leaving or the timeout elapsing ends the generation.
    const abortSignal = AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]);
    // The key travels in the SDK's Authorization header, never a query string,
    // so it cannot be captured by proxy logs or surface in an error URL.
    const stream = await client.responses.create(
      {
        model: CHAT_MODEL,
        // The system instruction travels as `instructions`, which the Responses
        // API keeps separate from the conversation. Visitor text can therefore
        // never occupy the same channel as the rules, which is the structural
        // half of the injection defence — the deterministic gate is the other.
        // The decided route travels with the rules, never with the visitor text,
        // so the answer cannot offer a route other than the button on screen.
        instructions: buildSystemInstruction(promptMenu, cta),
        input: toResponsesInput(history, message),
        // The full menu is 84 dishes and needs ~2060 output tokens to list in
        // full; at 700 the answer stopped mid-price after 28 of them. This is a
        // ceiling, not a reservation — ordinary answers stay short, so raising
        // it costs nothing for them.
        max_output_tokens: MAX_OUTPUT_TOKENS,
        // `temperature` is not an option here — reasoning models reject it with
        // a 400 — so determinism is governed by the reasoning budget instead.
        reasoning: { effort: REASONING_EFFORT },
        // Nothing is retained on OpenAI's side. Visitors are anonymous and the
        // transcript belongs to their browser, so there is no reason to leave a
        // copy of it with a third party.
        store: false,
        stream: true,
      },
      { signal: abortSignal },
    );

    return streamText(stream, cta);
  } catch (error) {
    // Rejected origin, oversized body and malformed JSON are request faults and
    // answer in the repository's standard `{ error }` shape; anything else stays
    // a neutral in-conversation reply so the widget never leaks internals.
    if (error instanceof AccessError || error instanceof InputError || error instanceof SyntaxError) return apiError(error);
    console.error("Chat route error", error);
    return gateResponse(UNAVAILABLE, "unavailable", 200, ctaHeader(cta));
  }
}
