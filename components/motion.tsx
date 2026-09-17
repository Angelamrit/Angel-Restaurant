"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const READY = "data-motion-ready";

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    let observer: IntersectionObserver | null = null;

    const reveal = (target: Element) => {
      // Class first, animate second, in the same task: the base style turns visible
      // while the animation still owns opacity, so nothing flashes in between.
      target.classList.add("is-revealed");
      // "mask" (editorial line reveal) and "line" (drawn apricot rule) are pure CSS:
      // the class toggle above is enough to start their keyframes declaratively.
      const variant = target.getAttribute("data-reveal");
      if (variant === "mask" || variant === "line") return;
      const styles = getComputedStyle(root);
      const duration = parseFloat(styles.getPropertyValue("--duration-reveal"));
      const easing = styles.getPropertyValue("--ease-reveal").trim();
      const distance = styles.getPropertyValue("--reveal-distance").trim();
      const stagger = parseFloat(styles.getPropertyValue("--stagger"));
      const keyframes = [
        { opacity: 0, transform: `translateY(${distance})` },
        { opacity: 1, transform: "translateY(0)" },
      ];
      const targets = target.hasAttribute("data-stagger-children") ? Array.from(target.children) : [target];
      targets.forEach((element, index) => {
        animations.push(element.animate(keyframes, { duration, easing, delay: stagger * index, fill: "backwards" }));
      });
    };

    const start = () => {
      root.setAttribute(READY, "");
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer?.unobserve(target);
          reveal(target);
        });
      }, { threshold: 0.12 });
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((element) => observer?.observe(element));
    };

    const stop = () => {
      observer?.disconnect();
      observer = null;
      animations.splice(0).forEach((animation) => animation.cancel());
    };

    const sync = () => {
      stop();
      if (preference.matches) root.removeAttribute(READY);
      else start();
    };

    sync();
    preference.addEventListener("change", sync);
    return () => {
      stop();
      preference.removeEventListener("change", sync);
    };
  }, [pathname]);

  // Magnetic pull on primary buttons: a restrained, GPU-cheap nudge toward the
  // cursor, expressed as --mx/--my custom properties the CSS transform reads.
  // One delegated listener for every .button-primary on the page, not a wrapper
  // per button. Runs only for hover-capable, fine-pointer, motion-allowing visitors.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const strength = 0.3;
    const max = 10;
    let frame = 0;
    let active: HTMLElement | null = null;

    const release = (element: HTMLElement) => {
      element.style.removeProperty("--mx");
      element.style.removeProperty("--my");
    };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const target = (event.target as HTMLElement)?.closest?.<HTMLElement>(".button-primary") ?? null;
      if (target !== active) {
        if (active) release(active);
        active = target;
      }
      if (!target) return;
      cancelAnimationFrame(frame);
      const rect = target.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      frame = requestAnimationFrame(() => {
        target.style.setProperty("--mx", `${Math.max(-max, Math.min(max, dx * strength))}px`);
        target.style.setProperty("--my", `${Math.max(-max, Math.min(max, dy * strength))}px`);
      });
    };

    const leave = () => {
      if (active) release(active);
      active = null;
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      if (active) release(active);
    };
  }, []);

  return null;
}
