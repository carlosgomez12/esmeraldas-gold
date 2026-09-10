import { GoldDivider } from "@/components/ui/separator";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="bg-ink-950 py-16 text-ivory-50 sm:py-20">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(201,163,92,0.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(11,92,67,0.5), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory-200/85">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-center">
          <GoldDivider />
        </div>
      </div>
    </header>
  );
}