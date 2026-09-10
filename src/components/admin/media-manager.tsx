"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Clipboard, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface MediaRow {
  id: string;
  originalUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager({ assets }: { assets: MediaRow[] }) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecciona una imagen");
      return;
    }
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const result = await uploadMedia(fd);
    setBusy(false);
    if (result.ok && result.url) {
      toast.success("Imagen subida");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo subir");
    }
  }

  async function copyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copiada");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
        <h2 className="font-display text-xl font-medium text-ink-900">Subir imagen</h2>
        <form onSubmit={handleUpload} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="media-file">Archivo (hasta 10 MB)</Label>
            <input
              id="media-file"
              ref={fileRef}
              name="file"
              type="file"
              accept="image/*"
              required
              className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-ivory-50 hover:file:bg-ink-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-alt">Texto alternativo (opcional)</Label>
            <Input id="media-alt" name="alt" placeholder="Anillo de esmeralda 18k" />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="gold" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Subir
            </Button>
          </div>
        </form>
      </section>

      <section>
        <p className="mb-3 text-sm text-ink-600">
          {assets.length} {assets.length === 1 ? "archivo" : "archivos"} en la biblioteca.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70"
            >
              <div className="relative aspect-square bg-ivory-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.originalUrl}
                  alt={asset.alt ?? ""}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => copyUrl(asset.originalUrl, asset.id)}
                  className="absolute right-2 top-2 rounded-full bg-ink-950/80 p-2 text-ivory-50 opacity-0 backdrop-blur transition group-hover:opacity-100"
                  title="Copiar URL"
                >
                  {copiedId === asset.id ? (
                    <Check className="h-4 w-4 text-gold-400" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="truncate text-sm font-medium text-ink-900" title={asset.fileName}>
                  {asset.fileName}
                </p>
                <p className="text-xs text-ink-500">
                  {formatBytes(asset.sizeBytes)} · {new Date(asset.createdAt).toLocaleDateString("es-CO")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}