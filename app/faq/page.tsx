import type { Metadata } from "next";
import { PageIntro, Reservation } from "@/components/editorial";
import { faqs } from "@/lib/restaurant";
export const metadata: Metadata = { title: "Questions & answers", description: "Reservations, hours, halal food, vegetarian options, private events, and how to find Angel Indian Restaurant in Jackson Heights, Queens.", alternates: { canonical: "/faq" } };
export default function FAQPage() { return <main id="main-content" tabIndex={-1}><PageIntro eyebrow="Before you join us" title="A few" italic="good answers." /><section className="faq-list container-shell" aria-label="Frequently asked questions">{faqs.map(([question, answer], index) => <details key={question}><summary><span className="type-caption">0{index + 1}</span>{question}<span className="faq-icon" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</section><Reservation /></main>; }
