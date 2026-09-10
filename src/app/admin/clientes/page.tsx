import { db } from "@/lib/db";
import { PageTitle, EmptyState } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      marketingOptIn: true,
      createdAt: true,
      orders: { select: { total: true, status: true } },
    },
  });

  return (
    <div>
      <PageTitle title="Clientes" description="Base de clientes y su historial de compra." />

      {customers.length === 0 ? (
        <EmptyState
          title="No hay clientes registrados"
          hint="Los clientes aparecen cuando realizan su primera compra."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Total comprado</th>
                <th className="px-4 py-3">Newsletter</th>
                <th className="px-4 py-3">Desde</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const totalSpent = customer.orders
                  .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
                  .reduce((sum, o) => sum + o.total, 0);
                const name = [customer.firstName, customer.lastName]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-ink-900/5 last:border-0 hover:bg-ivory-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{name || "—"}</p>
                      <p className="text-xs text-ink-500">{customer.email ?? "sin correo"}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{customer.phone ?? "—"}</td>
                    <td className="px-4 py-3">{customer.orders.length}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(totalSpent)}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {customer.marketingOptIn ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {customer.createdAt.toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}