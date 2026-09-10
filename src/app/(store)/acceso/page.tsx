import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { GoldDivider } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

export default function AccesoPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-ink-900/10 bg-white/70 p-8 shadow-lg shadow-ink-900/5">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-3xl font-semibold uppercase tracking-[0.14em] text-ink-900"
          >
            Esmeraldas&nbsp;Gold
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gold-700">
            Panel de administración
          </p>
          <GoldDivider className="mt-5" />
          <h1 className="mt-6 font-display text-2xl font-medium text-ink-900">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Ingresa con tus credenciales de acceso.
          </p>
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}