import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { getUserPermissionKeys } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/acceso");

  const permissions = await getUserPermissionKeys(user.id);

  return (
    <div className="min-h-screen bg-[#0b0a08]">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-950 py-6 lg:flex">
          <AdminSidebar permissions={[...permissions]} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col bg-ivory-100">
          <AdminTopbar user={user} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}