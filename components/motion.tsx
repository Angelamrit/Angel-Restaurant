"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Content stays visible without JavaScript. Only offscreen sections receive a
// short, eased entrance, with no continuous scroll or pointer animation work.
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        if (seen.has(element)) return;
        if (element.closest("[data-motion-pending]:not([data-motion-hydrated])")) return;
        // Never replay an entrance over already-readable above-the-fold content.
        if (element.getBoundingClientRect().top >= innerHeight) observer?.observe(element);
        else seen.add(element);
      });
    };
    const stop = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const sync = () => {
      stop();
      if (preference.matches) { observer = null; return; }
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer?.unobserve(target);
          if (seen.has(target)) return;
          seen.add(target);
          const targets = target.hasAttribute("data-stagger-children") ? Array.from(target.children) : [target];
          targets.forEach((element, index) => {
            const animation = element.animate(
              [{ translate: "0 12px" }, { translate: "0 0" }],
              { duration: 420, delay: Math.min(index * 40, 120), easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          });
        });
      });
      scan();
    };
    sync();
    document.addEventListener("angel:motion-ready", scan);
    preference.addEventListener("change", sync);
    return () => {
      stop();
      document.removeEventListener("angel:motion-ready", scan);
      preference.removeEventListener("change", sync);
    };
  }, [pathname]);
  return null;
}
