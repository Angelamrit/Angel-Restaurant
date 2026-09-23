import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="surface-dark tone-dark section">
      <div className="container-shell simple-page">
        <p className="eyebrow eyebrow-rule">404 / A little off the menu</p>
        <h1 className="display-xl">Let’s get you<br /><em>back to Angel.</em></h1>
        <p className="lede">We couldn’t find that page.</p>
        <div className="button-row"><Link className="button button-primary" href="/"><span>Return home</span><span className="button-icon" aria-hidden="true">↗</span></Link></div>
      </div>
    </main>
  );
}
