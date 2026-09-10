"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { paymentProvider } from "@/lib/payments";

const lineSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).max(20),
});

const contactSchema = z.object({
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().length(2).default("CO"),
});

function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EG-${date}-${suffix}`;
}

export async function createOrder(input: {
  lines: z.infer<typeof lineSchema>[];
  contact: z.infer<typeof contactSchema>;
  shipping: z.infer<typeof shippingSchema>;
}): Promise<{ ok: boolean; error?: string; orderId?: string; orderNumber?: string }> {
  const lines = z.array(lineSchema).safeParse(input.lines);
  const contact = contactSchema.safeParse(input.contact);
  const shipping = shippingSchema.safeParse(input.shipping);

  if (!lines.success || lines.data.length === 0)
    return { ok: false, error: "Tu carrito está vacío." };
  if (!contact.success) return { ok: false, error: "Revisa tus datos de contacto." };
  if (!shipping.success) return { ok: false, error: "Revisa los datos de envío." };

  const productIds = lines.data.map((l) => l.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
  });

  let itemsTotal = 0;
  const orderItems: {
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[] = [];

  for (const line of lines.data) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || typeof product.price !== "number") {
      return {
        ok: false,
        error: `No pudimos validar «${product?.name ?? "una pieza"}». Escríbenos por WhatsApp para completar tu pedido.`,
      };
    }
    const total = product.price * line.qty;
    itemsTotal += total;
    orderItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: line.qty,
      unitPrice: product.price,
      total,
    });
  }

  const orderNumber = makeOrderNumber();
  const email = contact.data.email.toLowerCase();

  try {
    const existingCustomer = await db.customer.findFirst({ where: { email } });
    const customer = existingCustomer
      ? await db.customer.update({
          where: { id: existingCustomer.id },
          data: {
            phone: contact.data.phone || undefined,
            marketingOptIn: true,
          },
        })
      : await db.customer.create({
          data: {
            email,
            phone: contact.data.phone || null,
            firstName: shipping.data.fullName.split(/\s+/)[0] ?? null,
            lastName:
              shipping.data.fullName.split(/\s+/).slice(1).join(" ") || null,
            marketingOptIn: true,
          },
        });

    const order = await db.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          firstName: shipping.data.fullName,
          lastName: shipping.data.fullName,
          line1: shipping.data.line1,
          line2: shipping.data.line2 || null,
          city: shipping.data.city,
          region: shipping.data.region || null,
          postalCode: shipping.data.postalCode || null,
          country: shipping.data.country,
          phone: contact.data.phone || null,
          isDefault: true,
        },
      });

      const created = await tx.order.create({
        data: {
          number: orderNumber,
          customerId: customer.id,
          customerEmail: email,
          customerPhone: contact.data.phone || null,
          billingName: shipping.data.fullName,
          shippingAddressId: address.id,
          shippingName: shipping.data.fullName,
          shippingLine1: shipping.data.line1,
          shippingLine2: shipping.data.line2 || null,
          shippingCity: shipping.data.city,
          shippingRegion: shipping.data.region || null,
          shippingPostalCode: shipping.data.postalCode || null,
          shippingCountry: shipping.data.country,
          itemsTotal,
          total: itemsTotal,
          currency: "COP",
          source: "web",
          metadata: { items: orderItems.map((i) => i.sku) },
          items: {
            create: orderItems.map((i) => ({
              productId: i.productId,
              name: i.name,
              sku: i.sku,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          },
          payments: {
            create: {
              provider: "WOMPI",
              amount: itemsTotal,
              currency: "COP",
              status: "PENDING",
            },
          },
        },
        include: { payments: true },
      });

      return created;
    });

    return { ok: true, orderId: order.id, orderNumber: order.number };
  } catch {
    return {
      ok: false,
      error: "No pudimos crear tu pedido. Intenta de nuevo o escríbenos por WhatsApp.",
    };
  }
}

export async function getAcceptanceTokenAction(): Promise<{
  ok: boolean;
  token?: string;
  mock?: boolean;
}> {
  const token = await paymentProvider.getAcceptanceToken();
  if (!token) return { ok: false };
  return { ok: true, token, mock: paymentProvider.name === "mock" };
}

export async function processPayment(input: {
  orderId: string;
  paymentMethodToken: string;
  installments?: number;
}): Promise<{
  ok: boolean;
  error?: string;
  status?: string;
  reference?: string | null;
  mock?: boolean;
}> {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: { payments: { where: { status: "PENDING" }, take: 1 } },
  });
  if (!order) return { ok: false, error: "Pedido no encontrado." };

  const payment = order.payments[0];
  if (!payment) return { ok: false, error: "No hay pago pendiente." };

  const acceptanceToken = await paymentProvider.getAcceptanceToken();
  const result = await paymentProvider.createTransaction({
    amount: order.total,
    currency: order.currency,
    reference: order.number,
    customer: {
      email: order.customerEmail,
      phone: order.customerPhone,
      fullName: order.shippingName,
    },
    paymentMethodToken: input.paymentMethodToken,
    acceptanceToken,
    installments: input.installments,
  });

  if (!result.providerReference) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: result.failureReason,
        payload: result.raw as never,
      },
    });
    return {
      ok: false,
      error: result.failureReason ?? "No se pudo procesar el pago.",
    };
  }

  const paid = result.status === "APPROVED";
  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: {
        status: paid ? "PAID" : "FAILED",
        providerReference: result.providerReference,
        failureReason: result.failureReason,
        paidAt: paid ? new Date() : null,
        payload: result.raw as never,
      },
    }),
    db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paid ? "PAID" : "PENDING",
        status: paid ? "CONFIRMED" : order.status,
      },
    }),
  ]);

  return {
    ok: paid,
    status: result.status,
    reference: result.providerReference,
    mock: paymentProvider.name === "mock",
  };
}

export async function getOrderPublic(orderId: string): Promise<{
  ok: boolean;
  error?: string;
  order?: {
    number: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    items: { name: string; quantity: number; unitPrice: number }[];
  };
}> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Pedido no encontrado." };

  return {
    ok: true,
    order: {
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      currency: order.currency,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    },
  };
}

export async function checkoutEnv() {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  };
}