
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllBundles } from '@/lib/bundleService';
import { getTestDetails } from '@/lib/adminTestsService';

export default function BundleDetailsPage() {
  const params = useParams();
  const bundleId = params.bundleId;
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBundle() {
      const bundles = await getAllBundles();
      const found = bundles.find((b) => b.id === bundleId);
      setBundle(found);
      setLoading(false);
    }
    fetchBundle();
  }, [bundleId]);

 if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
  <div className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-20">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{bundle.title}</h1>

      {bundle.imageUrl && (
        <div className="mb-8">
          <img
            src={bundle.imageUrl}
            alt={bundle.title}
            className="w-full max-h-[320px] object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
          />
        </div>
      )}
      {(!bundle.testIds || bundle.testIds.length === 0) ? (
        <p className="text-gray-500 dark:text-gray-400">No tests found in this bundle.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bundle.testIds.map((testId) => (
            <TestCard testId={testId} key={testId} />
          ))}
        </div>
      )}
    </div>
  );
}

function TestCard({ testId}) {
  const [test, setTest] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTest() {
      try {
        const t = await getTestDetails(testId);
        setTest(t);
      } catch(e) {
        setTest(null);
      }
    }
    fetchTest();
  }, [testId]);

  return (
      <div className="backdrop-blur-md bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between transition hover:scale-[1.01] hover:shadow-xl duration-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {test ? test.testName : testId}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Questions:{" "}
            {test?.questions?.length ?? "N/A"}
          </p>
      </div>

        <button
          onClick={() => router.push(`/test/${testId}`)}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
        >
          Start Test
        </button>
    </div>
  );
}


