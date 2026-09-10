import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm, type ProductFormValue } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
          select: { asset: { select: { originalUrl: true } } },
        },
        inventory: { select: { stock: true } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const initial: ProductFormValue = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: product.price?.toString() ?? "",
    compareAtPrice: product.compareAtPrice?.toString() ?? "",
    material: product.material ?? "",
    goldType: product.goldType ?? "",
    stone: product.stone ?? "",
    stoneColor: product.stoneColor ?? "",
    stoneCarat: product.stoneCarat ?? "",
    weight: product.weight ?? "",
    dimensions: product.dimensions ?? "",
    certification: product.certification ?? "",
    certificateUrl: product.certificateUrl ?? "",
    careInstructions: product.careInstructions ?? "",
    categoryId: product.categoryId ?? "",
    status: product.status,
    buyingMode: product.buyingMode,
    featured: product.featured,
    exclusive: product.exclusive,
    isGemCertified: product.isGemCertified,
    isCustomizable: product.isCustomizable,
    highValue: product.highValue,
    isDemo: product.isDemo,
  };

  return (
    <div>
      <PageTitle
        title={product.name}
        description={`SKU ${product.sku} · ${product.inventory ? `${product.inventory.stock} en inventario` : "sin inventario"}`}
      />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={initial}
        primaryImageUrl={product.images[0]?.asset.originalUrl ?? null}
      />
    </div>
  );
}