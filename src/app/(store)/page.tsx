import Link from "next/link";
import { ArrowRight, MessageCircle, Quote, Star } from "lucide-react";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { ProductCard } from "@/components/catalog/product-card";
import { GoldDivider } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  getFeaturedProducts,
  getTestimonials,
  getCollections,
} from "@/lib/data/products";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Joyas en oro y esmeraldas | Esmeraldas Gold",
  description:
    "Boutique digital de joyería premium. Piezas únicas en oro y esmeraldas colombianas, asesoría privada y envío asegurado.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featuredProducts, collections, testimonials] = await Promise.all([
    getFeaturedProducts(6),
    getCollections(),
    getTestimonials(3),
  ]);

  return (
    <>
      <Hero />
      <ValueProps />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
            Piezas destacadas
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
            Edición &ldquo;Esmeraldas Eternas&rdquo;
          </h2>
          <GoldDivider className="mt-5" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600">
            Una selección de piezas con esmeraldas de origen colombiano,
            oro de ley y un cuidado obsesivo por los detalles.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 3} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/catalogo">
              Ver el catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {collections.length > 0 ? (
        <section className="bg-ink-950 py-20 text-ivory-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">
                Colecciones
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
                Histórias en oro
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/colecciones/${collection.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-ivory-50/10 bg-ivory-100 p-8 transition-all duration-300 hover:border-gold-500/50 hover:bg-ivory-50"
                >
                  <h3 className="font-display text-2xl font-medium text-ink-900 group-hover:text-gold-700 transition-colors">
                    {collection.name}
                  </h3>
                  {collection.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink-600 line-clamp-3">
                      {collection.description}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
                    Descubrir
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
              Nuestra historia
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
              Una tradición de excelencia
            </h2>
            <GoldDivider className="mt-5 justify-start" />
            <p className="mt-6 text-base leading-relaxed text-ink-600">
              En {env.siteName} creemos que una joya no es un objeto: es la
              custodia de una memoria. Por eso cada pieza pasa por un proceso
              artesanal riguroso, desde la selección de la gema hasta el último
              pulido.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              Trabajamos con esmeraldas de origen colombiano, oro de ley y
              talladores que han dedicado su vida al oficio. El resultado: joyas
              atemporales, diseñadas para ser heredadas.
            </p>
            <div className="mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/nosotros">
                  Conoce más de nosotros
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-gold-500/20 bg-gradient-to-br from-ivory-200 to-gold-300/30 p-10 text-center shadow-lg">
              <div>
                <span className="font-display text-sm uppercase tracking-[0.3em] text-gold-700">
                  Desde Colombia
                </span>
                <div className="mx-auto mt-4 h-px w-20 bg-gold-500" />
                <p className="mt-4 font-display text-3xl font-medium text-ink-900">
                  El alma de la esmeralda
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="border-y border-ink-900/10 bg-ivory-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
                Testimonios
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
                Clientes que guardamos en el corazón
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col rounded-2xl border border-ink-900/10 bg-white/70 p-7 shadow-sm"
                >
                  <Quote className="h-6 w-6 text-gold-500" />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-4">
                    <div>
                      <span className="font-display text-base font-medium text-ink-900">
                        {t.name}
                      </span>
                      {t.city ? (
                        <span className="block text-xs text-ink-500">
                          {t.city}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-0.5 text-gold-500">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-gold-500" />
                      ))}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-ink-950 py-20 text-ivory-50">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">
            Uniéndose primero
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Accede a ediciones limitadas
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory-200/80">
            Suscríbete para recibir primicias sobre nuevas piezas,
            historias detrás de las gemas e invitaciones a eventos privados.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <section className="bg-gradient-to-r from-gold-500/15 via-ivory-50 to-gold-500/15 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-medium text-ink-900 sm:text-4xl">
            ¿Buscas una pieza especial o un diseño a medida?
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-ink-600">
            Nuestro equipo te acompaña de principio a fin: asesoría,
            visualización del diseño y entrega asegurada.
          </p>
          <Button
            asChild
            variant="primary"
            size="lg"
          >
            <a
              href={buildWhatsAppLink(
                "Hola, me gustaría una asesoría personalizada para una pieza a medida."
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Escríbenos por WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}