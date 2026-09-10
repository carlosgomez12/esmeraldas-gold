"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  alt?: string | null;
  originalUrl: string;
}

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [index, setIndex] = React.useState(0);
  const main = images[index];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-gold-500/25 bg-gradient-to-br from-ivory-100 via-white to-gold-500/15">
        <div className="text-center px-10">
          <span className="font-display text-sm uppercase tracking-[0.28em] text-gold-700">
            Esmeraldas Gold
          </span>
          <div className="mx-auto mt-4 h-px w-20 bg-gold-500" />
          <p className="mt-4 font-display text-2xl font-medium text-ink-900">
            {name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main.originalUrl}
          alt={main.alt ?? name}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label="Ver detalle"
          className="absolute inset-0 cursor-zoom-in"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={() =>
                setIndex((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ivory-50/90 p-2 text-ink-800 opacity-0 shadow transition group-hover:opacity-100 hover:bg-ivory-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ivory-50/90 p-2 text-ink-800 opacity-0 shadow transition group-hover:opacity-100 hover:bg-ivory-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-20 w-20 overflow-hidden rounded-lg border-2 transition",
                i === index
                  ? "border-gold-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.originalUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              {img.originalUrl.includes(".mp4") ? (
                <Play className="absolute inset-0 m-auto h-5 w-5 text-ivory-50" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}