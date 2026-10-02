"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// One anonymous page view per pathname, for direct loads and client-side navigation alike. Sent after the page has
// loaded and the browser is idle, so it never competes with rendering. The server assigns the visitor cookie.
let queue: Promise<unknown> = Promise.resolve();
let firstView = true;

export function PageViewTracker() {
  const pathname = usePathname();
  // Re-renders and React's development double-run of effects keep this ref, so each path is sent once.
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;
    if (navigator.doNotTrack === "1") return;
    // Only a full page load has a meaningful external referrer; client-side navigations would repeat it.
    const referrer = firstView ? document.referrer : "";
    firstView = false;
    const body = JSON.stringify({ path: pathname, referrer });
    // Chained so a brand-new visitor's second view waits for the first response, which sets the cookie.
    const send = () => { queue = queue.then(() => fetch("/api/analytics/view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })).catch(() => {}); };
    const whenIdle = () => {
      // Safari has no requestIdleCallback.
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(send, { timeout: 3000 });
      else setTimeout(send, 1000);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
  }, [pathname]);

  return null;
}
