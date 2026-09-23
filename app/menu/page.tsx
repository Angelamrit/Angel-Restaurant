import Image from "next/image";
import { type CSSProperties } from "react";
import { PageIntro, Reservation } from "@/components/editorial";
import { MenuExplorer } from "@/components/menu-explorer";
import { SectionHead } from "@/components/section-head";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
import { getPublicMenu } from "@/lib/menu-repository";
import { money, type PublicSection } from "@/lib/menu-types";
import { MenuRefresh } from "@/components/menu-refresh";
import { MotionReady } from "@/components/motion-ready";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Menu: Tandoori, Biryani & Curries in Jackson Heights",
  description: "Explore our current dishes and prices: tandoori chicken, dum biryani, Amritsari kulcha, vegetarian and vegan curries. 100% halal Indian food in Jackson Heights, Queens.",
  path: "/menu",
});
const breadcrumbs = breadcrumbList([{ name: "The menu", path: "/menu" }]);
// Structured data uses the same published records as the visible menu.
const menuJsonLd = (menu: PublicSection[]) => ({
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
});

const order = (index: number) => ({ "--i": index } as CSSProperties);

export default async function MenuPage() {
  const { sections, specials, categories, items } = await getPublicMenu();
  const dishCount = items.length;
  const signatureDishes = specials.filter(dish => dish.image).map(dish => ({ ...dish, price: money(dish.priceCents), description: dish.featuredDescription || dish.description, section: categories.find(category => category.id === dish.categoryId)?.title, stock: dish.image.includes("-stock") }));
  return (
    <main id="main-content" tabIndex={-1} data-motion-pending>
      <MotionReady />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={menuJsonLd(sections.filter(section => section.items.length))} />
      <MenuRefresh />
      <PageIntro
        eyebrow="The Angel menu · 100% halal food"
        title="A little spice."
        italic="A lot of soul."
        description="From the clay oven to the comfort of a slow-cooked curry. Find your favorite, or discover something new."
        image={{ name: "tandoori-aceva", alt: "Tandoori chicken and kebabs coming out of the clay oven" }}
        mark="Menu"
      />
      {signatureDishes.length > 0 && <section className="surface-gold tone-gold section" aria-label="Signature plates">
        <div className="container-shell section-space">
          <SectionHead label="Where to start" title="The plates people" italic="come back for." aside={<p className="type-caption">All {dishCount} dishes in full below</p>} />
          <div className="menu-grid">
            {signatureDishes.map((dish, index) => (
              <article className="frame frame-strong dish-card" style={order(index % 3)} data-reveal="photo" data-tilt key={dish.name}>
                <div className="dish-image">
                  <Image src={dish.image} alt={dish.stock ? `${dish.name} — illustrative food photograph` : dish.name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" loading={index === 0 ? "eager" : undefined} fetchPriority={index === 0 ? "high" : undefined} />
                  {dish.vegetarian && <span className="chip chip-solid dish-tag">Vegetarian</span>}
                </div>
                <div className="dish-heading"><h3>{dish.name}</h3><span>{dish.price}</span></div>
                <p>{dish.description}</p>
                <span className="dish-section">{dish.section}</span>
              </article>
            ))}
          </div>
          <p className="menu-note type-caption">Some photographs are illustrative; presentation may vary.</p>
        </div>
      </section>}
      <section className="surface-dark tone-dark section" aria-label="The full menu">
        <div className="container-shell menu-section"><MenuExplorer menu={sections} categories={["All dishes", ...new Set(categories.map(category => category.filter))]} /></div>
      </section>
      <Reservation />
    </main>
  );
}
