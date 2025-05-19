'use client';

//page.jsx displays test results.

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { testSeries } from '@/lib/tests';
import Link from 'next/link';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();

  // Extract course and test IDs from params
  // const courseId = Array.isArray(params.course) ? params.course[0] : params.course;
  // const testId = Array.isArray(params.test) ? params.test[0] : params.test;
  const courseId = params.course;
  const testId = params.test;


  // State
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get test data
  const courseTests = testSeries[courseId] || [];
  const testData = courseTests.find((t) => t.id === testId);

  // Fetch result data
  useEffect(() => {
    // Get result from localStorage
    const results = JSON.parse(localStorage.getItem('testResults') || '[]');
    const userResult = results.find(
      (r) => r.courseId === courseId && r.testId === testId
    );

    if (userResult) {
      setResult(userResult);
    }

    setLoading(false);
  }, [courseId, testId]);

  // If test not found
  if (!testData) {
    return <div className="p-6 text-red-600">Test not found.</div>;
  }

  // If still loading
  if (loading) {
    return <div className="p-6">Loading results...</div>;
  }

  // If no result found
  if (!result) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>No result found for this test. Have you taken it yet?</p>
        </div>
        <Link href={`/tests/${courseId}/${testId}`}>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Take This Test
          </button>
        </Link>
      </div>
    );
  }

  // Calculate score percentage
  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {testData.title} - Results
      </h2>

      {/* Score summary */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6 transition-colors duration-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
          <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
            {result.score} / {result.totalQuestions}
          </h3>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{scorePercentage}%</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question analysis */}
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Question Analysis
      </h3>

      <div className="space-y-4">
        {testData.questions.map((question, index) => {
          const userAnswer = result.answers[question.id];
          const isCorrect = userAnswer === question.answer;

          return (
            <div
              key={question.id}
              className={`p-4 border rounded-lg transition-colors duration-200 ${
                isCorrect 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                <span className="font-bold">Q{index + 1}.</span> {question.question}
              </p>

              <div className="mt-2 text-sm">
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">Your answer:</span>{" "}
                  {userAnswer || "Not answered"}
                </p>

                {!isCorrect && (
                  <p className="text-blue-700 dark:text-blue-400">
                    <span className="font-semibold">Correct answer:</span>{" "}
                    {question.answer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push(`/review/${testData.id}`)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 
                     text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Review Test
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                     text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
