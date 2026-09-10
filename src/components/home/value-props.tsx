import { Gem, ShieldCheck, MessageCircle, Truck } from "lucide-react";

const valueProps = [
  {
    icon: Gem,
    title: "Piezas únicas",
    text: "Diseños de autor con esmeraldas de origen colombiano.",
  },
  {
    icon: ShieldCheck,
    title: "Autenticidad garantizada",
    text: "Certificación y trazabilidad de tus piedras y metales.",
  },
  {
    icon: MessageCircle,
    title: "Asesoría privada",
    text: "Acompañamiento personal en cada decisión.",
  },
  {
    icon: Truck,
    title: "Envío asegurado",
    text: "Transporte protegido a todo el territorio nacional.",
  },
];

export function ValueProps() {
  return (
    <section className="border-b border-ink-900/10 bg-ivory-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {valueProps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-lg font-medium text-ink-900">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}