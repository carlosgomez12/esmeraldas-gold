import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;

  const [products, categories, collections] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { active: true },
      select: { slug: true },
    }),
    db.collection.findMany({
      where: { active: true },
      select: { slug: true },
    }),
  ]);

  const staticRoutes = [
    "",
    "/catalogo",
    "/colecciones",
    "/nosotros",
    "/proceso",
    "/contacto",
    "/preguntas-frecuentes",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/producto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/catalogo?categoria=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${base}/colecciones/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
  ];
}