import { requireAdminPage } from "@/lib/admin-access";
export default async function AnalyticsPage() {
  await requireAdminPage();
  const ga = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const vercel = !!process.env.VERCEL;
  return <><div className="admin-page-head"><div><p className="eyebrow">UNDERSTAND YOUR GUESTS</p><h1>Website insights</h1><p>Real activity, collected by your existing analytics providers.</p></div></div>
    <div className="admin-two"><section className="admin-panel"><span className="admin-badge">{vercel ? "Deployment detected" : "Awaiting deployment"}</span><h2>Vercel Analytics</h2><p>Visitor counts, page views, popular pages, devices and traffic trends are available in the project’s Vercel dashboard when Web Analytics is enabled.</p><a className="admin-button" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Open Vercel ↗</a></section>
    <section className="admin-panel"><span className="admin-badge">{ga ? "Measurement ID configured" : "Not configured"}</span><h2>Google Analytics 4</h2><p>Daily and weekly visitors, engagement and event reports appear in your GA4 property after collection starts.</p><a className="admin-button" href="https://analytics.google.com/" target="_blank" rel="noreferrer">Open Google Analytics ↗</a></section></div>
    <section className="admin-panel"><h2>Engagement tracking</h2><p>Public-site interactions are sent through a shared tracking function. Administrator activity is excluded. Collection runs in production and respects the browser’s Do Not Track preference.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Interaction</th><th scope="col">What is recorded</th></tr></thead><tbody>{[["Menu filters", "Selected course or dietary filter; search text is never collected"], ["Chef Special previews", "Dish ID, name and category"], ["Reservations and directions", "CTA name and page path"], ["Contact interactions", "Call, email or WhatsApp link clicks"]].map(([name, detail]) => <tr key={name}><td>{name}</td><td>{detail}</td></tr>)}</tbody></table></div></section>
    <section className="admin-panel admin-empty"><h2>No imported reporting data</h2><p>Connect reporting access to bring visitor counts and trends into this workspace. For now, view your reports in the provider dashboards above.</p></section>
  </>;
}
