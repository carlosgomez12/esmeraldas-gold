import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { serverEnv } from "@/config/server-env";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracionPage() {
  const settings = await db.siteSettings.findMany({
    orderBy: { key: "asc" },
  });

  const envChecks: { label: string; configured: boolean }[] = [
    { label: "Wompi pagos", configured: Boolean(serverEnv.wompiPublicKey && serverEnv.wompiPrivateKey) },
    { label: "Webhook n8n", configured: Boolean(serverEnv.n8nWebhookUrl) },
    { label: "Webhook CRM", configured: Boolean(serverEnv.crmWebhookUrl) },
    { label: "Email (Resend/SMTP)", configured: serverEnv.emailProvider !== "console" },
    { label: "Almacenamiento local", configured: serverEnv.storageDriver === "local" },
    { label: "Alto valor (COP)", configured: serverEnv.highValueThresholdCop > 0 },
  ];

  return (
    <div>
      <PageTitle title="Configuración" description="Ajustes generales y variables de entorno." />

      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-medium text-ink-900">
          Estado de la instalación
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {envChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-2xl border border-ink-900/10 bg-white/70 px-5 py-4 text-sm"
            >
              <span className="font-medium text-ink-900">{check.label}</span>
              <span
                className={
                  check.configured
                    ? "rounded-full bg-esmerald-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-esmerald-800"
                    : "rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700"
                }
              >
                {check.configured ? "Configurado" : "Pendiente"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Las credenciales se leen del archivo <code>.env</code>. Nunca se muestran aquí.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-display text-xl font-medium text-ink-900">
          Preferencias de la tienda
        </h2>
        <p className="mb-4 text-sm text-ink-600">
          Claves guardadas como JSON en <code>SiteSettings</code>. Edita el JSON y guarda.
        </p>
        <SettingsEditor
          settings={settings.map((s) => ({
            key: s.key,
            valueJson: JSON.stringify(s.value, null, 2),
          }))}
          allowCreate
        />
      </section>
    </div>
  );
}