import { requireAdminPage } from "@/lib/admin-access";
import { getCategories } from "@/lib/menu-repository";
import { MenuForm } from "@/components/admin/menu-form";
export default async function NewDish() {
  await requireAdminPage();
  return <><div className="admin-page-head"><div><p className="eyebrow">MENU / NEW DISH</p><h1>Something delicious.</h1><p>Add a new dish to Angel’s menu.</p></div></div><MenuForm categories={await getCategories()} /></>;
}
