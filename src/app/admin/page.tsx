import Link from "next/link";
import { db } from "@/lib/db";
import { userCan } from "@/auth";
import { getSessionUser } from "@/lib/auth/guards";
import { PageTitle, StatCard, AdminBadge, EmptyState } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSessionUser();
  const adminId = session?.id ?? "";

  const [products, orders, customers, leads, recentOrders] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.customer.count(),
    db.lead.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        number: true,
        customerEmail: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
    }),
  ]);

  const totalSales = await db.order.aggregate({
    _sum: { total: true },
    where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
  });

  const [canSeeProducts, canSeeOrders, canSeeCustomers, canSeeLeads] =
    await Promise.all([
      userCan(adminId, "products.read"),
      userCan(adminId, "orders.read"),
      userCan(adminId, "customers.read"),
      userCan(adminId, "leads.read"),
    ]);

  return (
    <div>
      <PageTitle
        title="Dashboard"
        description="Resumen general de la tienda."
        action={{ label: "Nuevo producto", href: "/admin/productos/nuevo" }}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canSeeProducts ? (
          <StatCard label="Productos" value={products} hint="En el catálogo completo" />
        ) : null}
        <StatCard label="Pedidos totales" value={orders} hint="Todos los estados" highlight />
        <StatCard
          label="Ventas"
          value={formatPrice(totalSales._sum.total ?? 0)}
          hint="Excluye cancelados y reembolsos"
          highlight
        />
        {canSeeCustomers ? <StatCard label="Clientes" value={customers} /> : null}
        {canSeeLeads ? <StatCard label="Leads" value={leads} hint="Contactos por asesorar" /> : null}
      </div>

      <h2 className="mb-4 font-display text-xl font-medium text-ink-900">
        Pedidos recientes
      </h2>
      {canSeeOrders ? (
        recentOrders.length === 0 ? (
          <EmptyState title="Todavía no hay pedidos" hint="Cuando un cliente finalice su compra, aparecerá aquí." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ivory-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-gold-700 hover:underline">
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customerEmail}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3"><AdminBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3"><AdminBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-ink-500">
                      {order.createdAt.toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <EmptyState title="Sin acceso a pedidos" />
      )}
    </div>
  );
}