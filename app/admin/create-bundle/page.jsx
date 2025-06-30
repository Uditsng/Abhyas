// app/admin/create-bundle/page.jsx
"use client";

import { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Select,
  useToast, Heading, Stack, Checkbox, Text, Flex
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';

export default function CreateBundlePage() {
  const [user, loadingUser] = useAuthState(auth);
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [tests, setTests] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [createdBundleId, setCreatedBundleId] = useState(null);
  const [createdBundleTitle, setCreatedBundleTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchTests() {
      const all = await getAllTests();
      setTests(all);
    }
    fetchTests();
  }, []);

  const handleSubmit = async () => {
    if (!title || !exam || !subject || !price) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const bundleData = {
        title,
        exam,
        subject,
        price: parseFloat(price),
        status,
        testIds: selectedTestIds,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      };

      const newId = await createBundle(bundleData);
      setCreatedBundleId(newId);
      setCreatedBundleTitle(title);

      toast({
        title: 'Bundle Created',
        description: 'Your bundle was saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setTitle('');
      setExam('');
      setSubject('');
      setPrice('');
      setStatus('draft');
      setSelectedTestIds([]);
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast({
        title: 'Error',
        description: 'Could not create bundle. Try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTestSelection = (testId) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  return (
    <Box maxW="3xl" mx="auto" py={10} px={6}>
      <Heading mb={6}>Create New Bundle</Heading>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Bundle Title</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SSC Reasoning Pack" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Exam</FormLabel>
          <Input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="e.g. SSC, NDA, NEET" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Subject</FormLabel>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Reasoning, Physics" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Price (INR)</FormLabel>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 199" />
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Select Tests to Include (optional)</FormLabel>
          {tests.length === 0 ? (
            <Text color="gray.500">No tests available yet. You can create them after saving the bundle.</Text>
          ) : (
            <Flex direction="column" gap={2} maxH="250px" overflowY="auto" border="1px solid #ccc" p={3} borderRadius="md">
              {tests.map((test) => (
                <Checkbox
                  key={test.id}
                  isChecked={selectedTestIds.includes(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                >
                  {test.title}
                </Checkbox>
              ))}
            </Flex>
          )}
        </FormControl>

        <Button colorScheme="blue" isLoading={loading} onClick={handleSubmit}>
          Create Bundle
        </Button>

        {createdBundleId && (
          <Box mt={6} borderTop="1px solid #ccc" pt={4}>
            <Text fontWeight="medium" mb={2}>
              ✅ Bundle "{createdBundleTitle}" created.
            </Text>
            <Button
              colorScheme="teal"
              onClick={() => router.push(`/admin/create-test?bundleId=${createdBundleId}`)}
            >
              Create Tests for this Bundle
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
