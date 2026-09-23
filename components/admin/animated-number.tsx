"use client";

import { useEffect, useRef } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      element.textContent = String(value);
    };
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 850, 1);
      element.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    if (!preference.matches) frame = requestAnimationFrame(tick);
    preference.addEventListener("change", finish);
    return () => {
      finish();
      preference.removeEventListener("change", finish);
    };
  }, [value]);

  return <span className="admin-number" aria-label={String(value)}><span ref={ref} aria-hidden="true">{value}</span></span>;
}
