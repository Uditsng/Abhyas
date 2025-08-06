

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllBundles } from "@/lib/bundleService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import BundlePurchase from "@/components/BundlePurchase";

export default function ExamBundlesPage() {
  const params = useParams();
  const examId = params.examId;
  const [exam, setExam] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const bundlesPerPage = 10;

  useEffect(() => {
    async function fetchExamAndBundles() {
      setLoading(true);
      const examSnap = await getDoc(doc(db, "exams", examId));
      if (!examSnap.exists()) {
        setExam(null);
        setBundles([]);
        setLoading(false);
        return;
      }
      const examData = { id: examSnap.id, ...examSnap.data() };
      setExam(examData);
      const allBundles = await getAllBundles();
      const filtered = allBundles.filter(
        (b) =>
          b.exam === examData.category &&
          b.subExamCategory === (examData.subCategory || examData.name)
      );
      setBundles(filtered);
      setCurrentPage(1); // reset pagination when examId changes
      setLoading(false);
    }

    if (examId) fetchExamAndBundles();
  }, [examId]);

  // Pagination slice
  const indexOfLastBundle = currentPage * bundlesPerPage;
  const indexOfFirstBundle = indexOfLastBundle - bundlesPerPage;
  const currentBundles = bundles.slice(indexOfFirstBundle, indexOfLastBundle);
  const totalPages = Math.ceil(bundles.length / bundlesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-gray-600 dark:text-gray-300">
        <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Loading bundles...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 text-red-600 dark:text-red-400 text-xl">
        Exam not found.
      </div>
    );
  }

  return (
    <div className="py-28 mb-24 px-4">
      <div className="max-w-7xl mx-auto py-4">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
          {exam.subCategory || exam.name} Bundles
        </h1>

        {bundles.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No bundles found for this exam.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBundles.map((bundle) => (
                <BundlePurchase key={bundle.id} bundle={bundle} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="inline-flex space-x-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
