"use client";
import Image from "next/image";

const images = [{ name: "tandoori-chicken", label: "From the fire" }, { name: "room-long-table-v2", label: "Settle in" }, { name: "dal-makhni-naan", label: "Made to share" }, { name: "curries-spread", label: "A generous table" }];
export function GalleryRail() {
  return <div className="gallery-motion"><div className="gallery-motion-toolbar container-shell"><p className="type-caption">A glimpse of Angel</p></div><div className="gallery-window"><div className="gallery-track">{[0, 1].map((copy) => <div className="gallery-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{images.map((photo) => <figure key={photo.name}><div><Image src={`/angel-vps/${photo.name}.avif`} alt={copy ? "" : `${photo.label} — Angel editorial collection`} fill sizes="(max-width: 767px) 46vw, 30vw" quality={45} /></div><figcaption>{photo.label}</figcaption></figure>)}</div>)}</div></div></div>;
}
