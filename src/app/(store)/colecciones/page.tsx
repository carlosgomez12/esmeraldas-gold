import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getCollections } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Colecciones",
  description:
    "Descubre las colecciones de Esmeraldas Gold: ediciones de joyas en oro y esmeraldas llenas de historia.",
  alternates: { canonical: "/colecciones" },
};

export default async function ColeccionesPage() {
  const collections = await getCollections();

  return (
    <>
      <PageHeader
        eyebrow="Ediciones y universos"
        title="Colecciones"
        description="Cada colección cuenta una historia: una piedra, un gesto, un legado."
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {collections.length === 0 ? (
          <p className="py-16 text-center text-ink-600">
            Las colecciones estarán disponibles muy pronto.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/colecciones/${collection.slug}`}
                className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl border border-ink-900/10 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-900/10"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, rgba(201,163,92,0.35), transparent 55%), linear-gradient(135deg, #f7f3ea 0%, #efe8d8 60%, #e6dcc8 100%)",
                }}
              >
                {collection.exclusive ? (
                  <span className="absolute right-5 top-5 rounded-full bg-ink-950/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300">
                    Exclusiva
                  </span>
                ) : null}
                <div>
                  <h2 className="font-display text-3xl font-medium text-ink-900 transition-colors group-hover:text-gold-700">
                    {collection.name}
                  </h2>
                  {collection.description ? (
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-600 line-clamp-3">
                      {collection.description}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                    {collection._count.products} piezas · Descubrir
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}