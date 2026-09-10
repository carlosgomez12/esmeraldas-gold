"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    searchParams.get("redirectTo") ??
    "/admin";

  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@esmeraldasgold.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p
          className="rounded-lg bg-red-900/10 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        Iniciar sesión
      </Button>

      <p className="text-center text-xs text-ink-500">
        Acceso exclusivo para el equipo de {process.env.NEXT_PUBLIC_SITE_NAME ?? "Esmeraldas Gold"}.
      </p>
    </form>
  );
}