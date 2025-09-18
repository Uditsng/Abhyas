//lib/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc } from 'firebase/firestore'
import {db} from '@/lib/firebaseConfig'

// useCartStore is custom hook (like useState, useEffect)
export const useCartStore = create(
  persist(
    (set, get) => ({
      // 1️⃣ Initial state
      cartItems: [],

      // 2️⃣ Add item
      addToCart: async (bundle, userId) => {
        const alreadyExists = get().cartItems.find(item => item.id === bundle.id);
        if (!alreadyExists) {
          const updatedCart= [...get().cartItems, bundle];
          set({ cartItems: updatedCart})

          if (userId){
            await setDoc(doc(db, 'carts', userId), {cartItems: updatedCart})
          }
        }
      },

      // 3️⃣ Remove item
      removeFromCart: async (bundleId,userId) => {
        const updatedCart= get().cartItems.filter(item => item.id !== bundleId);
        set({ cartItems: updatedCart})

        if(userId){
          await setDoc(doc(db,'carts', userId),{cartItems:updatedCart})
        }
      },

      // 4️⃣ Clear everything
      clearCart: async (userId) => {
        set({ cartItems: [] });

         if(userId){
          await setDoc(doc(db,'carts', userId),{cartItems:[]})
        }
      },

      //sync from firestore
      syncCartFromFirestore: async(userId) =>{
        const docRef = doc(db, 'carts', userId)
        const snap = await getDoc(docRef)
        if(snap.exists()){
          const data = snap.data()
          if (data?.cartItems){
            set({cartItems:data.cartItems})
          }
        }
      }
    }),
    {
      name: 'bundle-cart-storage', 
    }
  )
);
