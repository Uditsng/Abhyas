// //components/PackageCard.jsx

"use client";

import Link from "next/link";
import { FiBox, FiStar, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';
import { createInvoice, getInvoice } from '@/lib/invoiceService';

export default function PackageCard({ pkg, isPurchased = false, showInvoiceButton = false, order }) {
  const [user] = useAuthState(auth);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const subjects = pkg.bundles
    ? [...new Set(pkg.bundles.map((b) => b.subject))].slice(0, 3).join(", ")
    : "";

  const totalTests = pkg.totalTests || 0;
  const totalQuestions = pkg.totalQuestions || 0;
  const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleInvoiceClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setInvoiceLoading(true);

    if (!order) {
      showToast("Order not found for this package.", 'error');
      setInvoiceLoading(false);
      return;
    }

    try {
      let invoice = await getInvoice(order.id);
      if (!invoice) {
        const invoiceData = {
          orderId: order.id,
          userId: user.uid,
          packageId: pkg.id,
          amount: order.amount,
          date: order.date,
          userInfo: {
            name: user.displayName,
            email: user.email,
          },
          packageInfo: {
            title: pkg.name,
          },
        };
        await createInvoice(invoiceData);
      }
      window.open(`/invoice/${order.id}`, '_blank');
    } catch (error) {
      console.error("Error handling invoice:", error);
      showToast("Could not generate or retrieve your invoice.", 'error');
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <>
      <div className="relative max-w-sm w-full h-full mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-blue-500/30 transition-all duration-300 flex flex-col backdrop-blur-md cursor-pointer">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
        
        <Link href={`/packages/${pkg.id}`} className="relative z-10 flex flex-col h-full bg-white dark:bg-gray-800 rounded-t-2xl no-underline">
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
            {pkg.imageUrl ? (
              <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
            ) : (
              <FiBox className="w-16 h-16 text-gray-400" />
            )}
            <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <FiStar className="w-3 h-3" /> PACKAGE
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate uppercase">
                {pkg.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate uppercase">
                <b>{subjects || pkg.examId}</b>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                <span><strong>{pkg.bundleIds?.length || 0}</strong> Bundles</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                <span><strong>{totalTests}</strong> Tests</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FiCheckCircle className="text-green-500" />
                <span><strong>{totalQuestions}</strong> Questions</span>
              </div>
            </div>
            
           {!isPurchased ? (
              <div className="flex flex-wrap gap-2 items-center mb-4">
                {pkg.originalPrice && (
                  <span className="text-sm line-through text-red-400 dark:text-red-500">
                    ₹{pkg.originalPrice}
                  </span>
                )}
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₹{pkg.price}
                </span>
                {savings > 0 && (
                  <span className="text-sm px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md font-medium">
                    You save ₹{savings.toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-medium">
                  Purchased
                </span>
              </div>
            )}


            <button className="w-full py-2.5 px-4 mt-auto rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition shadow-md">
              View Contents
            </button>
          </div>
        </Link>
        {isPurchased && showInvoiceButton && (
          <div className="p-4 pt-0 relative z-10 bg-white dark:bg-gray-800 rounded-b-2xl">
            <button
                className="w-full py-2.5 px-4 rounded-full text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition disabled:bg-teal-400 disabled:cursor-not-allowed"
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