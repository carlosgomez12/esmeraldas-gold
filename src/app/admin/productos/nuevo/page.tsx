import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductNewPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageTitle title="Nuevo producto" description="Agrega una nueva pieza al catálogo." />
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}