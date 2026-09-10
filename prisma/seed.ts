import bcrypt from "bcryptjs";
import type { Prisma } from "../src/generated/prisma/client";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://esmeraldas:esmeraldas_dev@localhost:5432/esmeraldas_gold?schema=public",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Esmeraldas Gold...");

  // ----------------------------------------------------------
  // 1. PERMISSIONS
  // ----------------------------------------------------------
  const permissionCatalog = [
    { key: "dashboard.view", name: "Ver dashboard" },
    { key: "products.read", name: "Ver productos" },
    { key: "products.create", name: "Crear productos" },
    { key: "products.update", name: "Editar productos" },
    { key: "products.delete", name: "Eliminar productos" },
    { key: "products.duplicate", name: "Duplicar productos" },
    { key: "products.feature", name: "Destacar productos" },
    { key: "media.manage", name: "Gestionar medios" },
    { key: "categories.manage", name: "Gestionar categorías" },
    { key: "collections.manage", name: "Gestionar colecciones" },
    { key: "inventory.manage", name: "Gestionar inventario" },
    { key: "orders.read", name: "Ver pedidos" },
    { key: "orders.update", name: "Actualizar pedidos" },
    { key: "customers.read", name: "Ver clientes" },
    { key: "customers.update", name: "Editar clientes" },
    { key: "leads.read", name: "Ver leads" },
    { key: "leads.update", name: "Gestionar leads" },
    { key: "promotions.manage", name: "Gestionar promociones" },
    { key: "content.manage", name: "Gestionar contenido" },
    { key: "seo.manage", name: "Gestionar SEO" },
    { key: "settings.manage", name: "Gestionar configuración" },
    { key: "users.manage", name: "Gestionar usuarios" },
  ] as const;

  for (const p of permissionCatalog) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name },
      create: { key: p.key, name: p.name },
    });
  }
  console.log(`✓ Permissions (${permissionCatalog.length})`);

  // ----------------------------------------------------------
  // 2. SUPER ADMIN
  // ----------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@esmeraldasgold.com";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "Admin#Esmeraldas2026";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "SUPER_ADMIN", passwordHash, active: true },
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });
  console.log(`✓ Super admin (${adminEmail})`);

  // ----------------------------------------------------------
  // 3. CATEGORIES
  // ----------------------------------------------------------
  const categories = [
    { slug: "anillos", name: "Anillos" },
    { slug: "collares", name: "Collares" },
    { slug: "pulseras", name: "Pulseras" },
    { slug: "aretes", name: "Aretes" },
    { slug: "alta-joyeria", name: "Alta Joyería" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, active: true },
      create: { slug: c.slug, name: c.name },
    });
  }
  console.log(`✓ Categories (${categories.length})`);

  // ----------------------------------------------------------
  // 4. COLLECTIONS
  // ----------------------------------------------------------
  const collections = [
    { slug: "coleccion-oro", name: "Colección Oro", imageUrl: "/demo/gold-ring.svg" },
    { slug: "esmeraldas", name: "Esmeraldas", imageUrl: "/demo/emerald-ring.svg" },
    { slug: "piezas-unicas", name: "Piezas Únicas", exclusive: true, imageUrl: "/demo/emerald-necklace.svg" },
  ];

  for (const c of collections) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.name, imageUrl: c.imageUrl, active: true },
      create: c,
    });
  }
  console.log(`✓ Collections (${collections.length})`);

  // ----------------------------------------------------------
  // 5. DEMO PRODUCTS (claramente marcados, eliminables por admin)
  // ----------------------------------------------------------
  const demoProducts = [
    {
      slug: "demo-anillo-oro",
      sku: "DEMO-RG-001",
      name: "Demo Gold Ring",
      shortDescription: "Producto de demostración. Será reemplazado por una pieza real.",
      description:
        "Este es un producto DEMO creado para demostrar la plataforma. El administrador debe reemplazarlo por la joya real desde el panel.",
      price: 2900000,
      material: null,
      buyingMode: "DIRECT" as const,
      status: "ACTIVE" as const,
      stock: 3,
      featured: true,
      image: "/demo/gold-ring.svg",
      category: "anillos",
      collections: ["coleccion-oro"],
    },
    {
      slug: "demo-anillo-esmeralda",
      sku: "DEMO-ER-001",
      name: "Demo Emerald Ring",
      shortDescription: "Producto de demostración. Precio por consulta.",
      description:
        "Pieza DEMO con modalidad de venta asistida. El precio y las características serán definidos por el administrador.",
      price: null,
      buyingMode: "REQUEST_PRICE" as const,
      status: "ACTIVE" as const,
      stock: 1,
      image: "/demo/emerald-ring.svg",
      category: "anillos",
      collections: ["esmeraldas"],
    },
    {
      slug: "demo-pulsera-oro",
      sku: "DEMO-BR-001",
      name: "Demo Gold Bracelet",
      shortDescription: "Compra mediante asesor.",
      description:
        "Producto DEMO en modalidad asistida: el cliente conversa con un asesor antes de cerrar la compra.",
      price: null,
      buyingMode: "ASSISTED" as const,
      status: "ACTIVE" as const,
      stock: 1,
      image: "/demo/gold-ring.svg",
      category: "pulseras",
      collections: ["coleccion-oro"],
    },
    {
      slug: "demo-collar-esmeralda",
      sku: "DEMO-NK-001",
      name: "Demo Emerald Necklace",
      shortDescription: "Disponibilidad por consulta.",
      description:
        "Collar DEMO. Requiere consultar disponibilidad con el equipo comercial.",
      price: 12500000,
      buyingMode: "CHECK_AVAILABILITY" as const,
      status: "ACTIVE" as const,
      stock: 0,
      featured: true,
      image: "/demo/emerald-necklace.svg",
      category: "collares",
      collections: ["esmeraldas", "piezas-unicas"],
    },
    {
      slug: "demo-aretes-esmeralda",
      sku: "DEMO-EA-001",
      name: "Demo Emerald Earrings",
      shortDescription: "Compra directa o con asesoría.",
      description:
        "Aretes DEMO que permiten compra directa o asistencia comercial según la preferencia del cliente.",
      price: 8200000,
      buyingMode: "DIRECT_AND_ASSISTED" as const,
      status: "ACTIVE" as const,
      stock: 2,
      image: "/demo/emerald-earrings.svg",
      category: "aretes",
      collections: ["esmeraldas"],
    },
    {
      slug: "demo-collar-oro",
      sku: "DEMO-NK-002",
      name: "Demo Gold Necklace",
      shortDescription: "Producto de demostración.",
      description:
        "Collar DEMO en oro. Reemplazar por una pieza real desde el panel de administración.",
      price: 5400000,
      buyingMode: "DIRECT" as const,
      status: "ACTIVE" as const,
      stock: 2,
      image: "/demo/necklace.svg",
      category: "collares",
      collections: ["coleccion-oro"],
    },
    {
      slug: "demo-alta-joyeria",
      sku: "DEMO-HJ-001",
      name: "Demo High Jewelry Piece",
      shortDescription: "Pieza exclusiva: asesoría privada.",
      description:
        "Pieza DEMO de alta joyería con asesoría privada. Por encima del umbral de alto valor configurable.",
      price: null,
      buyingMode: "REQUEST_PRICE" as const,
      status: "ACTIVE" as const,
      stock: 1,
      exclusive: true,
      highValue: true,
      featured: true,
      image: "/demo/emerald-necklace.svg",
      category: "alta-joyeria",
      collections: ["piezas-unicas"],
    },
  ];

  const bySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c])
  );
  const colls = await prisma.collection.findMany();

  for (const d of demoProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        slug: d.slug,
        sku: d.sku,
        name: d.name,
        shortDescription: d.shortDescription,
        description: d.description,
        price: d.price,
        currency: "COP",
        buyingMode: d.buyingMode,
        status: d.status,
        featured: d.featured,
        exclusive: d.exclusive,
        highValue: d.highValue,
        isDemo: true,
        categoryId: bySlug[d.category]?.id,
        inventory: {
          create: {
            stock: d.stock,
            minStock: 1,
            strict: true,
            track: true,
            status:
              d.stock === 0
                ? "OUT_OF_STOCK"
                : d.stock <= 1
                  ? "LOW_STOCK"
                  : "AVAILABLE",
          },
        },
        images: {
          create: {
            asset: {
              create: {
                type: "IMAGE",
                originalUrl: d.image,
                largeUrl: d.image,
                mediumUrl: d.image,
                thumbnailUrl: d.image,
                fileName: `${d.slug}.svg`,
                mimeType: "image/svg+xml",
                sizeBytes: 4096,
                width: 1200,
                height: 1200,
                alt: d.name,
                caption: "Imagen de demostración",
              },
            },
            isPrimary: true,
            sortOrder: 0,
          },
        },
        collections: {
          create: d.collections
            .map((slug) => {
              const found = colls.find((c) => c.slug === slug);
              return found ? { collectionId: found.id } : null;
            })
            .filter((x): x is { collectionId: string } => x !== null),
        },
      },
    });

    await prisma.seoData.create({
      data: {
        entityType: "PRODUCT",
        entityId: product.slug,
        title: `${d.name} | Esmeraldas Gold`,
        description: d.shortDescription,
      },
    });
  }
  console.log(`✓ Demo products (${demoProducts.length})`);

  // ----------------------------------------------------------
  // 6. SITE SETTINGS (defaults; editables desde el panel)
  // ----------------------------------------------------------
  const settings: Record<string, unknown> = {
    site: {
      name: "Esmeraldas Gold",
      tagline: "Joyas en oro y esmeraldas",
      description:
        "Boutique digital de joyería premium en oro y esmeraldas. Piezas únicas con atención personalizada.",
      currency: "COP",
      locale: "es-CO",
    },
    whatsapp: {
      number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567",
      defaultMessage: process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE,
    },
    contact: {
      email: "hola@esmeraldasgold.com",
      phone: "",
      address: "",
      instagram: "",
      facebook: "",
      tiktok: "",
    },
    shipping: {
      countries: ["CO"],
      freeShippingThreshold: null,
      feeDomestic: 15000,
    },
    commerce: {
      highValueThresholdCop: 30000000,
      defaultBuyingMode: "DIRECT",
    },
    homepage: {
      heroTitle: "La joya que cuenta tu historia",
      heroSubtitle: "Oro y esmeraldas para momentos que merecen ser recordados.",
    },
  };

  for (const [key, value] of Object.entries(settings)) {
    const jsonValue = value as Prisma.InputJsonValue;
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue },
    });
  }
  console.log(`✓ Site settings (${Object.keys(settings).length})`);

  // ----------------------------------------------------------
  // 7. PLACEHOLDER TESTIMONIAL (reemplazar por testimonios reales)
  // ----------------------------------------------------------
  const testiCount = await prisma.testimonial.count();
  if (testiCount === 0) {
    await prisma.testimonial.create({
      data: {
        name: "Cliente Esmeraldas Gold",
        city: "",
        text: "Testimonio de demostración. Gestiona los testimonios reales desde el panel de administración.",
        rating: 5,
      },
    });
  }
  console.log("✓ Testimonials (placeholder)");

  console.log("🎉 Seed finalizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });