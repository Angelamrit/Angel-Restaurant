"use client";
import { useActionState, useEffect, useRef } from "react";
import { sendEnquiry } from "@/app/private-dining/actions";
import { idleEnquiryState, OCCASIONS, type EnquiryField } from "@/lib/enquiry";
import { restaurant } from "@/lib/restaurant";

function mailtoFallback(values: Partial<Record<EnquiryField, string>> | undefined) {
  const body = [
    "Private dining enquiry",
    ...(["Name", "Email", "Phone", "Guests", "Date", "Occasion", "Message"] as const).map(
      (key) => `${key}: ${values?.[key] || "Not specified"}`
    ),
  ].join("\n\n");
  return `mailto:${restaurant.email}?subject=${encodeURIComponent("Private dining enquiry — Angel")}&body=${encodeURIComponent(body)}`;
}

function fieldError(state: typeof idleEnquiryState, field: EnquiryField) {
  return state.status === "error" ? state.fieldErrors?.[field] : undefined;
}

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(sendEnquiry, idleEnquiryState);
  // Set once the client has mounted, by mutating the hidden input directly
  // rather than via setState. Doing this with React state instead (a value
  // from Date.now() in the initial state, or a setState call inside the
  // effect) would either mismatch the server-rendered markup at hydration or
  // trigger an avoidable extra render — see react-hooks/set-state-in-effect.
  // A no-JS submission simply never gets this field filled in, and the server
  // action treats an absent/zero timestamp as "skip this check".
  const startedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  const values = state.status === "error" ? state.values : undefined;

  return (
    <form id="enquiry" className="enquiry-form" action={formAction} noValidate>
      <div className="form-intro">
        <p className="type-eyebrow">Private dining</p>
        <h2>Make it <em>an occasion.</em></h2>
        <p>Tell us about your celebration and we’ll create something unforgettable.</p>
      </div>

      {/* Honeypot: hidden from sighted and screen-reader users alike (see .enquiry-hp
          in app/site.css), left unfilled by real visitors, and checked in the
          server action. Not a substitute for the rate limit below, just cheap
          and effective against unsophisticated bots. */}
      <div className="enquiry-hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="_t" ref={startedAtRef} defaultValue={0} />

      <div className="form-grid">
        <label>
          Your name
          <input name="Name" autoComplete="name" required maxLength={100} defaultValue={values?.Name} aria-invalid={Boolean(fieldError(state, "Name"))} aria-describedby={fieldError(state, "Name") ? "err-Name" : undefined} />
          {fieldError(state, "Name") && <span className="field-error" id="err-Name" role="alert">{fieldError(state, "Name")}</span>}
        </label>
        <label>
          Email
          <input name="Email" type="email" autoComplete="email" required defaultValue={values?.Email} aria-invalid={Boolean(fieldError(state, "Email"))} aria-describedby={fieldError(state, "Email") ? "err-Email" : undefined} />
          {fieldError(state, "Email") && <span className="field-error" id="err-Email" role="alert">{fieldError(state, "Email")}</span>}
        </label>
        <label>
          Phone
          <input name="Phone" type="tel" autoComplete="tel" defaultValue={values?.Phone} aria-invalid={Boolean(fieldError(state, "Phone"))} aria-describedby={fieldError(state, "Phone") ? "err-Phone" : undefined} />
          {fieldError(state, "Phone") && <span className="field-error" id="err-Phone" role="alert">{fieldError(state, "Phone")}</span>}
        </label>
        <label>
          Guests
          <input name="Guests" type="number" min="1" max="1000" required defaultValue={values?.Guests} aria-invalid={Boolean(fieldError(state, "Guests"))} aria-describedby={fieldError(state, "Guests") ? "err-Guests" : undefined} />
          {fieldError(state, "Guests") && <span className="field-error" id="err-Guests" role="alert">{fieldError(state, "Guests")}</span>}
        </label>
        <label>
          Date
          <input name="Date" type="date" required defaultValue={values?.Date} aria-invalid={Boolean(fieldError(state, "Date"))} aria-describedby={fieldError(state, "Date") ? "err-Date" : undefined} />
          {fieldError(state, "Date") && <span className="field-error" id="err-Date" role="alert">{fieldError(state, "Date")}</span>}
        </label>
        <label>
          Occasion
          <select name="Occasion" defaultValue={values?.Occasion ?? ""}>
            <option value="" disabled>Select an occasion</option>
            {OCCASIONS.map((occasion) => <option key={occasion}>{occasion}</option>)}
          </select>
        </label>
      </div>

      <label className="full-width">
        Tell us your vision
        <textarea name="Message" rows={4} maxLength={2000} placeholder="Share your ideas, preferences, dietary needs, or special requests…" defaultValue={values?.Message} />
      </label>

      <div className="form-actions">
        <label className="consent">
          <input type="checkbox" name="Consent" required />
          <span>I agree to be contacted about this enquiry</span>
        </label>
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Book your occasion"}
        </button>
      </div>

      {state.status === "success" && (
        <div className="form-status" role="status">
          <p><strong>Your enquiry is on its way.</strong> Our team will be in touch shortly.</p>
          <p>Or contact us directly: <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> · <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a></p>
        </div>
      )}

      {state.status === "error" && state.code === "rate_limit" && (
        <div className="form-status" role="status">
          <p><strong>Too many enquiries at once.</strong> Please try again in a few minutes, or call us at <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>.</p>
        </div>
      )}

      {state.status === "error" && (state.code === "delivery" || state.code === "config") && (
        <div className="form-status" role="status">
          <p><strong>We couldn’t send this automatically.</strong> Please send it by email instead — we’ve prepared it for you.</p>
          <p><a href={mailtoFallback(state.values)}>Open a prepared email to {restaurant.email} ↗</a></p>
        </div>
      )}

      {state.status === "error" && state.code === "validation" && (
        <div className="form-status" role="status">
          <p>Please check the highlighted fields above and try again.</p>
        </div>
      )}
    </form>
  );
}
