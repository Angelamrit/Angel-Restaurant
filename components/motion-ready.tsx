"use client";

import { useEffect, useRef } from "react";

// Streamed pages announce their commit before the shared reveal observer writes
// classes or counter text into their server-rendered content.
export function MotionReady() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const scope = marker.current?.closest("main");
    if (!scope) return;
    scope.setAttribute("data-motion-hydrated", "");
    document.dispatchEvent(new CustomEvent("angel:motion-ready", { detail: scope }));
    return () => scope.removeAttribute("data-motion-hydrated");
  }, []);
  return <span hidden ref={marker} />;
}
