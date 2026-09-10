"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface FavoriteProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: number | null;
  currency: string;
  category?: string | null;
  image?: string | null;
}

export default function FavoritosPage() {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const [products, setProducts] = useState<FavoriteProduct[] | undefined>(
    undefined
  );
  const idsKey = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(
          ids
            .map((id) =>
              (data.products as FavoriteProduct[]).find((p) => p.id === id)
            )
            .filter((p): p is FavoriteProduct => Boolean(p))
        );
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, idsKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          <Heart className="h-4 w-4" />
          Tu selección
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
          Favoritos
        </h1>
      </header>

      {ids.length === 0 || products?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-24 text-center">
          <Heart className="mx-auto h-8 w-8 text-gold-500/60" />
          <p className="mt-4 font-display text-2xl font-medium text-ink-900">
            Aún no tienes favoritos
          </p>
          <p className="mt-2 text-sm text-ink-600">
            Guarda las piezas que más te gusten para encontrarlas fácilmente.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
      ) : !products ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => (
            <article
              key={p.id}
              className="relative flex flex-col overflow-hidden rounded-xl border border-ink-900/10 bg-white/70"
            >
              <button
                type="button"
                aria-label="Quitar de favoritos"
                onClick={() => toggle(p.id)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ivory-50/90 shadow-sm"
              >
                <Heart className="h-4 w-4 fill-gold-500 text-gold-500" />
              </button>
              <Link
                href={`/producto/${p.slug}`}
                className="block aspect-[4/5] w-full bg-ivory-100"
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                {p.category ? (
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold-700">
                    {p.category}
                  </span>
                ) : null}
                <Link
                  href={`/producto/${p.slug}`}
                  className="mt-1 font-display text-lg font-medium text-ink-900 hover:text-gold-700"
                >
                  {p.name}
                </Link>
                <div className="mt-auto pt-3">
                  <span className="text-sm font-semibold">
                    {p.price !== null
                      ? formatPrice(p.price, p.currency)
                      : "Consultar"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}