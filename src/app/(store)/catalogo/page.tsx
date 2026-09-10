import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/catalog/product-card";
import { CatalogControls } from "@/components/catalog/catalog-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { GoldDivider } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Catálogo de joyas en oro y esmeraldas",
  description:
    "Explora nuestra selección de anillos, cadenas, pendientes y piezas exclusivas en oro y esmeraldas colombianas.",
  alternates: { canonical: "/catalogo" },
};

interface CatalogPageProps {
  searchParams: Promise<{
    buscar?: string;
    categoria?: string;
    coleccion?: string;
    maxPrice?: string;
    orden?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts({
      buscar: params.buscar,
      categoria: params.categoria,
      coleccion: params.coleccion,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      orden: params.orden as never,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          Esmeraldas Gold
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
          Catálogo
        </h1>
        <GoldDivider className="mt-5" />
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600">
          Cada pieza es única o de edición limitada. Si una pieza no muestra
          precio, escríbenos: te asesoramos con gusto.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        }
      >
        <div className="mb-10">
          <CatalogControls categories={categories} total={total} />
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-24 text-center">
            <h2 className="font-display text-2xl font-medium text-ink-900">
              No encontramos piezas con esos filtros
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Prueba con otros términos o escríbenos y te ayudamos a encontrar
              la pieza ideal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}