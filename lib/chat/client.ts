import "server-only";
import OpenAI from "openai";

// Server-only OpenAI client. The key is read lazily inside the function, never at
// module scope, and a missing key degrades to null so the route can answer with
// its neutral "unavailable" reply instead of throwing at a visitor. The
// `server-only` import makes an accidental client-side import a build error,
// which is what keeps OPENAI_API_KEY out of the browser bundle.

// The model behind the assistant. The whole knowledge base and the live menu are
// sent on every request, so the job is exact retrieval from several thousand
// tokens of context in which menu rows differ only in their first word — three
// dishes end in "Dum Biryani" at three different prices. gpt-5.4-mini was the
// fastest candidate that stayed correct on every such probe (see the Amrit
// portfolio assistant, which measured gpt-5.4-nano, gpt-5.4-mini, gpt-4.1-mini
// and gpt-5.5 against that exact case before settling here).
export const CHAT_MODEL = "gpt-5.4-mini";

// Reasoning budget. "none" and "low" measured identically on accuracy and
// time-to-first-token; "low" is kept as the cheaper insurance for the hard
// cases (the full menu, mixed questions, refusals under adversarial phrasing).
// Minimising the budget on a long grounded prompt is what broke exact retrieval
// on the previous provider. Reasoning models reject `temperature` with a 400, so
// determinism is governed by this rather than by sampling settings.
export const REASONING_EFFORT = "low" as const;

// Headroom over the longest legitimate answer (the whole menu, ~2060 tokens).
// A ceiling, not a reservation: ordinary answers stay short.
export const MAX_OUTPUT_TOKENS = 3000;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}
