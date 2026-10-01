"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/lib/menu-types";
import { trackEvent } from "@/lib/analytics";
import { useSlideAdvance } from "@/lib/use-slide-advance";

const pad = (index: number) => String(index + 1).padStart(2, "0");

type Dish = MenuItem & { note: string };

// The two-column layout (list beside a sticky preview) collapses to one column at this width; there the preview
// would sit far below the list, out of sight of the dish that was tapped, so it opens directly under that dish.
const NARROW = "(max-width: 48rem)";

function PreviewCopy({ dish, index }: { dish: Dish; index: number }) {
  return (
    <>
      <span className="dish-preview-num" aria-hidden="true">{pad(index)}</span>
      <div className="dish-preview-copy" aria-hidden="true">
        <p className="eyebrow">{dish.note}</p>
        <h3>{dish.name}</h3>
        {(dish.featuredDescription || dish.description) && <p>{dish.featuredDescription || dish.description}</p>}
        <div className="dish-badges">
          {dish.vegan ? <span title="Vegan">VG</span> : dish.vegetarian && <span title="Vegetarian">V</span>}
          <span title="100% halal food">H</span>
        </div>
      </div>
    </>
  );
}

export function DishShowcase({ dishes }: { dishes: Dish[] }) {
  const { active, setActive, setPaused, reducedMotion } = useSlideAdvance(dishes.length);
  const [manualPaused, setManualPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const tapped = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // On a phone the open panel is under its dish, so the carousel must not move it while it is being read.
  useEffect(() => { setPaused(manualPaused || hovering || narrow); }, [manualPaused, hovering, narrow, setPaused]);

  const activeIndex = Math.min(active, Math.max(dishes.length - 1, 0));

  // After a tap on a phone, bring the chosen dish to the top of the screen so its image is in view straight away.
  useEffect(() => {
    if (!narrow || !tapped.current) return;
    tapped.current = false;
    buttons.current[activeIndex]?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
  }, [activeIndex, narrow, reducedMotion]);

  if (!dishes.length) return <p>Explore our current dishes on the full menu.</p>;

  return (
    <div className="dish-showcase">
      <ul
        className="dish-list"
        data-reveal
        data-stagger-children
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovering(false); }}
      >
        {dishes.map((dish, index) => (
          <li key={dish.id}>
            <button
              type="button"
              ref={(element) => { buttons.current[index] = element; }}
              className={`dish-item${index === activeIndex ? " is-active" : ""}`}
              aria-pressed={index === activeIndex}
              onMouseEnter={() => { if (!narrow) setActive(index); }}
              onFocus={() => { if (!narrow) setActive(index); }}
              onClick={() => {
                tapped.current = narrow && index !== activeIndex;
                setActive(index);
                trackEvent(dish.type === "chef-special" ? "chef_special_click" : "menu_item_click", { itemId: dish.id, itemName: dish.name, category: dish.note });
              }}
            >
              <span className="dish-num" aria-hidden="true">{pad(index)}</span>
              <span><span className="dish-name">{dish.name}</span><span className="dish-note">{dish.note}</span></span>
              <span className={`circle-btn${index === activeIndex ? " is-active" : ""}`} aria-hidden="true">↗</span>
            </button>
            {narrow && index === activeIndex && (
              <figure className="frame frame-strong dish-preview dish-preview--inline">
                <div className="dish-preview-frame is-active">
                  <Image src={dish.image} alt={dish.name} fill sizes="100vw" />
                  <PreviewCopy dish={dish} index={index} />
                </div>
              </figure>
            )}
          </li>
        ))}
      </ul>
      {!narrow && (
        <figure className="frame frame-strong dish-preview" data-reveal="photo" data-tilt data-paused={manualPaused || hovering || reducedMotion}>
          {dishes.map((dish, index) => (
            <div className={`dish-preview-frame${index === activeIndex ? " is-active" : ""}`} aria-hidden={index !== activeIndex} key={dish.id}>
              {index === activeIndex && <Image src={dish.image} alt={dish.name} fill sizes="50vw" />}
              <PreviewCopy dish={dish} index={index} />
            </div>
          ))}
          {/* Re-keyed on the active dish so the fill restarts with every advance. */}
          <span className="dish-preview-progress" aria-hidden="true" key={activeIndex} />
          {!reducedMotion && dishes.length > 1 && (
            <button
              type="button"
              className="cinematic-pause dish-preview-pause"
              aria-pressed={manualPaused}
              onClick={() => setManualPaused((value) => !value)}
            >{manualPaused ? "Play" : "Pause"} <span aria-hidden="true">{manualPaused ? "▷" : "Ⅱ"}</span></button>
          )}
        </figure>
      )}
    </div>
  );
}
