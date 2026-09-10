import type { Metadata } from "next";
import {
  LegalArticle,
  type LegalSection,
} from "@/components/legal/legal-article";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    heading: "Aceptación de los términos",
    body: "Al navegar o comprar en Esmeraldas Gold aceptas estos términos. La información publicada sobre piezas (precios, disponibilidad y características) puede actualizarse y, cuando una pieza lo requiera, se confirma de forma personalizada.",
  },
  {
    heading: "Productos y precios",
    body: "Los precios se expresan en pesos colombianos (COP) e incluyen impuestos salvo indicación contraria. Algunas piezas se ofrecen bajo la modalidad 'Consultar', momento en que nuestro equipo confirma disponibilidad, precio y condiciones antes de finalizar cualquier compromiso.",
  },
  {
    heading: "Los atributos de las piezas",
    body: "Las características de cada joya (oro, quilates, peso, certificación y demás) se proporcionan de buena fe. Si una pieza no indica un atributo, esta se confirma personalizadamente con el cliente antes de la venta.",
  },
  {
    heading: "Pedidos y confirmación",
    body: "Una vez recibida tu orden de compra, nuestro equipo la revisa y confirma. Para piezas bajo consulta o alta joyería, el pedido se formaliza únicamente tras la confirmación por parte de un asesor.",
  },
  {
    heading: "Propiedad intelectual",
    body: "Los diseños, textos, logotipos e imágenes del sitio pertenecen a Esmeraldas Gold y no pueden reproducirse sin autorización expresa.",
  },
];

export default function TerminosPage() {
  return (
    <LegalArticle
      title="Términos y condiciones"
      description="Las bases de tu relación con Esmeraldas Gold al usar nuestro sitio y servicios."
      updated="8 de septiembre de 2026"
      sections={sections}
    />
  );
}