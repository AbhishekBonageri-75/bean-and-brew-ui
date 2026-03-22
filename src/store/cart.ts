import { create } from 'zustand';
import { cartApi, type Cart } from '../lib/api';

const CART_ID = 'dev-user';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  cartId: string;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  cartId: CART_ID,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartApi.get(get().cartId);
      set({ cart: data });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (variantId, quantity) => {
    const { data } = await cartApi.addItem(get().cartId, variantId, quantity);
    set({ cart: data });
  },

  updateItem: async (variantId, quantity) => {
    const { data } = await cartApi.updateItem(get().cartId, variantId, quantity);
    set({ cart: data });
  },

  removeItem: async (variantId) => {
    const { data } = await cartApi.removeItem(get().cartId, variantId);
    set({ cart: data });
  },

  applyPromo: async (code) => {
    const { data } = await cartApi.applyPromo(get().cartId, code);
    set({ cart: data });
  },

  clearCart: async () => {
    await cartApi.clear(get().cartId);
    set({ cart: null });
  },
}));
