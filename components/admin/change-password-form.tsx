"use client";
import { useState } from "react";
import { passwordRules } from "@/lib/password-policy";

// Settings > Change password. The current password is required even though the administrator is signed in, so a
// session left open on a shared computer cannot be used to lock the owner out.
export function ChangePasswordForm({ legacy }: { legacy: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const results = passwordRules.map(rule => ({ label: rule.label, ok: rule.ok(next) }));
  const meetsRules = results.every(rule => rule.ok);
  const matches = next.length > 0 && next === repeat;
  const different = next !== current;
  const ready = !!current && meetsRules && matches && different && !pending;
  return <form className="admin-form" noValidate onSubmit={async event => {
    event.preventDefault(); if (!ready) return; setPending(true); setError(""); setDone(false);
    try {
      const response = await fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCurrent(""); setNext(""); setRepeat(""); setDone(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not change the password."); }
    finally { setPending(false); }
  }}>
    <label>{legacy ? "Current access key" : "Current password"}<input type="password" name="current" value={current} onChange={event => { setCurrent(event.target.value); setDone(false); }} autoComplete="current-password" spellCheck={false} required /></label>
    <label>New password<input type="password" name="new" value={next} onChange={event => { setNext(event.target.value); setDone(false); }} autoComplete="new-password" spellCheck={false} aria-describedby="password-rules" required /></label>
    <ul id="password-rules" className="admin-muted" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: ".2rem", fontSize: ".78rem" }}>
      {results.map(rule => <li key={rule.label} style={{ opacity: next ? 1 : .7 }}><span aria-hidden="true">{next ? (rule.ok ? "✓ " : "• ") : "• "}</span>{rule.label}<span className="sr-only">{next ? (rule.ok ? " (met)" : " (not met yet)") : ""}</span></li>)}
    </ul>
    <label>Repeat the new password<input type="password" name="repeat" value={repeat} onChange={event => { setRepeat(event.target.value); setDone(false); }} autoComplete="new-password" spellCheck={false} required /></label>
    {repeat && !matches && <p className="admin-muted" role="status">The two new passwords do not match yet.</p>}
    {next && current && !different && <p className="admin-muted" role="status">The new password must be different from the current one.</p>}
    {error && <p className="admin-error" role="alert">{error}</p>}
    {done && <p role="status">Password changed. Any other signed-in devices have been signed out, and you stay signed in here.</p>}
    <button className="admin-button primary" disabled={!ready}>{pending ? "Changing…" : "Change password"}</button>
  </form>;
}
