"use client";

import Image from "next/image";
import { useState } from "react";
import type { MenuItem } from "@/lib/menu-types";
import { trackEvent } from "@/lib/analytics";

const pad = (index: number) => String(index + 1).padStart(2, "0");

export function DishShowcase({ dishes }: { dishes: (MenuItem & { note: string })[] }) {
  const [active, setActive] = useState(0);
  if (!dishes.length) return <p>Explore our current dishes on the full menu.</p>;
  const activeIndex = Math.min(active, dishes.length - 1);
  return (
    <div className="dish-showcase">
      <ul className="dish-list" data-reveal data-stagger-children>
        {dishes.map((dish, index) => (
          <li key={dish.id}>
            <button
              type="button"
              className={`dish-item${index === activeIndex ? " is-active" : ""}`}
              aria-pressed={index === activeIndex}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => { setActive(index); trackEvent(dish.type === "chef-special" ? "chef_special_click" : "menu_item_click", { itemId: dish.id, itemName: dish.name, category: dish.note }); }}
            >
              <span className="dish-num" aria-hidden="true">{pad(index)}</span>
              <span><span className="dish-name">{dish.name}</span><span className="dish-note">{dish.note}</span></span>
              <span className={`circle-btn${index === activeIndex ? " is-active" : ""}`} aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
      <figure className="frame frame-strong dish-preview" data-reveal="photo" data-tilt>
        {dishes.map((dish, index) => (
          <div className={`dish-preview-frame${index === activeIndex ? " is-active" : ""}`} aria-hidden={index !== activeIndex} key={dish.id}>
            {index === activeIndex && <Image src={dish.image} alt={dish.name} fill sizes="(max-width: 767px) 100vw, 50vw" />}
            <span className="dish-preview-num" aria-hidden="true">{pad(index)}</span>
            <div className="dish-preview-copy" aria-hidden="true">
              <p className="eyebrow">{dish.note}</p>
              <h3>{dish.name}</h3>
            </div>
          </div>
        ))}
      </figure>
    </div>
  );
}
