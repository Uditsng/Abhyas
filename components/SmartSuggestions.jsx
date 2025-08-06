'use client';

import Link from 'next/link';

export default function SmartSuggestions({ testResults = [], bundles = [] }) {
  if (!testResults.length && !bundles.length) return null;

  const testIdsAttempted = new Set(testResults.map((r) => r.testId));
  const lowScoreTests = testResults.filter(r => {
    if (r.totalQuestions === 0) return false;
    const percent = (r.score / r.totalQuestions) * 100;
    return percent < 50;
  });

  const bundlesWithNoAttempts = bundles.filter(bundle => {
    return bundle.testIds.every(testId => !testIdsAttempted.has(testId));
  });

  const latestTest = testResults[0];
  const suggestions = [];

  // Add suggestion for low-scoring test
  if (lowScoreTests.length > 0) {
    const test = lowScoreTests[0];
    suggestions.push({
      message: `Your score in "${test.title}" was below 50%. Consider reviewing it.`,
      link: `/tests/${test.testId}`
    });
  }

  // Add suggestion for unattempted bundle
  if (bundlesWithNoAttempts.length > 0) {
    const bundle = bundlesWithNoAttempts[0];
    suggestions.push({
      message: `You haven’t started the "${bundle.title}" bundle. Try a test now.`,
      link: `/bundles/${bundle.id}`
    });
  }

  // Suggest most recent test retake
  if (latestTest && latestTest.testId) {
    suggestions.push({
      message: `Want to retake "${latestTest.title}" to improve your score?`,
      link: `/tests/${latestTest.testId}`
    });
  }

  // Suggest try a new test
  const unattemptedTestIds = bundles
    .flatMap(b => b.testIds)
    .filter(testId => !testIdsAttempted.has(testId));
  if (unattemptedTestIds.length > 0) {
    suggestions.push({
      message: `You still have unattempted tests in your bundles. Start one today!`,
      link: `/tests`
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        Smart Suggestions for You
      </h2>
      <ul className="space-y-3">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-start">
            <span className="mr-2 text-blue-500 dark:text-blue-400">👉 </span>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {s.message}
              </p>
              {s.link && (
                <Link href={s.link} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Take Action →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
