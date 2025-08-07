"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Text,
  Button,
  useToast,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestDetails } from "@/lib/adminTestsService";
import { saveTestResult } from "@/lib/testResultService";
import { useAuth } from "@/components/AuthContext";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId;
  const toast = useToast();
  const { user } = useAuth();

  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markedForReview, setMarkedForReview] = useState({});
  const [showPalette, setShowPalette] = useState(false); // For mobile palette toggle
  const { isOpen, onOpen, onClose } = useDisclosure(); // For leave modal
  const {
    isOpen: isSubmitModalOpen,
    onOpen: onSubmitOpen,
    onClose: onSubmitClose,
  } = useDisclosure(); // For submit modal
  const [isTestSubmitted, setIsTestSubmitted] = useState(false); // NEW: flag for submission
  const nextRouteRef = useRef(null); // NEW: store next route for modal

  //Fisher-Yates algorithm to shuffle the questions
  function shuffleArray(array) {
    const arr = array.slice(); // Copy array
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // SAFER: Only intercept browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isTestSubmitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTestSubmitted]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (!isTestSubmitted) {
        e.preventDefault?.();
        nextRouteRef.current = "/dashboard"; // default fallback
        onOpen();
        window.history.pushState(null, "", window.location.href); // Prevent back
      }
    };
    window.history.pushState(null, "", window.location.href); // Trap back
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isTestSubmitted, onOpen]);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setLoading(false);
        toast({
          title: "Missing Test ID",
          description: "Test ID is required to load this test.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push("/dashboard");
        return;
      }

      try {
        const fetchedData = await getTestDetails(testId); // Only use testId

        if (fetchedData) {
          const shuffledQuestions = shuffleArray(fetchedData.questions || []);
          setTestData({ ...fetchedData, questions: shuffledQuestions });
          setTimeLeft(fetchedData.duration * 60);
        } else {
          toast({
            title: "Test not found",
            description: `Could not find test with ID: ${testId}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
        toast({
          title: "Error loading test",
          description: "Failed to load test data. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, router, toast]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || !testData) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testData]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && testData && !submitting) {
      handleSubmitTest();
    }
  }, [timeLeft, testData, submitting]);

  const handleAnswerChange = (questionId, selectedOption) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedOption,
    }));
    // If answered, unmark for review
    setMarkedForReview((prev) => ({ ...prev, [questionId]: false }));
  };

  // Mark for review toggle
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

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
    setShowPalette(false); // Hide palette on mobile after selection
  };

  const calculateScore = useCallback(() => {
    let correctCount = 0;
    testData.questions.forEach((question) => {
      const correctAnswerString = question.options[question.correctAnswer];
      if (userAnswers[question.id] === correctAnswerString) {
        correctCount++;
      }
    });
    return correctCount;
  }, [testData, userAnswers]);

  // NEW: Effect to handle navigation after successful submission
  useEffect(() => {
    if (isTestSubmitted) {
      router.push(`/results/${testId}`);
    }
  }, [isTestSubmitted, router, testId]);

  const handleSubmitTest = async () => {
    setSubmitting(true);
    const score = calculateScore();
    const totalQuestions = testData.questions.length;
    const result = {
      testId: testId, // Use from params
      title: testData.title || "Untitled Test",
      score: score,
      totalQuestions: totalQuestions,
      answers: userAnswers,
      durationTaken: testData.duration * 60 - timeLeft, // Time taken in seconds
      date: new Date().toISOString(),
    };

    try {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to submit your test and view results.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        router.push("/auth/login");
        return;
      }
      console.log("[DEBUG] Saving test result:", { userId: user.uid, result });
      await saveTestResult(user.uid, result);
      console.log(
        "[DEBUG] Test result saved for user:",
        user.uid,
        "testId:",
        testId
      );
      toast({
        title: "Test Submitted",
        description: `You scored ${score} out of ${totalQuestions}!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push(`/results/${testId}`);
      setIsTestSubmitted(true); // Allow navigation
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your test. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onSubmitClose(); // Close submit modal
    }
  };

  // Modal: on confirm, allow navigation
  const handleConfirmLeave = () => {
    setIsTestSubmitted(true);
    onClose();
    if (nextRouteRef.current) {
      router.push(nextRouteRef.current);
    } else {
      router.push("/dashboard");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Responsive timer color
  const timerColor =
    timeLeft < 60 ? "red.500" : timeLeft < 180 ? "orange.400" : "green.500";

  // Auth redirect and loading state
  if (loading || !testData) {
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" />
        <Text ml={4}>Loading test...</Text>
      </Center>
    );
  }
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="gray.500">
          No questions found for this test.
        </Text>
      </Center>
    );
  }
  const progress =
    ((currentQuestionIndex + 1) / testData.questions.length) * 100;

  // Helper for palette button color classes
  function getQuestionStatusClass(question) {
    const isAnswered = userAnswers[question.id] !== undefined;
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
  }

  return (
    <Box p={6}>
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        {/* Main content */}
        <div className="lg:flex gap-8">
          <div className="lg:flex-1 w-full max-w-3xl mx-auto">
            {/* Timer and progress display */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-3 mb-4 border-b dark:border-gray-700 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {testData.testName}
                </h2>
                <div
                  className={`font-mono text-lg font-bold rounded-md px-2 py-1 ${
                    timeLeft < 60
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  Time: {formatTime(timeLeft)}
                </div>
                {/* Hamburger button - only visible on mobile */}
                <button
                  onClick={() => setShowPalette(!showPalette)}
                  className="lg:hidden p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <span className="sr-only">Toggle question palette</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile question palette - visible only when toggled */}
            {showPalette && (
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
                          setShowPalette(false); // Close palette after selection
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

            <AnimatePresence mode="wait">
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
                  {currentQuestion.options.map((opt, idx) => (
                    <label
                      key={`${currentQuestion.id}-${idx}`}
                      className={`block p-3 border dark:border-gray-700 rounded-lg cursor-pointer transition-colors duration-200 ${
                        userAnswers[currentQuestion.id] === opt
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={opt}
                          checked={userAnswers[currentQuestion.id] === opt}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, opt)
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
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 border dark:border-gray-700 rounded transition-colors duration-200 ${
                  currentQuestionIndex === 0
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
                disabled={
                  currentQuestionIndex === testData.questions.length - 1
                }
                className={`px-4 py-2 rounded transition-colors duration-200
                ${
                  currentQuestionIndex === testData.questions.length - 1
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                }
              `}
              >
                Next
              </button>
            </div>

            {/* Submit button */}
            <div className="bottom-4 left-4 right-4 z-50 text-center mb-6">
              <button
                onClick={onSubmitOpen}
                disabled={submitting}
                className={`px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 ${
                  submitting
                    ? "opacity-70 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Test"}
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
                           ${getQuestionStatusClass(
                             question
                           )} hover:ring-2 hover:ring-offset-1 focus:ring-2 focus:ring-blue-400`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Leave Test?</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to leave? Your progress will be lost.
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleConfirmLeave}>
                Leave
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Submit Confirmation Modal */}
        <Modal isOpen={isSubmitModalOpen} onClose={onSubmitClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Submission</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Are you sure you want to submit the test?</ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onSubmitClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                ml={3}
                onClick={handleSubmitTest}
                isLoading={submitting}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Box>
  );
}
