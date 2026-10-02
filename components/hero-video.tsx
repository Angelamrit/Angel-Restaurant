"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// The sequence is two clips joined by a short crossfade (about 4.6 to 4.9 s). On a narrow phone only about a fifth of
// the frame shows, so the visible slice is re-aimed for the second clip (see the data-clip rules in app/site.css).
const SECOND_CLIP_STARTS = 4.7;

// Keep the optimized poster visible until muted playback starts.
export function HeroVideo({ src, poster, posterAlt }: { src: string; poster: string; posterAlt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const manuallyPaused = useRef(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    // Visitors who asked their browser to save data keep the poster; the Play button still works.
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const syncPlayback = () => {
      if (document.hidden || preference.matches || saveData || !inView || manuallyPaused.current) {
        video.pause();
      } else {
        video.play().catch(() => setPlaying(false));
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    preference.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      preference.removeEventListener("change", syncPlayback);
    };
  }, [failed]);

  // Fires a few times a second while playing; it writes only when the clip actually changes.
  const aimFocus = () => {
    const video = videoRef.current;
    const media = mediaRef.current;
    if (!video || !media) return;
    const clip = video.currentTime >= SECOND_CLIP_STARTS ? "2" : "1";
    if (media.dataset.clip !== clip) media.dataset.clip = clip;
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manuallyPaused.current = false;
      video.play().catch(() => setPlaying(false));
    } else {
      manuallyPaused.current = true;
      video.pause();
    }
  };

  return (
    <div className="hero-media" ref={mediaRef} data-clip="1">
      <Image src={poster} alt={posterAlt} fill sizes="100vw" loading="eager" fetchPriority="high" className="hero-poster" />
      {!failed && <video ref={videoRef} className={`hero-video${playing ? " is-playing" : ""}`} src={src} muted loop playsInline preload="none" aria-hidden="true" onError={() => setFailed(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={aimFocus} />}
      {!failed && <button type="button" className="cinematic-pause hero-video-pause" aria-pressed={playing} onClick={toggle}>{playing ? "Pause video" : "Play video"}</button>}
    </div>
  );
}
