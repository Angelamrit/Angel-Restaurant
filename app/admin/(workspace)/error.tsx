"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="admin-panel admin-empty"><h1>We couldn’t load the workspace.</h1><p>Please try again. If this continues, ask your site administrator to check the database connection and migrations.</p><button className="admin-button" onClick={reset}>Try again</button></section>; }
