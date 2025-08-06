'use client';

import React from 'react';
import ProgressBar from './ProgressBar';

export default function BundleProgressList({ bundles = [], testResults = [] }) {
  if (!bundles.length) {
    return <p className="text-gray-500 dark:text-gray-400">No purchased bundles found.</p>;
  }

  const testIdsAttempted = new Set(testResults.map((r) => r.testId));

  return (
    <div className="space-y-6">
      {bundles.map((bundle) => {
        const totalTests = bundle.testIds?.length || 0;
        const attemptedTests = bundle.testIds?.filter((id) => testIdsAttempted.has(id)).length || 0;
        const percentage = totalTests > 0 ? Math.round((attemptedTests / totalTests) * 100) : 0;

        return (
          <div key={bundle.id} className="p-1 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 truncate">
                {bundle.title}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {attemptedTests}/{totalTests} Tests
              </span>
            </div>
            <ProgressBar percentage={percentage} />
          </div>
        );
      })}
    </div>
  );
}
