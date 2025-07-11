'use client';

import { Box, Text, Button, SimpleGrid, Spinner } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function ExamBrowser() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      const snap = await getDocs(collection(db, 'exams'));
      const allExams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(allExams);
      // Set first category as default
      const categories = [...new Set(allExams.map(e => e.category))];
      setSelectedCategory(categories[0] || '');
      setLoading(false);
    }
    fetchExams();
  }, []);

  // Get unique categories
  const categories = [...new Set(exams.map(e => e.category))];
  // Filter exams for selected category
  const filteredExams = exams.filter(e => e.category === selectedCategory);

  if (loading) return <Box p={6}><Spinner size="lg" /></Box>;

  return (
    <Box className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <Text fontSize="2xl" fontWeight="bold" mb={3}>
        Popular Exams
      </Text>
      {/* Category Tabs */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={6}>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={cat === selectedCategory ? 'solid' : 'outline'}
            colorScheme="blue"
            className="rounded-full"
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </Box>
      {/* Sub Exam Cards */}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
        {filteredExams.map((exam) => (
          <Box
            key={exam.id}
            onClick={() => router.push(`/dashboard/exam/${exam.id}`)}
            className="bg-white dark:bg-gray-700 border rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition cursor-pointer "
          >
            <Text fontWeight="medium">{exam.subCategory || exam.name}</Text>
            <ChevronRightIcon boxSize={5} />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
