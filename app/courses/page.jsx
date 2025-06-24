'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  Container,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import CourseCard from '@/components/CourseCard';
import SectionHeader from '@/components/SectionHeader';
import { getCourses } from '@/lib/tests'; // Import the getCourses function

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourses(); // Fetch courses from Firestore
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // You might want to set an error state here to display a message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Empty dependency array means this runs once on mount

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading courses...</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <SectionHeader title="Explore Courses" />

      <Box mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            _dark={{ bg: "gray.700" }}
          />
        </InputGroup>
      </Box>

      {filteredCourses.length === 0 && !loading ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" color="gray.500">No courses found matching your search.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              imageUrl={course.image}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
