import type { MenuInput } from "./menu-types";

export class InputError extends Error {}
export function validateMenu(input: unknown, categoryIds: string[]): MenuInput {
  if (!input || typeof input !== "object") throw new InputError("Please check the dish details.");
  const value = input as Record<string, unknown>;
  const text = (key: string, max: number, required = false) => {
    const field = value[key];
    if (typeof field !== "string" || field.length > max || (required && !field.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(field)) throw new InputError(`Please enter a valid ${key}.`);
    return field.trim();
  };
  const flag = (key: string) => {
    if (typeof value[key] !== "boolean") throw new InputError(`Please select ${key}.`);
    return value[key] as boolean;
  };
  const id = text("id", 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new InputError("Invalid dish identifier.");
  const categoryId = text("categoryId", 80, true);
  if (!categoryIds.includes(categoryId)) throw new InputError("Choose an existing category.");
  if (value.type !== "regular" && value.type !== "chef-special") throw new InputError("Choose a valid dish type.");
  if (typeof value.priceCents !== "number" || !Number.isInteger(value.priceCents) || value.priceCents < 0 || value.priceCents > 1000000) throw new InputError("Price must be between $0 and $10,000, with at most two decimals.");
  if (typeof value.sortOrder !== "number" || !Number.isInteger(value.sortOrder) || Math.abs(value.sortOrder) > 100000) throw new InputError("Sort order must be a whole number between -100000 and 100000.");
  const image = text("image", 1000);
  if (value.type === "chef-special" && !image) throw new InputError("Upload an image for this Chef Special.");
  if (value.featured === true && !image) throw new InputError("Upload an image before featuring this dish.");
  const vegan = flag("vegan");
  return { id, name: text("name", 120, true), description: text("description", 2000), priceCents: value.priceCents,
    categoryId, type: value.type, image, available: flag("available"), visible: flag("visible"), sortOrder: value.sortOrder,
    vegetarian: flag("vegetarian") || vegan, vegan, tag: text("tag", 60), featured: flag("featured"), featuredDescription: text("featuredDescription", 2000) };
}
