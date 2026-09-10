import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/guards";
import { userCan } from "@/auth";
import { PageTitle, AdminBadge, EmptyState } from "@/components/admin/ui";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSessionUser();
  const canCreate = session
    ? await userCan(session.id, "products.create")
    : false;

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      price: true,
      status: true,
      featured: true,
      isDemo: true,
      category: { select: { name: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { asset: { select: { originalUrl: true } } },
      },
    },
  });

  return (
    <div>
      <PageTitle
        title="Productos"
        description={`${products.length} ${products.length === 1 ? "producto" : "productos"} en el catálogo.`}
        action={canCreate ? { label: "Nuevo producto", href: "/admin/productos/nuevo" } : undefined}
      />

      {products.length === 0 ? (
        <EmptyState
          title="No hay productos todavía"
          hint="Crea el primer producto desde «Nuevo producto»."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-900/10 bg-white/70">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-[0.14em] text-ink-500">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Destacado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-ink-900/5 last:border-0 hover:bg-ivory-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="flex items-center gap-3"
                    >
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0].asset.originalUrl}
                          alt=""
                          className="h-11 w-11 rounded-lg border border-ink-900/10 object-cover"
                        />
                      ) : (
                        <span className="h-11 w-11 rounded-lg border border-dashed border-ink-900/15 bg-ivory-50" />
                      )}
                      <span className="font-medium text-ink-900 group-hover:underline">
                        {product.name}
                        {product.isDemo ? (
                          <span className="ml-2 rounded bg-ink-900/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                            demo
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{product.sku}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {product.price != null ? formatPrice(product.price) : "Consultar"}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <FeaturedToggle productId={product.id} featured={product.featured} />
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