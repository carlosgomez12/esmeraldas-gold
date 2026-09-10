import { Gem, Hand, Scale, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Nuestro proceso",
  description:
    "Así nace una pieza de Esmeraldas Gold: selección de la gema, diseño, orfebrería artesanal y certificación.",
  alternates: { canonical: "/proceso" },
};

const steps = [
  {
    icon: Gem,
    title: "Selección de la gema",
    text: "Visitamos y auditamos nuestras fuentes. Cada esmeralda se elige por su color, claridad y origen certificado, con trazabilidad documentada.",
  },
  {
    icon: Sparkles,
    title: "Diseño y ensueño",
    text: "Cada pieza comienza como un boceto que dialoga con el cliente. Ajustamos tallas, perfiles y acabados hasta que el diseño cuenta exactamente lo que debe contar.",
  },
  {
    icon: Hand,
    title: "Orfebrería artesanal",
    text: "Nuestros maestros orfebres trabajan el oro de ley con técnicas tradicionales y herramientas modernas: fundición, soldadura, pulido y engaste a mano.",
  },
  {
    icon: Scale,
    title: "Control y entrega",
    text: "Verificamos metales y piedras, documentamos certificaciones y entregamos con embalaje de seguridad y envío asegurado a todo el país.",
  },
];

export default function ProcesoPage() {
  return (
    <>
      <PageHeader
        eyebrow="El oficio"
        title="Nuestro proceso"
        description="De la mina a tu mano: cada etapa está pensada para que la pieza sea impecable y honesta."
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="grid gap-6 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="relative overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70 p-8"
            >
              <span className="absolute right-4 top-3 font-display text-6xl font-medium text-gold-500/15">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-medium text-ink-900">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}