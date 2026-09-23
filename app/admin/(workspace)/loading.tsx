export default function Loading() {
  return <div className="admin-loading" aria-busy="true" role="status"><div className="admin-page-head"><p>Loading workspace…</p></div><div aria-hidden="true"><div className="admin-stats">{[1,2,3,4,5].map(n => <div className="admin-panel admin-skeleton" key={n} />)}</div><div className="admin-two"><div className="admin-panel admin-skeleton admin-skeleton-tall" /><div className="admin-panel admin-skeleton admin-skeleton-tall" /></div></div></div>;
}
