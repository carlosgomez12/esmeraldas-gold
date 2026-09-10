export type Consent = "accepted" | "denied" | null;

export const CONSENT_KEY = "esmeraldas-gold-consent";

export function getStoredConsent(): Consent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "accepted" ? "accepted" : value === "denied" ? "denied" : null;
}

export function storeConsent(consent: "accepted" | "denied") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, consent);
}