import type { Metadata } from "next";
import {
  LegalArticle,
  type LegalSection,
} from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Política de cookies",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    heading: "¿Qué son las cookies?",
    body: "Las cookies son pequeños archivos que se guardan en tu dispositivo y nos ayudan a que el sitio funcione y a medir su uso de forma anónima.",
  },
  {
    heading: "Cookies necesarias",
    body: "Son indispensables para el funcionamiento del sitio: mantener la sesión, tu carrito y la seguridad. No requieren consentimiento porque son técnicas.",
  },
  {
    heading: "Cookies de medición y marketing",
    body: "Con tu consentimiento usamos herramientas de analítica (Google Analytics / GTM) y, en el futuro, publicidad. Estas cookies nos permiten entender cómo se usa el sitio y medir campañas, siempre de forma agregada.",
  },
  {
    heading: "Cómo gestionarlas",
    body: "Puedes cambiar tus preferencias en cualquier momento desde el banner de cookies o desde la configuración de tu navegador. Bloquearlas puede afectar tu experiencia de compra.",
  },
];

export default function CookiesPage() {
  return (
    <LegalArticle
      title="Política de cookies"
      description="Transparencia sobre el uso de cookies en nuestro sitio."
      updated="8 de septiembre de 2026"
      sections={sections}
    />
  );
}