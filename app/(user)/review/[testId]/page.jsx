'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import {Box,Heading,Text,Badge,Button,Flex,Progress,Card,CardBody,Stack,StackDivider,Radio,RadioGroup,Tooltip,IconButton,useToast,Spinner,Center} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getTestDetails } from '@/lib/adminTestsService';
import { useAuth } from '@/components/AuthContext';
import { saveBookmark, removeBookmark } from '@/lib/bookmarkService';
import { getTestResult } from '@/lib/testResultService';

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId;
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
      if (!testId) {
        setLoading(false);
        return;
      }

      try {
        const fetchedData = await getTestDetails(testId);

        if (fetchedData) {
          setTestData(fetchedData);

          let answers = {};
          let score = 0;
          if (user) {
            try {
              const result = await getTestResult(user.uid, testId);
              if (result) {
                answers = result.answers || {};
                score = result.score || 0;
              }
            } catch (e) {
              // fallback to localStorage
            }
          }
          
          if (!user || Object.keys(answers).length === 0) {
            if (typeof window !== 'undefined') {
              try {
                const results = JSON.parse(localStorage.getItem('testResults') || '[]');
                const testResult = results.find(result => result.testId === testId);
                if (testResult) {
                  answers = testResult.answers || {};
                  score = testResult.score || 0;
                }
              } catch (error) {
                console.error("Error loading local data:", error);
              }
            }
          }
          setUserAnswers(answers);
          setScore(score);

          if (typeof window !== 'undefined') {
            const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
            if (storedBookmarks) {
              setBookmarkedQuestions(JSON.parse(storedBookmarks));
            }
          }

          if (questionParam) {
            const questionIndex = fetchedData.questions.findIndex(q => q.id === questionParam);
            if (questionIndex !== -1) {
              setCurrentQuestionIndex(questionIndex);
            }
          }
        } else {
          toast({
            title: "Test not found",
            description: `Could not find test: ${testId}`,
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
  }, [testId, questionParam, router, toast, user]);

  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (testData && currentQuestionIndex < testData.questions.length - 1) {
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
        }
        delete newBookmarks[bookmarkKey];
        localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
        setBookmarkedQuestions(newBookmarks);

        toast({
          title: "Bookmark removed",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // If not bookmarked, add it
        const currentQuestion = testData.questions.find(q => q.id === questionId);
        const bookmarkData = {
          testId: testData.id,
          // ✅ **THE FIX IS HERE**: Changed testData.title to testData.testName
          testTitle: testData.testName || testData.title || "Untitled Test",
          courseId: testData.category || testData.subject || "general",
          questionId: questionId,
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
          explanation: currentQuestion.explanation || "No explanation provided.",
          date: new Date().toISOString(),
        };

        if (user) {
          await saveBookmark(user.uid, bookmarkKey, bookmarkData);
        }
        
        newBookmarks[bookmarkKey] = bookmarkData;
        localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
        setBookmarkedQuestions(newBookmarks);

        toast({
          title: "Bookmarked!",
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

  if (loading || !testData) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading test review...</Text>
      </Center>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];
  const correctAnswerString = currentQuestion.options[currentQuestion.correctAnswer];
  const isCorrect = userAnswer === correctAnswerString;
  const bookmarkKey = `${testData.id}_${currentQuestion.id}`;
  const isBookmarked = bookmarkedQuestions[bookmarkKey] !== undefined;

  return (
    <Box px={4} py={24} maxW="800px" mx="auto" className="min-h-screen">
      <Heading size="lg" mb={4}>{testData.testName || testData.title} Review</Heading>

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
              {currentQuestion.options.map((option, index) => {
                const isOptionCorrect = option === correctAnswerString;
                const isUserSelected = option === userAnswer;
                return (
                  <Box
                    key={index}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={
                      isOptionCorrect ? 'green.300' : isUserSelected ? 'red.300' : 'gray.200'
                    }
                    _dark={{
                      borderColor: isOptionCorrect ? 'green.500' : isUserSelected ? 'red.500' : 'gray.600',
                      bg: isOptionCorrect ? 'green.900' : isUserSelected ? 'red.900' : 'gray.700'
                    }}
                    bg={
                      isOptionCorrect ? 'green.50' : isUserSelected ? 'red.50' : 'white'
                    }
                  >
                    <Flex align="center">
                      <Radio
                        value={option}
                        isDisabled={true}
                        colorScheme={isOptionCorrect ? 'green' : 'red'}
                      >
                        {option}
                      </Radio>
                      {isOptionCorrect && (
                        <Tooltip label="Correct answer" placement="right">
                          <CheckCircleIcon ml={2} color="green.500" />
                        </Tooltip>
                      )}
                      {isUserSelected && !isOptionCorrect && (
                        <Tooltip label="Your answer (incorrect)" placement="right">
                          <WarningIcon ml={2} color="red.500" />
                        </Tooltip>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </RadioGroup>

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

      <Flex justify="space-between" mt={6}>
        <Link href={`/results/${testData.id}`}>
          <Button colorScheme="gray">Back to Results</Button>
        </Link>
        <Link href="/dashboard">
          <Button colorScheme="blue">Go to Dashboard</Button>
        </Link>
      </Flex>
    </Box>
  );
}
