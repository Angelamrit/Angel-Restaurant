"use client";

import Image from "next/image";
import { useState } from "react";

const dishes = [
  { name: "Tandoori Chicken", image: "tandoori-aceva", note: "From the tandoor", alt: "Tandoori chicken and kebabs from the clay oven" },
  { name: "Chicken Dum Biryani", image: "chicken-biryani-stock", note: "Chef’s special", alt: "Chicken dum biryani with saffron and basmati rice" },
  { name: "Lamb Curry", image: "lamb-curry-aceva", note: "Curries", alt: "Aromatic lamb curry finished with fresh herbs" },
  { name: "Dal Makhni & Garlic Naan", image: "dal-naan-aceva", note: "Made to share", alt: "Dal makhni, garlic naan and basmati rice" },
  { name: "Chole Bhatura", image: "chole-bhature-stock", note: "Vegetarian starters", alt: "Spiced chickpeas with golden, freshly fried flatbread" },
  { name: "Amritsari Paneer Kulcha", image: "amritsari-kulcha-stock", note: "Vegetarian mains", alt: "Paneer-stuffed kulcha with chickpeas, pickle and yogurt" },
];

export function HoverPreviewGallery() {
  const [active, setActive] = useState(0);

  return (
    <div className="hover-gallery container-shell">
      <figure className="hover-gallery-preview">
        {dishes.map((dish, index) => (
          <div
            className={`hover-gallery-frame ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
            key={dish.image}
          >
            <Image
              src={`/angel/${dish.image}.webp`}
              alt={dish.alt}
              fill
              sizes="(max-width: 767px) 100vw, 48vw"
            />
            <div className="hover-gallery-caption" aria-hidden="true">
              <span className="type-caption">{dish.note}</span>
              <strong>{dish.name}</strong>
            </div>
          </div>
        ))}
      </figure>

      <ul className="hover-gallery-list" data-reveal data-stagger-children>
        {dishes.map((dish, index) => (
          <li key={dish.image}>
            <button
              type="button"
              className={`hover-gallery-item ${index === active ? "is-active" : ""}`}
              aria-pressed={index === active}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span className="hover-gallery-thumb">
                <Image src={`/angel/${dish.image}.webp`} alt="" fill sizes="120px" />
              </span>
              <span className="hover-gallery-text">
                <span className="hover-gallery-name">{dish.name}</span>
                <span className="type-caption">{dish.note}</span>
              </span>
              <span className="hover-gallery-index" aria-hidden="true">0{index + 1}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
