import "server-only";

import type { Role } from "@/generated/prisma/client";
import { roleLabel } from "@/lib/auth/role-label";

export const ALL_PERMISSIONS = [
  "dashboard.view",
  "products.read",
  "products.create",
  "products.update",
  "products.delete",
  "products.duplicate",
  "products.feature",
  "media.manage",
  "categories.manage",
  "collections.manage",
  "inventory.manage",
  "orders.read",
  "orders.update",
  "customers.read",
  "customers.update",
  "leads.read",
  "leads.update",
  "promotions.manage",
  "content.manage",
  "seo.manage",
  "settings.manage",
  "users.manage",
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  ADMIN: [...ALL_PERMISSIONS.filter((p) => p !== "users.manage")],
  EDITOR: [
    "dashboard.view",
    "products.read",
    "products.create",
    "products.update",
    "products.duplicate",
    "products.feature",
    "media.manage",
    "categories.manage",
    "collections.manage",
    "content.manage",
    "seo.manage",
  ],
  SALES: [
    "dashboard.view",
    "products.read",
    "orders.read",
    "orders.update",
    "customers.read",
    "customers.update",
    "leads.read",
    "leads.update",
  ],
};

export { roleLabel };