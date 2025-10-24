// app/(user)/test/[testId]/instructions/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestDetails } from '@/lib/adminTestsService';
import { useAuth } from '@/components/AuthContext';
import { Spinner, Center, Text } from '@chakra-ui/react';

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;
  const { user, loading: authLoading } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchTestInfo = async () => {
      try {
        const testData = await getTestDetails(testId);
        if (testData) {
          setTest(testData);
        } else {
          // Handle test not found
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Failed to fetch test details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestInfo();
  }, [testId, user, authLoading, router]);

  const handleStartTest = () => {
    if (isChecked) {
      router.push(`/test/${testId}`);
    }
  };

  if (loading || authLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 pt-24">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          {test?.testName}
        </h1>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
          <span>Duration: {test?.duration} Mins</span>
          <span>Maximum Marks: {test?.totalQuestions}</span>
        </div>

        <h2 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Read the following instructions carefully:
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <li>The test contains {test?.totalQuestions} total questions.</li>
          <li>Each question has 4 options out of which only one is correct.</li>
          <li>You have to finish the test in {test?.duration} minutes.</li>
          <li>You will be awarded 1 mark for each correct answer and there will be no marks deducted for each wrong answer.</li>
          <li>There is no negative marking for the questions that you have not attempted.</li>
          <li>You can write this test only once. Make sure that you complete the test before you submit the test and/or close the browser.</li>
        </ol>

        <div className="border-t pt-4 mt-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair means in this examination. I understand that using unfair means of any sort for my own or someone else’s advantage will lead to my immediate disqualification.
            </span>
          </label>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleStartTest}
            disabled={!isChecked}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            I am ready to begin
          </button>
        </div>
      </div>
    </div>
  );
}