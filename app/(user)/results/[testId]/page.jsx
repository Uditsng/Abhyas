'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading, Text, Button, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, Card, CardBody, Stack, StackDivider, useToast, Spinner, Center, Badge } from '@chakra-ui/react';
import { CheckCircleIcon} from '@chakra-ui/icons';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { getTestResult } from '@/lib/testResultService';
import { getTestDetails } from '@/lib/tests';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId;
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();

  const [result, setResult] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (authLoading) return;

      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to view your test results.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        router.push('/auth/login');
        return;
      }

      if (!testId) {
        setLoading(false);
        toast({
          title: "Missing Information",
          description: "Test ID is missing to view results.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
        return;
      }

      let fetchedResult = null;
      let attempts = 0;
      while (attempts < 5 && !fetchedResult) {
        try {
          console.log('[DEBUG] Fetching test result:', { userId: user.uid, testId });
          fetchedResult = await getTestResult(user.uid, testId);
          console.log('[DEBUG] Fetched result:', fetchedResult);
          if (fetchedResult) break;
          // Wait 400ms before retrying
          await new Promise(res => setTimeout(res, 400));
        } catch (error) {
          // Only show error after all retries
          if (attempts === 4) {
            console.error("Error fetching test results:", error);
            toast({
              title: "Error",
              description: "Failed to load test results. Please try again later.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            router.push('/dashboard');
          }
        }
        attempts++;
      }
  
      if (fetchedResult) {
        setResult(fetchedResult);
        const details = await getTestDetails(testId);
        setTestDetails(details);
      } else if (attempts === 5) {
        toast({
          title: "Result Not Found",
          description: "Could not find results for this test.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
      }
      setLoading(false);
    };
  
    fetchResults();
  }, [testId, user, authLoading, router, toast]);
  if (loading || !result || !testDetails) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading results...</Text>
      </Center>
    );
  }

  if (!result || !testDetails){
    return null
  }

  const totalQuestions = testDetails.questions.length;
  const correctAnswers = result.score;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);
  const duration = Number(result?.durationTaken) || 0;
  const timeTakenMinutes = Math.floor(duration / 60);
  const timeTakenSeconds = duration % 60;

  return (
    <Box p={6}>
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        <Heading as="h1" size="xl" mb={6} textAlign="center">
          Results for {testDetails.title}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Overall Performance
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    You completed the test with a score of{' '}
                    <Text as="span" fontWeight="bold" color="blue.500">
                      {correctAnswers} out of {totalQuestions}
                    </Text>{' '}
                    questions correct.
                  </Text>
                </Box>
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Score Percentage
                  </Heading>
                  <Stat>
                    <StatNumber fontSize="2xl">{percentage}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type={percentage >= 50 ? 'increase' : 'decrease'} />
                      {percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                    </StatHelpText>
                  </Stat>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Detailed Breakdown
                  </Heading>
                  <SimpleGrid columns={2} spacing={4} pt="2">
                    <Stat>
                      <StatLabel>Correct</StatLabel>
                      <StatNumber color="green.500">{correctAnswers}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Incorrect</StatLabel>
                      <StatNumber color="red.500">{wrongAnswers}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Attempted</StatLabel>
                      <StatNumber>{result.totalQuestions}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Time Taken</StatLabel>
                      <StatNumber>{timeTakenMinutes}m {timeTakenSeconds}s</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Flex justify="center" gap={4} mt={8}>
          <Link href={`/review/${testId}`}>
            <Button colorScheme="blue" size="lg" leftIcon={<CheckCircleIcon />}>
              Review Answers
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button colorScheme="gray" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </Flex>
      </div>
    </Box>
  );
}
