"use client";

import { useEffect, useRef, useState } from "react";

// Muted/looped/playsInline background footage, with everything DESIGN_SPEC's
// video section asks for: a stable poster, a manual pause control, no autoplay
// under reduced motion, and pausing when the tab is hidden. No information
// here is conveyed only through motion — the real content is the text
// overlay, not the footage.
//
// The video's own `poster` attribute is the still image: there is no separate
// <Image> layered on top of it. An extra layered photo meant an instant,
// network-timing-independent swap between "photo visible" and "video visible"
// on every load — precisely the visible pop this was built to avoid. The
// native poster has no such swap: the browser paints it immediately and only
// replaces it with real frames once playback actually starts, and it stays
// as the fallback on its own if the video fails or motion is reduced.
export function HeroVideo({ src, poster, posterAlt }: { src: string; poster: string; posterAlt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  // True only once the video has real frames on screen (the "playing" event).
  // Drives whether the poster frame is the only thing a screen reader has to
  // go on: while it is (reduced motion, still loading, or a failed load),
  // the element carries posterAlt; once real motion is playing, the
  // surrounding text overlay is the content and this goes back to decorative.
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  // Always rendered (server-rendered and hydrated identically), rather than
  // conditionally mounted once JS confirms the motion preference — that
  // earlier approach meant the browser couldn't even discover the video
  // file, let alone start fetching it, until after hydration finished and
  // this effect ran. Keeping the tag present (without a declarative
  // `autoPlay`) lets the browser's preload scanner start on the file from
  // the initial HTML, and playback is instead started/stopped imperatively
  // here, which is what correctly keeps it paused for reduced-motion
  // visitors and on a load failure.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    if (!video.dataset.userPaused) video.play().catch(() => setFailed(true));
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (!video.dataset.userPaused) video.play().catch(() => setFailed(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [reducedMotion, failed]);

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

  const showControls = !failed && !reducedMotion;

  return (
    <div className="hero-media">
      <video
        ref={videoRef}
        className="hero-video"
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden={playing}
        aria-label={playing ? undefined : posterAlt}
        onError={() => setFailed(true)}
        onPlaying={() => setPlaying(true)}
        onPlay={() => setPaused(false)}
        onPause={() => {
          setPaused(true);
          setPlaying(false);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {showControls && (
        <button type="button" className="cinematic-pause hero-video-pause" aria-pressed={paused} onClick={toggle}>
          {paused ? "Play" : "Pause"} <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
        </button>
      )}
    </div>
  );
}
