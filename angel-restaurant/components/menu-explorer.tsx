"use client";

import Image from "next/image";
import { useState } from "react";
import { categories, dishes } from "@/lib/restaurant";

export function MenuExplorer() {
  const [category, setCategory] = useState("All dishes");
  const [vegetarian, setVegetarian] = useState(false);
  const visible = dishes.filter((dish) => (category === "All dishes" || dish.category === category) && (!vegetarian || dish.vegetarian));
  return <div className="menu-explorer"><div className="menu-controls"><div className="menu-categories" aria-label="Filter dishes by category">{categories.map((name) => <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div><label className="vegetarian-filter"><input type="checkbox" checked={vegetarian} onChange={(event) => setVegetarian(event.target.checked)} />Vegetarian only</label></div><p className="type-caption menu-count" aria-live="polite">{visible.length} dishes · {category}</p><div className="menu-grid" key={`${category}-${vegetarian}`}>{visible.map((dish) => <article className="dish-card" key={dish.name}><div className="dish-image"><Image src={`/angel/${dish.image}.webp`} alt={dish.stock ? `${dish.name} — illustrative food photograph` : `${dish.name} — editorial image from Angel’s collection`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />{dish.vegetarian && <span className="dish-tag">Vegetarian</span>}</div><div className="dish-heading"><h3>{dish.name}</h3><span>{dish.price}</span></div><p>{dish.description}</p></article>)}</div>{visible.length === 0 && <p className="empty-menu">No vegetarian dishes in this category. Try Vegetarian mains or All dishes.</p>}<p className="menu-note type-caption">Prices and availability may change. Please ask our team about dietary requirements. Some photographs are illustrative; presentation may vary.</p></div>;
}
