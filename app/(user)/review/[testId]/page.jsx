'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import {Box,Heading,Text,Badge,Button,Flex,Progress,Card,CardBody,Stack,StackDivider,Radio,RadioGroup,Tooltip,IconButton,useToast,Spinner,Center} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getTestDetails } from '@/lib/tests';
import { useAuth } from '@/components/AuthContext';
import { saveBookmark, removeBookmark } from '@/lib/bookmarkService';

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId;
  const courseId = searchParams.get('courseId'); 
  const questionParam = searchParams.get('q');
  const toast = useToast();
  const { user } = useAuth();

  const [testData, setTestData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});

  // Load test data and user answers
  useEffect(() => {
    const fetchAndLoadData = async () => {
      setLoading(true);
      if (!testId || !courseId) { // Ensure courseId is available
        setLoading(false);
        if (!courseId) {
          toast({
            title: "Missing Course ID",
            description: "Course ID is required to review this test.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push('/dashboard'); // Redirect if courseId is missing
        }
        return;
      }

      try {
        const fetchedData = await getTestDetails(courseId, testId); // Use courseId here

        if (fetchedData) {
          setTestData(fetchedData);

          // Only access localStorage on the client side
          if (typeof window !== 'undefined') {
            try {
              const results = JSON.parse(localStorage.getItem('testResults') || '[]');
              // Filter results by both testId and courseId
              const testResult = results.find(result => result.testId === testId && result.courseId === courseId);

              if (testResult) {
                setUserAnswers(testResult.answers || {});
                setScore(testResult.score || 0);
              } else {
                toast({
                  title: "No results found",
                  description: "We couldn't find your results for this test",
                  status: "warning",
                  duration: 3000,
                  isClosable: true,
                });
              }

              const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
              if (storedBookmarks) {
                setBookmarkedQuestions(JSON.parse(storedBookmarks));
              }
            } catch (error) {
              console.error("Error loading local data:", error);
            }
          }

          // If a specific question is requested via URL, jump to it
          if (questionParam) {
            const questionIndex = fetchedData.questions.findIndex(q => q.id === questionParam);
            if (questionIndex !== -1) {
              setCurrentQuestionIndex(questionIndex);
            }
          }
        } else {
          toast({
            title: "Test not found",
            description: `Could not find test: ${testId} in course ${courseId}`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching test data for review:", error);
        toast({
          title: "Error",
          description: "Failed to load test data for review",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAndLoadData();
  }, [testId, courseId, questionParam, router, toast]); // Add courseId to dependency array

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
    const bookmarkKey = `${testData.id}_${questionId}`;
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
          testId: testData.id,
          courseId: testData.courseId,
          testTitle: testData.title,
          questionId: questionId,
          question: testData.questions[currentQuestionIndex].question,
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
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading test review...</Text>
      </Center>
    );
  }

  // Calculate percentage score
  const scorePercentage = Math.round((score / testData.questions.length) * 100);
  const currentQuestion = testData.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.answer;

  // Check if current question is bookmarked
  const bookmarkKey = `${testData.id}_${currentQuestion.id}`;
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
        <Link href={`/results/${testData.courseId}/${testData.id}`}>
          <Button colorScheme="gray">Back to Results</Button>
        </Link>

        <Link href="/dashboard">
          <Button colorScheme="blue">Go to Dashboard</Button>
        </Link>
      </Flex>
    </Box>
  );
}
