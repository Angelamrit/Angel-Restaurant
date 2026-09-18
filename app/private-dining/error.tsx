"use client";

import { restaurant } from "@/lib/restaurant";

// Server Action IDs are per-build (node_modules/next/dist/docs/01-app/02-guides/server-actions.md,
// "Deployment considerations"): a tab left open across a deploy can submit the
// enquiry form with an ID the new build doesn't recognize and throw here. A
// plain refresh re-fetches the current build's markup and IDs and resolves it,
// so that's the only actionable step to offer.
export default function PrivateDiningError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="container-shell section-space">
      <p className="type-eyebrow">Something went astray</p>
      <h1>Let’s try that<br /><em>again.</em></h1>
      <p className="my-8">
        This page may have updated since you opened it. Please refresh and try your enquiry again, or call us directly
        at <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>.
      </p>
      <button className="button button-primary" type="button" onClick={reset}>
        Try again ↗
      </button>
    </main>
  );
}
