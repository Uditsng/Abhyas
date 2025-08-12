"use client";

import { useCartStore } from "@/lib/cartStore";
import { FaTrash } from "react-icons/fa";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebaseConfig";
import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button as ChakraButton,
} from "@chakra-ui/react";

export default function CartPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    syncCartFromFirestore,
  } = useCartStore();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = +(subtotal * 0.18).toFixed(2);
  const discount = 0;
  const total = subtotal + tax - discount;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (!user?.uid) return;
    syncCartFromFirestore(user.uid);
  }, [user?.uid]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRemoveAll = () => {
        if (user) {
      clearCart(user.uid);
    }
    onClose();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const bundle = cartItems[0];
    const amount = Math.round(total * 100);

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "ABHYAS",
        description: bundle.title,
        order_id: order.id,
        handler: async function (response) {
          await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user,
              bundle,
              amount,
            }),
          });

          if(user){
            clearCart(user.uid);
          }
          router.push("/dashboard");
        },
        prefill: {
          name: user?.displayName || "Guest",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3085d6" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[300px]">
  //       <Spinner className="mr-2" />
  //       <span>Loading user info...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-24 px-4 flex justify-center">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">🛒 Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-green-600 dark:text-green-400 py-20 text-lg">
            Your cart is empty 😢
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((bundle) => (
                <div
                  key={bundle.id}
                  className="flex flex-col sm:flex-row items-center gap-4 border border-gray-200 dark:border-white/20 p-4 rounded-md"
                >
                  <img
                    src={bundle.imageUrl}
                    alt={bundle.title}
                    className="w-24 h-16 object-contain border rounded bg-gray-100 dark:bg-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {bundle.title}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end sm:text-right gap-2">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ₹{bundle.price}
                    </p>
                    <button
                      onClick={() => user && removeFromCart(bundle.id, user.uid)}
                      className="text-red-500 hover:underline text-sm flex items-center gap-1"
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {cartItems.length >= 2 && (
                <div className="text-right">
                  <button
                    onClick={onOpen}
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white text-sm"
                  >
                    <FaTrash className="inline mr-1" />
                    Remove All
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="w-full max-w-sm border border-gray-200 dark:border-white/20 p-6 rounded-lg bg-gray-50 dark:bg-white/10">
              <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
                Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tax (18%):</span>
                  <span className="text-red-400">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-yellow-500">Coupon:</span>
                  <input
                    disabled
                    placeholder="Coupon Expired"
                    className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-400 text-xs w-36"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Discount:</span>
                  <span className="text-gray-400">No coupon applied</span>
                </div>
                <hr className="border-t border-gray-300 dark:border-white/20" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600 dark:text-green-400">₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-right text-gray-500">(18% tax included)</p>
                <button
                  onClick={handleCheckout}
                  className="w-full mt-2 py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={!user || cartItems.length === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove All Dialog */}
        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Remove All Items
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to remove all items from your cart? This action cannot be
                undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <ChakraButton ref={cancelRef} onClick={onClose}>
                  Cancel
                </ChakraButton>
                <ChakraButton colorScheme="red" onClick={handleRemoveAll} ml={3}>
                  Remove All
                </ChakraButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </div>
    </div>
  );
}
