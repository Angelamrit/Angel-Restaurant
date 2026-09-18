"use client";

import { useEffect, useRef, useState } from "react";

// Muted/looped/playsInline background footage, with everything DESIGN_SPEC's
// video section asks for: a manual pause control, no autoplay under reduced
// motion, and pausing when the tab is hidden. No information here is
// conveyed only through motion — the real content is the text overlay, not
// the footage.
//
// Deliberately no poster image on the normal path: a poster is a second,
// distinct asset that the browser paints instantly, so there is always a
// "photo, then video" moment as soon as the video has buffered enough to
// play — no amount of preloading removes that, since the whole point of a
// poster is to show something before the video can. Leaving it out means
// the .hero-media container's own background color is what's behind the
// video until its first real frame decodes; `poster` is only ever applied
// if the video genuinely fails to load, as a fallback rather than a preview.
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

  // Always rendered (server-rendered and hydrated identically), rather than
  // conditionally mounted once JS confirms the motion preference — that
  // earlier approach meant the browser couldn't even discover the video
  // file, let alone start fetching it, until after hydration finished and
  // this effect ran. Playback is started/stopped imperatively here (not via
  // a declarative `autoPlay`), which is what keeps it paused for
  // reduced-motion visitors and after a load failure.
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
        // Only set once the video has actually failed — see the file-level
        // comment above. React adds/removes the attribute itself; no poster
        // means none is fetched or painted on the ordinary path at all.
        poster={failed ? poster : undefined}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden={!failed}
        aria-label={failed ? posterAlt : undefined}
        onError={() => setFailed(true)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
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
