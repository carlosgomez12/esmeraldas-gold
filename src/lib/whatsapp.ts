import { env } from "@/config/env";

export function buildWhatsAppLink(message: string, phone?: string): string {
  const number = phone ?? env.whatsappNumber;
  const clean = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(productName: string): string {
  return `Hola, me gustaría recibir asesoría sobre la pieza «${productName}» de Esmeraldas Gold.`;
}

export function siteEnquiryMessage(): string {
  return env.whatsappDefaultMessage;
}