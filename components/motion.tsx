"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];

    // Main reveal observer with stagger support
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        revealObserver.unobserve(target);
        if (preference.matches) return;

        const styles = getComputedStyle(document.documentElement);
        const duration = parseFloat(styles.getPropertyValue("--duration-reveal"));
        const easing = styles.getPropertyValue("--ease-reveal").trim();
        const revealDistance = styles.getPropertyValue("--reveal-distance");
        const stagger = parseFloat(styles.getPropertyValue("--stagger"));
        const hasStaggerChildren = target.hasAttribute("data-stagger-children");

        if (hasStaggerChildren) {
          // Stagger children if parent has data-stagger-children
          const children = target.querySelectorAll(":scope > *");
          children.forEach((child, index) => {
            const delay = stagger * index;
            animations.push(
              child.animate(
                [
                  { opacity: 0, transform: `translateY(${revealDistance})` },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                {
                  duration,
                  easing,
                  fill: "none",
                  delay,
                }
              )
            );
          });
        } else {
          // Single element reveal
          animations.push(
            target.animate(
              [
                { opacity: 0, transform: `translateY(${revealDistance})` },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration, easing, fill: "none" }
            )
          );
        }
      });
    }, { threshold: 0.12 });

    // Parallax observer for scroll-based effects
    const parallaxObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (preference.matches) return;

        const onScroll = () => {
          const rect = target.getBoundingClientRect();
          const scrollProgress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
          const parallaxMax = parseFloat(target.getAttribute("data-parallax-max") || "20");
          const offset = scrollProgress * parallaxMax;
          (target as HTMLElement).style.transform = `translateY(${-offset}px)`;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
      });
    }, { threshold: 0.1 });

    // Attach observers
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    document.querySelectorAll("[data-parallax]").forEach((element) => parallaxObserver.observe(element));

    const cancel = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };

    preference.addEventListener("change", cancel);
    return () => {
      revealObserver.disconnect();
      parallaxObserver.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancel);
    };
  }, [pathname]);

  return null;
}
