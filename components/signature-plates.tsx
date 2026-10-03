import Image from "next/image";
import type { CSSProperties } from "react";
import { SectionHead } from "@/components/section-head";
import type { Category, MenuItem } from "@/lib/menu-types";
import { money } from "@/lib/menu-types";

type Plate = { name: string; price: string; description: string; section?: string; image: string; imageRatio: string; vegetarian: boolean; stock: boolean };

function imageRatio(image: string) {
<<<<<<< Updated upstream
  const ratios: [string, string][] = [
    ["chicken-dum-biryani-v2.webp", "1536 / 1024"],
    ["amritsari-paneer-kulcha.webp", "1536 / 1024"],
    ["vegetable-dum-biryani-v2.webp", "1200 / 675"],
    ["goat-dum-biryani-v2.webp", "1448 / 1086"],
    ["chole-bhatura-v2.webp", "1448 / 1086"],
    ["amritsari-kulcha-stock.webp", "1600 / 1200"],
    ["amritsari-aloo-kulcha.webp", "1199 / 1312"],
    ["mix-veg-kulcha.webp", "1408 / 1117"],
  ];
  return ratios.find(([filename]) => image.endsWith(filename))?.[1] ?? "4 / 3";
=======
  const ratios: Record<string, string> = {
    "chicken-dum-biryani": "1536 / 1024",
    "amritsari-paneer-kulcha": "1536 / 1024",
    "vegetable-dum-biryani": "1200 / 675",
    "goat-dum-biryani": "1448 / 1086",
    "chole-bhatura": "1448 / 1086",
    "amritsari-kulcha-stock": "1600 / 1200",
    "amritsari-aloo-kulcha": "1199 / 1312",
    "mix-veg-kulcha": "1408 / 1117",
    "lamb-rogan-josh": "1122 / 1402",
    "dal-makhni": "1122 / 1402",
    "butter-chicken": "1254 / 1254",
  };
  const filename = image.split("/").at(-1)?.replace(/\.(?:avif|webp|jpe?g|png)$/i, "");
  return (filename && ratios[filename]) || "4 / 3";
>>>>>>> Stashed changes
}

const order = (index: number) => ({ "--i": index } as CSSProperties);

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
}

// "Where to start": every chef's-special dish that has photography, as
// large, asymmetric hero tiles (one wide portrait plus two stacked
// secondaries per group of three, repeating). A few of these photos are
// supplied stock shots of uneven quality rather than the restaurant's own,
// so the dishes the restaurant actually photographed are ordered first —
// they tend to land in the larger slot of each group — but every dish gets
// the same tile design regardless of which photo it carries.
export function SignaturePlates({ specials, categories, dishCount }: { specials: MenuItem[]; categories: Category[]; dishCount: number }) {
  const plates: Plate[] = specials.filter(dish => dish.image).map(dish => ({
    name: dish.name,
    price: money(dish.priceCents),
    description: dish.featuredDescription || dish.description,
    section: categories.find(category => category.id === dish.categoryId)?.title,
    image: dish.image,
    imageRatio: imageRatio(dish.image),
    vegetarian: dish.vegetarian,
    stock: dish.image.includes("-stock"),
  })).sort((a, b) => Number(a.stock) - Number(b.stock));
  if (plates.length === 0) return null;

  const pairedNames = new Set(["Butter Chicken", "Lamb Rogan Josh"]);
  const pairedPlates = plates.filter(dish => pairedNames.has(dish.name));
  const groups = chunk(plates.filter(dish => !pairedNames.has(dish.name)), 3);
  const pairedStart = groups.reduce((total, group) => total + group.length, 0);

  return (
    <section className="surface-gold tone-gold section" aria-label="Signature plates">
      <div className="container-shell section-space">
        <SectionHead label="Where to start" title="The plates people" italic="come back for." />

        <div className="dish-feature">
          {groups.map((group, groupIndex) => (
            <div className={`dish-feature-row${group.length === 1 ? " is-solo" : ""}`} key={group[0].name}>
              <DishTile dish={group[0]} index={groupIndex * 3} large />
              {group.length > 1 && (
                <div className="dish-feature-stack">
                  {group.slice(1).map((dish, i) => (
                    <DishTile dish={dish} index={groupIndex * 3 + i + 1} key={dish.name} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {pairedPlates.length > 0 && (
            <div className="dish-feature-row dish-feature-row--pair">
              {pairedPlates.map((dish, i) => (
                <DishTile dish={dish} index={pairedStart + i} key={dish.name} />
              ))}
            </div>
          )}
        </div>

        <div className="menu-note type-caption dish-feature-close">
          <p>Some photographs are illustrative; presentation may vary.</p>
          <p>All {dishCount} dishes in full below</p>
        </div>
      </div>
    </section>
  );
}

function DishTile({ dish, index, large, eager }: { dish: Plate; index: number; large?: boolean; eager?: boolean }) {
  return (
    <article className={`dish-feature-tile${large ? " is-large" : ""}${dish.name === "Lamb Rogan Josh" ? " is-lamb-rogan-josh" : ""}`} data-reveal="photo" data-tilt style={order(index)}>
      <div className="dish-feature-image" style={{ aspectRatio: dish.imageRatio }}>
        <Image
          src={dish.image}
          alt={dish.stock ? `${dish.name} — illustrative food photograph` : dish.name}
          fill
          quality={45}
          sizes={large ? "(max-width: 767px) 100vw, (max-width: 1023px) 60vw, 40vw" : "(max-width: 767px) 100vw, (max-width: 1023px) 30vw, 20vw"}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
        />
        {dish.vegetarian && <span className="chip chip-solid dish-tag">Vegetarian</span>}
      </div>
      <div className="dish-feature-copy">
        <span className="dish-feature-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div className="dish-feature-head">
          <h3>{dish.name}</h3>
          <span className="dish-feature-line" aria-hidden="true" />
          <span className="dish-feature-price">{dish.price}</span>
        </div>
        <p>{dish.description}</p>
        {dish.section && <span className="dish-feature-section">{dish.section}</span>}
      </div>
    </article>
  );
}
