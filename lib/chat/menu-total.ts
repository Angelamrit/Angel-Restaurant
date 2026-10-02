import { money } from "../menu-types.ts";

// "How much for one of everything?" is arithmetic over the live menu. It is answered from the
// menu's own prices (integer cents) instead of by the model, which cannot reliably sum dozens of
// numbers. The matcher is deliberately narrow: anything that is not clearly a request to price the
// whole menu falls through to the normal assistant.

const WORD_NUMBERS: Record<string, number> = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const MAX_QUANTITY = 20;

const PRICE_INTENT = /\b(how\s+much|total|cost|costs|price|prices|sum|add(?:ed)?\s+up|come\s+to|comes\s+to|would\s+it\s+be|bill)\b/i;
// "<count> of everything / each / every dish", or the whole/entire menu.
const WHOLE_MENU = /\b(?:(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s+(?:of\s+)?(?:everything|each|every\s+(?:single\s+)?(?:dish|item|thing)|all\s+(?:the\s+)?(?:dishes|items)))\b|\b(?:everything\s+on\s+the\s+menu|(?:whole|entire|full)\s+menu|every\s+(?:single\s+)?(?:dish|item)\s+on\s+the\s+menu|all\s+(?:the\s+)?(?:dishes|items)\s+on\s+the\s+menu|one\s+of\s+everything)\b/i;
const COUNT = /\b(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:of\s+)?(?:everything|each|every|all)\b/i;

export type MenuTotalRequest = { quantity: number };
export type MenuTotal = { dishes: number; quantity: number; totalCents: number };

/** A request to price the whole menu, or null for any other message. */
export function parseMenuTotalRequest(message: string): MenuTotalRequest | null {
  if (!PRICE_INTENT.test(message) || !WHOLE_MENU.test(message)) return null;
  const raw = COUNT.exec(message)?.[1]?.toLowerCase();
  const quantity = raw ? (WORD_NUMBERS[raw] ?? Number(raw)) : 1;
  return { quantity: Number.isInteger(quantity) && quantity >= 1 ? Math.min(quantity, MAX_QUANTITY) : 1 };
}

/** The cost of `quantity` of every dish. Integer cents throughout, so no rounding drift. */
export function menuTotal(items: { name: string; priceCents: number }[], quantity = 1): MenuTotal {
  const priced = items.filter(item => Number.isFinite(item.priceCents) && item.priceCents > 0);
  return { dishes: priced.length, quantity, totalCents: priced.reduce((sum, item) => sum + item.priceCents, 0) * quantity };
}

export function formatMenuTotal({ dishes, quantity, totalCents }: MenuTotal): string {
  if (!dishes) return "I could not find any priced dishes on the menu just now. Please try again shortly.";
  const what = quantity === 1 ? `one of every dish on the menu (${dishes} dishes)` : `${quantity} of every dish on the menu (${dishes} dishes)`;
  return `${money(totalCents)} for ${what}, before tax and tip, added up from the current menu prices.`;
}
