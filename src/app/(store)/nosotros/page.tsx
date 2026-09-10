import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { GoldDivider } from "@/components/ui/separator";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Nuestra historia",
  description:
    "La historia de Esmeraldas Gold: una casa de joyería dedicada al oro y a la esmeralda colombiana, con un compromiso artesanal.",
  alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="La casa"
        title="Nuestra historia"
        description="Detrás de cada pieza hay un origen, un oficio y la obsesión por el detalle."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <GoldDivider className="mb-10" />
        <div className="space-y-8 text-base leading-relaxed text-ink-700">
          <p>
            Esmeraldas Gold nació del vínculo profundo entre la tierra
            colombiana y el arte de la orfebrería. Desde nuestras primeras
            piezas supimos que una joya puede contar historias: la del minero
            que extrajo la gema, la del tallador que le dio luz, y la de quien
            la lleva cada día.
          </p>
          <p>
            Trabajamos con proveedores que certifican el origen de cada
            esmeralda, y con maestros orfebres que cuidan cada soldadura, cada
            acabado. Por eso nuestras piezas no se fabrican en serie: se
            conciben, se dibujan y se materializan para ser atemporales.
          </p>
          <p>
            Creemos en una joyería honesta y cercana. Cada pieza incluye la
            asesoría de nuestro equipo, la garantía de autenticidad y un
            acompañamiento que continúa mucho después de la compra.
          </p>
          <blockquote className="border-l-2 border-gold-500 pl-6 font-display text-2xl font-medium text-ink-900 italic">
            &ldquo;Una joya no se usa: se atesora. Y cuando se hereda, se
            convierte en memoria.&rdquo;
          </blockquote>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-white/80 to-gold-500/10 p-8">
          <p className="flex-1 font-display text-xl font-medium text-ink-900">
            ¿Quieres conocer nuestras piezas de cerca?
          </p>
          <a
            href={buildWhatsAppLink(siteEnquiryMessage())}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-esmerald-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ivory-50 transition hover:bg-esmerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            Pedir asesoría
          </a>
        </div>
      </div>
    </>
  );
}