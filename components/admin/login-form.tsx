"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <form className="admin-form" onSubmit={async event => {
    event.preventDefault(); if (pending) return; setPending(true); setError("");
    const key = new FormData(event.currentTarget).get("key");
    try { const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); router.replace("/admin/dashboard"); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not sign in."); setPending(false); }
  }}><label>Administrator access key<input name="key" type="password" required autoComplete="current-password" disabled={!configured || pending} /></label>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!configured && <p role="status">Administrator access is not configured yet. Your site administrator can enable this workspace.</p>}
    <button className="admin-button primary" disabled={!configured || pending}>{pending ? "Opening workspace…" : "Open workspace →"}</button>
  </form>;
}
