"use client";
import { track } from "@vercel/analytics";
import { sendGAEvent } from "@next/third-parties/google";
type EventName = "menu_filter" | "menu_item_click" | "chef_special_click" | "cta_click" | "contact_click" | "call_click" | "whatsapp_click";
export function trackEvent(name: EventName, properties: Record<string, string> = {}) {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin") || navigator.doNotTrack === "1") return;
  const data = { ...properties, page: window.location.pathname };
  // Local QA can observe the exact dispatched event without creating fake provider traffic.
  if (process.env.NODE_ENV !== "production") {
    window.dispatchEvent(new CustomEvent("angel:analytics", { detail: { name, properties: data } }));
    return;
  }
  try {
    track(name, data);
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) sendGAEvent("event", name, data);
  } catch { /* Analytics must never interrupt navigation or menu interactions. */ }
}
