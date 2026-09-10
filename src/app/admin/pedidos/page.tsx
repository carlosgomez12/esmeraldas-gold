import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle, AdminBadge, EmptyState } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      number: true,
      customerEmail: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      items: { select: { id: true } },
    },
  });

  return (
    <div>
      <PageTitle title="Pedidos" description="Todas las órdenes de la tienda." />

      {orders.length === 0 ? (
        <EmptyState
          title="No hay pedidos todavía"
          hint="Cuando un cliente complete el checkout, aparecerá aquí."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Artículos</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-ink-900/5 last:border-0 hover:bg-ivory-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-semibold text-gold-700 hover:underline"
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customerEmail}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <AdminBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {order.createdAt.toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}