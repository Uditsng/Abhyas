'use client';

//test/[testId]page.jsx and review-page.jsx are for taking and reviewing tests.

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Progress,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Radio,
  RadioGroup,
  Tooltip,
  IconButton,
  useToast
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { testSeries } from '@/lib/tests';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveBookmark, removeBookmark } from '@/lib/bookmarkService';

export default function TestReviewPage() {
  // Get the testId from the URL and any query params
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId;
  const questionParam = searchParams.get('q');
  const toast = useToast();

  console.log("Review page params:", params);
  console.log("Test ID from params:", testId);

  // State variables
  const [testData, setTestData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});

  // Add user state
  const [user, authLoading] = useAuthState(auth);

  // Load test data and user answers
  useEffect(() => {
    console.log("Loading review for test ID:", testId);

    // Find the test data
    let foundTest = null;
    let foundCourseId = null;

    // Search through all test series to find the matching test
    Object.entries(testSeries).forEach(([courseId, series]) => {
      const found = series.find(test => test.id === testId);
      if (found) {
        foundTest = {...found};
        foundCourseId = courseId;
      }
    });

    if (!foundTest) {
      // Test not found, redirect to dashboard
      console.error(`Test not found: ${testId}`);
      toast({
        title: "Test not found",
        description: `Could not find test: ${testId}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
      return;
    }

    console.log("Found test:", foundTest.title, "in course:", foundCourseId);
    setTestData({...foundTest, courseId: foundCourseId});

    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        // Get user answers from localStorage
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        console.log("All test results:", results);

        // Find the specific test result by matching both testId and courseId if available
        const testResult = results.find(result => {
          // First try to match both testId and courseId
          if (result.courseId && foundCourseId) {
            return result.testId === testId && result.courseId === foundCourseId;
          }
          // Fall back to just matching testId
          return result.testId === testId;
        });

        if (testResult) {
          console.log("Found test result:", testResult);
          setUserAnswers(testResult.answers || {});
          setScore(testResult.score || 0);
        } else {
          console.warn("No test results found for test ID:", testId);
          toast({
            title: "No results found",
            description: "We couldn't find your results for this test",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error loading test results:", error);
        toast({
          title: "Error",
          description: "Failed to load test results",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    // Load bookmarked questions from localStorage - only on client side
    if (typeof window !== 'undefined') {
      try {
        const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
        if (storedBookmarks) {
          setBookmarkedQuestions(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    }

    // If a specific question is requested via URL, jump to it
    if (questionParam && foundTest) {
      const questionIndex = foundTest.questions.findIndex(q => q.id === questionParam);
      if (questionIndex !== -1) {
        setCurrentQuestionIndex(questionIndex);
      }
    }

    setLoading(false);
  }, [testId, questionParam, router, toast]);

  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle bookmarking questions
  const toggleBookmark = async (questionId) => {
    const bookmarkKey = `${testId}_${questionId}`;
    const newBookmarks = { ...bookmarkedQuestions };

    try {
      if (newBookmarks[bookmarkKey]) {
        // If already bookmarked, remove it
        if (user) {
          await removeBookmark(user.uid, bookmarkKey);
        } else {
          // Just use localStorage if not logged in
          delete newBookmarks[bookmarkKey];
          localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
        }

        // Update state
        delete newBookmarks[bookmarkKey];
        setBookmarkedQuestions(newBookmarks);

        toast({
          title: "Bookmark removed",
          description: "Question removed from bookmarks",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // If not bookmarked, add it with test info
        const bookmarkData = {
          testId: testId,
          courseId: testData.courseId,
          testTitle: testData.title,
          questionId: questionId,
          question: currentQuestion.question,
          date: new Date().toISOString(),
        };

        if (user) {
          await saveBookmark(user.uid, bookmarkKey, bookmarkData);
        } else {
          // Just use localStorage if not logged in
          newBookmarks[bookmarkKey] = bookmarkData;
          localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
        }

        // Update state
        newBookmarks[bookmarkKey] = bookmarkData;
        setBookmarkedQuestions(newBookmarks);

        toast({
          title: "Bookmarked!",
          description: "Question added to bookmarks",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Could not update bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // If still loading or test not found
  if (loading || !testData) {
    return (
      <Box p={8} maxW="800px" mx="auto">
        <Text>Loading test review...</Text>
      </Box>
    );
  }

  // Calculate percentage score
  const scorePercentage = Math.round((score / testData.questions.length) * 100);
  const currentQuestion = testData.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.answer;

  // Check if current question is bookmarked
  const bookmarkKey = `${testId}_${currentQuestion.id}`;
  const isBookmarked = bookmarkedQuestions[bookmarkKey] !== undefined;

  return (
    <Box p={4} maxW="800px" mx="auto" className="min-h-screen">
      <Heading size="lg" mb={4}>{testData.title} - Review</Heading>

      {/* Score summary */}
      <Card mb={6}>
        <CardBody>
          <Stack divider={<StackDivider />} spacing={4}>
            <Box>
              <Flex justify="space-between" align="center">
                <Heading size="md">Your Score: {score}/{testData.questions.length}</Heading>
                <Badge
                  colorScheme={scorePercentage >= 70 ? "green" : scorePercentage >= 40 ? "yellow" : "red"}
                  fontSize="lg"
                  py={1}
                  px={3}
                  borderRadius="full"
                >
                  {scorePercentage}%
                </Badge>
              </Flex>
              <Progress
                value={scorePercentage}
                colorScheme={scorePercentage >= 70 ? "green" : scorePercentage >= 40 ? "yellow" : "red"}
                mt={2}
                borderRadius="full"
                size="sm"
              />
            </Box>

            <Flex justify="space-between">
              <Text>Total Questions: {testData.questions.length}</Text>
              <Text>Correct Answers: {score}</Text>
              <Text>Wrong Answers: {testData.questions.length - score}</Text>
            </Flex>
          </Stack>
        </CardBody>
      </Card>

      {/* Question navigation */}
      <Flex justify="space-between" mb={4} align="center">
        <Button
          onClick={goToPrevQuestion}
          isDisabled={currentQuestionIndex === 0}
          colorScheme="blue"
          variant="outline"
          leftIcon={<ChevronLeftIcon />}
        >
          Previous
        </Button>

        <Text>Question {currentQuestionIndex + 1} of {testData.questions.length}</Text>

        <Button
          onClick={goToNextQuestion}
          isDisabled={currentQuestionIndex === testData.questions.length - 1}
          colorScheme="blue"
          variant="outline"
          rightIcon={<ChevronRightIcon />}
        >
          Next
        </Button>
      </Flex>


      {/* Question card */}
      <Card mb={6}>
        <CardBody>
          <Box mb={4}>
            <Flex align="center" justify="space-between" mb={2}>
              <Flex align="center">
                <Heading size="md" mr={2}>Question {currentQuestionIndex + 1}</Heading>
                {isCorrect ? (
                  <Badge colorScheme="green">Correct</Badge>
                ) : (
                  <Badge colorScheme="red">Incorrect</Badge>
                )}
              </Flex>

              {/* Bookmark button */}
              <IconButton
                icon={<StarIcon />}
                aria-label="Bookmark question"
                size="sm"
                colorScheme={isBookmarked ? "yellow" : "gray"}
                onClick={() => toggleBookmark(currentQuestion.id)}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
              />
            </Flex>
            <Text fontSize="lg">{currentQuestion.question}</Text>
          </Box>

          <RadioGroup value={userAnswer || ''}>
            <Stack spacing={3}>
              {currentQuestion.options.map((option, index) => (
                <Box
                  key={index}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={
                    option === currentQuestion.answer
                      ? 'green.300'
                      : option === userAnswer && option !== currentQuestion.answer
                        ? 'red.300'
                        : 'gray.200'
                  }
                  _dark={{
                    borderColor:
                      option === currentQuestion.answer
                        ? 'green.500'
                        : option === userAnswer && option !== currentQuestion.answer
                          ? 'red.500'
                          : 'gray.600',
                    bg:
                      option === currentQuestion.answer
                        ? 'green.900'
                        : option === userAnswer && option !== currentQuestion.answer
                          ? 'red.900'
                          : 'gray.700'
                  }}
                  bg={
                    option === currentQuestion.answer
                      ? 'green.50'
                      : option === userAnswer && option !== currentQuestion.answer
                        ? 'red.50'
                        : 'white'
                  }
                >
                  <Flex align="center">
                    <Radio
                      value={option}
                      isDisabled={true}
                      colorScheme={option === currentQuestion.answer ? 'green' : 'red'}
                    >
                      {option}
                    </Radio>

                    {option === currentQuestion.answer && (
                      <Tooltip label="Correct answer" placement="right">
                        <CheckCircleIcon ml={2} color="green.500" />
                      </Tooltip>
                    )}

                    {option === userAnswer && option !== currentQuestion.answer && (
                      <Tooltip label="Your answer (incorrect)" placement="right">
                        <WarningIcon ml={2} color="red.500" />
                      </Tooltip>
                    )}
                  </Flex>
                </Box>
              ))}
            </Stack>
          </RadioGroup>

          {/* Explanation section */}
          {currentQuestion.explanation && (
            <Box mt={6} p={4} bg="blue.50" _dark={{ bg: "blue.900" }} borderRadius="md">
              <Flex align="center" mb={2}>
                <InfoIcon mr={2} color="blue.500" _dark={{ color: "blue.300" }} />
                <Text fontWeight="bold">Explanation:</Text>
              </Flex>
              <Text>{currentQuestion.explanation}</Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Action buttons */}
      <Flex justify="space-between" mt={6}>
        <Link href={`/results/${testId}`}>
          <Button colorScheme="gray">Back to Results</Button>
        </Link>

        <Link href="/dashboard">
          <Button colorScheme="blue">Go to Dashboard</Button>
        </Link>
      </Flex>
    </Box>
  );
}





