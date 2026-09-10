"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setPrimaryImage,
} from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormValue {
  id?: string;
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  material: string;
  goldType: string;
  stone: string;
  stoneColor: string;
  stoneCarat: string;
  weight: string;
  dimensions: string;
  certification: string;
  certificateUrl: string;
  careInstructions: string;
  categoryId: string;
  status: string;
  buyingMode: string;
  featured: boolean;
  exclusive: boolean;
  isGemCertified: boolean;
  isCustomizable: boolean;
  highValue: boolean;
  isDemo: boolean;
}

const empty: ProductFormValue = {
  name: "",
  sku: "",
  shortDescription: "",
  description: "",
  price: "",
  compareAtPrice: "",
  material: "",
  goldType: "",
  stone: "",
  stoneColor: "",
  stoneCarat: "",
  weight: "",
  dimensions: "",
  certification: "",
  certificateUrl: "",
  careInstructions: "",
  categoryId: "",
  status: "DRAFT",
  buyingMode: "DIRECT",
  featured: false,
  exclusive: false,
  isGemCertified: false,
  isCustomizable: false,
  highValue: false,
  isDemo: false,
};

export function ProductForm({
  categories,
  initial,
  primaryImageUrl,
}: {
  categories: CategoryOption[];
  initial?: ProductFormValue;
  primaryImageUrl?: string | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [values, setValues] = React.useState<ProductFormValue>(
    initial ?? empty
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState(primaryImageUrl ?? "");

  function set<K extends keyof ProductFormValue>(
    key: K,
    value: ProductFormValue[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const result = isEdit
      ? await updateProduct(values.id!, fd)
      : await createProduct(fd);
    if (!result.ok) {
      setBusy(false);
      setError(result.error ?? "No se pudo guardar.");
      return;
    }
    const productId = isEdit ? values.id! : result.id!;
    if (imageUrl.trim() && productId) {
      await setPrimaryImage(productId, imageUrl.trim());
    }
    toast.success(isEdit ? "Producto actualizado" : "Producto creado");
    setBusy(false);
    router.push(`/admin/productos/${productId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl space-y-8"
    >
      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Información básica
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={values.sku}
              onChange={(e) => set("sku", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              name="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="ARCHIVED">Archivado</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (COP)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="Dejar vacío = Consultar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={0}
              value={values.compareAtPrice}
              onChange={(e) => set("compareAtPrice", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              id="categoryId"
              name="categoryId"
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyingMode">Modo de compra</Label>
            <Select
              id="buyingMode"
              name="buyingMode"
              value={values.buyingMode}
              onChange={(e) => set("buyingMode", e.target.value)}
            >
              <option value="DIRECT">Compra directa</option>
              <option value="REQUEST_PRICE">Precio bajo consulta</option>
              <option value="CHECK_AVAILABILITY">Verificar disponibilidad</option>
              <option value="ASSISTED">Venta asistida</option>
              <option value="DIRECT_AND_ASSISTED">Directa y asistida</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="shortDescription">Descripción corta</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Atributos (opcionales)
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Si no se especifican, la tienda muestra «Consultar». Nunca inventamos
          datos de oro, peso ni certificación.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["material", "Material"],
              ["goldType", "Tipo de oro"],
              ["stone", "Piedra principal"],
              ["stoneColor", "Color de la piedra"],
              ["stoneCarat", "Peso de la piedra"],
              ["weight", "Peso de la pieza"],
              ["dimensions", "Dimensiones"],
              ["certification", "Certificación"],
            ] as const
          ).map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                name={key}
                value={values[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="certificateUrl">URL del certificado</Label>
            <Input
              id="certificateUrl"
              name="certificateUrl"
              type="url"
              value={values.certificateUrl}
              onChange={(e) => set("certificateUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="careInstructions">Cuidados de la pieza</Label>
            <Textarea
              id="careInstructions"
              name="careInstructions"
              rows={3}
              value={values.careInstructions}
              onChange={(e) => set("careInstructions", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Imagen principal
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de la imagen</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/media/mi-imagen.jpg o https://…"
            />
          </div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Vista previa"
              className="h-14 w-14 rounded-lg border border-ink-900/10 object-cover"
            />
          ) : null}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Sube archivos desde la sección «Medios» y pega aquí la URL.
        </p>
      </section>

      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Flags
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["featured", "Destacado en inicio", Star],
              ["exclusive", "Pieza exclusiva"],
              ["isGemCertified", "Certificada"],
              ["isCustomizable", "Personalizable"],
              ["highValue", "Alta joyería"],
              ["isDemo", "Marketing demo"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-900/10 bg-ivory-50 px-4 py-3 text-sm"
            >
              <input
                type="checkbox"
                name={key}
                checked={values[key] ?? false}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-gold-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        {error ? (
          <p className="rounded-lg bg-red-900/10 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={busy}
          className="w-full sm:w-auto"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        {isEdit ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={async () => {
              if (!values.id) return;
              if (confirm("¿Eliminar este producto?")) {
                setBusy(true);
                const result = await deleteProduct(values.id);
                setBusy(false);
                if (result.ok) {
                  toast.success("Producto eliminado");
                  router.push("/admin/productos");
                  router.refresh();
                } else {
                  toast.error(result.error ?? "No se pudo eliminar");
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-red-700" />
            Eliminar
          </Button>
        ) : null}
      </div>
    </form>
  );
}