"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { env } from "@/config/env";
import { getStoredConsent, storeConsent } from "@/lib/consent";

type GTagCommand = (
  action: string,
  ...args: unknown[]
) => void;

type ConsentWindow = {
  dataLayer?: unknown[];
  gtag?: GTagCommand;
};

function consentWindow(): ConsentWindow {
  return window as unknown as ConsentWindow;
}

const GRANTED: Record<string, string> = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
};

const DENIED: Record<string, string> = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

function ensureDataLayer(consent: Record<string, string>) {
  const w = consentWindow();
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(Array.prototype.slice.call(arguments));
  };
  w.gtag("consent", "default", consent);
}

function loadGtm(gtmId: string) {
  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

function loadGa4(ga4Id: string) {
  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
  document.head.appendChild(script);

  const w = consentWindow();
  w.gtag = w.gtag || function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(Array.prototype.slice.call(arguments));
  };
  w.gtag("js", new Date());
  w.gtag("config", ga4Id, { send_page_view: true });
}

function injectAnalytics() {
  if (!env.ga4Enabled) return;
  if (document.getElementById("gtm-script") || document.getElementById("ga4-script")) {
    return;
  }
  ensureDataLayer(GRANTED);
  if (env.gtmId) {
    loadGtm(env.gtmId);
  } else if (env.ga4Id) {
    loadGa4(env.ga4Id);
  }
}

function subscribeNothing() {
  return () => {};
}

export function CookieConsent() {
  const isClient = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = React.useState(false);
  const consent = React.useMemo(
    () => (isClient ? getStoredConsent() : null),
    [isClient]
  );

  React.useEffect(() => {
    if (consent === "accepted") injectAnalytics();
  }, [consent]);

  if (!isClient || dismissed || consent !== null) return null;

  function accept() {
    storeConsent("accepted");
    setDismissed(true);
    injectAnalytics();
  }

  function decline() {
    storeConsent("denied");
    const w = consentWindow();
    if (w.dataLayer) {
      w.gtag?.("consent", "update", DENIED);
    }
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-900/10 bg-ivory-50/95 p-5 shadow-[0_-8px_30px_rgba(11,10,8,0.12)] backdrop-blur sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-gold-600" />
            <h2 className="font-display text-lg font-medium text-ink-900">
              Valoramos tu privacidad
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Usamos cookies propias y de terceros (Google Analytics) para medir el
            tráfico y mejorar tu experiencia. Solo las activamos si nos das tu
            consentimiento. Consulta nuestra{" "}
            <Link
              href="/politica-de-cookies"
              className="text-gold-700 underline decoration-gold-500/40 underline-offset-2"
            >
              política de cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={decline}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink-900/20 bg-transparent px-6 text-sm font-semibold uppercase tracking-wide text-ink-700 transition hover:border-gold-500 hover:text-gold-700"
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={accept}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400"
          >
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={decline}
            aria-label="Cerrar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/15 text-ink-500 transition hover:text-ink-900 sm:self-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}