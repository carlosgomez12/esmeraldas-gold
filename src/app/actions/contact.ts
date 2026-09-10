"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { serverEnv } from "@/config/server-env";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
  source: z.string().trim().max(40).default("contacto"),
  productId: z.string().optional(),
});

export type ContactState = {
  ok: boolean;
  message: string;
};

function sendWebhook(payload: Record<string, unknown>) {
  if (!serverEnv.n8nWebhookUrl) return;
  void fetch(serverEnv.n8nWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": serverEnv.n8nWebhookSecret,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(4000),
  }).catch(() => undefined);
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    source: formData.get("source") ?? "contacto",
    productId: formData.get("productId") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Revisa los campos e inténtalo de nuevo." };
  }

  const data = parsed.data;
  try {
    const lead = await db.lead.create({
      data: {
        source: "WEB",
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        productId: data.productId || null,
        metadata: { origin: data.source },
      },
    });

    sendWebhook({
      event: "lead.created",
      leadId: lead.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      productId: data.productId,
      origin: data.source,
    });

    return {
      ok: true,
      message:
        "Gracias por escribirnos. Nuestro equipo te contactará muy pronto.",
    };
  } catch {
    return { ok: false, message: "No pudimos enviar tu mensaje. Intenta de nuevo." };
  }
}