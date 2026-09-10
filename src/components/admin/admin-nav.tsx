"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNav, getNavigationFor, type AdminNavItem } from "./admin-nav-data";

export { adminNav, getNavigationFor };
export type { AdminNavItem };

export function AdminSidebar({ permissions = [] }: { permissions?: string[] }) {
  const pathname = usePathname();
  const items = adminNav.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  return (
    <>
      <Link href="/" className="mb-8 block px-6" aria-label="Volver a la tienda">
        <span className="font-display text-lg font-semibold uppercase tracking-[0.14em] text-ivory-50">
          Esmeraldas&nbsp;Gold
        </span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.28em] text-gold-400">
          Panel de administración
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-ivory-200/70 hover:bg-ivory-50/5 hover:text-ivory-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ivory-50/10 p-4">
        <Link
          href="/"
          className="text-xs text-ivory-200/60 transition hover:text-gold-400"
        >
          ← Ver la tienda
        </Link>
      </div>
    </>
  );
}