import type { CSSProperties } from "react";
import { AnimatedNumber } from "@/components/admin/animated-number";
import { requireAdminPage } from "@/lib/admin-access";
import { getTrafficStats } from "@/lib/visitor-analytics";

const pageNames: Record<string, string> = { "/": "Home", "/menu": "Menu", "/story": "Our story", "/gallery": "The experience", "/private-dining": "Private dining", "/visit": "Visit us", "/faq": "Questions", "/press": "Press", "/privacy": "Privacy" };
// Day keys are calendar dates; reading them at UTC noon keeps the label on the same day in any server timezone.
const dayLabel = (day: string, options: Intl.DateTimeFormatOptions) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
export default async function AnalyticsPage() {
  await requireAdminPage();
  const traffic = await getTrafficStats();
  const counts: [string, number][] = [["Visitors today", traffic.visitorsToday], ["Visitors this week", traffic.visitorsThisWeek], ["Visitors this month", traffic.visitorsThisMonth], ["Total visitors", traffic.totalVisitors], ["Page views today", traffic.pageViewsToday]];
  const busiest = Math.max(1, ...traffic.daily.map(day => day.visitors));
  const ga = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return <><div className="admin-page-head"><div><p className="eyebrow">UNDERSTAND YOUR GUESTS</p><h1>Website insights</h1><p>Real activity, collected by your existing analytics providers.</p></div></div>
    <div className="admin-stats admin-stats-traffic">{counts.map(([label, value], index) => <article className="admin-panel" key={label} style={{ "--enter-order": index } as CSSProperties}><p>{label}</p><strong><AnimatedNumber value={value} /></strong></article>)}
      <article className="admin-panel" style={{ "--enter-order": counts.length } as CSSProperties}><p>Most viewed page</p><strong className="admin-stat-text">{traffic.mostViewed ? pageNames[traffic.mostViewed.path] ?? traffic.mostViewed.path : "—"}</strong><small className="admin-muted">{traffic.mostViewed ? `${traffic.mostViewed.views} view${traffic.mostViewed.views === 1 ? "" : "s"} in the last 30 days` : "No page views yet"}</small></article></div>
    <section className="admin-panel"><div className="admin-section-head"><h2>Visitors, last 7 days</h2><small className="admin-muted">Days in {traffic.timeZone.replace(/_/g, " ")} time · weeks start Monday</small></div>
      <ol className="admin-chart">{traffic.daily.map(({ day, visitors }) => <li key={day} aria-label={`${dayLabel(day, { weekday: "long", month: "short", day: "numeric" })}: ${visitors} visitor${visitors === 1 ? "" : "s"}`}><span className="admin-chart-value" aria-hidden="true">{visitors}</span><span className="admin-chart-bar" aria-hidden="true" style={{ "--bar": visitors / busiest } as CSSProperties} /><span className="admin-chart-day" aria-hidden="true">{day === traffic.today ? "Today" : dayLabel(day, { weekday: "short" })}</span></li>)}</ol>
      <p className="admin-muted">Anonymous counts from this website: one visitor per browser, using a random first-party cookie. Crawlers, administrators and browsers sending Do Not Track are not counted.</p></section>
    <section className="admin-panel"><span className="admin-badge">{ga ? "Measurement ID configured" : "Not configured"}</span><h2>Google Analytics 4</h2><p>Daily and weekly visitors, engagement and event reports appear in your GA4 property after collection starts.</p><a className="admin-button" href="https://analytics.google.com/" target="_blank" rel="noreferrer">Open Google Analytics ↗</a></section>
    <section className="admin-panel"><h2>Engagement tracking</h2><p>Public-site interactions are sent through a shared tracking function. Administrator activity is excluded. Collection runs in production and respects the browser’s Do Not Track preference.</p><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Interaction</th><th scope="col">What is recorded</th></tr></thead><tbody>{[["Menu filters", "Selected course or dietary filter; search text is never collected"], ["Chef Special previews", "Dish ID, name and category"], ["Reservations and directions", "CTA name and page path"], ["Contact interactions", "Call, email or WhatsApp link clicks"]].map(([name, detail]) => <tr key={name}><td>{name}</td><td>{detail}</td></tr>)}</tbody></table></div></section>
  </>;
}
