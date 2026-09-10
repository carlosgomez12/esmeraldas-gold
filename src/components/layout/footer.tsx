import Link from "next/link";
import { AtSign, MessageCircle, ThumbsUp } from "lucide-react";
import { env } from "@/config/env";
import { footerColumns } from "@/config/navigation";
import { buildWhatsAppLink, siteEnquiryMessage } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink-950 text-ivory-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="font-display text-xl font-semibold uppercase tracking-[0.18em] text-ivory-50">
                Esmeraldas&nbsp;Gold
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.34em] text-gold-400">
                Joyería fina
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory-200/80">
              Casa de joyería especializada en piezas únicas de oro y esmeraldas.
              Cada pieza se concibe como una experiencia que acompaña los
              momentos que valen oro.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory-100/20 text-ivory-100 transition hover:border-gold-400 hover:text-gold-400"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory-100/20 text-ivory-100 transition hover:border-gold-400 hover:text-gold-400"
              >
                <ThumbsUp className="h-4 w-4" />
              </a>
              <a
                href={buildWhatsAppLink(siteEnquiryMessage())}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory-100/20 text-ivory-100 transition hover:border-esmerald-500 hover:text-esmerald-500"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivory-200/80 transition-colors hover:text-ivory-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ivory-100/10 pt-8 sm:flex-row">
          <p className="text-xs text-ivory-200/60">
            © {new Date().getFullYear()} {env.siteName}. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-ivory-200/60">
            Hecho con dedicación en Colombia · Precios sujetos a confirmación
          </p>
        </div>
      </div>
    </footer>
  );
}