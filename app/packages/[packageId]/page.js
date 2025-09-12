"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPackageById } from "@/lib/packageService";
import { FiBox, FiStar,FiChevronRight } from "react-icons/fi";

export default function PackageDetailsPage() {
  const { packageId } = useParams();
  const [pkg, setPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) return;
      setLoading(true);
      try {
        const packageData = await getPackageById(packageId);
        setPackage(packageData);
      } catch (error) {
        console.error("Failed to fetch package:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-gray-500 dark:text-gray-300">Loading Package...</div>
      </div>
    );
  }

  if (!pkg) {
    return <div className="text-center text-red-500 py-24">Package not found.</div>;
  }

  return (
    <div className="pt-24 pb-12 px-4 mx-auto text-gray-800 dark:text-gray-100 relative max-w-7xl">
      {/* Main package details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 items-center">
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
          {pkg.imageUrl ? (
            <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <FiBox className="w-24 h-24 text-gray-400" />
          )}
        </div>
        <div>
          <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-3 w-fit">
            <FiStar className="w-3 h-3"/> PACKAGE
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{pkg.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{pkg.description || 'The ultimate collection to boost your exam preparation.'}</p>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{pkg.price}
            </span>
            {pkg.originalPrice && (
              <span className="text-lg line-through text-red-400 dark:text-red-500">
                ₹{pkg.originalPrice}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <button className="flex-1 py-3 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Add to Cart
            </button>
            <button className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Buy Now
            </button>
          </div>
        </div>
      </div>

          {/* BUNDLE LIST */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-500 pb-2 inline-block">
          What's Included
        </h2>
        {pkg.bundles && pkg.bundles.length > 0 ? (
          <div className="space-y-4">
            {pkg.bundles.map((bundle) => (
              <div 
                key={bundle.id}                 
              >
                <div className="bg-white/10 dark:bg-white/5 border border-white/20 hover:border-white/40 dark:hover:border-white/30 backdrop-blur-md shadow-lg rounded-xl p-4 transition-all duration-300 group-hover:shadow-blue-500/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Left Side: Title & Subject */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {bundle.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bundle.subject}
                      </p>
                    </div>

                    {/* Middle: Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-800 dark:text-gray-200 w-full sm:w-auto">
                      <div className="text-center flex-1 sm:flex-initial">
                        <p className="font-bold text-lg">{bundle.testIds?.length || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tests</p>
                      </div>
                      <div className="text-center flex-1 sm:flex-initial">
                        <p className="font-bold text-lg">{bundle.totalQuestionsInBundle || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      </div>
                      <div className="text-center flex-1 sm:flex-initial">
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">₹{bundle.price}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No bundles are currently included in this package.</p>
        )}
      </div>
    </div>
  );
}
