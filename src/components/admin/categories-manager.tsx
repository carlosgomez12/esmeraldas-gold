"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "@/components/admin/ui";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  productCount: number;
}

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onCreate(formData: FormData) {
    setBusy(true);
    const result = await createCategory(formData);
    setBusy(false);
    if (result.ok) {
      toast.success("Categoría creada");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo crear");
    }
  }

  async function onUpdate(id: string, formData: FormData) {
    setBusy(true);
    const result = await updateCategory(id, formData);
    setBusy(false);
    if (result.ok) {
      toast.success("Categoría actualizada");
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo actualizar");
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría «${name}»?`)) return;
    setBusy(true);
    const result = await deleteCategory(id);
    setBusy(false);
    if (result.ok) {
      toast.success("Categoría eliminada");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo eliminar");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Nueva categoría
        </h2>
        <form action={onCreate} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input id="cat-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Descripción (opcional)</Label>
            <Textarea id="cat-desc" name="description" rows={3} />
          </div>
          <Button type="submit" variant="gold" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear
          </Button>
        </form>
      </section>

      <section>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-12 text-center text-sm text-ink-600">
              Aún no hay categorías.
            </p>
          ) : null}
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-ink-900/10 bg-white/70 p-5"
            >
              {editingId === category.id ? (
                <form
                  action={(fd) => onUpdate(category.id, fd)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input name="name" defaultValue={category.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      name="description"
                      rows={2}
                      defaultValue={category.description ?? ""}
                    />
                  </div>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={category.active}
                      className="h-4 w-4 accent-gold-600"
                    />
                    Activa en el catálogo
                  </label>
                  <div className="flex gap-3">
                    <Button type="submit" variant="gold" size="sm" disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-lg font-medium text-ink-900">
                        {category.name}
                      </p>
                      <AdminBadge status={category.active ? "ACTIVE" : "ARCHIVED"} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      /{category.slug} · {category.productCount}{" "}
                      {category.productCount === 1 ? "producto" : "productos"}
                    </p>
                    {category.description ? (
                      <p className="mt-1 max-w-prose text-sm text-ink-600">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="light"
                      size="sm"
                      onClick={() => setEditingId(category.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      title="Eliminar"
                      onClick={() => onDelete(category.id, category.name)}
                    >
                      <X className="h-4 w-4 text-red-700" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}