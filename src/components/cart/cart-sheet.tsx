"use client";

import Link from "next/link";
import { Plus, Minus, Trash2, MessageCircle, MapPin } from "lucide-react";
import { Sheet, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppLink, productEnquiryMessage } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

export function CartSheet() {
  const { items, open, setOpen, setQty, removeItem, subtotal, clear } = useCart();
  const count = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      className="max-w-md"
    >
      <SheetHeader
        title="Tu carrito"
        subtitle={
          count > 0
            ? `${count} ${count === 1 ? "pieza seleccionada" : "piezas seleccionadas"}`
            : "Todavía no hay piezas en tu carrito"
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-ink-600">
              Tu carrito está vacío. Explora nuestra colección y vuelve cuando
              tengas tu pieza favorita.
            </p>
            <Button asChild variant="outline" size="md" onClick={() => setOpen(false)}>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-5">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex gap-4 border-b border-ink-900/10 pb-5"
              >
                <Link
                  href={`/producto/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ivory-200"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="font-display text-base font-medium text-ink-900 hover:text-gold-700 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <span className="mt-0.5 text-xs tracking-[0.12em] text-gold-700 uppercase">
                    {formatPrice(item.unitAmount)}
                  </span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-full border border-ink-900/15">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center text-ink-600"
                        onClick={() => setQty(item.key, item.qty - 1)}
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center text-ink-600"
                        onClick={() => setQty(item.key, item.qty + 1)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:text-red-700"
                      aria-label="Quitar del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 ? (
        <div className="border-t border-ink-900/10 px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.14em] text-ink-600">
              Subtotal
            </span>
            <span className="font-display text-2xl font-semibold text-ink-900">
              {formatPrice(subtotal())}
            </span>
          </div>
          <div className="space-y-2">
            <Button asChild variant="gold" size="lg" className="w-full">
              <Link
                href="/checkout"
                onClick={() => {
                  setOpen(false);
                  track.beginCheckout(subtotal());
                }}
              >
                Finalizar compra
              </Link>
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-600">
              <MapPin className="h-3.5 w-3.5 text-gold-700" />
              Envío asegurado a todo el país
            </p>
            <button
              type="button"
              onClick={() => {
                const msg = items
                  .map(
                    (i) => `${i.qty}× ${i.name} (${formatPrice(i.unitAmount)})`
                  )
                  .join("\n");
                window.open(
                  buildWhatsAppLink(
                    `Hola, me gustaría completar mi pedido:\n\n${msg}\n\nTotal estimado: ${formatPrice(subtotal())}`
                  ),
                  "_blank"
                );
                track.contact("whatsapp_cart");
              }}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm text-esmerald-700 hover:text-esmerald-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Completar pedido por WhatsApp
            </button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}