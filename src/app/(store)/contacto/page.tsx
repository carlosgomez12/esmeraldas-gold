import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos para asesorías personalizadas, piezas a medida o preguntas sobre nuestra joyería en oro y esmeraldas.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Estamos para acompañarte"
        title="Contacto"
        description="Cuéntanos qué estás buscando y nuestro equipo te responderá con una asesoría personalizada."
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink-900">
              Envíanos un mensaje
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-7">
              <h3 className="font-display text-xl font-medium text-ink-900">
                Atención directa
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Preferimos el trato cercano. Escríbenos por WhatsApp y un
                asesor te atenderá sin esperas.
              </p>
              <a
                href={buildWhatsAppLink(siteEnquiryMessage())}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-esmerald-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ivory-50 shadow transition hover:bg-esmerald-600"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp directo
              </a>
              <div className="mt-6 space-y-2 border-t border-ink-900/10 pt-5 text-sm text-ink-600">
                <p>
                  <span className="font-semibold text-ink-900">Horario:</span>{" "}
                  Lunes a sábado de 9:00 a 19:00
                </p>
                <p>
                  <span className="font-semibold text-ink-900">
                    Ubicación:
                  </span>{" "}
                  Bogotá, Colombia · Envíos nacionales asegurados
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}