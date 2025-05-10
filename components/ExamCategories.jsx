'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Heading, Flex, Button, SimpleGrid, Card, CardBody, Text, Badge } from '@chakra-ui/react';
import { courses } from '@/lib/courses';
import { testSeries } from '@/lib/tests';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/carousel.css';

export default function ExamCategories() {
  // Create categories from the courses data
  const categories = [
    ...courses.map(course => ({
      id: course.id,
      name: course.title
    }))
  ];

  // Create a flattened array of all tests with their course info
  const allExams = Object.entries(testSeries).flatMap(([courseId, tests]) => {
    return tests.map(test => ({
      id: test.id,
      name: test.title,
      category: courseId,
      description: test.description || `${test.totalQuestions} questions | ${test.duration} mins`,
      image:'/images/banner.jpg',
      totalQuestions: test.totalQuestions,
      duration: test.duration
    }));
  });

  // State for active category
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');

  // Filter exams based on active category
  const filteredExams = allExams.filter(exam => exam.category === activeCategory);

  // Slider settings for category buttons
  const sliderSettings = {
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
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
        <Slider {...sliderSettings}>
          {categories.map(category => (
            <Box key={category.id} px={1} textAlign="center">
              <Button
                colorScheme="blue"
                variant={activeCategory === category.id ? "solid" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                size="md"
                borderRadius="full"
                px={4}
                minW="100px"
                transition="all 0.2s"
              >
                {category.name}
              </Button>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Exams Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mx={4}>
        {filteredExams.map(exam => (
          <Link key={exam.id} href={`/tests/${exam.category}/${exam.id}`}>
            <Card
              overflow="hidden"
              variant="outline"
              _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
              transition="all 0.2s"
              h="100%"
            >
              <Box position="relative" height="160px">
                <Image
                  src={exam.image}
                  alt={exam.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <CardBody>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="md">{exam.name}</Heading>
                  <Badge colorScheme="blue">
                    {exam.totalQuestions} Qs
                  </Badge>
                </Flex>
                <Text color="gray.600" fontSize="sm">
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

      {filteredExams.length === 0 && (
        <Box textAlign="center" p={8}>
          <Text>No exams found in this category.</Text>
        </Box>
      )}
    </Box>
  );
}
