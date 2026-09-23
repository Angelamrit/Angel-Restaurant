"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Refresh on returning to a previously opened menu; no polling or stale client snapshot.
export function MenuRefresh() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [router]);
  return null;
}
