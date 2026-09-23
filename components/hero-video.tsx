"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// The first paint is an optimized image. Video bytes are requested only on intent.
export function HeroVideo({ src, poster, posterAlt }: { src: string; poster: string; posterAlt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [requested, setRequested] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !requested || failed) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pause = () => video.pause();
    const visibility = () => { if (document.hidden) pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    observer.observe(video);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", pause);
    video.play().catch(() => setFailed(true));
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", pause);
    };
  }, [requested, failed]);

  const toggle = () => {
    if (!requested) { setRequested(true); return; }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setFailed(true));
    else video.pause();
  };

  return (
    <div className="hero-media">
      <Image src={poster} alt={posterAlt} fill sizes="100vw" loading="eager" fetchPriority="high" className="hero-poster" />
      {requested && !failed && <video ref={videoRef} className="hero-video" src={src} muted loop playsInline preload="none" aria-hidden="true" onError={() => setFailed(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      {!failed && <button type="button" className="cinematic-pause hero-video-pause" aria-pressed={playing} onClick={toggle}>{playing ? "Pause video" : "Play video"}</button>}
    </div>
  );
}
