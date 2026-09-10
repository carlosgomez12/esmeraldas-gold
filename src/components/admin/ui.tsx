import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium text-ink-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-600">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ivory-50 transition hover:bg-gold-500 hover:text-ink-950"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string | number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight
          ? "border-gold-500/40 bg-gradient-to-br from-white to-gold-500/10"
          : "border-ink-900/10 bg-white/70"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function AdminBadge({
  status,
}: {
  status: string;
}) {
  const map: Record<string, { label: string; variant: "ink" | "emerald" | "gold" | "ivory" | "outline" }> = {
    ACTIVE: { label: "Activo", variant: "emerald" },
    DRAFT: { label: "Borrador", variant: "ivory" },
    ARCHIVED: { label: "Archivado", variant: "outline" },
    PENDING: { label: "Pendiente", variant: "gold" },
    CONFIRMED: { label: "Confirmado", variant: "emerald" },
    PROCESSING: { label: "En proceso", variant: "gold" },
    SHIPPED: { label: "Enviado", variant: "ink" },
    DELIVERED: { label: "Entregado", variant: "emerald" },
    CANCELLED: { label: "Cancelado", variant: "outline" },
    REFUNDED: { label: "Reembolsado", variant: "outline" },
    PAID: { label: "Pagado", variant: "emerald" },
    FAILED: { label: "Fallido", variant: "outline" },
    NEW: { label: "Nuevo", variant: "gold" },
    SOLD: { label: "Vendido", variant: "emerald" },
  };
  const conf = map[status] ?? { label: status, variant: "ivory" as const };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-16 text-center">
      <p className="font-display text-xl font-medium text-ink-900">{title}</p>
      {hint ? <p className="mt-2 text-sm text-ink-600">{hint}</p> : null}
    </div>
  );
}