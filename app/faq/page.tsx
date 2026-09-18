import { PageIntro, Reservation } from "@/components/editorial";
import { faqs } from "@/lib/restaurant";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
export const metadata = pageMetadata({ title: "FAQ: Reservations, Halal, Hours & Parking", description: "Reservations, hours, halal food, vegetarian options, private events, and how to find Angel Indian Restaurant in Jackson Heights, Queens.", path: "/faq" });
const breadcrumbs = breadcrumbList([{ name: "Questions & answers", path: "/faq" }]);
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
export default function FAQPage() { return <main id="main-content" tabIndex={-1}><JsonLd data={breadcrumbs} /><JsonLd data={faqJsonLd} /><PageIntro eyebrow="Before you join us" title="A few" italic="good answers." /><section className="faq-list container-shell" aria-label="Frequently asked questions">{faqs.map(([question, answer], index) => <details key={question}><summary><span className="type-caption">0{index + 1}</span>{question}<span className="faq-icon" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</section><Reservation /></main>; }
