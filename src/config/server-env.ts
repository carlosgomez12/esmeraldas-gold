import "server-only";

export const serverEnv = {
  authSecret: process.env.AUTH_SECRET ?? "",
  authTrustHost: process.env.AUTH_TRUST_HOST === "true",
  databaseUrl: process.env.DATABASE_URL ?? "",
  wompiPublicKey: process.env.WOMPI_PUBLIC_KEY ?? "",
  wompiPrivateKey: process.env.WOMPI_PRIVATE_KEY ?? "",
  wompiEventsSecret: process.env.WOMPI_EVENTS_SECRET ?? "",
  wompiCurrency: process.env.WOMPI_CURRENCY ?? "COP",
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "",
  crmWebhookUrl: process.env.CRM_WEBHOOK_URL ?? "",
  crmWebhookSecret: process.env.CRM_WEBHOOK_SECRET ?? "",
  emailProvider: process.env.EMAIL_PROVIDER ?? "console",
  emailFrom: process.env.EMAIL_FROM ?? "Esmeraldas Gold <hola@esmeraldasgold.com>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ?? "587",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  storageDriver: process.env.STORAGE_DRIVER ?? "local",
  storageLocalDir: process.env.STORAGE_LOCAL_DIR ?? "public/media",
  highValueThresholdCop: Number(
    process.env.HIGH_VALUE_THRESHOLD_COP ?? "30000000"
  ),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "",
} as const;