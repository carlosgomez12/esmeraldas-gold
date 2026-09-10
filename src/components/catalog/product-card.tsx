"use client";

import Link from "next/link";
import { Heart, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { PublicProduct } from "@/lib/data/products";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { buildWhatsAppLink, productEnquiryMessage } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

interface ProductCardProps {
  product: PublicProduct;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useCart((s) => s.setOpen);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const hasWishlist = useWishlist((s) => s.has(product.id));

  const image = product.images[0]?.asset.originalUrl;
  const hasPrice = typeof product.price === "number";
  const outOfStock =
    product.inventory?.stock !== null &&
    product.inventory?.stock !== undefined &&
    product.inventory.stock <= 0;

  const handleAdd = () => {
    if (!hasPrice || outOfStock) return;
    addItem(
      {
        key: product.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image,
        unitAmount: product.price!,
      },
      1
    );
    toast.success(`${product.name} añadido a tu carrito`);
    track.addToCart({ id: product.sku, name: product.name, price: product.price ?? undefined });
    setCartOpen(true);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-ink-900/10 bg-white/70 shadow-sm shadow-ink-900/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink-900/10",
        className
      )}
    >
      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
        }}
        aria-label={hasWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ivory-50/90 shadow-sm backdrop-blur transition-colors hover:bg-ivory-50"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            hasWishlist ? "fill-gold-500 text-gold-500" : "text-ink-700"
          )}
        />
      </button>

      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-ivory-100"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-sm uppercase tracking-[0.2em] text-ink-500">
              Esmeraldas Gold
            </span>
          </div>
        )}
        {product.exclusive ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink-950/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-300 backdrop-blur">
            Pieza exclusiva
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category ? (
          <span className="text-[10px] uppercase tracking-[0.22em] text-gold-700">
            {product.category.name}
          </span>
        ) : null}
        <Link
          href={`/producto/${product.slug}`}
          className="mt-1 font-display text-lg font-medium leading-snug text-ink-900 transition-colors hover:text-gold-700 line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {hasPrice ? (
              <span className="text-sm font-semibold tracking-wide text-ink-900">
                {formatPrice(product.price)}
              </span>
            ) : (
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-gold-700">
                Consultar
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {hasPrice && !outOfStock ? (
              <button
                type="button"
                onClick={handleAdd}
                aria-label="Añadir al carrito"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-ivory-50 transition hover:bg-gold-500 hover:text-ink-950"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            ) : (
              <a
                href={buildWhatsAppLink(productEnquiryMessage(product.name))}
                target="_blank"
                rel="noreferrer"
                aria-label="Consultar disponibilidad"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-esmerald-700/40 px-3 text-esmerald-700 transition hover:bg-esmerald-700 hover:text-ivory-50"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Consultar</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}