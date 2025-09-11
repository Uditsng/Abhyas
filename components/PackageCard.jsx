"use client";

import Link from "next/link";
import { FiBox, FiStar } from "react-icons/fi";

export default function PackageCard({ pkg }) {
  // Extract subjects from the bundles within the package
  const subjects = pkg.bundles ? [...new Set(pkg.bundles.map(b => b.subject))].slice(0, 3).join(', ') : '';

  return (
    <Link href={`/packages/${pkg.id}`} className="no-underline group">
      <div className="relative max-w-sm w-full mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-blue-500/30 transition-all duration-300 flex flex-col backdrop-blur-md cursor-pointer h-full">
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>

        <div className="relative z-10 flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl">
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
            {pkg.imageUrl ? (
              <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
            ) : (
              <FiBox className="w-16 h-16 text-gray-400" />
            )}
            <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <FiStar className="w-3 h-3"/> PACKAGE
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-grow">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate uppercase">
                {pkg.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate uppercase">
                <b>{subjects || pkg.examId}</b>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-4">
               {pkg.originalPrice && (
                <span className="text-sm line-through text-red-400 dark:text-red-500">
                  ₹{pkg.originalPrice}
                </span>
              )}
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{pkg.price}
              </span>
              <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md font-medium">
                {pkg.bundleIds?.length || 0} Bundles Included
              </span>
            </div>
            <button className="w-full py-2.5 px-4 mt-auto rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition shadow-md">
              View Package
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

