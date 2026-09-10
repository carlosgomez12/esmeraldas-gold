import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle, AdminBadge } from "@/components/admin/ui";
import { OrderStatusForm, OrderNotesForm } from "@/components/admin/order-controls";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { id: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      shippingAddress: true,
      customer: true,
    },
  });

  if (!order) notFound();

  return (
    <div>
      <PageTitle title={`Pedido ${order.number}`} description={order.customerEmail} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">
              Artículos
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-ink-900/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 bg-ivory-50 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                    <th className="px-4 py-2.5">Producto</th>
                    <th className="px-4 py-2.5">SKU</th>
                    <th className="px-4 py-2.5 text-right">Cant.</th>
                    <th className="px-4 py-2.5 text-right">Precio unit.</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-ink-900/5 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-ink-900">{item.name}</td>
                      <td className="px-4 py-3 text-ink-600">{item.sku}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ml-auto w-full max-w-72 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.itemsTotal)}</span>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-ink-600">
                  <span>Descuento</span>
                  <span>− {formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-600">
                <span>Envío</span>
                <span>
                  {order.shippingFee === 0 ? "Gratis" : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.taxAmount > 0 ? (
                <div className="flex justify-between text-ink-600">
                  <span>Impuestos</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-ink-900/10 pt-2 font-display text-lg text-ink-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">Pagos</h2>
            <div className="mt-4 space-y-3">
              {order.payments.length === 0 ? (
                <p className="text-sm text-ink-500">Sin pagos registrados.</p>
              ) : (
                order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-ivory-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-ink-900">
                        {formatPrice(payment.amount)} · {payment.provider}
                      </p>
                      <p className="text-xs text-ink-500">
                        {payment.method ?? "Método no especificado"} · ref {payment.providerReference ?? "—"}
                      </p>
                    </div>
                    <AdminBadge status={payment.status} />
                  </div>
                ))
              )}
            </div>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
              <h2 className="font-display text-xl font-medium text-ink-900">
                Nota del cliente
              </h2>
              <p className="mt-3 max-w-prose text-sm text-ink-700">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-lg font-medium text-ink-900">Estado</h2>
            <p className="mb-4 mt-1 flex items-center gap-2 text-sm text-ink-600">
              Pago: <AdminBadge status={order.paymentStatus} />
            </p>
            <OrderStatusForm orderId={order.id} current={order.status} />
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-lg font-medium text-ink-900">Envío</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Destinatario</dt>
                <dd className="text-ink-900">{order.shippingName}</dd>
              </div>
              <div className="pt-2">
                <dt className="text-xs uppercase tracking-wide text-ink-500">Dirección</dt>
                <dd className="text-ink-900">
                  {order.shippingLine1}
                  {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                  <br />
                  {order.shippingCity}
                  {order.shippingRegion ? `, ${order.shippingRegion}` : ""}
                  {order.shippingPostalCode ? ` · ${order.shippingPostalCode}` : ""}
                </dd>
              </div>
              {order.customerPhone ? (
                <div className="pt-2">
                  <dt className="text-xs uppercase tracking-wide text-ink-500">Teléfono</dt>
                  <dd className="text-ink-900">{order.customerPhone}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-lg font-medium text-ink-900">Notas del equipo</h2>
            <div className="mt-3">
              <OrderNotesForm orderId={order.id} initial={order.adminNotes} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}