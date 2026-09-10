"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/auth/role-label";

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  permissionCount?: number;
}

export function UsersManager({
  users,
  isSuperAdmin,
}: {
  users: UserRow[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const result = await createUser(fd);
    setBusy(false);
    if (result.ok) {
      toast.success("Usuario creado");
      e.currentTarget.reset();
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo crear el usuario");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      {isSuperAdmin ? (
        <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
          <h2 className="font-display text-xl font-medium text-ink-900">
            Nuevo usuario
          </h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nombre (opcional)</Label>
              <Input id="user-name" name="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Correo</Label>
              <Input id="user-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Contraseña (mín. 8)</Label>
              <Input id="user-password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Rol</Label>
              <Select id="user-role" name="role" defaultValue="SALES">
                <option value="ADMIN">Administrador</option>
                <option value="EDITOR">Editor</option>
                <option value="SALES">Ventas</option>
              </Select>
            </div>
            <Button type="submit" variant="gold" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Crear usuario
            </Button>
          </form>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 p-6 text-sm text-ink-600">
          Solo el super administrador puede crear o administrar usuarios.
        </section>
      )}

      <section>
        <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
          <table className="w-full min-w-140 text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-ink-900/5 last:border-0 hover:bg-ivory-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{user.name ?? "—"}</p>
                    <p className="text-xs text-ink-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-ink-900/15 bg-ivory-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                      {roleLabel(user.role as never)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.active
                          ? "text-esmerald-800"
                          : "text-ink-400"
                      }
                    >
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {new Date(user.createdAt).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}