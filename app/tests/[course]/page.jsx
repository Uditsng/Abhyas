'use client';

// app/tests/[course]/page.jsx  handle test listings and individual test pages.

import { testSeries } from '../../../lib/tests';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseTestsPage() {
  const params = useParams();
  const courseId = params.course;

  const courseTests = testSeries[courseId]; // Gets the list of tests for that course

  if (!courseTests) {
    return <div className="p-6 text-red-600">Course not found.</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Tests for {courseId.toUpperCase()}</h2>
      <div className="space-y-4">
        {courseTests.map((test) => ( // Loops through each test and shows a card for it
          <div
            key={test.id}
            className="border dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{test.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Duration: {test.duration} mins | Questions: {test.totalQuestions}
            </p>
            <Link href={`/tests/${courseId}/${test.id}`}>
              <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded transition-colors duration-200">
                Start Test
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}