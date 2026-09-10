"use client";

import { env } from "@/config/env";

type CustomEvent = {
  event: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    dataLayer?: CustomEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (env.ga4Enabled && typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

function dataLayerPush(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  gtag("event", event, params);
}

export const track = {
  viewItem: (item: {
    id: string;
    name: string;
    price?: number;
    category?: string;
  }) => {
    dataLayerPush("view_item", {
      items: JSON.stringify([{ item_id: item.id, item_name: item.name, price: item.price ?? 0, item_category: item.category ?? "" }]),
    });
  },
  addToCart: (item: { id: string; name: string; price?: number; quantity?: number }) => {
    dataLayerPush("add_to_cart", {
      items: JSON.stringify([{ item_id: item.id, item_name: item.name, price: item.price ?? 0, quantity: item.quantity ?? 1 }]),
    });
  },
  beginCheckout: (value?: number) => {
    dataLayerPush("begin_checkout", value ? { value } : {});
  },
  purchase: (data: { transactionId: string; value: number; currency?: string }) => {
    dataLayerPush("purchase", {
      transaction_id: data.transactionId,
      value: data.value,
      currency: data.currency ?? "COP",
    });
  },
  generateLead: (value?: string) => {
    dataLayerPush("generate_lead", value ? { value } : {});
  },
  contact: (channel: string) => {
    dataLayerPush("contact", { channel });
  },
};