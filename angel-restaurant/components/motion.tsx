"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (preference.matches) return;
        const styles = getComputedStyle(document.documentElement);
        animations.push(target.animate([
          { opacity: 0, transform: `translateY(${styles.getPropertyValue("--reveal-distance")})` },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: parseFloat(styles.getPropertyValue("--duration-reveal")), easing: styles.getPropertyValue("--ease-reveal").trim(), fill: "none" }));
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    const cancel = () => { if (preference.matches) animations.forEach((animation) => animation.cancel()); };
    preference.addEventListener("change", cancel);
    return () => { observer.disconnect(); animations.forEach((animation) => animation.cancel()); preference.removeEventListener("change", cancel); };
  }, [pathname]);
  return null;
}
