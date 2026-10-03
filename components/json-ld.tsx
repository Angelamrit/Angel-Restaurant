import { headers } from "next/headers";

// Per node_modules/next/dist/docs/01-app/02-guides/json-ld.md: render structured
// data with a plain <script> (not next/script) and escape "<" so a literal
// "</script>" inside string data (a dish description, a press quote) can never
// break out of the tag. This matters now that the menu JSON-LD carries dish names and descriptions
// that administrators edit in the database, not just local constants.
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
