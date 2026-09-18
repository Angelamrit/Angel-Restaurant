import Image from "next/image";
import { type CSSProperties } from "react";
import { PageIntro, Reservation } from "@/components/editorial";
import { MenuExplorer } from "@/components/menu-explorer";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
import { dishCount, signatureDishes, menu } from "@/lib/restaurant";

export const metadata = pageMetadata({
  title: "Menu: Tandoori, Biryani & Curries in Jackson Heights",
  description: `All ${dishCount} dishes with prices: tandoori chicken, dum biryani, Amritsari kulcha, vegetarian and vegan curries. 100% halal Indian food in Jackson Heights, Queens.`,
  path: "/menu",
});
const breadcrumbs = breadcrumbList([{ name: "The menu", path: "/menu" }]);
// Built from lib/restaurant.ts's menu array so this stays in sync with any future
// edits to the printed-menu transcription. HalalDiet reflects the site's own
// "100% halal" claim (app/layout.tsx); drop it if that ever stops being true.
const menuJsonLd = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "Angel Indian Restaurant menu",
  inLanguage: "en-US",
  hasMenuSection: menu.map((section) => ({
    "@type": "MenuSection",
    name: section.kicker ? `${section.title} — ${section.kicker}` : section.title,
    hasMenuItem: section.items.map((dish) => ({
      "@type": "MenuItem",
      name: dish.name,
      description: dish.description,
      offers: { "@type": "Offer", price: dish.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" },
      suitableForDiet: [
        dish.vegan && "https://schema.org/VeganDiet",
        dish.vegetarian && "https://schema.org/VegetarianDiet",
        "https://schema.org/HalalDiet",
      ].filter(Boolean),
    })),
  })),
};

const order = (index: number) => ({ "--i": index } as CSSProperties);

export default function MenuPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={menuJsonLd} />
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
                <Image src={`/angel/${dish.image}.webp`} alt={dish.stock ? `${dish.name} — illustrative food photograph` : `${dish.name} — editorial image from Angel’s collection`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" loading={index === 0 ? "eager" : undefined} fetchPriority={index === 0 ? "high" : undefined} />
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
