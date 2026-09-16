"use client";
import { useState, type FormEvent } from "react";
import { restaurant } from "@/lib/restaurant";

export function EnquiryForm() {
  const [prepared, setPrepared] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = ["Private dining enquiry", ...["Name", "Email", "Phone", "Guests", "Date", "Occasion", "Message"].map((key) => `${key}: ${data.get(key) || "Not specified"}`)].join("\n\n");
    window.location.href = `mailto:${restaurant.email}?subject=${encodeURIComponent("Private dining enquiry — Angel")}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }

  return (
    <form className="enquiry-form luxury-occasion" onSubmit={submit}>
      <div className="form-header">
        <p className="type-eyebrow">Private dining</p>
        <h2>Make it <em>an occasion.</em></h2>
        <p className="form-description">Celebrate life's special moments at Angel. Share your vision with our team—we'll craft an unforgettable experience.</p>
      </div>

      <div className="form-section">
        <fieldset>
          <legend className="form-legend">Your details</legend>
          <div className="form-grid">
            <label className={`form-label ${focused === 'name' ? 'is-focused' : ''}`}>
              <span>Your name</span>
              <input
                name="Name"
                autoComplete="name"
                required
                maxLength={100}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
            </label>
            <label className={`form-label ${focused === 'email' ? 'is-focused' : ''}`}>
              <span>Email address</span>
              <input
                name="Email"
                type="email"
                autoComplete="email"
                required
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </label>
            <label className={`form-label ${focused === 'phone' ? 'is-focused' : ''}`}>
              <span>Phone number</span>
              <input
                name="Phone"
                type="tel"
                autoComplete="tel"
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
              />
            </label>
            <label className={`form-label ${focused === 'guests' ? 'is-focused' : ''}`}>
              <span>Number of guests</span>
              <input
                name="Guests"
                type="number"
                min="1"
                max="1000"
                required
                onFocus={() => setFocused('guests')}
                onBlur={() => setFocused(null)}
              />
            </label>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend className="form-legend">The occasion</legend>
          <div className="form-occasion-grid">
            <label className={`form-label ${focused === 'date' ? 'is-focused' : ''}`}>
              <span>Preferred date</span>
              <input
                name="Date"
                type="date"
                required
                onFocus={() => setFocused('date')}
                onBlur={() => setFocused(null)}
              />
            </label>
            <label className={`form-label occasion-select ${focused === 'occasion' ? 'is-focused' : ''}`}>
              <span>What are we celebrating?</span>
              <select
                name="Occasion"
                defaultValue=""
                onFocus={() => setFocused('occasion')}
                onBlur={() => setFocused(null)}
              >
                <option value="" disabled>Select an occasion</option>
                <option>Birthday celebration</option>
                <option>Anniversary</option>
                <option>Engagement</option>
                <option>Wedding reception</option>
                <option>Corporate gathering</option>
                <option>Family reunion</option>
                <option>Milestone celebration</option>
                <option>Other special occasion</option>
              </select>
            </label>
          </div>
        </fieldset>
      </div>

      <div className="form-section">
        <fieldset>
          <legend className="form-legend">Your vision</legend>
          <label className={`form-label full-width ${focused === 'message' ? 'is-focused' : ''}`}>
            <span>Tell us about your plans</span>
            <textarea
              name="Message"
              rows={4}
              maxLength={2000}
              placeholder="Group composition, dietary requirements, atmosphere preferences, special requests…"
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused(null)}
            />
            <span className="char-count"><span className="count">0</span>/2000</span>
          </label>
        </fieldset>
      </div>

      <div className="form-footer">
        <label className="consent">
          <input type="checkbox" required />
          <span>I agree to be contacted by Angel about this enquiry.</span>
        </label>
        <button className="button button-primary button-lg" type="submit">
          Begin your occasion <span aria-hidden="true">✨</span>
        </button>
      </div>

      {prepared && (
        <div className="form-status success" role="status">
          <p><strong>Your enquiry is ready.</strong> Your email app is opening a draft message. If it doesn't appear, you can contact our team directly:</p>
          <p><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> · <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
        </div>
      )}
    </form>
  );
}
