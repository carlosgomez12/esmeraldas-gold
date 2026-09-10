import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { CollectionsManager } from "@/components/admin/collections-manager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageTitle
        title="Colecciones"
        description="Curatos editoriales de tu catálogo."
      />
      <CollectionsManager
        collections={collections.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          active: c.active,
          exclusive: c.exclusive,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}