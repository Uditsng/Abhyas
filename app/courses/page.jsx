// lists all courses.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { courses } from '@/lib/courses';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Chakra UI color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.900', 'white');
  
  return (
    <Box p={4} maxW="1200px" mx="auto" className="min-h-screen">
      <Heading as="h1" size="xl" mb={6} color={headingColor}>
        Available Courses
      </Heading>
      
      {/* Search input */}
      <Box mb={8} maxW="md">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={cardBg}
          />
        </InputGroup>
      </Box>
      
      {filteredCourses.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card
                overflow="hidden"
                variant="outline"
                bg={cardBg}
                _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
                transition="all 0.2s"
                h="100%"
              >
                <Image
                  src={course.image || '/images/default-course.jpg'}
                  alt={course.title}
                  objectFit="cover"
                  height="200px"
                />
                <CardBody>
                  <Stack spacing={3}>
                    <Heading size="md" color={headingColor}>{course.title}</Heading>
                    <Text color={textColor}>{course.description}</Text>
                  </Stack>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" p={10} bg={cardBg} borderRadius="md">
          <Heading size="md" mb={2} color={headingColor}>No courses found</Heading>
          <Text color={textColor} mb={6}>
            Try adjusting your search query.
          </Text>
          <Box
            as="button"
            onClick={() => setSearchQuery('')}
            px={4}
            py={2}
            borderRadius="md"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600' }}
          >
            Clear Search
          </Box>
        </Box>
      )}
    </Box>
  );
}