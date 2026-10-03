"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useSlideAdvance } from "@/lib/use-slide-advance";

type Slide = { name: string; alt: string };

export function CinematicSlideshow({
  slides,
  className = "",
  label,
  priority = false,
  intervalMs = 5200,
}: {
  slides: Slide[];
  className?: string;
  label: string;
  priority?: boolean;
  intervalMs?: number;
}) {
  const { active, setActive, setPaused, reducedMotion } = useSlideAdvance(slides.length, { intervalMs });
  const [engaged, setEngaged] = useState(false);
  useEffect(() => { setPaused(engaged); }, [engaged, setPaused]);

  return (
    <figure
      className={`cinematic-slideshow editorial-photo ${className}`}
      aria-label={label}
      data-paused={engaged || reducedMotion}
      style={{ "--slide-interval": `${intervalMs}ms` } as CSSProperties}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setEngaged(false);
      }}
    >
      <div className="cinematic-frames">
        {slides.map((slide, index) => (
          <div
            className={`cinematic-frame ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
            key={slide.name}
          >
            {index === active && <Image
              src={`/angel-vps/${slide.name}.avif`}
              alt={index === active ? slide.alt : ""}
              fill
              sizes="(max-width: 767px) 100vw, 60vw"
              quality={45}
              // Next 16: `loading="eager"` (not `preload`) is what the LCP heuristic
              // checks on the rendered <img>, so only the real first slide gets it.
              loading={priority && index === 0 ? "eager" : undefined}
            />}
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
      </div>
    </figure>
  );
}
