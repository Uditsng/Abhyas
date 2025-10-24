"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBundleById } from "@/lib/bundleService";
import { getTestsByIds } from "@/lib/adminTestsService";
import { Clock, BookOpen, ListChecks, Zap } from "lucide-react";

export default function BundleDetailsPage() {
  const { bundleId } = useParams();
  const [bundle, setBundle] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBundleAndTests() {
      try {
        const bundleData = await getBundleById(bundleId);
        if (!bundleData) {
          setBundle(null);
          setLoading(false);
          return;
        }

        setBundle(bundleData);

        if (bundleData.testIds?.length > 0) {
          const testData = await getTestsByIds(bundleData.testIds);
          setTests(testData);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    fetchBundleAndTests();
  }, [bundleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        Bundle not found.
      </div>
    );
  }

  return (
    <div className='pt-24'>
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 sm:px-4 lg:px-8 py-12 bg-gradient-to-r from-blue-200 via-indigo-200 to-indigo-100 dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      {/* Image Section - Keep as you like */}
      {bundle.imageUrl && (
        <div className="flex justify-center px-2">
          <img
            src={bundle.imageUrl}
            alt={bundle.title}
            className="max-w-sm h-auto rounded-xl shadow-lg object-contain"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-center text-4xl font-extrabold uppercase mt-6 mb-6 bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
        {bundle.title}
      </h1>

      {/* Tests List */}
      {tests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mt-6 text-center">
          No tests found in this bundle.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} router={router} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

// Test Card Component
function TestCard({ test, router }) {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  return (
    <div className="backdrop-blur-lg bg-white/30 dark:bg-white/10 border border-gray-200/40 dark:border-gray-700/50 rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl transition duration-300">
      {/* Title */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 line-clamp-2 uppercase">
          {test.testName || "Untitled Test"}
        </h2>
        {test.difficulty && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyClass(
              test.difficulty
            )}`}
          >
            {test.difficulty}
          </span>
        )}
      </div>
      {/* Meta Info */}
      <div className="space-y-2 mb-6">
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <BookOpen className="w-4 h-4" /> {test.subject || "General"}
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4" /> {test.duration || "N/A"} mins
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <ListChecks className="w-4 h-4" /> {test.questions?.length ?? 0} Qs
        </p>
      </div>

      {/* Action Button */}
      <button
        // onClick={() => router.push(`/test/${test.id}`)}
        onClick={() => router.push(`/test/${test.id}/instructions`)}
        className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-indigo-500 transition-all duration-300"
      >
        Start Test
      </button>
    </div>
  );
}
