"use client";

import Link from "next/link";
import { FiBox, FiStar, FiCheckCircle } from "react-icons/fi";

export default function PackageCard({ pkg, isPurchased = false }) {
  const subjects = pkg.bundles
    ? [...new Set(pkg.bundles.map((b) => b.subject))].slice(0, 3).join(", ")
    : "";

  const totalTests = pkg.totalTests || 0;
  const totalQuestions = pkg.totalQuestions || 0;
  const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;

  return (
    <Link href={`/packages/${pkg.id}`} className="no-underline group h-full">
      <div className="relative w-full mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-blue-500/30 transition-all duration-300 flex flex-col backdrop-blur-md cursor-pointer h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>

        <div className="relative z-10 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl">
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
            {pkg.imageUrl ? (
              <img
                src={pkg.imageUrl}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
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
                <span>
                  <strong>{pkg.bundleIds?.length || 0}</strong> Bundles
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                <span>
                  <strong>{totalTests}</strong> Tests
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FiCheckCircle className="text-green-500" />
                <span>
                  <strong>{totalQuestions}</strong> Questions
                </span>
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
              {isPurchased ? 'View Contents' : 'View Package'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}