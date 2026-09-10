import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Layers,
  Image,
  Inbox,
  Settings,
  Shield,
  FileText,
  Search as SearchIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/admin/productos", label: "Productos", icon: Package, permission: "products.read" },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart, permission: "orders.read" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, permission: "customers.read" },
  { href: "/admin/leads", label: "Leads", icon: Inbox, permission: "leads.read" },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, permission: "categories.manage" },
  { href: "/admin/colecciones", label: "Colecciones", icon: Layers, permission: "collections.manage" },
  { href: "/admin/media", label: "Medios", icon: Image, permission: "media.manage" },
  { href: "/admin/seo", label: "SEO", icon: SearchIcon, permission: "seo.manage" },
  { href: "/admin/contenido", label: "Contenido", icon: FileText, permission: "content.manage" },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, permission: "settings.manage" },
  { href: "/admin/usuarios", label: "Usuarios", icon: Shield, permission: "users.manage" },
];

export function getNavigationFor(permissions: Set<string>): AdminNavItem[] {
  return adminNav.filter(
    (item) => !item.permission || permissions.has(item.permission)
  );
}