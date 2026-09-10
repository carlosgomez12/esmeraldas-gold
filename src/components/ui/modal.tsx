"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-lg rounded-xl border border-ink-900/10 bg-ivory-50 p-0 shadow-2xl backdrop:bg-ink-950/50 backdrop:backdrop-blur-sm animate-fade-up",
        className
      )}
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-ink-900/10 px-6 py-4">
          <h2 className="font-display text-xl font-medium text-ink-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:text-ink-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="p-6">{children}</div>
    </dialog>,
    document.body
  );
}