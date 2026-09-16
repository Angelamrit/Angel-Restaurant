import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, Reservation } from "@/components/editorial";
import { VisitSection } from "@/components/neighborhood-map";
import { restaurant } from "@/lib/restaurant";
export const metadata: Metadata = { title: "Visit us" };
export default function VisitPage() { return <main id="main-content" tabIndex={-1}><PageIntro eyebrow="Make your way to Angel" title="A table worth" italic="coming together for." /><VisitSection /><section className="contact-section container-shell" data-reveal><div><p className="type-eyebrow">A question before your visit?</p><h2>Let’s <em>talk.</em></h2></div><div><a href="tel:3478480098">{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a><p>For parking, access, or dietary questions, please contact our team before your visit.</p><Link className="text-link" href="/faq">Frequently asked questions ↗</Link></div></section><Reservation /></main>; }
