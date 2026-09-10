import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CookieConsent } from "@/components/cookies/cookie-consent";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CartSheet />
      <WhatsAppFloat />
      <CookieConsent />
    </>
  );
}