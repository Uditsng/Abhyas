"use client";

// app/tests/[course]/[test]/page.jsx  handle test listings and individual test pages.

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@chakra-ui/react";
import { saveTestResult } from "@/lib/testResultService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { motion, AnimatePresence } from "framer-motion";
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Box } from "@chakra-ui/react";

export default function TakeTestPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthRedirect();
  const params = useParams();
  const toast = useToast();
  const [user] = useAuthState(auth);
  const courseId = params.course;
  const testId = params.test;

  // State for answers and submission
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted , setIsSubmitted] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  // Question navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Marked for review state
  const [markedForReview, setMarkedForReview] = useState({});

  // Mobile palette visibility
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  // Test data and loading state
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    async function fetchTest() {
      try {
        const data = await getTestDetails(testId);
        if (data) {
          setTestData(data);
        } else {
          toast({
            title: "Test not found",
            description: "The requested test could not be found.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        toast({
          title: "Error",
          description: "Failed to load test data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [testId, toast]);

  // Timer for Tests
  useEffect(() => {
    if (testData) {
      // Convert minutes to seconds
      setTimeRemaining(testData.duration * 60);
      setTimerStarted(true);
    }
  }, [testData]);

  // Define handleSubmit function

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsConfirmOpen(false);

    setIsSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      testData.questions.forEach((question) => {
        if (answers[question.id] === question.answer) {
          score++;
        }
      });

      // Create result object
      const result = {
        testId: testId,
        courseId: courseId,
        answers,
        score,
        totalQuestions: testData.questions.length,
        date: new Date().toISOString(),
      };

      console.log('Submitting result:', result);

      // Store in Firebase if logged in
      if (user) {
        await saveTestResult(user.uid, result);
      } else {
        // Fallback to localStorage for non-logged in users
        const results = JSON.parse(localStorage.getItem("testResults") || "[]");

        // Remove any existing result for this test to avoid duplicates
        const filteredResults = results.filter(
          (r) => !(r.testId === testId && r.courseId === courseId)
        );

        filteredResults.push(result);
        localStorage.setItem("testResults", JSON.stringify(filteredResults));
      }

      // Set test as submitted to disable navigation prevention
      setIsSubmitted(true);

      toast({
        title: "Test submitted",
        description: "Your answers have been recorded",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setTimeout(() => {
        // Use window.location for a full page navigation which avoids React hydration issues
        window.location.href = `/results/${courseId}/${testId}`;
      }, 1000);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  }, [isSubmitting, testData, answers, courseId, testId, user, toast]);

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
  }, [timerStarted, timeRemaining, handleSubmit]);

  // Add navigation prevention
  useEffect(() => {

    //beforeunload event to warn about leaving the page
    const handleBeforeUnload = (e) => {

      // Skip navigation prevention if already submitting or submitted
      if (isSubmitting || isSubmitted) return;
      e.preventDefault();
      //ToDo: add styling
      e.returnValue = " ";
      //Auto-submit in background
      handleSubmit()
      return e.returnValue;
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSubmitting, isSubmitted, handleSubmit]);

  // Prevent back button navigation
useEffect(() => {
  if (isSubmitting || isSubmitted) return;

  const handlePopState = () => {
    const confirmLeave = window.confirm(
     "Submit before leaving..."
    );
    if (!confirmLeave) {
      // Push the current state again to stay on page
      window.history.pushState(null, "", window.location.href);
    } else {
      handleSubmit(); // Auto-submit
    }
  };

  // Push initial state so back button triggers popstate
  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [isSubmitting, isSubmitted, handleSubmit]);


  // Show loading spinner if auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  if (loading) return <div>Loading...</div>;
  if (!testData) return <div className="p-6 text-red-600">Test not found.</div>;

  // Get current question and helpers (declare only once)
  const currentQuestion = testData.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const getQuestionStatusClass = (question) => {
  const isAnswered = answers[question.id] !== undefined;
  const isMarked = markedForReview[question.id] === true;
    if (isAnswered && isMarked) {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700";
    } else if (isAnswered) {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700";
    } else if (isMarked) {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700";
    } else {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800/40";
    }
  };

  // Format time as MM:SS
const formatTime = (seconds) => {
  if (typeof seconds !== "number" || isNaN(seconds)) {
    return "00:00"; // fallback if seconds is invalid
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
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
    setCurrentQuestionIndex(index);
  };

  // Handle marking questions for review
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <Box p={6}>
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        {/* Main content */}
        <div className='lg:flex gap-8'>
        <div className="lg:flex-1 w-full max-w-3xl mx-auto">
          {/* Timer and progress display */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-3 mb-4 border-b dark:border-gray-700 transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {testData.title}
              </h2>
              <div
                className={`font-mono text-lg font-bold rounded-md px-3 py-1 ${
                  timeRemaining < 60
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                }`}
              >
                Time: {!timerStarted ? 'Loading...' : formatTime(timeRemaining)}
              </div>

              {/* Hamburger button - only visible on mobile */}
              <button
                onClick={() => setShowMobilePalette(!showMobilePalette)}
                className="lg:hidden p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="sr-only">Toggle question palette</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile question palette - visible only when toggled */}
          {showMobilePalette && (
          <div className="lg:hidden mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md transition-colors duration-200">
            {/* Question palette */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                Question Palette
              </h3>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Answered
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Not Answered
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Marked
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Answered & Marked
                  </span>
                </div>
              </div>

              {/* Question buttons */}
              <div className="grid grid-cols-12 gap-1">
                {testData.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      goToQuestion(index);
                      setShowMobilePalette(false); // Close palette after selection
                    }}
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                           ${getQuestionStatusClass(question)}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}
         
        <AnimatePresence mode='wait'> 
          <motion.div 
           key={currentQuestion.id}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
           className="mb-6 border dark:border-gray-700 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200"
          >
        <p className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">
              Q{currentQuestionIndex + 1}. {currentQuestion.question}
            </p>
            <div className="space-y-3">
              {currentQuestion.options.map((opt,idx) => (
                <label
                  key={`${currentQuestion.id}-${idx}`}
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
                      onChange={() =>
                        handleOptionChange(currentQuestion.id, opt)
                      }
                      className="mr-3 accent-blue-600 dark:accent-blue-400"
                    />
                    <span className="text-gray-800 dark:text-gray-200">
                      {opt}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

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

            {/* Mark for review button */}
            <button
              onClick={() => toggleMarkForReview(currentQuestion.id)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                         ${
                           markedForReview[currentQuestion.id]
                             ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                             : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                         }`}
            >
              {markedForReview[currentQuestion.id]
                ? "Unmark for Review"
                : "Mark for Review"}
            </button>

            <button
              onClick={goToNextQuestion}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
            >
              Next
            </button>
          </div>

          {/* Submit button */}
          <div className="bottom-4 left-4 right-4 z-50 text-center mb-6">
            <button
              onClick={() => setIsConfirmOpen(true)}
              disabled={isSubmitting}
              className={`px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        {/* Sidebar with test statistics - visible only on desktop */}
        <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-fit sticky top-4 transition-colors duration-200">
          <div className="mb-6">

            {/* Question palette */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                Question Palette
              </h3>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Answered
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Not Answered
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Marked
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Answered & Marked
                  </span>
                </div>
              </div>

              {/* Question buttons */}
              <div className="grid grid-cols-8 gap-2">
                {testData.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                           ${getQuestionStatusClass(question)} hover:ring-2 hover:ring-offset-1 focus:ring-2 focus:ring-blue-400`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Confirmation dialog */}
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Submit Test?</AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to submit this test?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="green" onClick={handleSubmit} ml={3} isLoading={isSubmitting}>
                  Submit
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </div>
    </Box>
  );
}
