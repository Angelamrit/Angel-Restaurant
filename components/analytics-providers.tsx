"use client";
import { useEffect, useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
const subscribe = () => () => {};
const clientSnapshot = () => navigator.doNotTrack !== "1";
const serverSnapshot = () => false;
export function AnalyticsProviders({ gaId }: { gaId?: string }) {
  const enabled = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  useEffect(() => {
    if (!gaId) return;
    const browser = window as unknown as Record<string, unknown>;
    browser[`ga-disable-${gaId}`] = !enabled;
    return () => { browser[`ga-disable-${gaId}`] = true; };
  }, [gaId, enabled]);
  return enabled ? <><Analytics beforeSend={event => new URL(event.url).pathname.startsWith("/admin") ? null : event} />{gaId && <GoogleAnalytics gaId={gaId} />}</> : null;
}
