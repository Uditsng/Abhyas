'use client';

import { Box, Text, Button, SimpleGrid } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

// Mock Exams Data 
const examData = [
  {
    category: 'Banking Exams',
    subExams: [
      'SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk',
      'RRB Officer Scale - I', 'RRB Office Assistant',
      'HARCO Bank Clerk', 'IBPS SO', 'Indian Overseas Bank LBO',
      'Bank of Baroda Peon', 'Bihar State Cooperative Bank'
    ]
  },
  {
    category: 'SSC Exams',
    subExams: ['SSC CGL', 'SSC CHSL', 'SSC MTS']
  },
  {
    category: 'Teaching Exams',
    subExams: ['CTET', 'DSSSB', 'KVS']
  },
  {
    category: 'Civil Services Exam',
    subExams: ['UPSC Prelims', 'UPSC Mains']
  },
  {
    category: 'Railways Exams',
    subExams: ['RRB NTPC', 'RRB Group D']
  },
  {
    category: 'Engineering Recruitment Exams',
    subExams: ['GATE', 'ISRO Scientist']
  }
];

export default function ExamBrowser() {
  const router = useRouter();

  return (
    <Box className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <Text fontSize="2xl" fontWeight="bold" mb={3}>
        Popular Exams
      </Text>

      <div className="flex flex-wrap gap-3 mb-6">
        {examData.map((exam) => (
          <Button
            key={exam.category}
            variant="outline"
            colorScheme="blue"
            className="rounded-full"
            size="sm"
          >
            {exam.category}
          </Button>
        ))}
      </div>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {examData[0].subExams.map((subExam) => (
          <Box
            key={subExam}
            onClick={() => router.push(`/dashboard/${subExam.replace(/\s+/g, '-').toLowerCase()}`)}
            className="bg-white dark:bg-gray-700 border rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <Text fontWeight="medium">{subExam}</Text>
            <ChevronRightIcon boxSize={5} />
          </Box>
        ))}
      </SimpleGrid>

      <Box mt={6} textAlign="center">
        <Button variant="link" colorScheme="blue">
          Explore all exams
        </Button>
      </Box>
    </Box>
  );
}
