"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { name: string; alt: string };

export function CinematicSlideshow({
  slides,
  className = "",
  label,
  priority = false,
}: {
  slides: Slide[];
  className?: string;
  label: string;
  priority?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);

  return (
    <figure className={`cinematic-slideshow editorial-photo ${className}`} aria-label={label}>
      <div className="cinematic-frames">
        {slides.map((slide, index) => (
          <div
            className={`cinematic-frame ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
            key={slide.name}
          >
            <Image
              src={`/angel/${slide.name}.webp`}
              alt={index === active ? slide.alt : ""}
              fill
              sizes="(max-width: 767px) 100vw, 60vw"
              preload={priority && index === 0}
            />
          </div>
        ))}
      </div>
      <div className="cinematic-controls">
        <div className="cinematic-progress" role="group" aria-label="Choose photograph">
          {slides.map((slide, index) => (
            <button
              type="button"
              aria-label={`Show photograph ${index + 1}: ${slide.alt}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              key={slide.name}
            ><span /></button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="cinematic-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >{paused ? "Play" : "Pause"} <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
        )}
      </div>
    </figure>
  );
}
