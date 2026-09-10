import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/catalog/product-card";
import { GoldDivider } from "@/components/ui/separator";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await db.collection.findUnique({ where: { slug } });
  return {
    title: collection?.name ?? "Colección",
    description: collection?.description ?? undefined,
    alternates: { canonical: `/colecciones/${slug}` },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const [collection, { products }] = await Promise.all([
    db.collection.findUnique({ where: { slug } }),
    getProducts({ coleccion: slug }),
  ]);

  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          {collection.exclusive ? "Edición exclusiva" : "Colección"}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600">
            {collection.description}
          </p>
        ) : null}
        <GoldDivider className="mt-5" />
      </header>

      {products.length === 0 ? (
        <p className="py-16 text-center text-ink-600">
          Las piezas de esta colección se anunciarán próximamente. Escríbenos
          para conocerlas antes.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}