import { notFound } from "next/navigation";
import { getAdminItem, getCategories } from "@/lib/menu-repository";
import { MenuForm } from "@/components/admin/menu-form";
export default async function EditDish({ params }: { params: Promise<{ id: string }> }) {
  const dish = await getAdminItem((await params).id);
  if (!dish) notFound();
  return <><div className="admin-page-head"><div><p className="eyebrow">MENU / EDIT DISH</p><h1>{dish.name}</h1><p>Refine the details, then save to update your menu.</p></div></div><MenuForm key={dish.updatedAt} categories={await getCategories()} dish={dish} /></>;
}
