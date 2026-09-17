"use client";
import { useState, type FormEvent } from "react";
import { restaurant } from "@/lib/restaurant";

export function EnquiryForm() {
  const [prepared, setPrepared] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = ["Private dining enquiry", ...["Name", "Email", "Phone", "Guests", "Date", "Occasion", "Message"].map((key) => `${key}: ${data.get(key) || "Not specified"}`)].join("\n\n");
    window.location.href = `mailto:${restaurant.email}?subject=${encodeURIComponent("Private dining enquiry — Angel")}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="form-intro">
        <p className="type-eyebrow">Private dining</p>
        <h2>Make it <em>an occasion.</em></h2>
        <p>Tell us about your celebration and we’ll create something unforgettable.</p>
      </div>

      <div className="form-grid">
        <label>
          Your name
          <input name="Name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          Email
          <input name="Email" type="email" autoComplete="email" required />
        </label>
        <label>
          Phone
          <input name="Phone" type="tel" autoComplete="tel" />
        </label>
        <label>
          Guests
          <input name="Guests" type="number" min="1" max="1000" required />
        </label>
        <label>
          Date
          <input name="Date" type="date" required />
        </label>
        <label>
          Occasion
          <select name="Occasion" defaultValue="">
            <option value="" disabled>Select an occasion</option>
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Engagement</option>
            <option>Wedding</option>
            <option>Corporate event</option>
            <option>Family gathering</option>
            <option>Other celebration</option>
          </select>
        </label>
      </div>

      <label className="full-width">
        Tell us your vision
        <textarea name="Message" rows={4} maxLength={2000} placeholder="Share your ideas, preferences, dietary needs, or special requests…" />
      </label>

      <div className="form-actions">
        <label className="consent">
          <input type="checkbox" required />
          <span>I agree to be contacted about this enquiry</span>
        </label>
        <button className="button button-primary" type="submit">Book your occasion</button>
      </div>

      {prepared && (
        <div className="form-status" role="status">
          <p><strong>Your enquiry is ready.</strong> Check your email app for the draft message.</p>
          <p>Or contact us: <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
        </div>
      )}
    </form>
  );
}
