import type { Metadata } from "next";
import {
  LegalArticle,
  type LegalSection,
} from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    heading: "¿Qué datos recopilamos?",
    body: "Recopilamos la información que compartes voluntariamente: nombre, correo, teléfono y mensajes enviados por formularios, WhatsApp o el proceso de compra. También recopilamos datos técnicos básicos (navegador, dispositivo) mediante el análisis del sitio.",
  },
  {
    heading: "¿Cómo usamos tus datos?",
    body: "Los utilizamos para responderte, procesar pedidos, coordinar envíos, ofrecerte asesoría y —si aceptas— enviarte información sobre nuevas ediciones. Nunca vendemos tus datos a terceros.",
  },
  {
    heading: "Seguridad",
    body: "Protegemos tu información con medidas técnicas y organizativas. Los pagos se procesan a través de pasarelas certificadas; no almacenamos datos de tarjetas en nuestros servidores.",
  },
  {
    heading: "Tus derechos",
    body: "Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento escribiéndonos a nuestro WhatsApp oficial o al correo de contacto del sitio.",
  },
  {
    heading: "Cookies",
    body: "Usamos cookies propias y de terceros para el funcionamiento del sitio y medición anónima de audiencia. Consulta nuestra política de cookies para más detalle.",
  },
];

export default function PrivacidadPage() {
  return (
    <LegalArticle
      title="Política de privacidad"
      description="Cómo tratamos tus datos personales con transparencia y respeto."
      updated="8 de septiembre de 2026"
      sections={sections}
    />
  );
}