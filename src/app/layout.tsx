import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { env } from "@/config/env";
import { ToasterProvider } from "@/components/layout/toaster-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.siteName} | Joyas en oro y esmeraldas`,
    template: `%s | ${env.siteName}`,
  },
  description:
    "Boutique digital de joyas premium en oro y esmeraldas. Piezas únicas, atención personalizada y asesoría privada.",
  applicationName: env.siteName,
  authors: [{ name: env.siteName }],
  formatDetection: { telephone: true },
  openGraph: {
    title: `${env.siteName} | Joyas en oro y esmeraldas`,
    description:
      "Boutique digital de joyas premium en oro y esmeraldas. Piezas únicas, atención personalizada y asesoría privada.",
    locale: "es_CO",
    type: "website",
    siteName: env.siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.siteName} | Joyas en oro y esmeraldas`,
    description:
      "Boutique digital de joyas premium en oro y esmeraldas. Piezas únicas, atención personalizada y asesoría privada.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={env.siteLang}
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-ivory-100 text-ink-900">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}