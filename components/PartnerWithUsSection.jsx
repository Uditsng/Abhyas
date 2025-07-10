import { Box, Heading, Text, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import { FiUserPlus } from 'react-icons/fi';

export default function PartnerWithUsSection() {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('border-gray-200', 'border-gray-700');

  return (
    <Box className="mb-12">
      <Flex justify="center" align="center">
        <Box
          bg={bg}
          borderRadius="2xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor={border}
          p={8}
          maxW="2xl"
          w="full"
          textAlign="center"
          className="transition-colors duration-200"
        >
          <FiUserPlus size={48} className="mx-auto mb-4 text-blue-500 dark:text-blue-300" />
          <Heading size="lg" mb={2}>Partner With Us</Heading>
          <Text fontSize="lg" color="gray.600" dark={{ color: 'gray.300' }} mb={6}>
            Are you a teacher or admin? Join our platform to reach thousands of students and make a difference in education.
          </Text>
          <Link href="/auth/register">
            <Button as="a" colorScheme="blue" size="lg" borderRadius="full">
              Become a Teacher / Partner
            </Button>
          </Link>
        </Box>
      </Flex>
    </Box>
  );
} 