import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { SettingsEditor } from "@/components/admin/settings-editor";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const [settings, seoRows] = await Promise.all([
    db.siteSettings.findMany({ orderBy: { key: "asc" } }),
    db.seoData.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        title: true,
        description: true,
        robots: true,
        updatedAt: true,
      },
    }),
  ]);

  return (
    <div>
      <PageTitle title="SEO" description="Metadatos globales y por página." />

      <section className="mb-8">
        <h2 className="mb-1 font-display text-xl font-medium text-ink-900">
          Metadatos globales
        </h2>
        <p className="mb-4 text-sm text-ink-600">
          El SEO por producto, categoría y colección se edita desde cada entidad.
          Estas claves controlan los defaults del sitio (se sugieren{" "}
          <code>seo_home</code>, <code>seo_catalogo</code>, <code>seo_contacto</code>).
        </p>
        <SettingsEditor
          settings={settings.map((s) => ({
            key: s.key,
            valueJson: JSON.stringify(s.value, null, 2),
          }))}
          allowCreate
        />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-medium text-ink-900">
          SEO por entidad
        </h2>
        {seoRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-12 text-center text-sm text-ink-600">
            Aún no hay metadatos personalizados por entidad.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                  <th className="px-4 py-3">Entidad</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Robots</th>
                  <th className="px-4 py-3">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {seoRows.map((row) => (
                  <tr key={row.id} className="border-b border-ink-900/5 last:border-0">
                    <td className="px-4 py-3">
                      <span className="rounded bg-ink-900/5 px-2 py-0.5 text-xs uppercase text-ink-600">
                        {row.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-64 truncate">{row.title ?? "—"}</td>
                    <td className="px-4 py-3 max-w-96 truncate">{row.description ?? "—"}</td>
                    <td className="px-4 py-3">{row.robots ?? "index,follow"}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {row.updatedAt.toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-ink-500">
          La edición por entidad vive en los formularios de producto, categoría y
          colección. Consulta{" "}
          <Link href="/sitemap.xml" className="text-gold-700 underline">
            /sitemap.xml
          </Link>{" "}
          y{" "}
          <Link href="/robots.txt" className="text-gold-700 underline">
            /robots.txt
          </Link>
          .
        </p>
      </section>
    </div>
  );
}