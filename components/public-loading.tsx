function Placeholder({ className = "" }: { className?: string }) {
  return <span className={`site-skeleton-block ${className}`} />;
}

function IntroSkeleton() {
  return (
    <section className="site-skeleton-intro" aria-hidden="true">
      <div className="container-shell site-skeleton-intro-copy">
        <Placeholder className="site-skeleton-eyebrow" />
        <Placeholder className="site-skeleton-title" />
        <Placeholder className="site-skeleton-title site-skeleton-title-short" />
        <Placeholder className="site-skeleton-copy" />
        <Placeholder className="site-skeleton-copy site-skeleton-copy-short" />
      </div>
    </section>
  );
}

export function PublicLoading({ menu = false }: { menu?: boolean }) {
  return (
    <main id="main-content" className={`site-loading${menu ? " site-loading-menu" : ""}`} tabIndex={-1} aria-busy="true">
      <p className="site-loading-status" role="status">{menu ? "Loading the menu…" : "Loading page content…"}</p>
      <IntroSkeleton />
      {menu ? (
        <section className="site-loading-menu-body container-shell" aria-hidden="true">
          <Placeholder className="site-skeleton-heading" />
          <div className="site-skeleton-controls"><Placeholder /><Placeholder /><Placeholder /><Placeholder /></div>
          <div className="site-skeleton-dishes">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="site-skeleton-dish" key={index}>
                <Placeholder className="site-skeleton-dish-title" />
                <Placeholder className="site-skeleton-dish-price" />
                <Placeholder className="site-skeleton-dish-description" />
                <Placeholder className="site-skeleton-dish-description site-skeleton-dish-description-short" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="site-loading-feature container-shell" aria-hidden="true">
          <div className="site-skeleton-feature-copy">
            <Placeholder className="site-skeleton-eyebrow" />
            <Placeholder className="site-skeleton-title" />
            <Placeholder className="site-skeleton-copy" />
            <Placeholder className="site-skeleton-copy site-skeleton-copy-short" />
          </div>
          <Placeholder className="site-skeleton-photo" />
        </section>
      )}
    </main>
  );
}
