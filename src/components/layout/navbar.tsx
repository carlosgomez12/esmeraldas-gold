"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { env } from "@/config/env";
import { navLinks } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

function useIsClient() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function CartBadge() {
  const isClient = useIsClient();
  const count = useCart((s) => s.count());
  if (!isClient) return null;
  return count > 0 ? (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink-950">
      {count}
    </span>
  ) : null;
}

function WishlistBadge() {
  const isClient = useIsClient();
  const count = useWishlist((s) => s.ids.length);
  if (!isClient) return null;
  return count > 0 ? (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-ivory-50">
      {count}
    </span>
  ) : null;
}

function Logo() {
  return (
    <Link href="/" className="group inline-flex flex-col leading-none">
      <span className="font-display text-xl font-semibold tracking-[0.18em] text-ink-900 uppercase">
        Esmeraldas&nbsp;Gold
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.34em] text-gold-700 group-hover:text-gold-600 transition-colors">
        Joyería fina
      </span>
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const setCartOpen = useCart((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-ivory-100/90 backdrop-blur-md">
      <div className="bg-ink-900 text-ivory-50">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em]">
          Envío asegurado en todo el país · Acompañamiento y asesoría personalizada
        </p>
      </div>

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
        </div>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.2em] transition-colors hover:text-gold-700",
                  pathname === link.href
                    ? "text-gold-700"
                    : "text-ink-700"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Link
            href="/catalogo?buscar="
            aria-label="Buscar"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:text-gold-700 transition-colors"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/favoritos"
            aria-label="Favoritos"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:text-gold-700 transition-colors"
          >
            <Heart className="h-5 w-5" />
            <WishlistBadge />
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Abrir carrito"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:text-gold-700 transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            <CartBadge />
          </button>
          <a
            href={`https://wa.me/${env.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:text-esmerald-700 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </a>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-ink-900/10 bg-ivory-50 lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-md px-4 py-3 text-sm uppercase tracking-[0.18em]",
                    pathname === link.href
                      ? "bg-gold-500/10 text-gold-700"
                      : "text-ink-700 hover:bg-ink-900/5"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Button asChild variant="gold" className="w-full" size="md">
                <a href={`https://wa.me/${env.whatsappNumber}`} target="_blank" rel="noreferrer">
                  Asesoría por WhatsApp
                </a>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}