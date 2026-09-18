import Link from "next/link";
import { PageIntro, Reservation } from "@/components/editorial";
import { VisitSection } from "@/components/neighborhood-map";
import { restaurant } from "@/lib/restaurant";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Hours, Address & Directions", description: "Angel Indian Restaurant, 75-18 37th Ave, Jackson Heights, NY 11372. Open Tue–Sun 12–10 PM. 74 St–Broadway (7/E/F/M/R). Call 347-848-0098.", path: "/visit" });
const breadcrumbs = breadcrumbList([{ name: "Visit us", path: "/visit" }]);
export default function VisitPage() { return <main id="main-content" tabIndex={-1}><JsonLd data={breadcrumbs} /><PageIntro eyebrow="Make your way to Angel" title="A table worth" italic="coming together for." /><VisitSection /><section className="contact-section container-shell" data-reveal><div><p className="type-eyebrow">A question before your visit?</p><h2>Let’s <em>talk.</em></h2></div><div><a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a><p>For parking, access, or dietary questions, please contact our team before your visit.</p><p>Planning an event? <Link className="text-link" href="/private-dining#enquiry">Send an enquiry ↗</Link></p><Link className="text-link" href="/faq">Frequently asked questions ↗</Link></div></section><Reservation /></main>; }
