"use client";

import { useEffect, useState } from "react";

// Shared by every image index and slideshow. It stops for reduced motion, hidden tabs,
// hover or keyboard focus as requested by the individual interactive component.
export function useSlideAdvance(length: number, { intervalMs = 5200, autoplay = true }: { intervalMs?: number; autoplay?: boolean } = {}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(!autoplay);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, length, intervalMs]);

  return { active, setActive, paused, setPaused, reducedMotion };
}
