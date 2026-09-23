export type Category = { id: string; filter: string; title: string; kicker: string; sortOrder: number };
export type MenuItem = {
  id: string; name: string; description: string; priceCents: number; categoryId: string;
  type: "regular" | "chef-special"; image: string; available: boolean; visible: boolean;
  sortOrder: number; vegetarian: boolean; vegan: boolean; tag: string;
  featured: boolean; featuredDescription: string; createdAt: string; updatedAt: string;
};
export type MenuInput = Omit<MenuItem, "createdAt" | "updatedAt">;
export type PublicSection = Category & { items: (MenuItem & { price: string })[] };
export const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
