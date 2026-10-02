"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
const subscribe = () => () => {};
const clientSnapshot = () => navigator.doNotTrack !== "1";
const serverSnapshot = () => false;

// The ~90 KB Google tag mounts once the page has finished loading and the browser is idle
// (or 4s at the latest), so it does not compete with hydration and first paint on slow
// phones. Page views are counted by the site's own anonymous counter (components/page-view-tracker.tsx).
function useAfterLoadIdle() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setReady(true), { timeout: 4000 });
      else timer = window.setTimeout(() => setReady(true), 1500);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idle) w.cancelIdleCallback?.(idle);
      if (timer) clearTimeout(timer);
    };
  }, []);
  return ready;
}

export function AnalyticsProviders({ gaId, nonce }: { gaId?: string; nonce?: string }) {
  const enabled = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const ready = useAfterLoadIdle();
  useEffect(() => {
    if (!gaId) return;
    const browser = window as unknown as Record<string, unknown>;
    browser[`ga-disable-${gaId}`] = !enabled;
    return () => { browser[`ga-disable-${gaId}`] = true; };
  }, [gaId, enabled]);
  return enabled && gaId && ready ? <GoogleAnalytics gaId={gaId} nonce={nonce} /> : null;
}
