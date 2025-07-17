import { Box, Text, Image, Heading, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'How to Crack SSC CGL in First Attempt',
    intro: 'Tips, strategies, and resources to help you ace the SSC CGL exam on your first try.',
    image: '/images/Crack-ssc.png',
    link: '/blog/ssc-cgl-first-attempt',
  },
  {
    id: 2,
    title: 'Top 5 Mistakes to Avoid in Banking Exams',
    intro: 'Learn the most common pitfalls and how to avoid them for a successful banking exam journey.',
    image: '/images/Mistakes-to-Avoid-while-Preparing-for-Bank-Exams-2859110912.webp',
    link: '/blog/banking-mistakes',
  },
  {
    id: 3,
    title: 'Effective Time Management for UPSC Aspirants',
    intro: 'Master your study schedule and boost productivity with these proven time management techniques.',
    image: '/images/Time-1024x536-2217678230.jpg',
    link: '/blog/upsc-time-management',
  },
];

export default function BlogPreviewSection() {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('border-gray-200', 'border-gray-700');

  return (
    <Box className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">📰 Latest Articles</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Stay updated with our latest tips and insights.</p>
      </div>
      <Flex gap={8} justify="center" flexWrap="wrap">
        {blogPosts.map((post) => (
          <Box
            key={post.id}
            bg={bg}
            borderRadius="2xl"
            boxShadow="md"
            borderWidth="1px"
            borderColor={border}
            maxW="sm"
            w="full"
            overflow="hidden"
            className="transition-colors duration-200 mb-6"
          >
            <Image src={post.image} alt={post.title} w="100%" h="180px" objectFit="cover" />
            <Box p={5}>
              <Heading size="md" mb={2}>{post.title}</Heading>
              <Text color="gray.600" dark={{ color: 'gray.300' }} mb={4}>{post.intro}</Text>
              <Link href={post.link} passHref legacyBehavior>
                <Button as="a" colorScheme="blue" variant="outline" size="sm">Read More</Button>
              </Link>
            </Box>
          </Box>
        ))}
      </Flex>
      <div className="text-center mt-4">
        <Link href="/blog" passHref legacyBehavior>
          <Button as="a" colorScheme="blue" variant="solid">View All Articles</Button>
        </Link>
      </div>
    </Box>
  );
} 