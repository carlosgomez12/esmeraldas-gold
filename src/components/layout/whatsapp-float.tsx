"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

export function WhatsAppFloat() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <a
      href={buildWhatsAppLink(siteEnquiryMessage())}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={() => track.contact("whatsapp_float")}
      className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-esmerald-700 text-ivory-50 shadow-xl shadow-esmerald-900/30 transition-transform hover:scale-110 hover:bg-esmerald-600"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}