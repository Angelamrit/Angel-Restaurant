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
