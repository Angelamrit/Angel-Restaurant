import "server-only";
import { cache } from "react";
import { query } from "./database";
import { money, type Category, type MenuItem, type MenuInput } from "./menu-types";
import { InputError, validateMenu } from "./menu-validation";
import { requireAdmin } from "./admin-access";

function item(row: Record<string, unknown>): MenuItem {
  return { id: String(row.id), name: String(row.name), description: String(row.description), priceCents: Number(row.price_cents),
    categoryId: String(row.category_id), type: row.type as MenuItem["type"], image: String(row.image), available: !!row.available,
    visible: !!row.visible, sortOrder: Number(row.sort_order), vegetarian: !!row.vegetarian, vegan: !!row.vegan,
    tag: String(row.tag), featured: !!row.featured, featuredDescription: String(row.featured_description), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}
export const getCategories = cache(async (): Promise<Category[]> => (await query("SELECT * FROM categories ORDER BY sort_order, id")).map(row => ({ id: String(row.id), filter: String(row.filter), title: String(row.title), kicker: String(row.kicker), sortOrder: Number(row.sort_order) })));
export const getPublicMenu = cache(async () => {
  const [categories, rows] = await Promise.all([getCategories(), query("SELECT * FROM menu_items WHERE visible = 1 AND available = 1 ORDER BY sort_order, name, id")]);
  const items = rows.map(item);
  return { categories, items, sections: categories.map(category => ({ ...category, items: items.filter(dish => dish.categoryId === category.id).map(dish => ({ ...dish, price: money(dish.priceCents) })) })), specials: items.filter(dish => dish.type === "chef-special" || dish.featured) };
});
export async function getAdminMenu() {
  await requireAdmin();
  return (await query("SELECT * FROM menu_items ORDER BY sort_order, name, id")).map(item);
}
export async function getAdminItem(id: string) {
  await requireAdmin();
  const rows = await query("SELECT * FROM menu_items WHERE id = ?", [id]);
  return rows[0] ? item(rows[0]) : null;
}
export async function saveMenu(input: unknown, creating: boolean, version?: string) {
  await requireAdmin();
  const data = validateMenu(input, (await getCategories()).map(category => category.id));
  if (data.image && !(await query("SELECT id FROM media WHERE url = ?", [data.image])).length) throw new InputError("Upload a valid dish image before saving.");
  const now = new Date().toISOString();
  const values = [data.name, data.description, data.priceCents, data.categoryId, data.type, data.image, +data.available, +data.visible, data.sortOrder, +data.vegetarian, +data.vegan, data.tag, +data.featured, data.featuredDescription];
  if (creating) {
    const rows = await query("INSERT INTO menu_items (name, description, price_cents, category_id, type, image, available, visible, sort_order, vegetarian, vegan, tag, featured, featured_description, id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING RETURNING id", [...values, data.id, now, now]);
    if (!rows.length) throw new InputError("This dish was already saved. Return to the dish list.");
  } else {
    if (!version) throw new InputError("Reload this dish before saving.");
    const rows = await query("UPDATE menu_items SET name=?, description=?, price_cents=?, category_id=?, type=?, image=?, available=?, visible=?, sort_order=?, vegetarian=?, vegan=?, tag=?, featured=?, featured_description=?, updated_at=? WHERE id=? AND updated_at=? RETURNING id", [...values, now, data.id, version]);
    if (!rows.length) throw new InputError("This dish changed or was deleted in another session. Reload before saving.");
  }
}
export async function deleteMenu(id: string, version: string) {
  await requireAdmin();
  const rows = await query("DELETE FROM menu_items WHERE id = ? AND updated_at = ? RETURNING id", [id, version]);
  if (!rows.length) throw new InputError("This dish changed or was deleted. Refresh the list and try again.");
}
export async function setMenuStatus(id: string, field: "visible" | "available", enabled: boolean, version: string) {
  const dish = await getAdminItem(id);
  if (!dish) throw new InputError("This dish no longer exists.");
  await saveMenu({ ...dish, [field]: enabled } satisfies MenuInput, false, version);
}
