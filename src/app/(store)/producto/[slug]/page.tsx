import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import {
  ProductAttributes,
  CertificationNotice,
  CareInstructions,
} from "@/components/product/product-attributes";
import { ProductCard } from "@/components/catalog/product-card";
import { Badge } from "@/components/ui/badge";
import { GoldDivider } from "@/components/ui/separator";
import { env } from "@/config/env";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Pieza no encontrada" };

  const image = product.images[0]?.asset.originalUrl;
  const title = product.name;
  const description =
    product.shortDescription ??
    `Pieza de ${env.siteName} : joyería en oro y esmeraldas. Asesoría personalizada disponible.`;

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  if (product.status !== "ACTIVE" && !product.isDemo) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  const images = product.images.map((img) => ({
    id: img.asset.id,
    alt: img.asset.alt,
    originalUrl: img.asset.originalUrl,
  }));
  const primaryImage = images[0]?.originalUrl ?? null;
  const hasVideo = product.videos.length > 0;
  const outOfStock =
    product.inventory?.stock !== null &&
    product.inventory?.stock !== undefined &&
    product.inventory.stock <= 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.sku,
    image: images.map((img) => img.originalUrl),
    brand: { "@type": "Brand", name: env.siteName },
    category: product.category?.name,
    ...(typeof product.price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency,
            availability: outOfStock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            url: `${env.siteUrl}/producto/${product.slug}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500 uppercase tracking-[0.16em]">
            <li>
              <Link href="/" className="hover:text-gold-700">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-gold-700">
                Catálogo
              </Link>
            </li>
            {product.category ? (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="h-3 w-3" />
                </li>
                <li>
                  <Link
                    href={`/catalogo?categoria=${product.category.slug}`}
                    className="hover:text-gold-700"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li aria-current="page" className="text-ink-900">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} name={product.name} />

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {product.exclusive ? (
                <Badge variant="gold">Pieza exclusiva</Badge>
              ) : null}
              {product.highValue ? (
                <Badge variant="emerald">Alta joyería</Badge>
              ) : null}
              {hasVideo ? (
                <Badge variant="ivory">Video disponible</Badge>
              ) : null}
              {outOfStock ? (
                <Badge variant="outline">Consultar disponibilidad</Badge>
              ) : null}
            </div>

            <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-ink-900 sm:text-5xl">
              {product.name}
            </h1>

            {product.shortDescription ? (
              <p className="mt-4 text-base leading-relaxed text-ink-600">
                {product.shortDescription}
              </p>
            ) : (
              <p className="mt-4 text-base leading-relaxed text-ink-600">
                Pieza cuidadosamente elaborada por {env.siteName}. Escribe con
                nuestros asesores para conocer cada detalle.
              </p>
            )}

            <div className="mt-6">
              <ProductActions
                product={{
                  id: product.id,
                  slug: product.slug,
                  sku: product.sku,
                  name: product.name,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  currency: product.currency,
                  image: primaryImage,
                }}
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-white/60 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gold-600" />
                <span className="text-xs leading-snug text-ink-600">
                  Autenticidad y trazabilidad
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-white/60 p-4">
                <Truck className="h-5 w-5 shrink-0 text-gold-600" />
                <span className="text-xs leading-snug text-ink-600">
                  Envío asegurado en todo el país
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-ink-900/10 bg-white/60 p-4">
                <MessageCircle className="h-5 w-5 shrink-0 text-esmerald-700" />
                <span className="text-xs leading-snug text-ink-600">
                  Asesoría personalizada
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl font-medium text-ink-900">
                Detalles de la pieza
              </h2>
              <GoldDivider className="mt-3 justify-start" />
              <div className="mt-6 space-y-5">
                {product.description ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      Descripción
                    </h3>
                    <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-700">
                      {product.description.split(/\n{2,}/).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-2">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Especificaciones
                  </h3>
                  <ProductAttributes
                    material={product.material}
                    goldType={product.goldType}
                    stone={product.stone}
                    stoneColor={product.stoneColor}
                    stoneCarat={product.stoneCarat}
                    weight={product.weight}
                    dimensions={product.dimensions}
                    certification={product.certification}
                    certificationUrl={product.certificateUrl}
                  />
                </div>
                <CertificationNotice
                  certification={product.certification}
                  certificationUrl={product.certificateUrl}
                  isGemCertified={product.isGemCertified}
                />
                <CareInstructions care={product.careInstructions} />
              </div>
            </section>

            {product.reviews.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-medium text-ink-900">
                  Opiniones de la pieza
                </h2>
                <GoldDivider className="mt-3 justify-start" />
                <ul className="mt-6 space-y-5">
                  {product.reviews.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-2xl border border-ink-900/10 bg-white/70 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-medium text-ink-900">
                          {review.customer?.firstName ?? review.customerName ?? "Cliente"}
                        </span>
                        <span className="text-xs text-gold-700">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(Math.max(0, 5 - review.rating))}
                        </span>
                      </div>
                      {review.title ? (
                        <p className="mt-2 text-sm font-semibold text-ink-800">
                          {review.title}
                        </p>
                      ) : null}
                      {review.body ? (
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                          {review.body}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gold-500/25 bg-gradient-to-br from-white/80 to-gold-500/10 p-6">
              <h3 className="font-display text-xl font-medium text-ink-900">
                ¿No es exactamente lo que buscas?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Podemos hacer una pieza a medida o encontrarte la variación
                ideal. Dinós que tienes en mente.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                <li>Diseños personalizados</li>
                <li>Grabados y fechas especiales</li>
                <li>Adaptación de tallas y diseños</li>
              </ul>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
                  Te pueden gustar
                </p>
                <h2 className="mt-2 font-display text-3xl font-medium text-ink-900">
                  Piezas relacionadas
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-gold-700 hover:text-gold-600 sm:inline"
              >
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}