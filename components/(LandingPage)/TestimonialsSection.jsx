import { Box, Text, Avatar, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Amit Sharma',
    image: '/images/profile1.png',
    text: 'This platform helped me achieve my dream rank! The analytics and solutions are top-notch.',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    image: '/images/profile2.png',
    text: 'Affordable and effective. The mock tests are very close to the real exam.',
    rating: 4,
  },
  {
    name: 'Rahul Verma',
    image: '/images/profile3.png',
    text: 'Loved the mobile app and instant feedback. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    image: '/images/profile4.png',
    text: 'The All India Ranking feature kept me motivated throughout my preparation.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('border-gray-200', 'border-gray-700');

  // Auto-scroll every 5 seconds
  // (for a real app, use a carousel library or Framer Motion)
  // For now, simple auto-advance
  useState(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">❤️ What Our Students Say</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Real stories from real achievers.</p>
      </div>
      <Flex justify="center">
        <Box
          bg={bg}
          borderRadius="2xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor={border}
          p={8}
          maxW="lg"
          w="full"
          className="transition-colors duration-200"
        >
          <Flex align="center" direction="column" gap={4}>
            <Avatar src={testimonials[current].image} name={testimonials[current].name} size="xl" mb={2} />
            <Text fontSize="lg" className="italic text-center">"{testimonials[current].text}"</Text>
            <Flex align="center" gap={1} mb={2}>
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <FiStar key={i} className="text-yellow-400" />
              ))}
            </Flex>
            <Heading size="md" className="text-center">{testimonials[current].name}</Heading>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
} 