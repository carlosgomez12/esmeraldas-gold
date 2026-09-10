"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string | null;
  unitAmount: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),
      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
      count: () => get().items.reduce((acc, i) => acc + i.qty, 0),
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.unitAmount * i.qty, 0),
    }),
    {
      name: "esmeraldas-gold-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);