"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/editorial";

type GalleryPhoto = { name: string; label: string };

export function GalleryLightbox({ photos, children }: { photos: GalleryPhoto[]; children?: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (active === null) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        const first = buttons?.[0];
        const last = buttons?.[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "ArrowRight") setActive((current) => (current === null ? current : (current + 1) % photos.length));
      if (event.key === "ArrowLeft") setActive((current) => (current === null ? current : (current - 1 + photos.length) % photos.length));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, photos.length]);

  const isOpen = active !== null;
  useEffect(() => {
    if (!isOpen) return;
    return () => opener.current?.focus();
  }, [isOpen]);

  return (
    <>
      <section className="gallery-grid container-shell section-space" aria-label="Angel photo collection">
        {photos.map((photo, index) => (
          <figure key={photo.name} data-reveal="photo" data-tilt style={{ "--i": index % 2 } as CSSProperties}>
            <button
              type="button"
              ref={(element) => { triggers.current[index] = element; }}
              className="gallery-grid-trigger"
              onClick={() => { opener.current = triggers.current[index]; setActive(index); }}
              aria-haspopup="dialog"
            >
              <Photo name={photo.name} alt={`${photo.label} — Angel editorial collection, view larger`} />
            </button>
            <figcaption><span>0{index + 1}</span><span>{photo.label}</span><span className="gallery-grid-cue" aria-hidden="true">View ↗</span></figcaption>
          </figure>
        ))}
        {children}
      </section>
      {active !== null && (
        <dialog ref={dialogRef} className="lightbox" onCancel={() => setActive(null)} aria-label={`${photos[active].label}, photograph ${active + 1} of ${photos.length}`}>
          <button type="button" className="lightbox-nav lightbox-prev" onClick={() => setActive((active - 1 + photos.length) % photos.length)} aria-label="Previous photograph">‹</button>
          <figure className="lightbox-figure">
            <Image
              key={photos[active].name}
              src={`/angel/${photos[active].name}.webp`}
              alt={`${photos[active].label} — Angel editorial collection`}
              fill
              sizes="(max-width: 767px) 90vw, 60vw"
              loading="eager"
            />
            <figcaption>
              <span className="type-caption">0{active + 1} / 0{photos.length}</span>
              {photos[active].label}
            </figcaption>
          </figure>
          <button type="button" className="lightbox-nav lightbox-next" onClick={() => setActive((active + 1) % photos.length)} aria-label="Next photograph">›</button>
          <button ref={closeRef} type="button" className="lightbox-close" onClick={() => setActive(null)} aria-label="Close">✕</button>
        </dialog>
      )}
    </>
  );
}
