"use client";

import { useEffect } from "react";
import { Heart, RefreshCw, Share2, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { buildWhatsAppLink, productEnquiryMessage } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

interface ProductActionsProps {
  product: {
    id: string;
    slug: string;
    sku: string;
    name: string;
    price: number | null;
    compareAtPrice: number | null;
    currency: string;
    image?: string | null;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useCart((s) => s.setOpen);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const hasWishlist = useWishlist((s) => s.has(product.id));

  useEffect(() => {
    track.viewItem({
      id: product.sku,
      name: product.name,
      price: product.price ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const hasPrice = typeof product.price === "number";

  const handleAdd = () => {
    if (!hasPrice) return;
    const key = product.id;
    addItem(
      {
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        unitAmount: product.price!,
      },
      1
    );
    toast.success("Pieza añadida a tu carrito");
    track.addToCart({
      id: product.sku,
      name: product.name,
      price: product.price ?? undefined,
    });
    setCartOpen(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/producto/${product.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const discount =
    hasPrice && product.compareAtPrice
      ? Math.round(
          (1 - product.price! / product.compareAtPrice) * 100
        )
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          {hasPrice ? (
            <>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-semibold text-ink-900">
                  {formatPrice(product.price, product.currency)}
                </span>
                {discount ? (
                  <>
                    <span className="text-sm text-ink-500 line-through">
                      {formatPrice(product.compareAtPrice, product.currency)}
                    </span>
                    <span className="rounded-full bg-esmerald-700/10 px-2.5 py-1 text-xs font-semibold text-esmerald-800">
                      −{discount}%
                    </span>
                  </>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Impuestos incluidos · Métodos de pago seguros
              </p>
            </>
          ) : (
            <div>
              <span className="font-display text-3xl font-semibold uppercase tracking-wide text-gold-700">
                Consultar
              </span>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
                Esta pieza no tiene precio visible. Escríbenos por WhatsApp y te
                confirmamos disponibilidad y condiciones.
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            hasWishlist ? "Quitar de favoritos" : "Añadir a favoritos"
          }
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition hover:border-gold-500 hover:text-gold-700"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              hasWishlist ? "fill-gold-500 text-gold-500" : ""
            )}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {hasPrice ? (
          <Button variant="gold" size="lg" className="flex-1" onClick={handleAdd}>
            <ShoppingBag className="h-4 w-4" />
            Añadir y pedir
          </Button>
        ) : null}
        <Button
          asChild
          variant={hasPrice ? "outline" : "gold"}
          size="lg"
          className={hasPrice ? "flex-1" : "w-full"}
        >
          <a
            href={buildWhatsAppLink(productEnquiryMessage(product.name))}
            target="_blank"
            rel="noreferrer"
            onClick={() => track.contact("whatsapp_product")}
          >
            <MessageCircle className="h-4 w-4" />
            {hasPrice ? "Consultar por WhatsApp" : "Pedir esta pieza"}
          </a>
        </Button>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink-600">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 transition hover:text-gold-700"
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartir
        </button>
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Devoluciones y cambios coordinados
        </span>
      </div>
    </div>
  );
}