'use client';

import { useCartStore } from '@/lib/cartStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handlePayment = () => {
    setIsPaying(true);
    // Placeholder for payment integration
    setTimeout(() => {
      clearCart();
      setIsPaying(false);
      alert('Payment Gateway Coming Soon!');
      router.push('/');
    }, 1200);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-28 text-center text-gray-600 dark:text-gray-300">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p>Add bundles to your cart to proceed to checkout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-28 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="space-y-4 mb-8">
        {cartItems.map((bundle, idx) => (
          <div
            key={bundle.id}
            className="flex items-center justify-between bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl p-4 shadow-sm"
          >
            <div>
              <div className="font-semibold text-base">{bundle.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {bundle.testIds?.length || 0} Tests
              </div>
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold text-lg">
              ₹{bundle.price}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-xl font-bold">Total: ₹{total}</div>
      </div>
      <button
        onClick={handlePayment}
        disabled={isPaying}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium transition disabled:opacity-60"
      >
        {isPaying ? 'Processing...' : 'Proceed to Pay'}
      </button>
    </div>
  );
} 