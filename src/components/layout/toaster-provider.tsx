"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: "#121009",
          color: "#f7f3ea",
          border: "1px solid rgba(201,163,92,0.35)",
          borderRadius: "12px",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}