import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

const productInclude = {
  images: {
    where: { isPrimary: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    include: { asset: true },
  },
  category: true,
  inventory: true,
} satisfies Prisma.ProductInclude;

export type PublicProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export async function getFeaturedProducts(limit = 6) {
  return db.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getCollectionPreview(limit = 4) {
  const fallback = await db.product.findMany({
    where: { status: "ACTIVE" },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  if (fallback.length > 0) return fallback;
  return db.product.findMany({
    where: { isDemo: true },
    include: productInclude,
    take: limit,
  });
}

export interface ProductsQuery {
  categoria?: string;
  coleccion?: string;
  buscar?: string;
  maxPrice?: number;
  orden?: "relevancia" | "precio-asc" | "precio-desc" | "nuevos";
}

export async function getProducts(query: ProductsQuery = {}) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (query.categoria) {
    where.category = { slug: query.categoria };
  }
  if (query.coleccion) {
    where.collections = { some: { collection: { slug: query.coleccion } } };
  }
  if (query.buscar) {
    where.OR = [
      { name: { contains: query.buscar, mode: "insensitive" } },
      { shortDescription: { contains: query.buscar, mode: "insensitive" } },
      { description: { contains: query.buscar, mode: "insensitive" } },
    ];
  }
  if (typeof query.maxPrice === "number") {
    where.price = { lte: query.maxPrice };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { featured: "desc" },
    { createdAt: "desc" },
  ];
  if (query.orden === "precio-asc") orderBy = [{ price: "asc" }];
  if (query.orden === "precio-desc") orderBy = [{ price: "desc" }];
  if (query.orden === "nuevos") orderBy = [{ createdAt: "desc" }];

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productInclude,
      orderBy,
    }),
    db.product.count({ where }),
  ]);

  return { products: products as PublicProduct[], total };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        include: { asset: true },
      },
      videos: { include: { asset: true }, orderBy: { sortOrder: "asc" } },
      category: true,
      inventory: true,
      collections: { include: { collection: true } },
      reviews: { where: { active: true }, include: { customer: true } },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string | null,
  take = 4
) {
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getCategories() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
}

export async function getCollections() {
  return db.collection.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getTestimonials(limit = 3) {
  return db.testimonial.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}