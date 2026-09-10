"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck, Trash2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/ui/separator";
import {
  createOrder,
  getAcceptanceTokenAction,
  processPayment,
} from "@/app/actions/checkout";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

interface CardData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holder: string;
}

const emptyCard: CardData = {
  number: "",
  cvc: "",
  expMonth: "",
  expYear: "",
  holder: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, setQty, removeItem, subtotal, clear } = useCart();
  const [contact, setContact] = React.useState({ email: "", phone: "" });
  const [shipping, setShipping] = React.useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
  });
  const [card, setCard] = React.useState<CardData>(emptyCard);
  const [step, setStep] = React.useState<"review" | "payment">("review");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isMock, setIsMock] = React.useState(true);

  const count = items.reduce((a, i) => a + i.qty, 0);
  const total = subtotal();

  React.useEffect(() => {
    getAcceptanceTokenAction().then((r) => setIsMock(Boolean(r.mock)));
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl font-medium text-ink-900">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-ink-600">
          Agrega piezas y vuelve aquí para completar tu pedido.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  function setShippingField(field: keyof typeof shipping, value: string) {
    setShipping((s) => ({ ...s, [field]: value }));
  }

  async function handleProceed() {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      setError("Ingresa un correo válido para enviarte la confirmación.");
      return;
    }
    if (shipping.fullName.trim().length < 3 || shipping.line1.trim().length < 3 || shipping.city.trim().length < 2) {
      setError("Completa nombre completo, dirección y ciudad.");
      return;
    }
    setStep("payment");
  }

  async function handlePay() {
    setError(null);
    if (!contact.email || shipping.fullName.trim().length < 3) {
      setError("Verifica que tus datos de contacto y envío estén completos.");
      setStep("review");
      return;
    }

    setBusy(true);
    track.beginCheckout(total);

    try {
      const orderRes = await createOrder({
        lines: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        contact,
        shipping: { ...shipping, country: "CO" },
      });
      if (!orderRes.ok || !orderRes.orderId) {
        setError(orderRes.error ?? "No pudimos crear tu pedido.");
        return;
      }

      const acceptance = await getAcceptanceTokenAction();
      const mockToken = `tok_test_${crypto.randomUUID().replace(/-/g, "")}`;
      const paymentMethodToken = isMock
        ? mockToken
        : await tokenizeCard(card, acceptance.token ?? "");

      if (!isMock && !paymentMethodToken) {
        setError("No pudimos validar tu tarjeta. Revisa los datos.");
        return;
      }

      const paymentRes = await processPayment({
        orderId: orderRes.orderId,
        paymentMethodToken: paymentMethodToken ?? "",
      });

      if (!paymentRes.ok || paymentRes.status !== "APPROVED") {
        setError(paymentRes.error ?? "El pago no fue aprobado.");
        return;
      }

      clear();
      router.push(`/checkout/exito?order=${orderRes.orderId}`);
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          Último paso
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink-900 sm:text-5xl">
          Finalizar compra
        </h1>
        <GoldDivider className="mt-5" />
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">
              1 · Datos de contacto
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">WhatsApp (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+57 300 000 0000"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white/70 p-6">
            <h2 className="font-display text-xl font-medium text-ink-900">
              2 · Dirección de envío
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Nombre del destinatario</Label>
                <Input
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(e) => setShippingField("fullName", e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Dirección</Label>
                <Input
                  id="line1"
                  value={shipping.line1}
                  onChange={(e) => setShippingField("line1", e.target.value)}
                  placeholder="Calle, número, barrio"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line2">Complemento (opcional)</Label>
                <Input
                  id="line2"
                  value={shipping.line2}
                  onChange={(e) => setShippingField("line2", e.target.value)}
                  placeholder="Apartamento, torre…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) => setShippingField("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Departamento (opcional)</Label>
                <Input
                  id="region"
                  value={shipping.region}
                  onChange={(e) => setShippingField("region", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código postal (opcional)</Label>
                <Input
                  id="postalCode"
                  value={shipping.postalCode}
                  onChange={(e) => setShippingField("postalCode", e.target.value)}
                />
              </div>
            </div>
          </section>

          {step === "payment" ? (
            <section className="rounded-2xl border border-gold-500/30 bg-white/70 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium text-ink-900">
                  3 · Pago con tarjeta
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                  <Lock className="h-3.5 w-3.5" />
                  Conexión segura
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-600">
                {isMock
                  ? "Modo de prueba: ingresa cualquier tarjeta de ejemplo y el pago se aprobará."
                  : "Tus datos de tarjeta se tokenizan directamente con el procesador; no los almacenamos."}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="holder">Nombre en la tarjeta</Label>
                  <Input
                    id="holder"
                    value={card.holder}
                    onChange={(e) => setCard({ ...card, holder: e.target.value })}
                    placeholder="COMO APARECE EN LA TARJETA"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="number">Número de tarjeta</Label>
                  <Input
                    id="number"
                    inputMode="numeric"
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })
                    }
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expMonth">Mes</Label>
                  <Input
                    id="expMonth"
                    inputMode="numeric"
                    value={card.expMonth}
                    onChange={(e) => setCard({ ...card, expMonth: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                    placeholder="12"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expYear">Año</Label>
                    <Input
                      id="expYear"
                      inputMode="numeric"
                      value={card.expYear}
                      onChange={(e) => setCard({ ...card, expYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="2029"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      inputMode="numeric"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <p
                  className="mt-5 rounded-lg bg-red-900/10 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("review")}
                  disabled={busy}
                >
                  Volver
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  className="flex-1"
                  onClick={handlePay}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pagar {formatPrice(total)}
                    </>
                  )}
                </Button>
              </div>
            </section>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-ink-900/10 bg-white/70 p-5">
              <Button
                asChild
                variant="ghost"
                className="inline-flex items-center gap-1.5 text-esmerald-700"
              >
                <a
                  href={buildWhatsAppLink("Hola, quiero completar mi pedido por WhatsApp.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Prefiero pedir por WhatsApp
                </a>
              </Button>
              <Button type="button" variant="gold" onClick={handleProceed}>
                Continuar al pago →
              </Button>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-ink-900/10 bg-white/70 p-6">
          <h2 className="font-display text-xl font-medium text-ink-900">
            Resumen ({count} {count === 1 ? "pieza" : "piezas"})
          </h2>
          <ul className="mt-4 space-y-3 border-b border-ink-900/10 pb-4">
            {items.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-500">× {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatPrice(item.unitAmount * item.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label="Quitar"
                    className="text-ink-400 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-ink-600">
              <span>Envío asegurado</span>
              <span className="text-emerald-700">Se coordina contigo</span>
            </div>
            <div className="flex justify-between text-sm text-ink-600">
              <span>Impuestos</span>
              <span>Incluidos</span>
            </div>
            <div className="flex justify-between border-t border-ink-900/10 pt-3">
              <span className="font-medium text-ink-900">Total</span>
              <span className="font-display text-2xl font-semibold text-ink-900">
                {formatPrice(total)}
              </span>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-4 w-4 text-gold-600" />
            Pago procesado por pasarela certificada. Envío con seguimiento y
            póliza.
          </p>
        </aside>
      </div>
    </div>
  );
}

async function tokenizeCard(card: CardData, acceptanceToken: string): Promise<string | null> {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey) return null;
  try {
    const res = await fetch(
      `${publicKey.startsWith("pub_test_") ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1"}/tokens/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicKey}`,
        },
        body: JSON.stringify({
          number: card.number,
          cvc: card.cvc,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          card_holder: card.holder,
        }),
      }
    );
    const data = (await res.json()) as { data?: { id?: string } };
    return data.data?.id ?? null;
  } catch {
    return null;
  }
}