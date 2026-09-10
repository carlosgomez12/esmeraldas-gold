import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttributesProps {
  material?: string | null;
  goldType?: string | null;
  stone?: string | null;
  stoneColor?: string | null;
  stoneCarat?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  certification?: string | null;
  certificationUrl?: string | null;
  careInstructions?: string | null;
}

function Value({ children }: { children?: string | null }) {
  const resolved = children?.trim();
  return (
    <span className={cn("text-sm", resolved ? "text-ink-900" : "text-ink-500")}>
      {resolved || "Consultar"}
    </span>
  );
}

export function ProductAttributes(props: AttributesProps) {
  const rows: { label: string; node: React.ReactNode }[] = [
    { label: "Material", node: <Value>{props.material}</Value> },
    { label: "Tipo de oro", node: <Value>{props.goldType}</Value> },
    { label: "Piedra principal", node: <Value>{props.stone}</Value> },
    { label: "Color de la piedra", node: <Value>{props.stoneColor}</Value> },
    { label: "Peso de la piedra", node: <Value>{props.stoneCarat}</Value> },
    { label: "Peso de la pieza", node: <Value>{props.weight}</Value> },
    { label: "Dimensiones", node: <Value>{props.dimensions}</Value> },
  ];

  return (
    <dl className="divide-y divide-ink-900/10 border-y border-ink-900/10">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-4 py-3"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {row.label}
          </dt>
          <dd>{row.node}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CertificationNotice({
  certification,
  certificationUrl,
  isGemCertified,
}: {
  certification?: string | null;
  certificationUrl?: string | null;
  isGemCertified?: boolean;
}) {
  if (!isGemCertified) {
    return (
      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
        La certificación y trazabilidad de esta pieza pueden confirmarse con
        nuestro equipo.
      </p>
    );
  }
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-esmerald-700" />
      {certification ? `Certificación: ${certification}. ` : ""}
      {certificationUrl ? (
        <a
          href={certificationUrl}
          target="_blank"
          rel="noreferrer"
          className="text-gold-700 underline underline-offset-2 hover:text-gold-600"
        >
          Ver certificado
        </a>
      ) : (
        "Pieza certificada: te compartimos el certificado en la asesoría."
      )}
    </p>
  );
}

export function CareInstructions({ care }: { care?: string | null }) {
  if (!care) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
        Cuidados de la pieza
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">{care}</p>
    </div>
  );
}