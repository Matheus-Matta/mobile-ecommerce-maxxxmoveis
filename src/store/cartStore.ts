import { create } from "zustand";
import type { Cart } from "@/types/shopify";
import {
  createCart,
  addCartLines,
  updateCartLine,
  removeCartLines,
} from "@/services/shopify.service";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  addItem: async (merchandiseId, quantity = 1) => {
    set({ loading: true });
    try {
      const { cart } = get();
      if (cart) {
        const updated = await addCartLines(cart.id, [
          { merchandiseId, quantity },
        ]);
        set({ cart: updated });
      } else {
        const newCart = await createCart([{ merchandiseId, quantity }]);
        set({ cart: newCart });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (lineId, quantity) => {
    set({ loading: true });
    try {
      const { cart } = get();
      if (!cart) return;
      const updated = await updateCartLine(cart.id, lineId, quantity);
      set({ cart: updated });
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (lineId) => {
    set({ loading: true });
    try {
      const { cart } = get();
      if (!cart) return;
      const updated = await removeCartLines(cart.id, [lineId]);
      set({ cart: updated });
    } finally {
      set({ loading: false });
    }
  },

  clearCart: () => set({ cart: null }),
}));
