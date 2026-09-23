import { Fragment, type CSSProperties } from "react";

// Splits a run of text into per-word spans so a heading can rise word by word
// (see `.w` / `word-in` in site.css). Server-rendered, so the words are plain
// text without JS; the stagger index lives in `--i`. `from` offsets that index
// so several runs inside one heading (around a <br /> or an <em>) keep counting
// instead of restarting the choreography mid-sentence.
//
// The separating space is emitted *between* the spans, never inside one: each
// span is an inline-block, and trailing whitespace inside an inline-block is
// trimmed at the line end, which would fuse the words together.
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ").filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${from}-${index}`}>
          <span className="w" style={{ "--i": from + index } as CSSProperties}>{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
