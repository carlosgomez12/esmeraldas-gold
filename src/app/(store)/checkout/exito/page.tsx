import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderPublic } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const result = orderId ? await getOrderPublic(orderId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-16 w-16 text-esmerald-700" />
      <h1 className="mt-6 font-display text-4xl font-medium text-ink-900">
        Pedido confirmado
      </h1>
      <p className="mt-3 leading-relaxed text-ink-600">
        Gracias por confiar en Esmeraldas Gold. Si tu pieza está disponible,
        nuestro equipo te contactará para coordinar la entrega y resolver
        cualquier detalle.
      </p>

      {result?.ok && result.order ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-ink-900/10 bg-white/70 p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-ink-600">Número de pedido</span>
            <span className="font-semibold text-ink-900">
              {result.order.number}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-600">Pago</span>
            <span className="font-semibold text-emerald-700">
              {result.order.paymentStatus === "PAID"
                ? "Pagado"
                : "Pendiente de confirmación"}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-600">Total</span>
            <span className="font-display text-lg font-semibold text-ink-900">
              {formatPrice(result.order.total, result.order.currency)}
            </span>
          </div>
          <div className="mt-4 border-t border-ink-900/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              Piezas
            </p>
            <ul className="mt-2 space-y-1">
              {result.order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm text-ink-700">
                  <span>{item.name}</span>
                  <span>× {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/catalogo">Seguir explorando</Link>
        </Button>
        <Button asChild variant="gold">
          <a href={buildWhatsAppLink("Hola, acabo de hacer un pedido y quiero confirmarlo.")} target="_blank" rel="noreferrer">
            Contactar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}