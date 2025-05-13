'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Heading, Flex, Button, SimpleGrid, Card, CardBody, Text, Badge, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
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
      image:'/images/banner2.jpg',
      totalQuestions: test.totalQuestions,
      duration: test.duration
    }));
  });

  // State for active category
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 6; // Show 6 exams per page (2 rows of 3 on desktop, 3 rows of 2 on tablet, 6 rows of 1 on mobile)

  // Filter exams based on active category
  const filteredExams = allExams.filter(exam => exam.category === activeCategory);

  // Calculate pagination
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
    dots: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
          centerMode: true,
          centerPadding: '40px'
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
                size={{ base: "sm", md: "md" }}
                borderRadius="full"
                px={{ base: 3, md: 4 }}
                minW={{ base: "80px", md: "100px" }}
                transition="all 0.2s"
                fontWeight={activeCategory === category.id ? "bold" : "normal"}
                _hover={{ transform: "scale(1.05)" }}
              >
                {category.name}
              </Button>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Exams Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mx={4}>
        {currentExams.map(exam => (
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
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+"
                  onError={(e) => {
                    e.target.src = '/images/banner.jpg';
                  }}
                />
              </Box>
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

      {/* Pagination Controls */}
      {filteredExams.length > examsPerPage && (
        <Flex justify="center" mt={6} align="center">
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={prevPage}
            isDisabled={currentPage === 1}
            mr={4}
            aria-label="Previous page"
          />
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={nextPage}
            isDisabled={currentPage === totalPages}
            ml={4}
            aria-label="Next page"
          />
        </Flex>
      )}

      {filteredExams.length === 0 && (
        <Box textAlign="center" p={8}>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>No exams found in this category.</Text>
        </Box>
      )}
    </Box>
  );
}
