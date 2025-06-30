'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Heading, Flex, Button, SimpleGrid, Card, CardBody, Text, Badge } from '@chakra-ui/react';
import { getCourses, getTestsForCourse } from '@/lib/tests';

import dynamic from 'next/dynamic';
const Slider = dynamic(() => import('react-slick'), { ssr: false });
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
  const [coursesState, setCoursesState] = useState([]);
  const [tests, setTests] = useState([]);
  
  const { 
    activeCategory, 
    setActiveCategory, 
    currentPage, 
  } = useCategoryState(coursesState[0]?.id || '');
  
  useEffect(() => {
    async function fetchData(){
      const fetchedCourses = await getCourses()
      setCoursesState(fetchedCourses)
      if(fetchedCourses.length > 0){
        setActiveCategory(fetchedCourses[0].id)
        const fetchedTests = await getTestsForCourse(fetchedCourses[0].id)
        setTests(fetchedTests)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(()=>{
    async function fetchTests(){
      if(activeCategory)
{
  const fetchedTests = await getTestsForCourse(activeCategory)
  setTests(fetchedTests)
}
    }
    fetchTests()
  }, [activeCategory])


  // Handle test click - redirect to login if not authenticated
  const handleTestClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  // Create categories from the courses data
  const categories = coursesState.map(course => ({
    id: course.id,
    name: course.title
  }));


  // Calculate pagination
  const examsPerPage = 6;
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  // Use tests directly, as they are already filtered by activeCategory
  const currentExams = tests.slice((currentPage - 1) * examsPerPage, currentPage * examsPerPage);
  
  // Example of using the category state
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
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
                  src="/images/banner2.jpg"
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
      {/* <div className="resetPagination">
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
      </div> */}
    </Box>
  );
}
