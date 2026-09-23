"use client";

import { useEffect, useRef } from "react";

// A soft ring that trails the pointer and swells over anything interactive.
// The native cursor stays: this is a second, lagging layer, not a replacement.
// Mounted for everyone but only ever activated for hover-capable, fine-pointer,
// motion-allowing visitors (CSS hides it for the rest); it is aria-hidden and
// inert, so it never affects hit-testing, focus, or reading order.
const INTERACTIVE = "a, button, [role='button'], summary, input, select, textarea, label";

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let frame = 0;
    let visible = false;

    const tick = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      element.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2 ? requestAnimationFrame(tick) : 0;
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        cx = x;
        cy = y;
        visible = true;
        element.dataset.visible = "true";
      }
      const target = (event.target as Element | null)?.closest?.(INTERACTIVE);
      element.dataset.hover = target ? "true" : "false";
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const hide = () => {
      visible = false;
      delete element.dataset.visible;
    };

    const press = () => { element.dataset.pressed = "true"; };
    const release = () => { delete element.dataset.pressed; };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
