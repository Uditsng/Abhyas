"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Button, Spinner, Text, Card, CardBody, Stack } from "@chakra-ui/react";
import { getAllBundles } from "@/lib/bundleService";
import { getTestDetails } from "@/lib/tests";

export default function BundleDetailsPage() {
  const params = useParams();
  const bundleId = params.bundleId;
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBundle() {
      const bundles = await getAllBundles();
      const found = bundles.find((b) => b.id === bundleId);
      setBundle(found);
      setLoading(false);
    }
    fetchBundle();
  }, [bundleId]);

  if (loading) return <Spinner mt={10} />;
  if (!bundle) return <Text mt={10}>Bundle not found.</Text>;

  return (
    <Box maxW="900px" mx="auto" mb={32} py={8} px={8}>
      <Heading mb={2} mt={16}>{bundle.title}</Heading>
      <Card mb={4} bg="gray.50" _dark={{ bg: "gray.800" }}>
      </Card>
      {(!bundle.testIds || bundle.testIds.length === 0) ? (
        <Text color="gray.500">No tests found in this bundle.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {bundle.testIds.map((testId) => (
            <TestCard testId={testId} key={testId} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );

  // Helper component to fetch and show test name
  function TestCard({ testId }) {
    const [test, setTest] = useState(null);
    useEffect(() => {
      async function fetchTest() {
        try {
          const t = await getTestDetails(testId);
          setTest(t);
        } catch (e) {
          setTest(null);
        }
      }
      fetchTest();
    }, [testId]);
    return (
      <Card>
        <CardBody>
          <Stack spacing={2}>
            <Text fontWeight="bold">
              {test ? test.testName : testId}
              {test && test.questions ? <span style={{ marginLeft: 60, fontWeight: 400, color: '#666' }}>{`ques: ${test.questions.length}`}</span> : ''}
            </Text>
            <Button colorScheme="blue" onClick={() => router.push(`/test/${testId}`)}>
              Start Test
            </Button>
          </Stack>
        </CardBody>
      </Card>
    );
  }
}
