import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageTitle
        title="Categorías"
        description="Agrupa tus piezas para navegar el catálogo."
      />
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          active: c.active,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}