"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Gem, X, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createCollection,
  toggleCollectionExclusive,
  deleteCollection,
} from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  exclusive: boolean;
  productCount: number;
}

export function CollectionsManager({
  collections,
}: {
  collections: CollectionRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function onCreate(formData: FormData) {
    setBusy(true);
    const result = await createCollection(formData);
    setBusy(false);
    if (result.ok) {
      toast.success("Colección creada");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo crear");
    }
  }

  async function onToggleExclusive(id: string) {
    setBusy(true);
    const result = await toggleCollectionExclusive(id);
    setBusy(false);
    if (result.ok) {
      toast.success("Colección actualizada");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo actualizar");
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la colección «${name}»?`)) return;
    setBusy(true);
    const result = await deleteCollection(id);
    setBusy(false);
    if (result.ok) {
      toast.success("Colección eliminada");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo eliminar");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">
          Nueva colección
        </h2>
        <form action={onCreate} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="col-name">Nombre</Label>
            <Input id="col-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="col-desc">Descripción (opcional)</Label>
            <Textarea id="col-desc" name="description" rows={3} />
          </div>
          <Button type="submit" variant="gold" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        {collections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-12 text-center text-sm text-ink-600">
            Aún no hay colecciones.
          </p>
        ) : null}
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="rounded-2xl border border-ink-900/10 bg-white/70 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-medium text-ink-900">
                    {collection.name}
                  </p>
                  <AdminBadge status={collection.active ? "ACTIVE" : "ARCHIVED"} />
                  {collection.exclusive ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-700"
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      Exclusiva
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  /{collection.slug} · {collection.productCount}{" "}
                  {collection.productCount === 1 ? "producto" : "productos"}
                </p>
                {collection.description ? (
                  <p className="mt-1 max-w-prose text-sm text-ink-600">
                    {collection.description}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="light"
                  size="sm"
                  disabled={busy}
                  onClick={() => onToggleExclusive(collection.id)}
                >
                  <Gem className="h-3.5 w-3.5" />
                  {collection.exclusive ? "Quitar exclusiva" : "Marcar exclusiva"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  title="Eliminar"
                  onClick={() => onDelete(collection.id, collection.name)}
                >
                  <X className="h-4 w-4 text-red-700" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}