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
  return <form className="enquiry-form" onSubmit={submit}><h2>Make it <em>an occasion.</em></h2><p>Tell us a little about your plans. This prepares an email to our team; send it from your email app to complete your enquiry.</p><div className="form-grid"><label>Your name<input name="Name" autoComplete="name" required maxLength={100} /></label><label>Email address<input name="Email" type="email" autoComplete="email" required /></label><label>Phone number<input name="Phone" type="tel" autoComplete="tel" /></label><label>Number of guests<input name="Guests" type="number" min="1" max="1000" required /></label><label>Preferred date<input name="Date" type="date" required /></label><label>Occasion<select name="Occasion" defaultValue=""><option value="" disabled>Select an occasion</option><option>Birthday</option><option>Company dinner</option><option>Family gathering</option><option>Other celebration</option></select></label></div><label>Your plans<textarea name="Message" rows={4} maxLength={2000} placeholder="Tell us what you have in mind…" /></label><label className="consent"><input type="checkbox" required />I agree to be contacted by Angel about this enquiry.</label><button className="button button-primary" type="submit">Prepare enquiry email ↗</button>{prepared && <p role="status">Your email draft is ready to open. Nothing has been sent by this website. If your email app did not open, contact <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> or call {restaurant.phone}.</p>}</form>;
}
