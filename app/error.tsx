"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main-content" className="container-shell section-space" style={{ paddingTop: "12rem", minHeight: "70vh" }}><h1>We’ll be right back.</h1><p>We couldn’t load this page. Please try again shortly.</p><button className="button button-primary" onClick={reset}>Try again</button></main>; }
