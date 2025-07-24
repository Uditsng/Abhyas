"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Spinner, Text, Container } from "@chakra-ui/react";
import { getAllBundles } from "@/lib/bundleService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import BundlePurchase from "@/components/BundlePurchase";

export default function ExamBundlesPage() {
  const params = useParams();
  const examId = params.examId;
  const [exam, setExam] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExamAndBundles() {
      setLoading(true);
      // Fetch exam details
      const examSnap = await getDoc(doc(db, "exams", examId));
      if (!examSnap.exists()) {
        setExam(null);
        setBundles([]);
        setLoading(false);
        return;
      }
      const examData = { id: examSnap.id, ...examSnap.data() };
      setExam(examData);
      // Fetch all bundles
      const allBundles = await getAllBundles();
      // Match bundles by exam and subExamCategory
      const filtered = allBundles.filter(
        (b) =>
          (b.exam && b.exam === examData.category) &&
          (b.subExamCategory && b.subExamCategory === (examData.subCategory || examData.name))
      );
      setBundles(filtered);
      setLoading(false);
    }
    if (examId) fetchExamAndBundles();
  }, [examId]);

  if (loading) {
    return (
      <Box minH="300px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
        <Text ml={4}>Loading bundles...</Text>
      </Box>
    );
  }

  if (!exam) {
    return <Box p={8}><Text fontSize="xl" color="red.500">Exam not found.</Text></Box>;
  }

  return (
    <Box pt={24} mb={24}>
      <Container maxW="container.xl" py={4}>
        <Heading mb={6}>{exam.subCategory || exam.name} Bundles</Heading>
        {bundles.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" color="gray.500">No bundles found for this exam.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {bundles.map((bundle) => (
              <BundlePurchase key={bundle.id} bundle={bundle} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
} 