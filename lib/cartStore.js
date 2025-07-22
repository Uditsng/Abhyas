import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// useCartStore is your custom hook (like useState, useEffect)
export const useCartStore = create(
  persist(
    (set, get) => ({
      // 1️⃣ Initial state
      cartItems: [],

      // 2️⃣ Add item
      addToCart: (bundle) => {
        const alreadyExists = get().cartItems.find(item => item.id === bundle.id);
        if (!alreadyExists) {
          set({ cartItems: [...get().cartItems, bundle] });
        }
      },

      // 3️⃣ Remove item
      removeFromCart: (id) => {
        set({ cartItems: get().cartItems.filter(item => item.id !== id) });
      },

      // 4️⃣ Clear everything
      clearCart: () => {
        set({ cartItems: [] });
      }
    }),
    {
      name: 'bundle-cart-storage', // This key is used in localStorage
    }
  )
);
