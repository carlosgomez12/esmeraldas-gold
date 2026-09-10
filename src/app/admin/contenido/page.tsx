import { db } from "@/lib/db";
import { PageTitle, AdminBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminContenidoPage() {
  const [testimonials, subscribers, pages] = await Promise.all([
    db.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
      take: 100,
    }),
    db.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: 100,
    }),
    db.sitePage.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div>
      <PageTitle
        title="Contenido"
        description="Testimonios, suscriptores y páginas del sitio."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
          <h2 className="font-display text-xl font-medium text-ink-900">
            Testimonios
            <span className="ml-2 text-sm font-normal text-ink-500">
              {testimonials.length}
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {testimonials.length === 0 ? (
              <p className="text-sm text-ink-500">Sin testimonios aún.</p>
            ) : (
              testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-ink-900/10 bg-ivory-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink-900">
                      {t.name}
                      {t.city ? <span className="ml-2 text-xs text-ink-500">· {t.city}</span> : null}
                    </p>
                    <AdminBadge status={t.active ? "ACTIVE" : "ARCHIVED"} />
                  </div>
                  <p className="mt-1 text-sm text-ink-600">«{t.text}»</p>
                  <p className="mt-1 text-xs text-gold-600">{"★".repeat(t.rating)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="space-y-8">
          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">
              Suscriptores del newsletter
              <span className="ml-2 text-sm font-normal text-ink-500">
                {subscribers.length}
              </span>
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-ink-900/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 bg-ivory-50 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                    <th className="px-4 py-2.5">Correo</th>
                    <th className="px-4 py-2.5">Fuente</th>
                    <th className="px-4 py-2.5">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id} className="border-b border-ink-900/5 last:border-0">
                      <td className="px-4 py-2.5">{s.email}</td>
                      <td className="px-4 py-2.5 text-ink-500">{s.source ?? "home"}</td>
                      <td className="px-4 py-2.5 text-ink-500">
                        {s.subscribedAt.toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">
              Páginas del sitio
              <span className="ml-2 text-sm font-normal text-ink-500">{pages.length}</span>
            </h2>
            <div className="mt-4 space-y-2">
              {pages.length === 0 ? (
                <p className="text-sm text-ink-500">
                  Las páginas legales viven como rutas del código. Aquí aparecerán
                  páginas creadas desde el panel en el próximo ciclo.
                </p>
              ) : (
                pages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-ink-900/10 bg-ivory-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-ink-900">{p.title}</p>
                      <p className="text-xs text-ink-500">/{p.slug}</p>
                    </div>
                    <AdminBadge status={p.published ? "ACTIVE" : "DRAFT"} />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}