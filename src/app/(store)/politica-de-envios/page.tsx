import type { Metadata } from "next";
import {
  LegalArticle,
  type LegalSection,
} from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Política de envíos y devoluciones",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    heading: "Envíos",
    body: "Realizamos envíos asegurados y con seguimiento dentro de Colombia. El tiempo estimado se confirma al momento de la compra según tu ciudad. En piezas bajo consulta o a medida, la entrega se coordina personalmente con el cliente.",
  },
  {
    heading: "Empaque y seguridad",
    body: "Todas nuestras piezas salen en embalaje de seguridad con certificado de autenticidad cuando corresponde. Te enviaremos el número de seguimiento una vez tu pedido sea despachado.",
  },
  {
    heading: "Recepción",
    body: "Recomendamos revisar la pieza al recibirla y reportar cualquier novedad dentro de las 24 horas siguientes a la entrega.",
  },
  {
    heading: "Devoluciones y cambios",
    body: "Para piezas estándar, podemos coordinar cambio o devolución dentro de los términos acordados en cada venta. Las piezas personalizadas, a medida o grabadas no son objeto de devolución, salvo defectos de fabricación certificados.",
  },
];

export default function EnviosPage() {
  return (
    <LegalArticle
      title="Política de envíos y devoluciones"
      description="Cómo entregamos tus piezas y qué sucede si necesitas un cambio."
      updated="8 de septiembre de 2026"
      sections={sections}
    />
  );
}