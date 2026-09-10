import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-ivory-50">
      <div
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 75% 20%, rgba(201,163,92,0.28), transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(11,92,67,0.55), transparent 60%), linear-gradient(120deg, #0b0a08 0%, #16120a 55%, #0b5c43 130%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
        <div className="animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
            Edición &ldquo;Esmeraldas Eternas&rdquo;
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Joyas que atesoran
            <span className="block bg-gradient-to-r from-gold-300 via-gold-500 to-gold-400 bg-clip-text text-transparent">
              los momentos que valen oro
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory-200/85">
            Piezas únicas en oro y esmeraldas, diseñadas para celebrar los
            capítulos más importantes de tu vida. Asesoría privada y envío
            asegurado en todo el país.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild variant="gold" size="lg">
              <Link href="/catalogo">
                Explorar colección
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-ivory-50/30 text-ivory-50 hover:border-esmerald-500 hover:text-esmerald-500"
            >
              <a
                href={buildWhatsAppLink(siteEnquiryMessage())}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Asesoría personalizada
              </a>
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:block animate-fade-in">
          <div className="mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-2xl border border-gold-500/20 shadow-2xl shadow-ink-950/60">
            <div
              className="flex h-full w-full items-center justify-center bg-ivory-100"
              aria-hidden="true"
            >
              <div className="text-center px-10">
                <span className="font-display text-sm uppercase tracking-[0.3em] text-gold-600">
                  Esmeraldas Gold
                </span>
                <div className="mt-4 h-px w-24 bg-gold-500 mx-auto" />
                <p className="mt-4 font-display text-3xl font-medium leading-snug text-ink-900">
                  Joyería fina de autor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}