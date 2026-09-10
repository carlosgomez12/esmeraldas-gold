import { PageHeader } from "@/components/layout/page-header";

export interface LegalSection {
  heading: string;
  body: string;
}

export function LegalArticle({
  title,
  eyebrow = "Información legal",
  description,
  updated,
  sections,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
          Última actualización: {updated}
        </p>
        <div className="mt-8 space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-2xl font-medium text-ink-900">
                {i + 1}. {s.heading}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-6 text-sm leading-relaxed text-ink-600">
          ¿Tienes dudas sobre este documento? Escríbenos a nuestro WhatsApp
          oficial y con gusto te orientamos.
        </p>
      </div>
    </>
  );
}