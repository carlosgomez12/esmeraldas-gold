"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Sheet({
  open,
  onClose,
  children,
  side = "right",
  className,
}: SheetProps) {
  React.useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute top-0 h-full w-full max-w-md bg-ivory-50 shadow-2xl animate-fade-in flex flex-col",
          side === "right" ? "right-0" : "left-0",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/15 bg-ivory-50 text-ink-700 transition hover:border-gold-500 hover:text-gold-700"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-ink-900/10 px-6 py-5">
      <h2 className="font-display text-2xl font-medium text-ink-900">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-ink-600">{subtitle}</p>
      ) : null}
    </div>
  );
}