"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BundlePurchase({ bundle }) {
  const router = useRouter();

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md overflow-hidden shadow hover:shadow-lg transition-all duration-200 flex flex-col backdrop-blur-md">
      
      {bundle.promotionStatus === "active" && bundle.promotionRate > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md" >
          Featured</span>
      )}
      
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
            <strong>{bundle.subject}</strong>
          </p>
        </div>

        {/* Price & Tests */}
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
          <Link href={`/bundles/${bundle.id}`}>
            <button className="w-full py-2 px-4 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition">
              Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
