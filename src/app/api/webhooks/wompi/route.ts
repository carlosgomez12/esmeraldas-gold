import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wompiProvider } from "@/lib/payments/wompi-provider";
import { serverEnv } from "@/config/server-env";

export const runtime = "nodejs";

/**
 * Webhook de Wompi. Verifica la firma `x-signature`, actualiza el pago
 * y el estado del pedido. Incluye idempotencia por `providerReference`.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const event = await wompiProvider.verifyWebhookEvent(rawBody, headers);

  if (!event) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const providerReference = event.transactionId;
  const payment = await db.payment.findUnique({
    where: {
      providerReference,
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "payment not found" }, { status: 404 });
  }

  const paid = event.status === "APPROVED";
  const failed =
    event.status === "DECLINED" ||
    event.status === "VOIDED" ||
    event.status === "ERROR";

  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: {
        status: paid ? "PAID" : failed ? "FAILED" : "PENDING",
        paidAt: paid ? new Date() : null,
        payload: event.raw as never,
        updatedAt: new Date(),
      },
    }),
    db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: paid ? "PAID" : failed ? "PENDING" : "PENDING",
        status: paid ? "CONFIRMED" : undefined,
      },
    }),
  ]);

  if (serverEnv.n8nWebhookUrl) {
    void fetch(serverEnv.n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": serverEnv.n8nWebhookSecret,
      },
      body: JSON.stringify({
        event: "payment.event",
        status: event.status,
        providerReference,
        orderId: payment.orderId,
        amount: payment.amount,
      }),
      signal: AbortSignal.timeout(4000),
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}