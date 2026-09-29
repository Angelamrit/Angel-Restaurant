// Splits knowledge-base facts into the half a visitor may hear and the half
// addressed to the assistant.
//
// Some entries carry a sentence aimed at the model rather than the reader
// ("Do not describe it as a Michelin star.", "... are not published in the
// source material and must not be invented."). Left inline among the facts they
// read as things to say, and the model paraphrased them back: a visitor asking
// about private dining was told capacity is "not published in the source
// material". Separating them here keeps the knowledge base itself untouched.
//
// Pure, and free of `server-only`, so tests/chat-safety.test.mts can load it
// under plain `node --test` — the same reasoning as lib/chat/kb.ts.
// Explicit extension for that loader.
import { kb } from "./kb.ts";

const DIRECTIVE = /^(?:do not|never)\b/i;
// Wording that describes where information does or does not come from. A
// visitor should never hear how the assistant is sourced.
const INTERNAL_PROVENANCE = /\bmust not\b|source material|supplied knowledge/i;

export const isDirectiveSentence = (sentence: string): boolean =>
  DIRECTIVE.test(sentence.trim()) || INTERNAL_PROVENANCE.test(sentence);

export type SplitFacts = { facts: string; rules: string };

export function splitFacts(): SplitFacts {
  const visible: string[] = [];
  const rules: string[] = [];
  for (const fact of kb.facts.filter((entry) => entry.status === "confirmed")) {
    const said = fact.body.split(/(?<=\.)\s+/).filter((sentence) => {
      if (!isDirectiveSentence(sentence)) return true;
      rules.push(`- ${fact.topic}: ${sentence.trim()}`);
      return false;
    });
    const body = said.join(" ").trim();
    if (body) visible.push(`- ${fact.topic}: ${body}`);
  }
  return { facts: visible.join("\n"), rules: rules.join("\n") };
}
