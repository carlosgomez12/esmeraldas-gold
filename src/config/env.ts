export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Esmeraldas Gold",
  siteLang: process.env.NEXT_PUBLIC_SITE_LANG ?? "es",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567",
  whatsappDefaultMessage:
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ??
    "Hola, me gustaría recibir asesoría sobre sus joyas.",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  ga4Enabled: process.env.NEXT_PUBLIC_GA4_ENABLED === "true",
  defaultCurrency: process.env.SITE_DEFAULT_CURRENCY ?? "COP",
  locale: process.env.SITE_LOCALE ?? "es-CO",
} as const;

export type PublicEnv = typeof env;