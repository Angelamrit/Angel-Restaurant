// Per node_modules/next/dist/docs/01-app/02-guides/json-ld.md: render structured
// data with a plain <script> (not next/script) and escape "<" so a literal
// "</script>" inside string data (a dish description, a press quote) can never
// break out of the tag. Safe today because all JSON-LD sources are local
// constants, but cheap enough to always do.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
