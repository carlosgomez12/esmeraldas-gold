import "server-only";

import { redirect } from "next/navigation";
import { auth, userCan, isStaffRole } from "@/auth";
import type { Role } from "@/generated/prisma/client";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export async function getSession() {
  return auth();
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
}

/** Requiere sesión de staff; redirige a /acceso si no hay sesión. */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !isStaffRole(user.role)) redirect("/acceso");
  return user;
}

/**
 * Guarda para server actions. Devuelve `{ ok, error }` en lugar de lanzar,
 * para poder responder de forma tipada a formularios de admin.
 */
export async function can(
  userId: string,
  permission: string
): Promise<{ ok: boolean; error?: string }> {
  const allowed = await userCan(userId, permission);
  return allowed
    ? { ok: true }
    : { ok: false, error: "No tienes permisos para realizar esta acción." };
}

/** Guarda para server actions de SUPER_ADMIN. */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  return (await auth())?.user?.role === "SUPER_ADMIN";
}