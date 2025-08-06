

"use client";

import Image from "next/image";
import { BookOpenCheck, Trophy, BarChart4, Languages } from "lucide-react";

export default function PassPromoSection() {
  return (
    <div className="bg-blue-50 dark:bg-blue-400 py-16 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Left Side: Illustration */}
      <div className="w-full md:w-1/2">
        <Image
          src="/images/Learning-bro.svg" // Replace with your own SVG or image
          alt="Mock Test Access"
          width={500}
          height={500}
          className="mx-auto"
        />
      </div>

      {/* Right Side: Content */}
      <div className="w-full md:w-1/2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Get Unlimited Access to 600+ Mock Tests
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg">
          Prepare for top government & competitive exams with curated test series,
          structured performance tracking, and real-time rankings.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <FeatureCard icon={<Trophy />} title="All India Rank" />
          <FeatureCard icon={<BookOpenCheck />} title="Latest Exam Pattern" />
          <FeatureCard icon={<BarChart4 />} title="Performance Analytics" />
          <FeatureCard icon={<Languages />} title="Multi-Language Support" />
        </div>

        <button className="bg-blue-600 text-white py-3 px-6 rounded-xl shadow-md hover:bg-blue-700 transition">
          Explore Pass Now
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
      <div className="p-2 rounded-full bg-white dark:bg-gray-700 text-blue-600">
        {icon}
      </div>
      <h4 className="text-gray-800 dark:text-white font-semibold text-base">{title}</h4>
    </div>
  );
}
