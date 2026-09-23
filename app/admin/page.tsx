import Link from "next/link";
import { redirect } from "next/navigation";
import { accessConfigured, isAdmin } from "@/lib/admin-access";
import { LoginForm } from "@/components/admin/login-form";
export default async function AdminEntry() {
  if (await isAdmin()) redirect("/admin/dashboard");
  return <main id="main-content" className="admin-login"><div className="admin-panel"><p className="admin-brand"><span>angel</span><small>RESTAURANT MANAGEMENT</small></p><h1>A warm welcome<br />behind the scenes.</h1><p className="admin-muted">Your menu, thoughtfully managed.</p><LoginForm configured={accessConfigured()} /><Link href="/">← Back to the restaurant</Link></div></main>;
}
