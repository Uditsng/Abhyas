"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';
import { createInvoice, getInvoice } from '@/lib/invoiceService';
import { useState } from "react";

export default function BundleCard({ bundle, showInvoiceButton = false, order }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleInvoiceClick = async (e) => {
    // Prevent the link from navigating when the invoice button is clicked.
    e.stopPropagation(); 
    e.preventDefault();

    setInvoiceLoading(true);
    
    if (!order) {
      showToast("Order not found for this bundle.", 'error');
      setInvoiceLoading(false);
      return;
    }

    try {
        let invoice = await getInvoice(order.id);
        if (!invoice) {
          const invoiceData = {
            orderId: order.id,
            userId: user.uid,
            bundleId: bundle.id,
            amount: order.amount,
            date: order.date,
            userInfo: {
              name: user.displayName,
              email: user.email,
            },
            bundleInfo: {
              title: bundle.title,
            },
          };
          invoice = await createInvoice(invoiceData);
        }
        // Open invoice in a new tab
        window.open(`/invoice/${order.id}`, '_blank');
    } catch(error) {
        console.error("Error handling invoice:", error);
        showToast("Could not generate or retrieve your invoice.", 'error');
    } finally {
        setInvoiceLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-sm w-full h-full mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 flex flex-col backdrop-blur-md">
      <Link href={`/testList/${bundle.id}`} className="no-underline flex flex-col h-full flex-grow">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <img
            src={bundle.imageUrl}
            alt={bundle.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          {/* Title & Subject */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate uppercase">
              {bundle.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate uppercase">
              <b>{bundle.subject}</b>
            </p>
          </div>

          {/* Price & Test Count */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {bundle.originalPrice && (
              <span className="text-sm line-through px-2 py-1 bg-red-200 dark:bg-red-700 text-red-700 dark:text-red-300 rounded-md font-medium">
                ₹{bundle.originalPrice}
              </span>
            )}
            <span className="text-sm px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md font-medium">
              ₹{bundle.price}
            </span>
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md font-medium">
              {bundle.testIds?.length || 0} Tests
            </span>
          </div>

          {/* Button */}
          <div className="mt-auto">
             <button className="w-full py-2 px-4 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition">
                View Bundle
             </button>
          </div>
        </div>
      </Link>
      {showInvoiceButton && (
        <div className="p-4 pt-0">
          <button
              className="w-full py-2 px-4 rounded-full text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition disabled:bg-teal-400 disabled:cursor-not-allowed"
              onClick={handleInvoiceClick}
              disabled={invoiceLoading}
            >
              {invoiceLoading ? 'Generating...' : 'Download Invoice'}
            </button>
        </div>
      )}
    </div>
    {toast.show && (
         <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.message}
         </div>
      )}
    </>
  );
}
