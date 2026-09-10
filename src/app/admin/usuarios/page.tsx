import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/guards";
import { PageTitle } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const session = await getSessionUser();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      permissions: { select: { permissionId: true } },
    },
  });

  return (
    <div>
      <PageTitle
        title="Usuarios"
        description="Equipo con acceso al panel y sus roles."
      />
      <UsersManager
        isSuperAdmin={isSuperAdmin}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
          permissionCount: u.permissions.length,
        }))}
      />
    </div>
  );
}