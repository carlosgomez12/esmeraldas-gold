"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { toggleFeatured } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export function FeaturedToggle({
  productId,
  featured,
}: {
  productId: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      title={featured ? "Quitar de destacados" : "Destacar en el inicio"}
      aria-pressed={featured}
      onClick={async () => {
        setBusy(true);
        const result = await toggleFeatured(productId);
        setBusy(false);
        if (result.ok) {
          toast.success(featured ? "Dejó de ser destacado" : "Destacado en inicio");
          router.refresh();
        } else {
          toast.error(result.error ?? "No se pudo actualizar");
        }
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border transition",
        featured
          ? "border-gold-500 bg-gold-500/20 text-gold-700"
          : "border-ink-900/15 text-ink-400 hover:border-gold-400 hover:text-gold-600"
      )}
    >
      <Star className="h-4 w-4" fill={featured ? "currentColor" : "none"} />
    </button>
  );
}