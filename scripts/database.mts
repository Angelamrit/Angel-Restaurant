import nextEnv from "@next/env";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { AnyBulkWriteOperation } from "mongodb";
import { closeDatabase, collections, getDatabase, type CategoryDocument, type MenuItemDocument } from "../lib/database.ts";
import { PAGE_VIEW_RETENTION_SECONDS } from "../lib/visitor-analytics-core.ts";

nextEnv.loadEnvConfig(process.cwd());
const mode = process.argv[2];
if (!['migrate', 'seed', 'verify', 'photos', 'specials'].includes(mode)) throw new Error("Use migrate, seed, verify, photos, or specials.");

type Dish = { name: string; price: string; description?: string; vegetarian?: boolean; vegan?: boolean; tag?: string };
type Snapshot = { menu: { id: string; filter: string; title: string; kicker?: string; items: Dish[] }[]; signatureDishes: { name: string; image: string; description: string }[] };
const snapshot = JSON.parse(readFileSync("db/original-menu.json", "utf8")) as Snapshot;
const dishId = (name: string) => {
  const hash = createHash("sha256").update(`angel-menu:${name}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
};

async function migrate() {
  const database = getDatabase();
  const { categories, menuItems, media, rateLimits, migrations, enquiries, adminSessions, audit, eventReservations, pageViews, visitors } = collections();
  await Promise.all([
    adminSessions.createIndex({ tokenHash: 1 }, { unique: true, name: "admin_session_token" }),
    adminSessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "admin_session_expiry" }),
    audit.createIndex({ at: -1 }, { name: "audit_recent" }),
    enquiries.createIndex({ id: 1 }, { unique: true, name: "enquiry_id" }),
    enquiries.createIndex({ createdAt: -1 }, { name: "enquiry_recent" }),
    // The only read this collection serves: "is any blocking event on this date?".
    eventReservations.createIndex({ eventDate: 1, status: 1 }, { name: "event_date_status" }),
    categories.createIndex({ id: 1 }, { unique: true, name: "category_id" }),
    menuItems.createIndex({ id: 1 }, { unique: true, name: "menu_item_id" }),
    menuItems.createIndex({ visible: 1, available: 1, categoryId: 1, sortOrder: 1 }, { name: "public_menu_order" }),
    media.createIndex({ id: 1 }, { unique: true, name: "media_id" }),
    media.createIndex({ url: 1 }, { unique: true, name: "media_url" }),
    rateLimits.createIndex({ key: 1 }, { unique: true, name: "rate_limit_key" }),
    rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_expiry" }),
    migrations.createIndex({ id: 1 }, { unique: true, name: "migration_id" }),
    // Visitor analytics. Every report filters on a day range, then counts distinct visitors or groups by page,
    // so one compound index answers all of them from the index alone; the TTL index bounds raw-data storage.
    pageViews.createIndex({ day: 1, visitorId: 1, path: 1 }, { name: "page_view_day_visitor_path" }),
    pageViews.createIndex({ at: 1 }, { expireAfterSeconds: PAGE_VIEW_RETENTION_SECONDS, name: "page_view_expiry" }),
    visitors.createIndex({ visitorId: 1 }, { unique: true, name: "visitor_id" }),
  ]);
  for (const id of ["001-menu", "002-events", "003-visitor-analytics"]) await migrations.updateOne({ id }, { $setOnInsert: { id, appliedAt: new Date().toISOString() } }, { upsert: true });
  // Keep the database name visible in the command output without logging its URI.
  console.log(`MongoDB schema is ready in ${database.databaseName}.`);
}

async function seed() {
  const { categories, menuItems, media, migrations } = collections();
  if (await migrations.findOne({ id: "original-menu-seed" }, { projection: { _id: 1 } })) {
    console.log("Original seed already applied; preserving all admin changes and deletions.");
    return;
  }
  const now = new Date().toISOString();
  const categoryWrites = snapshot.menu.map((section, sortOrder) => ({
    updateOne: {
      filter: { id: section.id },
      update: { $setOnInsert: { id: section.id, filter: section.filter, title: section.title, kicker: section.kicker || "", sortOrder } satisfies CategoryDocument },
      upsert: true,
    },
  }));
  await categories.bulkWrite(categoryWrites);

  const mediaWrites: AnyBulkWriteOperation<{ id: string; url: string; createdAt: string }>[] = [];
  const itemWrites: AnyBulkWriteOperation<MenuItemDocument>[] = [];
  for (const section of snapshot.menu) {
    for (const [position, dish] of section.items.entries()) {
      const featured = snapshot.signatureDishes.find(candidate => candidate.name === dish.name);
      const image = featured ? `/angel/${featured.image}.webp` : section.id === "chefs-special" ? "/angel/amritsari-kulcha-stock.webp" : "";
      if (image) mediaWrites.push({ updateOne: { filter: { url: image }, update: { $setOnInsert: { id: dishId(image), url: image, createdAt: now } }, upsert: true } });
      const record: MenuItemDocument = {
        id: dishId(dish.name), name: dish.name, description: dish.description || "", priceCents: Math.round(Number(dish.price.slice(1)) * 100),
        categoryId: section.id, type: section.id === "chefs-special" ? "chef-special" : "regular", image, available: true, visible: true,
        sortOrder: position, vegetarian: !!dish.vegetarian, vegan: !!dish.vegan, tag: dish.tag || "", featured: !!featured,
        featuredDescription: featured?.description || "", createdAt: now, updatedAt: now,
      };
      itemWrites.push({ updateOne: { filter: { id: record.id }, update: { $setOnInsert: record }, upsert: true } });
    }
  }
  if (mediaWrites.length) await media.bulkWrite(mediaWrites);
  await menuItems.bulkWrite(itemWrites);
  await migrations.insertOne({ id: "original-menu-seed", appliedAt: now });
  console.log("Original menu seeded. Existing names, prices, descriptions and categories preserved.");
}

async function verify() {
  const rows = await collections().menuItems.find({}, { projection: { _id: 0 } }).toArray();
  for (const section of snapshot.menu) for (const dish of section.items) {
    const row = rows.find(candidate => candidate.id === dishId(dish.name));
    if (!row || row.name !== dish.name || row.description !== (dish.description || "") || row.priceCents !== Math.round(Number(dish.price.slice(1)) * 100) || row.categoryId !== section.id) throw new Error(`Migration mismatch: ${dish.name}`);
  }
  console.log(`Verified ${rows.length} dishes against the original snapshot.`);
}

// Moves the signature dishes from the original placeholder/stock images to the restaurant's own
// photographs. A dish is only touched while it still shows its original seed image, so any image an
// administrator has uploaded since is left alone. Safe to run more than once.
const photoUpdates = [
  { name: "Tandoori Chicken", from: "tandoori-aceva", to: "tandoori-chicken" },
  { name: "Lamb Rogan Josh", from: "lamb-curry-aceva", to: "lamb-rogan-josh-v2" },
  { name: "Dal Makhni", from: "dal-naan-aceva", to: "dal-makhni" },
<<<<<<< Updated upstream
  { name: "Chole Bhatura", from: "chole-bhature-stock", to: "chole-bhatura-v2" },
  { name: "Chicken Dum Biryani", from: "chicken-biryani-stock", to: "chicken-dum-biryani-v2" },
  { name: "Goat Dum Biryani", from: "goat-biryani-stock", to: "goat-dum-biryani-v2" },
  { name: "Vegetable Dum Biryani", from: "vegetable-biryani-stock", to: "vegetable-dum-biryani-v2" },
  // These five photographs were later replaced under the same file name. Browsers and the image optimizer keep a
  // file for 30 days, so the new versions live under new names; dishes already moved to the old name follow here.
  { name: "Lamb Rogan Josh", from: "lamb-rogan-josh", to: "lamb-rogan-josh-v2" },
  { name: "Chole Bhatura", from: "chole-bhatura", to: "chole-bhatura-v2" },
  { name: "Chicken Dum Biryani", from: "chicken-dum-biryani", to: "chicken-dum-biryani-v2" },
  { name: "Goat Dum Biryani", from: "goat-dum-biryani", to: "goat-dum-biryani-v2" },
  { name: "Vegetable Dum Biryani", from: "vegetable-dum-biryani", to: "vegetable-dum-biryani-v2" },
=======
  { name: "Chole Bhatura", from: "chole-bhature-stock", to: "chole-bhatura" },
  { name: "Chole Bhatura", from: "chole-bhatura-v2", to: "chole-bhatura" },
  { name: "Chicken Dum Biryani", from: "chicken-biryani-stock", to: "chicken-dum-biryani" },
  { name: "Chicken Dum Biryani", from: "chicken-dum-biryani-v2", to: "chicken-dum-biryani" },
  { name: "Goat Dum Biryani", from: "goat-biryani-stock", to: "goat-dum-biryani" },
  { name: "Goat Dum Biryani", from: "goat-dum-biryani-v2", to: "goat-dum-biryani" },
  { name: "Vegetable Dum Biryani", from: "vegetable-biryani-stock", to: "vegetable-dum-biryani" },
  { name: "Vegetable Dum Biryani", from: "vegetable-dum-biryani-v2", to: "vegetable-dum-biryani" },
>>>>>>> Stashed changes
  // The three kulcha dishes shared one stock photo; each now has its own photograph.
  { name: "Amritsari Paneer Kulcha", from: "amritsari-kulcha-stock", to: "amritsari-paneer-kulcha" },
  { name: "Amritsari Aloo Kulcha", from: "amritsari-kulcha-stock", to: "amritsari-aloo-kulcha" },
  { name: "Mix Veg Kulcha", from: "amritsari-kulcha-stock", to: "mix-veg-kulcha" },
];

async function photos() {
  const { menuItems, media } = collections();
  const now = new Date().toISOString();
  for (const { name, from, to } of photoUpdates) {
    const url = `/angel/${to}.webp`;
    // The admin editor only accepts images registered in the media library.
    await media.updateOne({ url }, { $setOnInsert: { id: dishId(url), url, createdAt: now } }, { upsert: true });
    const { modifiedCount } = await menuItems.updateOne({ id: dishId(name), image: `/angel/${from}.webp` }, { $set: { image: url, updatedAt: now } });
    console.log(`${name}: ${modifiedCount ? `now ${url}` : "unchanged (already updated or replaced by an administrator)"}`);
  }
  console.log("The public menu cache refreshes within 10 minutes, or immediately on the next admin save.");
}

// Promote three existing main-course dishes into the curated Chef's Special
// course. Keep prices, descriptions, availability and visibility as edited in
// the admin; only repair their course/type/image and register those image URLs.
async function specials() {
  const { menuItems, media } = collections();
  const names = ["Lamb Rogan Josh", "Dal Makhni", "Butter Chicken"];
  const chef = snapshot.menu.find(section => section.id === "chefs-special");
  if (!chef) throw new Error("Chef's Special course is missing from the menu snapshot.");
  const now = new Date().toISOString();
  for (const [position, name] of names.entries()) {
    const dish = chef.items.find(item => item.name === name);
    const featured = snapshot.signatureDishes.find(item => item.name === name);
    if (!dish || !featured) throw new Error(`Chef's Special source data is missing for ${name}.`);
    const image = `/angel/${featured.image}.webp`;
    await media.updateOne({ url: image }, { $setOnInsert: { id: dishId(image), url: image, createdAt: now } }, { upsert: true });
    const result = await menuItems.updateOne(
      { id: dishId(name) },
      { $set: { categoryId: chef.id, type: "chef-special", image, sortOrder: chef.items.findIndex(item => item.name === name) }, $setOnInsert: { updatedAt: now } },
    );
    if (!result.matchedCount) {
      const record: MenuItemDocument = {
        id: dishId(name), name, description: dish.description || "", priceCents: Math.round(Number(dish.price.slice(1)) * 100),
        categoryId: chef.id, type: "chef-special", image, available: true, visible: true, sortOrder: position,
        vegetarian: !!dish.vegetarian, vegan: !!dish.vegan, tag: dish.tag || "", featured: true,
        featuredDescription: featured.description || "", createdAt: now, updatedAt: now,
      };
      await menuItems.insertOne(record);
    }
    console.log(`${name}: now listed as a Chef's Special.`);
  }
}

try {
  if (mode === "migrate") await migrate();
  if (mode === "seed") await seed();
  if (mode === "verify") await verify();
  if (mode === "photos") await photos();
  if (mode === "specials") await specials();
} finally {
  await closeDatabase();
}
