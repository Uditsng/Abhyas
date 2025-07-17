'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Divider,
  useToast,
  Spinner,
  Image,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function CheckoutPage() {
  const { bundleId } = useParams();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const docRef = doc(db, 'bundles', bundleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBundle(docSnap.data());
        } else {
          toast({
            title: 'Bundle not found.',
            status: 'error',
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: 'Error fetching bundle.',
          description: err.message,
          status: 'error',
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (bundleId) fetchBundle();
  }, [bundleId]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!bundle) return null;

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, #e3f2fd, #bbdefb)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Flex
        w="full"
        maxW="1000px"
        borderRadius="2xl"
        overflow="hidden"
        bg="rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.3)"
        backdropFilter="blur(12px)"
        boxShadow="lg"
        direction={{ base: 'column', md: 'row' }}
      >
        {/* Left Panel - Bundle Info */}
        <Box w={{ base: '100%', md: '50%' }} p={6} bg="whiteAlpha.100">
          <Image
            src={bundle?.image || '/placeholder.png'}
            alt="Bundle Image"
            borderRadius="lg"
            mb={4}
            objectFit="cover"
            w="100%"
            h="200px"
          />
          <Heading size="md" color="Blue" mb={2}>
            {bundle.title}
          </Heading>
          <Text color="blue.400" mb={1}>
            {bundle.subject} • {bundle.exam} - {bundle.subExamCategory}
          </Text>
          <Text color="red.400" fontWeight="bold">
            ₹ {bundle.price}
          </Text>
          <Text color="blue.400">
            Includes {bundle?.testIds?.length || 0} tests
          </Text>
        </Box>

        {/* Right Panel - Payment Info */}
        <Box
          w={{ base: '100%', md: '50%' }}
          bg="rgba(255, 255, 255, 0.1)"
          p={6}
        >
          <Heading size="md" mb={4} color="Blue">
            Payment Summary
          </Heading>
          <Text color="blue.400">Subtotal: ₹ {bundle.price}</Text>
          <Text color="blue.400">Tax: ₹ 0</Text>
          <Text color="red.400" fontWeight="bold" mt={2}>
            Total: ₹ {bundle.price}
          </Text>

          <Divider my={6} borderColor="gray.500" />

          <Heading size="sm" color="black" mb={2}>
            Name on Card
          </Heading>
          <Input placeholder="Your name" mb={4} />
          <Heading size="sm" color="black" mb={2}>
            Card Number
          </Heading>
          <Input placeholder="1234 5678 9012 3456" mb={6} />

          {/* Razorpay or Placeholder Button */}
          <Button
            colorScheme="blue"
            w="full"
            borderRadius="lg"
            onClick={() =>
              toast({
                title: 'Payment Gateway Coming Soon!',
                description:
                  'Razorpay integration will be available once credentials are added.',
                status: 'info',
                duration: 3000,
                isClosable: true,
              })
            }
          >
            Proceed to Pay
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
