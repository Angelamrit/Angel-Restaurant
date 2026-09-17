import type { Metadata } from "next";
import { PageIntro } from "@/components/editorial";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Privacy & terms",
  description: "How angelindianrestaurant.com handles the information you share, and the terms for using this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro
        eyebrow="The fine print"
        title="Privacy"
        italic="& terms."
        description="How this website handles the information you share with us, and the terms for using it. Last updated 17 September 2026."
      />
      <section className="legal-content container-shell" aria-label="Privacy policy and terms of use">
        <h2>What this website collects</h2>
        <p>
          The private dining enquiry form asks for your name, email, phone, party size, date, occasion, and message. This
          website does not send that information to a server or store it anywhere. Submitting the form opens a draft email
          in your own email app, addressed to {restaurant.email}; nothing is transmitted until you choose to send it.
        </p>
        <p>
          Angel does not currently use cookies, analytics, or advertising trackers on this website. If that changes, this
          page will be updated to describe what is collected and why.
        </p>
        <h2>Reservations</h2>
        <p>
          Every &ldquo;Reserve a table&rdquo; link takes you to Angel&rsquo;s Resy page. Information you provide there is
          collected by Resy under Resy&rsquo;s own privacy policy, not this website&rsquo;s. Angel does not control or
          receive that data through this site.
        </p>
        <h2>Questions about your information</h2>
        <p>
          Contact us directly at <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> or{" "}
          <a href="tel:3478480098">{restaurant.phone}</a>.
        </p>
        <h2>Website terms of use</h2>
        <p>
          This site is provided for informational purposes: menu, hours, location, and how to reach Angel. Prices, dishes,
          and hours are subject to change; please call ahead to confirm anything time-sensitive before your visit.
        </p>
        <p>
          Text, photography, and design on this website belong to Angel Indian Restaurant or its licensors and may not be
          reused without permission. This website is offered as-is, without warranty of any kind, and Angel is not liable
          for losses arising from its use. These terms are governed by the laws of the State of New York.
        </p>
        <p className="type-caption">
          This page describes how this website works. It is a plain-language starting point, not a substitute for legal
          advice tailored to Angel&rsquo;s business.
        </p>
      </section>
    </main>
  );
}
