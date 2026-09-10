import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const all = await getProducts();
  const byId = new Map(all.products.map((p) => [p.id, p]));
  const products = ids
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      price: p.price,
      currency: p.currency,
      category: p.category?.name ?? null,
      image: p.images[0]?.asset.originalUrl ?? null,
    })),
  });
}