import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { PageTitle, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const LEAD_STATUS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Calificado",
  CLOSED: "Cerrado",
  LOST: "Perdido",
};

function LeadBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: "bg-gold-500/10 text-gold-700 border-gold-500/40",
    CONTACTED: "border-ink-900/15 bg-ivory-50 text-ink-700",
    QUALIFIED: "bg-esmerald-700/10 text-esmerald-800 border-esmerald-700/30",
    CLOSED: "border-ink-900/20 bg-ink-900 text-ivory-50",
    LOST: "border-ink-900/20 text-ink-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${map[status] ?? "border-ink-900/15 bg-ivory-50 text-ink-700"}`}
    >
      {LEAD_STATUS[status] ?? status}
    </span>
  );
}

export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      product: { select: { name: true, slug: true } },
      assignedTo: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <PageTitle title="Leads" description="Consultas de asesoría por WhatsApp y web." />

      {leads.length === 0 ? (
        <EmptyState
          title="No hay leads todavía"
          hint="Cuando alguien consulte una pieza o envíe el formulario de contacto, aparecerá aquí."
        />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-ink-900/10 bg-white/70 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-medium text-ink-900">
                      {lead.name ?? "Anónimo"}
                    </p>
                    <LeadBadge status={lead.status} />
                    <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400">
                      {lead.source}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {lead.email ? `${lead.email} · ` : ""}
                    {lead.phone ?? "sin teléfono"} ·{" "}
                    {lead.createdAt.toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {lead.phone ? (
                    <Link
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-esmerald-700/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-esmerald-800 transition hover:bg-esmerald-700/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Link>
                  ) : null}
                </div>
              </div>
              {lead.message ? (
                <p className="mt-3 max-w-prose rounded-xl bg-ivory-50 px-4 py-3 text-sm text-ink-700">
                  {lead.message}
                </p>
              ) : null}
              {lead.product ? (
                <p className="mt-2 text-sm text-ink-600">
                  Interesado/a en{" "}
                  <Link
                    href={`/producto/${lead.product.slug}`}
                    className="text-gold-700 underline decoration-gold-500/40 underline-offset-2"
                  >
                    {lead.product.name}
                  </Link>
                </p>
              ) : null}
              {lead.assignedTo ? (
                <p className="mt-2 text-xs text-ink-500">
                  Asignado a {lead.assignedTo.name ?? lead.assignedTo.email}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}