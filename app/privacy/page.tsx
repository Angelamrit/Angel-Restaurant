import { PageIntro } from "@/components/editorial";
import { restaurant } from "@/lib/restaurant";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy & Terms",
  description: "How angelindianrestaurant.com handles the information you share, uses analytics, and the terms for using this website.",
  path: "/privacy",
});
const breadcrumbs = breadcrumbList([{ name: "Privacy & terms", path: "/privacy" }]);

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro
        eyebrow="The fine print"
        title="Privacy"
        italic="& terms."
        description="How this website handles the information you share with us, and the terms for using it. Last updated 18 September 2026."
      />
      <section className="surface-dark tone-dark section" aria-label="Privacy policy and terms of use"><div className="legal-content container-shell">
        <h2>What this website collects</h2>
        <p>
          The private dining enquiry form asks for your name, email, phone, party size, date, occasion, and message. When
          you submit it, that information is sent securely to our email delivery provider, Resend, and emailed to our
          team at {restaurant.email} so we can respond to your enquiry. We do not sell or share this information with
          anyone else, and we use it only to respond to your enquiry.
        </p>
        <p>
          This website uses Google Analytics and Vercel Analytics to understand how visitors use the site, such as which
          pages are viewed and roughly how many people visit. These tools use cookies or similar technology and collect
          information like your approximate location, device and browser type, and the pages you view; they do not
          collect your name or contact details unless you choose to give them to us through the enquiry form. You can
          block this kind of tracking using your browser&rsquo;s privacy settings or an ad blocker without affecting your
          ability to use the site.
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
          <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>.
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
      </div></section>
    </main>
  );
}
