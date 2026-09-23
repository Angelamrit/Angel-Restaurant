import type { CSSProperties } from "react";

// Rotating text-ring monogram: the chef-site badge. A ring of small caps turns
// slowly around a frosted disc carrying the "A". Decorative, always aria-hidden.
export function Badge({ text = "Michelin Bib Gourmand · Angel · Est. 2019 · ", size = "11rem", className = "" }: { text?: string; size?: string; className?: string }) {
  return (
    <div className={`badge ${className}`} style={{ "--badge-size": size } as CSSProperties} aria-hidden="true">
      <span className="badge-glow" />
      <svg className="badge-ring" viewBox="0 0 100 100" focusable="false">
        <defs><path id={`badge-ring-${text.length}`} d="M50 50 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <text><textPath href={`#badge-ring-${text.length}`} textLength="276" lengthAdjust="spacing">{text.toUpperCase()}</textPath></text>
      </svg>
      <span className="badge-line" />
      <span className="badge-disc" />
      <span className="badge-letter">A</span>
    </div>
  );
}

// Rising gold embers. Positions and delays are derived from the index so the
// server and client render identical markup (no Math.random at render time).
export function Embers({ count = 16, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`embers ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const x = ((index * 61) % 97) + 1;
        const delay = (index * 0.7) % 9;
        const size = index % 3 === 0 ? 6 : 4;
        const drift = ((index * 37) % 80) - 40;
        return <span key={index} style={{ "--x": `${x}%`, "--d": `${delay}s`, "--s": `${size}px`, "--drift": `${drift}px` } as CSSProperties} />;
      })}
    </div>
  );
}
