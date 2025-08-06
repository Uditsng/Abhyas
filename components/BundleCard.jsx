"use client";

import Link from "next/link";

export default function BundleCard({ bundle }) {
  return (
    <Link href={`/testList/${bundle.id}`} className="no-underline">
      <div className="max-w-sm w-full mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 flex flex-col backdrop-blur-md cursor-pointer">
        {/* Image (16:9) */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-800">
          <img
            src={bundle.imageUrl}
            alt={bundle.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between h-full">
          {/* Title & Subject */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {bundle.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              Subject: <b>{bundle.subject}</b>
            </p>
          </div>

          {/* Price & Test Count */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {bundle.originalPrice && (
              <span className="text-sm line-through text-gray-500 dark:text-gray-400">
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
          <button className="w-full py-2 px-4 mt-auto rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition">
            View Bundle
          </button>
        </div>
      </div>
    </Link>
  );
}
