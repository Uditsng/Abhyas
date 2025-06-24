'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Removed useSearchParams
import { Box, Heading, Text, Button, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, Card, CardBody, Stack, StackDivider, useToast, Spinner, Center, Badge } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { getTestResult } from '@/lib/testResultService';
import { getTestDetails } from '@/lib/tests';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.test; 
  const courseId = params.course;
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();

  const [result, setResult] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (authLoading) return;

      if (!testId || !courseId) {
        setLoading(false);
        toast({
          title: "Missing Information",
          description: "Test ID or Course ID is missing to view results.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
        return;
      }

      try {
        let fetchedResult = null;
        if (user) {
          fetchedResult = await getTestResult(user.uid, testId, courseId);
        } else {
          const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
          fetchedResult = existingResults.find(res => res.testId === testId && res.courseId === courseId);
          // Try fallback: if not found, check if testId matches result.id (for legacy/localStorage data)
          fetchedResult = existingResults.find(res => (res.testId === testId || res.id === testId) && (res.courseId === courseId || res.course === courseId));
        }

        if (fetchedResult) {
          setResult(fetchedResult);
          const details = await getTestDetails(courseId, testId);
          setTestDetails(details);
        } else {
          toast({
            title: "Result Not Found",
            description: "Could not find results for this test.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching test results:", error);
        toast({
          title: "Error",
          description: "Failed to load test results. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, courseId, user, authLoading, router, toast]);

  if (loading || !result || !testDetails) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading results...</Text>
      </Center>
    );
  }

  const totalQuestions = testDetails.questions.length;
  const correctAnswers = result.score;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);
  const timeTakenMinutes = Math.floor(result.durationTaken / 60);
  const timeTakenSeconds = result.durationTaken % 60;

  return (
    <Box p={4} maxW="900px" mx="auto" className="min-h-screen">
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
        <Link href={`/review/${testId}?courseId=${courseId}`}>
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
    </Box>
  );
}
