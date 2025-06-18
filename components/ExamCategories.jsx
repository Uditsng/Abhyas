'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Box, Heading, Flex, Button, SimpleGrid, Card, CardBody, Text, Badge } from '@chakra-ui/react';
import { courses } from '@/lib/courses';
import { testSeries } from '@/lib/tests';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/carousel.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useCategoryState } from '@/hooks/useCategoryState';
import { examCategoriesCarouselSettings } from '@/app/config/carouselSettings';
import OptimizedImage from '@/components/OptimizedImage';

export default function ExamCategories() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    activeCategory, 
    setActiveCategory, 
    currentPage, 
    setCurrentPage,
    resetPagination 
  } = useCategoryState(courses[0]?.id || '');

  // Handle test click - redirect to login if not authenticated
  const handleTestClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  // Create categories from the courses data
  const categories = courses.map(course => ({
    id: course.id,
    name: course.title
  }));

  // Create a flattened array of all tests with their course info
  const allExams = Object.entries(testSeries).flatMap(([courseId, tests]) => {
    return tests.map(test => ({
      id: test.id,
      name: test.title,
      category: courseId,
      description: test.description || `${test.totalQuestions} questions | ${test.duration} mins`,
      image: '/images/banner2.jpg',
      totalQuestions: test.totalQuestions,
      duration: test.duration
    }));
  });

  // Filter exams based on active category
  const filteredExams = allExams.filter(exam => exam.category === activeCategory);

  // Calculate pagination
  const examsPerPage = 6;
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // Example of using the category state
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Pagination will automatically reset due to the hook's logic
  };

  return (
    <Box py={8} px={4} maxW="1200px" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Popular Exam Categories
      </Heading>

      {/* Category Filter Buttons Carousel */}
      <Box
        mb={10}
        className="category-carousel"
        px={{ base: 2, md: 6 }}
        position="relative"
        mx="auto"
        maxW="1000px"
      >
        <Slider {...examCategoriesCarouselSettings}>
          {categories.map((course) => (
            <Box key={course.id} px={1} textAlign="center">
              <Button
                colorScheme="blue"
                variant={activeCategory === course.id ? "solid" : "outline"}
                onClick={() => handleCategoryChange(course.id)}
                size={{ base: "sm", md: "md" }}
                borderRadius="full"
                px={{ base: 3, md: 4 }}
                minW={{ base: "80px", md: "100px" }}
                transition="all 0.2s"
                fontWeight={activeCategory === course.id ? "bold" : "normal"}
                _hover={{ transform: "scale(1.05)" }}
              >
                {course.name}
              </Button>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Exams Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mx={4}>
        {currentExams.map(exam => (
          <Link key={exam.id}
            href={`/tests/${exam.category}/${exam.id}`}
            onClick={handleTestClick}
          >
            <Card
              overflow="hidden"
              variant="outline"
              _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
              transition="all 0.2s"
              h="100%"
            >
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <OptimizedImage
                  src={exam.image}
                  alt={exam.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={indexOfFirstExam < 4}
                />
              </div>
              <CardBody>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="md">{exam.name}</Heading>
                  <Badge colorScheme="blue">
                    {exam.totalQuestions} Qs
                  </Badge>
                </Flex>
                <Text color="gray.600" _dark={{ color: "gray.400" }} fontSize="sm">
                  {exam.description}
                </Text>
                <Flex justify="space-between" align="center" mt={4}>
                  <Badge colorScheme="green" p={2} borderRadius="md">
                    {exam.duration} mins
                  </Badge>
                  <Button
                    colorScheme="teal"
                    size="sm"
                  >
                    Take Test
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </Link>
        ))}
      </SimpleGrid>

      {/* Example of using pagination */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </Box>
  );
}
