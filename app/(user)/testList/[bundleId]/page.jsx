// 'use client';

// import { useParams, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { getBundleById } from '@/lib/bundleService';
// import { getTestsByIds } from '@/lib/adminTestsService';

// export default function BundleDetailsPage() {
//   const { bundleId } = useParams();
//   const [bundle, setBundle] = useState(null);
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchBundleAndTests() {
//       try {
//         // 1. Get the bundle by ID (no need to fetch all bundles)
//         const bundleData = await getBundleById(bundleId);
//         if (!bundleData) {
//           setBundle(null);
//           setLoading(false);
//           return;
//         }

//         setBundle(bundleData);

//         // 2. Fetch all tests in one call
//         if (bundleData.testIds?.length > 0) {
//           const testData = await getTestsByIds(bundleData.testIds);
//           setTests(testData);
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setLoading(false);
//       }
//     }

//     fetchBundleAndTests();
//   }, [bundleId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center mt-10">
//         <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (!bundle) {
//     return (
//       <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
//         Bundle not found.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-20">
//       {bundle.imageUrl && (
//         <div className="flex justify-center">
//           <img
//             src={bundle.imageUrl}
//             alt={bundle.title}
//             className="max-w-sm h-auto rounded-lg object-contain"
//           />
//         </div>
//       )}

// <h1 className="flex justify-center text-3xl font-bold mb-4 mt-4 underline text-gray-800 dark:text-gray-100">{bundle.title}</h1>

//       {tests.length === 0 ? (
//         <p className="text-gray-500 dark:text-gray-400 mt-6">No tests found in this bundle.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
//           {tests.map((test) => (
//             <TestCard key={test.id} test={test} router={router} />
//           ))}
//         </div>
        
//       )}
//     </div>
//   );
// }

// // -------------------
// // Test Card Component
// // -------------------
// function TestCard({ test, router }) {
//   return (
    
//     <div className="backdrop-blur-md bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-5 flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl transition duration-200">
//       {/* Title */}
//       <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
//         {test.testName || "Untitled Test"}
//       </h2>

//       {/* Sub-info */}
//       <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//         {test.subject || "General"} | {test.duration || "N/A"} mins | {test.questions?.length ?? 0} Qs
//       </p>

//       {/* Action Button */}
//       <button
//         onClick={() => router.push(`/test/${test.id}`)}
//         className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center space-x-2"
//       >
//         Start Test
//       </button>
//     </div>
//   );
// }


'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBundleById } from '@/lib/bundleService';
import { getTestsByIds } from '@/lib/adminTestsService';
import { Clock, BookOpen, ListChecks } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-r from-blue-200 via-indigo-200 to-indigo-100 dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      
      {/* Image Section - Keep as you like */}
      {bundle.imageUrl && (
        <div className="flex justify-center">
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
  );
}

// -------------------
// Test Card Component
// -------------------
function TestCard({ test, router }) {
  return (
    <div className="backdrop-blur-lg bg-white/30 dark:bg-white/10 border border-gray-200/40 dark:border-gray-700/50 rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl transition duration-300">
      
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 line-clamp-2 uppercase">
        {test.testName || "Untitled Test"}
      </h2>

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
        onClick={() => router.push(`/test/${test.id}`)}
        className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-500 hover:to-indigo-500 transition-all duration-300"
      >
        Start Test
      </button>
    </div>
  );
}
