"use client";
import Link from "next/link";
import { FiUserPlus, FiTrendingUp, FiGlobe, FiUsers } from "react-icons/fi";

export default function PartnerWithUsSection() {
  return (
    <section className="w-full py-16 px-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side */}
        <div className="text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-4">
            <FiUserPlus size={56} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Partner With Us
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-xl">
            Are you a teacher, institute, or admin? Join our platform to share your expertise, reach thousands of students, and make a real difference in education.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <FiTrendingUp className="text-blue-500 dark:text-blue-300 mb-2" size={28} />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Earn Income</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <FiGlobe className="text-blue-500 dark:text-blue-300 mb-2" size={28} />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Expand Reach</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <FiUsers className="text-blue-500 dark:text-blue-300 mb-2" size={28} />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Empower Students</p>
            </div>
          </div>

          <Link href="/auth/register">
            <span className="inline-block bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
              Become a Teacher / Partner
            </span>
          </Link>
        </div>

        {/* Right Side - Illustration / Image */}
        <div className="flex justify-center md:justify-end">
          <img
            src="/images/13399753_Work_7-removebg-preview.png"
            alt="Partner with us illustration"
            className="max-w-md w-full drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
