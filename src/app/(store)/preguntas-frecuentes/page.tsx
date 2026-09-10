import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre pagos, envíos, autenticidad, personalización y cuidado de tus joyas en oro y esmeraldas.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const faqs = [
  {
    q: "¿Cómo sé que mis piezas son auténticas?",
    a: "Trabajamos con proveedores certificados y documentamos la trazabilidad de cada esmeralda. En la asesoría te compartimos el certificado y las garantías de cada pieza.",
  },
  {
    q: "¿Qué pasa si una pieza no tiene precio visible?",
    a: "Algunas piezas son bajo consulta por su valor o edición limitada. Escríbenos por WhatsApp y te confirmamos disponibilidad, condiciones y detalles.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Aceptamos tarjetas de crédito, débito y pagos a través de pasarelas seguras en Colombia (incluimos Wompi / Nequi / PSE según la pieza). También coordinamos pagos por WhatsApp para piezas especiales.",
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí. Todos los envíos salen asegurados y con seguimiento. El tiempo estimado se confirma al momento de la compra según tu ciudad.",
  },
  {
    q: "¿Puedo personalizar o hacer una pieza a medida?",
    a: "Sí. Diseños personalizados, grabados, adaptación de tallas y piezas desde cero. Cuéntanos tu idea y te acompañamos en todo el proceso.",
  },
  {
    q: "¿Cómo cuido una pieza de oro y esmeraldas?",
    a: "Guárdala en su estuche, evita el contacto con productos químicos y límpiala con un paño suave. Te entregamos instrucciones específicas con cada pieza.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resolvemos tus dudas"
        title="Preguntas frecuentes"
        description="Todo lo que debes saber antes de elegir tu pieza."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-ink-900/10 bg-white/70 p-6 open:shadow-md open:shadow-ink-900/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium text-ink-900 transition group-open:text-gold-700">
                {f.q}
                <span className="text-gold-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-white/80 to-gold-500/10 p-8 text-center">
          <p className="font-display text-xl font-medium text-ink-900">
            ¿Tienes otra pregunta?
          </p>
          <p className="mt-2 text-sm text-ink-600">
            Estamos a un mensaje de distancia.
          </p>
          <a
            href={buildWhatsAppLink(siteEnquiryMessage())}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-esmerald-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ivory-50 transition hover:bg-esmerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}