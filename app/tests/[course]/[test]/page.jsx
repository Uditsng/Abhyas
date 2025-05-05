'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from "@chakra-ui/react";
import { testSeries } from '@/lib/tests';

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  // Extract course and test IDs from params
  const courseId = Array.isArray(params.course) ? params.course[0] : params.course;
  const testId = Array.isArray(params.test) ? params.test[0] : params.test;

  // Get test data
  const courseTests = testSeries[courseId] || [];
  const testData = courseTests.find((t) => t.id === testId);

  // State for answers and submission
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Question navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialize timer when component mounts
  useEffect(() => {
    if (testData) {
      // Convert minutes to seconds
      setTimeRemaining(testData.duration * 60);
      setTimerStarted(true);
    }
  }, [testData]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionChange = (qId, selected) => {
    setAnswers((prev) => ({ ...prev, [qId]: selected }));
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < testData.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Handle test submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      testData.questions.forEach(question => {
        if (answers[question.id] === question.answer) {
          score++;
        }
      });

      // Create result object
      const result = {
        courseId,
        testId,
        answers,
        score,
        totalQuestions: testData.questions.length,
        date: new Date().toISOString(),
      };

      // For now, store in localStorage
      // This will be replaced with an API call later
      const results = JSON.parse(localStorage.getItem('testResults') || '[]');
      results.push(result);
      localStorage.setItem('testResults', JSON.stringify(results));

      toast({
        title: "Test submitted",
        description: "Your answers have been recorded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate to results page
      router.push(`/results/${courseId}/${testId}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Submission failed",
        description: "There was an error saving your test results",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  };

  // If test not found
  if (!testData) {
    return <div className="p-6 text-red-600">Test not found.</div>;
  }

  // Get current question
  const currentQuestion = testData.questions[currentQuestionIndex];
  const totalQuestions = testData.questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Timer and progress display */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-3 mb-4 border-b dark:border-gray-700 transition-colors duration-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{testData.title}</h2>
          <div className={`font-mono text-lg font-bold rounded-md px-3 py-1 ${
            timeRemaining < 60
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          }`}>
            Time: {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Question progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-200">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right transition-colors duration-200">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Current question */}
      <div className="mb-6 border dark:border-gray-700 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <p className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
          Q{currentQuestionIndex + 1}. {currentQuestion.question}
        </p>
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => (
            <label
              key={opt}
              className={`block p-3 border dark:border-gray-700 rounded-lg cursor-pointer transition-colors duration-200 ${
                answers[currentQuestion.id] === opt
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleOptionChange(currentQuestion.id, opt)}
                  className="mr-3 accent-blue-600 dark:accent-blue-400"
                />
                <span className="text-gray-800 dark:text-gray-200">{opt}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className={`px-4 py-2 border dark:border-gray-700 rounded transition-colors duration-200 ${
            isFirstQuestion
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {/* Question number buttons */}
          {testData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm transition-colors duration-200 ${
                index === currentQuestionIndex
                  ? "bg-blue-600 dark:bg-blue-700 text-white"
                  : answers[testData.questions[index].id]
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            Next
          </button>
        )}
      </div>

      {/* Submit button (always visible) */}
      {!isLastQuestion && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      )}
    </div>
  );
}
