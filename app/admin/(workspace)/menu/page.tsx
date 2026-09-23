import Link from "next/link";
import { getAdminMenu, getCategories } from "@/lib/menu-repository";
import { MenuTable } from "@/components/admin/menu-table";
export default async function MenuAdmin({ searchParams }: { searchParams: Promise<{ type?: string; saved?: string }> }) {
  const items = await getAdminMenu();
  const [categories, params] = await Promise.all([getCategories(), searchParams]);
  return <><div className="admin-page-head"><div><p className="eyebrow">FROM YOUR KITCHEN</p><h1>The menu</h1><p>Keep every dish, detail and price up to date.</p></div><Link href="/admin/menu/new" className="admin-button primary">+ Add dish</Link></div><MenuTable items={items} categories={categories} initialType={params.type} saved={params.saved === "1"} /></>;
}
