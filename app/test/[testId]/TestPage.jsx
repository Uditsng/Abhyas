'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Flex, Text, Progress, Badge, useToast } from '@chakra-ui/react';
import { testSeries } from '@/lib/tests';
import './test-page.css';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { testId } = params;

  // State variables
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  // Load test data
  useEffect(() => {
    // Find the test data
    let foundTest = null;
    let foundCourseId = null;

    // Search through all test series to find the matching test
    Object.entries(testSeries).forEach(([courseId, series]) => {
      const found = series.find(test => test.id === testId);
      if (found) {
        foundTest = found;
        foundCourseId = courseId;
      }
    });

    if (!foundTest) {
      // Test not found, redirect to dashboard
      router.push('/dashboard');
      return;
    }

    setTestData({...foundTest, courseId: foundCourseId});
    setTimeRemaining(foundTest.duration * 60); // Convert minutes to seconds

    // Initialize arrays for selected options and marked for review
    setSelectedOptions(Array(foundTest.questions.length).fill(null));
    setMarkedForReview(Array(foundTest.questions.length).fill(false));

    setLoading(false);
  }, [testId, router]);

  // Timer countdown effect
  useEffect(() => {
    if (!testData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testData, timeRemaining]);





  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  // Navigation functions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Mark question for review
  const handleMarkForReview = () => {
    const newMarkedForReview = [...markedForReview];
    newMarkedForReview[currentQuestionIndex] = !newMarkedForReview[currentQuestionIndex];
    setMarkedForReview(newMarkedForReview);
  };

  // Get class for question status in palette
  const getQuestionStatusClass = (index) => {
    if (selectedOptions[index] !== null && markedForReview[index]) {
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700';
    } else if (selectedOptions[index] !== null) {
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700';
    } else if (markedForReview[index]) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600';
    }
  };

  // Submit test
  const handleSubmitTest = () => {
    // Calculate score
    let score = 0;
    testData.questions.forEach((question, index) => {
      const selectedOption = selectedOptions[index];
      if (selectedOption !== null && question.options[selectedOption] === question.answer) {
        score++;
      }
    });

    // Create result object
    const result = {
      testId: testData.id,
      courseId: testData.courseId,
      score,
      totalQuestions: testData.questions.length,
      answers: testData.questions.reduce((acc, question, index) => {
        if (selectedOptions[index] !== null) {
          acc[question.id] = question.options[selectedOptions[index]];
        }
        return acc;
      }, {}),
      date: new Date().toISOString(),
    };

    // Save result to localStorage
    const results = JSON.parse(localStorage.getItem('testResults') || '[]');
    results.push(result);
    localStorage.setItem('testResults', JSON.stringify(results));

    // Show success message
    toast({
      title: 'Test submitted',
      description: `Your score: ${score}/${testData.questions.length}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Navigate to results page
    router.push(`/results/${testData.courseId}/${testData.id}`);
  };

  // Add navigation prevention
  useEffect(() => {
    // Block navigation using the browser's history API
    const blockNavigation = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Handle browser back/forward buttons
    const preventBackButton = (e) => {
      // Show confirmation dialog
      if (window.confirm("You have unsaved test progress. Are you sure you want to leave?")) {
        // If confirmed, submit the test
        handleSubmitTest();
      } else {
        // If not confirmed, stay on the page by pushing a new state
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Push state on initial load to ensure history has an entry
    window.history.pushState(null, "", window.location.href);

    // Add event listeners
    window.addEventListener('beforeunload', blockNavigation);
    window.addEventListener('popstate', preventBackButton);

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', blockNavigation);
      window.removeEventListener('popstate', preventBackButton);
    };
  }, [handleSubmitTest]);

  // If still loading or test not found
  if (loading || !testData) {
    return (
      <Box p={8} maxW="800px" mx="auto">
        <Text>Loading test...</Text>
      </Box>
    );
  }

  // Get current question
  const currentQuestion = testData.questions[currentQuestionIndex];

  // Calculate test statistics
  const totalQuestions = testData.questions.length;
  const answeredQuestions = selectedOptions.filter(option => option !== null).length;
  const remainingQuestions = totalQuestions - answeredQuestions;
  const markedQuestions = markedForReview.filter(marked => marked).length;

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar with test statistics - hidden on mobile */}
      <div className="hidden md:block w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mr-4 h-fit sticky top-4 transition-colors duration-200">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Test Progress</h3>

          {/* Timer */}
          <div className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-sm font-medium text-center">
            Time: {formatTime(timeRemaining)}
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
            </div>
            <Progress
              value={(answeredQuestions / totalQuestions) * 100}
              size="sm"
              colorScheme="blue"
              borderRadius="md"
            />
          </div>

          {/* Statistics */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Total Questions</span>
              <Badge colorScheme="blue">{totalQuestions}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Answered</span>
              <Badge colorScheme="green">{answeredQuestions}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Remaining</span>
              <Badge colorScheme="red">{remainingQuestions}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Marked for Review</span>
              <Badge colorScheme="yellow">{markedQuestions}</Badge>
            </div>
          </div>
        </div>

        {/* Question palette */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Question Palette</h3>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-sm mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">Answered</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">Not Visited</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-sm mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">Marked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 rounded-sm mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">Answered & Marked</span>
            </div>
          </div>

          {/* Question buttons */}
          <div className="grid grid-cols-4 gap-2">
            {testData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                           ${getQuestionStatusClass(index)}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Mobile statistics bar */}
        <div className="md:hidden bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4 transition-colors duration-200">
          <div className="flex justify-between items-center mb-2">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm font-medium">
              Time: {formatTime(timeRemaining)}
            </div>
            <div className="flex space-x-2">
              <Badge colorScheme="green">{answeredQuestions} Answered</Badge>
              <Badge colorScheme="red">{remainingQuestions} Left</Badge>
            </div>
          </div>
          <Progress
            value={(answeredQuestions / totalQuestions) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="md"
          />
        </div>

        {/* Test header with responsive design */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{testData.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{testData.description}</p>
          </div>
        </div>

        {/* Question card with dark mode support */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {testData.questions.length}
            </span>

            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currentQuestion.marks || 1} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-medium mb-4 text-gray-900 dark:text-gray-100">
            {currentQuestion.question}
          </h2>

          {/* Options with better mobile support */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors duration-200
                           ${selectedOptions[currentQuestionIndex] === index
                             ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400'
                             : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <div className={`w-5 h-5 border rounded-full flex items-center justify-center
                                    ${selectedOptions[currentQuestionIndex] === index
                                      ? 'border-blue-500 dark:border-blue-400'
                                      : 'border-gray-400 dark:border-gray-500'}`}>
                      {selectedOptions[currentQuestionIndex] === index && (
                        <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <span className={`text-base ${selectedOptions[currentQuestionIndex] === index
                                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                                      : 'text-gray-700 dark:text-gray-300'}`}>
                      {option}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons with better mobile layout */}
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleMarkForReview}
              className={`btn-secondary ${markedForReview[currentQuestionIndex] ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : ''}`}
            >
              {markedForReview[currentQuestionIndex] ? 'Marked for Review' : 'Mark for Review'}
            </button>

            {currentQuestionIndex < testData.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Mobile question palette toggle */}
        <div className="md:hidden mt-6">
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md flex items-center justify-center"
          >
            {showMobilePalette ? 'Hide Question Palette' : 'Show Question Palette'}
          </button>

          {showMobilePalette && (
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Not Visited</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Marked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 rounded-sm mr-1"></div>
                  <span className="text-gray-600 dark:text-gray-400">Answered & Marked</span>
                </div>
              </div>

              {/* Question buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {testData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setShowMobilePalette(false);
                    }}
                    className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                               ${getQuestionStatusClass(index)}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
