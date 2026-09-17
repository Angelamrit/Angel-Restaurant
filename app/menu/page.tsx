import type { Metadata } from "next";
import Image from "next/image";
import { type CSSProperties } from "react";
import { PageIntro, Reservation } from "@/components/editorial";
import { MenuExplorer } from "@/components/menu-explorer";
import { dishCount, signatureDishes } from "@/lib/restaurant";

export const metadata: Metadata = { title: "The menu", description: `Explore all ${dishCount} dishes on Angel’s Indian menu, from tandoori chicken and dum biryani to vegetarian and vegan favorites in Jackson Heights.`, alternates: { canonical: "/menu" } };

const order = (index: number) => ({ "--i": index } as CSSProperties);

export default function MenuPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro eyebrow="The Angel menu · 100% halal food" title="A little spice." italic="A lot of soul." description="From the clay oven to the comfort of a slow-cooked curry. Find your favorite, or discover something new." />
      <section className="container-shell section-space" aria-label="Signature plates">
        <div className="section-heading light-heading" data-reveal>
          <div><p className="type-eyebrow">Where to start</p><h2>The plates people<br /><em>come back for.</em></h2></div>
          <p className="type-caption">All {dishCount} dishes in full below</p>
        </div>
        <div className="menu-grid">
          {signatureDishes.map((dish, index) => (
            <article className="dish-card" style={order(index)} key={dish.name}>
              <div className="dish-image">
                <Image src={`/angel/${dish.image}.webp`} alt={dish.stock ? `${dish.name} — illustrative food photograph` : `${dish.name} — editorial image from Angel’s collection`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
                {dish.vegetarian && <span className="dish-tag">Vegetarian</span>}
              </div>
              <div className="dish-heading"><h3>{dish.name}</h3><span>{dish.price}</span></div>
              <p>{dish.description}</p>
              <span className="type-caption dish-section">{dish.section}</span>
            </article>
          ))}
        </div>
        <p className="menu-note type-caption">Some photographs are illustrative; presentation may vary.</p>
      </section>
      <section className="container-shell menu-section" aria-label="The full menu"><MenuExplorer /></section>
      <Reservation />
    </main>
  );
}
