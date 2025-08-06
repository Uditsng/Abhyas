"use client";
import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";

export default function PartnerWithUsSection() {
  return (
    <section className="mb-16 px-4">
      <div className="flex justify-center items-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 max-w-2xl w-full p-8 text-center transition-colors duration-200">
          <FiUserPlus size={48} className="mx-auto mb-4 text-blue-500 dark:text-blue-300" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Partner With Us</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Are you a teacher or admin? Join our platform to reach thousands of students and make a difference in education.
          </p>
          <Link href="/auth/register">
            <span className="inline-block bg-blue-600 text-white px-6 py-3 text-lg font-medium rounded-full hover:bg-blue-700 transition-colors duration-200">
              Become a Teacher / Partner
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
