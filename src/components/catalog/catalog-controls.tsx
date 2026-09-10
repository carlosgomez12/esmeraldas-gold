"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const sortOptions = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
];

export function CatalogControls({
  categories,
  total,
}: {
  categories: { slug: string; name: string; _count: { products: number } }[];
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get("buscar") ?? "");

  const current = {
    buscar: searchParams.get("buscar"),
    categoria: searchParams.get("categoria"),
    orden: searchParams.get("orden") ?? "relevancia",
  };

  function navigate(next: Record<string, string | null>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    router.push(`/catalogo?${params.toString()}`);
  }

  function clearAll() {
    setQuery("");
    router.push("/catalogo");
  }

  return (
    <div className="space-y-5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ ...current, buscar: query || null });
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o detalle de la pieza…"
            aria-label="Buscar piezas"
            className="h-12 rounded-full pl-11 pr-24"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ivory-50 transition hover:bg-gold-500 hover:text-ink-950"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gold-700" />
          Categorías
        </span>
        <button
          type="button"
          onClick={() => navigate({ ...current, categoria: null })}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            !current.categoria
              ? "border-gold-500 bg-gold-500/15 text-gold-700"
              : "border-ink-900/15 text-ink-600 hover:border-gold-500/60"
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => navigate({ ...current, categoria: cat.slug })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              current.categoria === cat.slug
                ? "border-gold-500 bg-gold-500/15 text-gold-700"
                : "border-ink-900/15 text-ink-600 hover:border-gold-500/60"
            }`}
          >
            {cat.name}
            <span className="ml-1 text-[10px] text-ink-500">
              {cat._count.products}
            </span>
          </button>
        ))}
        {(current.buscar || current.categoria) ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-red-900/20 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-900/10"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-ink-900/10 pt-4">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{total}</span>{" "}
          {total === 1 ? "pieza" : "piezas"}
          {current.buscar ? (
            <>
              {" "}
              para &ldquo;<span className="text-ink-900">{current.buscar}</span>
              &rdquo;
            </>
          ) : null}
        </p>
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-600">
          Ordenar
          <Select
            value={current.orden}
            onChange={(e) => navigate({ ...current, orden: e.target.value })}
            className="h-10 w-auto min-w-44 rounded-full text-xs"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}