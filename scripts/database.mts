import nextEnv from "@next/env";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { query, closeDatabase } from "../lib/database.ts";
nextEnv.loadEnvConfig(process.cwd());
process.env.DB_POOL_MAX = "1";
const mode = process.argv[2];
if (!['migrate', 'seed', 'verify'].includes(mode)) throw new Error("Use migrate, seed, or verify.");
type Dish = { name: string; price: string; description?: string; vegetarian?: boolean; vegan?: boolean; tag?: string };
type Snapshot = { menu: { id: string; filter: string; title: string; kicker?: string; items: Dish[] }[]; signatureDishes: { name: string; image: string; description: string }[] };
const snapshot = JSON.parse(readFileSync("db/original-menu.json", "utf8")) as Snapshot;
const dishId = (name: string) => {
  const h = createHash("sha256").update(`angel-menu:${name}`).digest("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
};
try {
  if (mode === "migrate") {
    await query("BEGIN");
    for (const sql of readFileSync("db/001-menu.sql", "utf8").split(";").filter(part => part.trim())) await query(sql);
    await query("INSERT INTO migrations(id, applied_at) VALUES (?, ?) ON CONFLICT(id) DO NOTHING", ["001-menu", new Date().toISOString()]);
    await query("COMMIT");
    console.log("Schema 001-menu is ready.");
  }
  if (mode === "seed") {
    await query("BEGIN");
    if ((await query("SELECT id FROM migrations WHERE id = ?", ["original-menu-seed"])).length) {
      console.log("Original seed already applied; preserving all admin changes and deletions.");
    } else {
      const now = new Date().toISOString();
      for (const [sectionOrder, section] of snapshot.menu.entries()) {
        await query("INSERT INTO categories(id, filter, title, kicker, sort_order) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING", [section.id, section.filter, section.title, section.kicker || "", sectionOrder]);
        for (const [position, dish] of section.items.entries()) {
          const featured = snapshot.signatureDishes.find(item => item.name === dish.name);
          // The two unphotographed kulchas share the existing illustrative kulcha image.
          const image = featured ? `/angel/${featured.image}.webp` : section.id === "chefs-special" ? "/angel/amritsari-kulcha-stock.webp" : "";
          if (image) await query("INSERT INTO media(id,url,created_at) VALUES (?,?,?) ON CONFLICT(url) DO NOTHING", [dishId(image), image, now]);
          await query("INSERT INTO menu_items(id,name,description,price_cents,category_id,type,image,available,visible,sort_order,vegetarian,vegan,tag,featured,featured_description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING", [dishId(dish.name), dish.name, dish.description || "", Math.round(Number(dish.price.slice(1)) * 100), section.id, section.id === "chefs-special" ? "chef-special" : "regular", image, 1, 1, position, +!!dish.vegetarian, +!!dish.vegan, dish.tag || "", +!!featured, featured?.description || "", now, now]);
        }
      }
      await query("INSERT INTO migrations(id, applied_at) VALUES (?, ?)", ["original-menu-seed", now]);
      console.log("Original menu seeded. Existing names, prices, descriptions and categories preserved.");
    }
    await query("COMMIT");
  }
  if (mode === "verify") {
    const rows = await query("SELECT * FROM menu_items");
    for (const section of snapshot.menu) for (const dish of section.items) {
      const row = rows.find(item => item.id === dishId(dish.name));
      if (!row || row.name !== dish.name || row.description !== (dish.description || "") || Number(row.price_cents) !== Math.round(Number(dish.price.slice(1))*100) || row.category_id !== section.id) throw new Error(`Migration mismatch: ${dish.name}`);
    }
    console.log(`Verified ${rows.length} dishes against the original snapshot.`);
  }
} catch (error) {
  if (mode !== "verify") await query("ROLLBACK").catch(() => {});
  throw error;
} finally { await closeDatabase(); }
