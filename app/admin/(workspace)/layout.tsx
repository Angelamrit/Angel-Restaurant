import { requireAdminPage } from "@/lib/admin-access";
import { AdminNav } from "@/components/admin/admin-nav";
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <div className="admin-workspace"><AdminNav /><main id="main-content" className="admin-main" tabIndex={-1}><header className="admin-topbar"><span>ANGEL / MANAGEMENT</span><span className="admin-badge">Administrator workspace</span></header>{children}</main></div>;
}
