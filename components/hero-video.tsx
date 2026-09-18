"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Muted/looped/playsInline background footage, with everything DESIGN_SPEC's
// video section asks for: a stable poster, a manual pause control, no autoplay
// under reduced motion, pausing when the tab is hidden, and a still-image
// fallback if the video can't load. No information here is conveyed only
// through motion — the real content is the text overlay, not the footage.
export function HeroVideo({ src, poster, posterAlt }: { src: string; poster: string; posterAlt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const showVideo = !reducedMotion && !failed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (!video.dataset.userPaused) video.play().catch(() => setFailed(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [showVideo]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      delete video.dataset.userPaused;
      video.play().catch(() => setFailed(true));
    } else {
      video.dataset.userPaused = "true";
      video.pause();
    }
  };

  return (
    <div className="hero-media">
      {showVideo && (
        <video
          ref={videoRef}
          className="hero-video"
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          onError={() => setFailed(true)}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      {/* Serves three roles: the video's native poster frame, the entire background
          under reduced motion, and the fallback if the video fails to load. */}
      <Image
        className="hero-video-poster"
        src={poster}
        alt={showVideo ? "" : posterAlt}
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        style={{ objectFit: "cover", opacity: showVideo ? 0 : 1 }}
      />
      {showVideo && (
        <button type="button" className="cinematic-pause hero-video-pause" aria-pressed={paused} onClick={toggle}>
          {paused ? "Play" : "Pause"} <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
        </button>
      )}
    </div>
  );
}
