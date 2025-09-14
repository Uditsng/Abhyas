'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BundlePurchase from '@/components/BundlePurchase';
import PackageCard from '@/components/PackageCard';
import SectionHeader from '@/components/SectionHeader';
// import { getBundlesByExamId } from '@/lib/bundleService';
// import { getPackagesByExamId } from '@/lib/packageService';
import { getBundlesBySubExamCategory } from '@/lib/bundleService';
import { getPackagesBySubExamCategory } from '@/lib/packageService';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function ExamDetailsPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        // Step 1: Fetch the exam document itself to get its category
        const examSnap = await getDoc(doc(db, "exams", examId));
        if (!examSnap.exists()) {
          setExam(null);
          setLoading(false);
          return;
        }
        const examData = { id: examSnap.id, ...examSnap.data() };
        setExam(examData);

  const subCategory = examData.subCategory || examData.name;
        if (subCategory) {
          const [packagesData, bundlesData] = await Promise.all([
            getPackagesBySubExamCategory(subCategory),
            getBundlesBySubExamCategory(subCategory),
          ]);
          setPackages(packagesData);
          setBundles(bundlesData);
        }
      } catch (error) {
        console.error("Failed to fetch exam data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 pt-20">
        <p className="text-gray-500 dark:text-gray-400">Loading content...</p>
      </div>
    );
  }
  
  if (!exam) {
      return <div className="text-center py-10 pt-20">Exam not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <SectionHeader
        title={exam.subCategory || exam.name}
        subtitle={`Browse packages and bundles for this exam.`}
      />
      {/* Packages Section */}
      {packages.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Available Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}

      {/* Individual Bundles Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {packages.length > 0 ? "Individual Bundles" : "Available Bundles"}
        </h2>
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <BundlePurchase key={bundle.id} bundle={bundle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No individual bundles found for this exam category.</p>
          </div>
        )}
      </section>
    </div>
  );
}