"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { roleLabel } from "@/lib/auth/role-label";

export function AdminTopbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: string };
}) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-ivory-50/10 bg-ink-950 px-6 text-ivory-100">
      <div>
        <p className="text-sm font-medium text-ivory-50">
          {user.name ?? "Administrador"}
        </p>
        <p className="text-xs text-ivory-200/60">
          {user.email} · {roleLabel(user.role as never)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/acceso" })}
        className="inline-flex items-center gap-2 rounded-full border border-ivory-50/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory-100 transition hover:border-gold-400 hover:text-gold-400"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}