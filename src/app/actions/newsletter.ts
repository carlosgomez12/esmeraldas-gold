"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { serverEnv } from "@/config/server-env";

const newsletterSchema = z.object({
  email: z.string().trim().email(),
  source: z.string().trim().max(60).default("home"),
});

export async function subscribeToNewsletter(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "home",
  });

  if (!parsed.success) {
    return { ok: false, message: "Ingresa un correo electrónico válido." };
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { active: true },
      create: {
        email: parsed.data.email,
        source: parsed.data.source,
      },
    });

    if (serverEnv.n8nWebhookUrl) {
      void fetch(serverEnv.n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": serverEnv.n8nWebhookSecret,
        },
        body: JSON.stringify({
          event: "newsletter.subscribe",
          email: parsed.data.email,
          source: parsed.data.source,
        }),
        signal: AbortSignal.timeout(4000),
      }).catch(() => undefined);
    }

    return {
      ok: true,
      message: "¡Gracias! Pronto recibirás noticias de nuestras ediciones.",
    };
  } catch {
    return {
      ok: false,
      message: "No pudimos guardar tu correo. Intenta de nuevo.",
    };
  }
}