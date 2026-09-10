import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-medium text-gold-500">404</p>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink-900">
        Página no encontrada
      </h1>
      <GoldDivider className="mt-6" />
      <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-600">
        La página que buscas no existe o fue movida. Nuestro catálogo sigue
        disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="gold">
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  );
}