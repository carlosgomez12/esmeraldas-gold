"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser, can } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";
import { ALL_PERMISSIONS } from "@/lib/auth/roles";
import type { Role } from "@/generated/prisma/client";

type ActionResult = { ok: boolean; error?: string; id?: string };

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(2).max(60),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0).optional().or(z.literal("")),
  compareAtPrice: z.coerce.number().int().min(0).optional().or(z.literal("")),
  material: z.string().trim().max(100).optional().or(z.literal("")),
  goldType: z.string().trim().max(100).optional().or(z.literal("")),
  stone: z.string().trim().max(100).optional().or(z.literal("")),
  stoneColor: z.string().trim().max(100).optional().or(z.literal("")),
  stoneCarat: z.string().trim().max(100).optional().or(z.literal("")),
  weight: z.string().trim().max(100).optional().or(z.literal("")),
  dimensions: z.string().trim().max(100).optional().or(z.literal("")),
  certification: z.string().trim().max(200).optional().or(z.literal("")),
  certificateUrl: z.string().trim().url().optional().or(z.literal("")),
  careInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  buyingMode: z.enum(["DIRECT", "REQUEST_PRICE", "CHECK_AVAILABILITY", "ASSISTED", "DIRECT_AND_ASSISTED"]).default("DIRECT"),
  featured: z.coerce.boolean().default(false),
  exclusive: z.coerce.boolean().default(false),
  isGemCertified: z.coerce.boolean().default(false),
  isCustomizable: z.coerce.boolean().default(false),
  highValue: z.coerce.boolean().default(false),
  isDemo: z.coerce.boolean().default(false),
});

function productPayload(input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: "Revisa los campos del producto." };
  const d = parsed.data;
  return {
    data: {
      name: d.name,
      sku: d.sku,
      shortDescription: d.shortDescription || null,
      description: d.description || null,
      price: d.price ? Number(d.price) : null,
      compareAtPrice: d.compareAtPrice ? Number(d.compareAtPrice) : null,
      material: d.material || null,
      goldType: d.goldType || null,
      stone: d.stone || null,
      stoneColor: d.stoneColor || null,
      stoneCarat: d.stoneCarat || null,
      weight: d.weight || null,
      dimensions: d.dimensions || null,
      certification: d.certification || null,
      certificateUrl: d.certificateUrl || null,
      careInstructions: d.careInstructions || null,
      categoryId: d.categoryId || null,
      status: d.status,
      buyingMode: d.buyingMode,
      featured: d.featured,
      exclusive: d.exclusive,
      isGemCertified: d.isGemCertified,
      isCustomizable: d.isCustomizable,
      highValue: d.highValue,
      isDemo: d.isDemo,
    },
  };
}

export async function createProduct(
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "products.create");
  if (!perm.ok) return { ok: false, error: perm.error };

  const payload = productPayload(Object.fromEntries(formData.entries()));
  if ("error" in payload) return { ok: false, error: payload.error };

  try {
    const product = await db.product.create({
      data: {
        ...payload.data,
        slug: slugify(payload.data.name),
      },
    });
    await db.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, stock: 0 },
    });
    revalidatePath("/admin/productos");
    revalidatePath("/catalogo");
    return { ok: true, id: product.id };
  } catch {
    return {
      ok: false,
      error: "No se pudo crear. Revisa que el nombre y SKU no se repitan.",
    };
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "products.update");
  if (!perm.ok) return { ok: false, error: perm.error };

  const payload = productPayload(Object.fromEntries(formData.entries()));
  if ("error" in payload) return { ok: false, error: payload.error };

  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) return { ok: false, error: "Producto no encontrado." };

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        ...payload.data,
        slug:
          existing.slug !== slugify(payload.data.name)
            ? slugify(payload.data.name)
            : existing.slug,
      },
    });
    revalidatePath("/admin/productos");
    revalidatePath("/catalogo");
    revalidatePath(`/producto/${existing.slug}`);
    return { ok: true, id: productId };
  } catch {
    return {
      ok: false,
      error: "No se pudo guardar. Verifica los valores obligatorios.",
    };
  }
}

export async function deleteProduct(
  productId: string
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "products.delete");
  if (!perm.ok) return { ok: false, error: perm.error };

  try {
    await db.product.delete({ where: { id: productId } });
    revalidatePath("/admin/productos");
    revalidatePath("/catalogo");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar el producto." };
  }
}

export async function toggleFeatured(productId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "products.feature");
  if (!perm.ok) return { ok: false, error: perm.error };

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Producto no encontrado." };
  await db.product.update({
    where: { id: productId },
    data: { featured: !product.featured },
  });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "categories.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, error: "El nombre es obligatorio." };
  const description = String(formData.get("description") ?? "").trim() || null;

  try {
    const category = await db.category.create({
      data: { slug: slugify(name), name, description },
    });
    revalidatePath("/admin/categorias");
    return { ok: true, id: category.id };
  } catch {
    return { ok: false, error: "Revisa que la categoría no se repita." };
  }
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "categories.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, error: "El nombre es obligatorio." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  try {
    await db.category.update({
      where: { id: categoryId },
      data: { name, description, active, slug: slugify(name) },
    });
    revalidatePath("/admin/categorias");
    revalidatePath("/catalogo");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar la categoría." };
  }
}

export async function deleteCategory(categoryId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "categories.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  try {
    await db.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categorias");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar la categoría." };
  }
}

export async function createCollection(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "collections.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, error: "El nombre es obligatorio." };
  const description = String(formData.get("description") ?? "").trim() || null;

  try {
    const collection = await db.collection.create({
      data: { slug: slugify(name), name, description },
    });
    revalidatePath("/admin/colecciones");
    return { ok: true, id: collection.id };
  } catch {
    return { ok: false, error: "Revisa que la colección no se repita." };
  }
}

export async function toggleCollectionExclusive(collectionId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "collections.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const collection = await db.collection.findUnique({
    where: { id: collectionId },
  });
  if (!collection) return { ok: false, error: "Colección no encontrada." };
  await db.collection.update({
    where: { id: collectionId },
    data: { exclusive: !collection.exclusive },
  });
  revalidatePath("/admin/colecciones");
  return { ok: true };
}

export async function deleteCollection(collectionId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "collections.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  try {
    await db.collection.delete({ where: { id: collectionId } });
    revalidatePath("/admin/colecciones");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar la colección." };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "orders.update");
  if (!perm.ok) return { ok: false, error: perm.error };

  const allowed = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];
  if (!allowed.includes(status)) {
    return { ok: false, error: "Estado inválido." };
  }

  await db.order.update({ where: { id: orderId }, data: { status: status as never } });
  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function updateOrderNotes(orderId: string, adminNotes: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "orders.update");
  if (!perm.ok) return { ok: false, error: perm.error };

  await db.order.update({
    where: { id: orderId },
    data: { adminNotes: adminNotes.trim() || null },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}

export async function createUser(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  if (user.role !== "SUPER_ADMIN")
    return { ok: false, error: "Solo el super administrador puede crear usuarios." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "") as Role;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Correo inválido." };
  if (password.length < 8)
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  if (!["SUPER_ADMIN", "ADMIN", "EDITOR", "SALES"].includes(role))
    return { ok: false, error: "Rol inválido." };

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const created = await db.user.create({
      data: { email, name, role, passwordHash },
    });
    revalidatePath("/admin/usuarios");
    return { ok: true, id: created.id };
  } catch {
    return { ok: false, error: "Ese correo ya está registrado." };
  }
}

const settingsSchema = z.object({
  key: z.string().min(1).max(80),
  valueJson: z.string().trim(),
});

export async function updateSetting(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "settings.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  try {
    const value = JSON.parse(parsed.data.valueJson) as unknown;
    await db.siteSettings.upsert({
      where: { key: parsed.data.key },
      update: { value: value as never },
      create: { key: parsed.data.key, value: value as never },
    });
    revalidatePath("/admin/configuracion");
    return { ok: true };
  } catch {
    return { ok: false, error: "El valor debe ser JSON válido." };
  }
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function uploadMedia(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "media.manage");
  if (!perm.ok) return { ok: false, error: perm.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "El archivo supera 10 MB." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Solo se permiten imágenes." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name
      .replace(/[^\w.\-]/g, "_")
      .toLowerCase()}`;
    const mediaDir = "public/media";
    const destination = `${mediaDir}/${safeName}`;
    await import("node:fs/promises").then((fs) =>
      fs.mkdir(mediaDir, { recursive: true }).then(() => fs.writeFile(destination, buffer))
    );

    const asset = await db.mediaAsset.create({
      data: {
        type: "IMAGE",
        originalUrl: `/media/${safeName}`,
        fileName: safeName,
        mimeType: file.type,
        sizeBytes: file.size,
        alt: String(formData.get("alt") ?? "") || null,
        uploadedBy: user.id,
      },
    });

    revalidatePath("/admin/media");
    return { ok: true, id: asset.id, url: asset.originalUrl };
  } catch {
    return { ok: false, error: "No se pudo guardar el archivo." };
  }
}

export async function setPrimaryImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const perm = await can(user.id, "products.update");
  if (!perm.ok) return { ok: false, error: perm.error };

  if (!/^https?:\/\/|\//.test(imageUrl)) {
    return { ok: false, error: "URL de imagen inválida." };
  }

  try {
    const asset = await db.mediaAsset.findFirst({
      where: { originalUrl: imageUrl },
    });
    let assetId: string;
    if (asset) {
      assetId = asset.id;
    } else {
      const created = await db.mediaAsset.create({
        data: {
          type: "IMAGE",
          originalUrl: imageUrl,
          fileName: imageUrl.split("/").pop() ?? "image",
          mimeType: imageUrl.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/*",
          sizeBytes: 0,
        },
      });
      assetId = created.id;
    }

    await db.$transaction([
      db.productImage.deleteMany({ where: { productId, isPrimary: true } }),
      db.productImage.create({
        data: { productId, assetId, isPrimary: true, sortOrder: 0 },
      }),
    ]);

    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath("/catalogo");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo adjuntar la imagen." };
  }
}

export { ALL_PERMISSIONS };