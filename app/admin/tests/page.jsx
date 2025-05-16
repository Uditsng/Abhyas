'use client';

import { useState, useEffect } from 'react';
import {
  Box, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  HStack, 
  Badge, 
  Spinner, 
  Center,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: 'General',
    duration: 60,
    totalQuestions: 20
  });

  // Fetch tests from Firebase
  useEffect(() => {
    // Check if user is authenticated and redirect if not
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    async function fetchTests() {
      try {
        setLoading(true);
        const testsCollection = collection(db, 'tests');
        const testSnapshot = await getDocs(testsCollection);
        const testList = testSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTests(testList);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTests();
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest({
      ...newTest,
      [name]: name === 'duration' || name === 'totalQuestions' ? parseInt(value) : value
    });
  };

  const handleCreateTest = async () => {
    try {
      const testData = {
        ...newTest,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'Draft'
      };
      
      await addDoc(collection(db, 'tests'), testData);
      onClose();
      
      // Refresh the test list
      const testsCollection = collection(db, 'tests');
      const testSnapshot = await getDocs(testsCollection);
      const testList = testSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTests(testList);
      
      // Reset form
      setNewTest({
        title: '',
        description: '',
        category: 'General',
        duration: 60,
        totalQuestions: 20
      });
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Test Series</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Create Test
        </Button>
      </HStack>
      
      {tests.length === 0 ? (
        <Box p={6} textAlign="center">
          <Heading size="md" mb={2}>No tests found</Heading>
          <Button colorScheme="blue" onClick={onOpen}>Create your first test</Button>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Duration</Th>
                <Th>Questions</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tests.map(test => (
                <Tr key={test.id}>
                  <Td fontWeight="medium">{test.title}</Td>
                  <Td>{test.category}</Td>
                  <Td>{test.duration} min</Td>
                  <Td>{test.totalQuestions}</Td>
                  <Td>
                    <Badge 
                      colorScheme={
                        test.status === 'Published' ? 'green' : 
                        test.status === 'Draft' ? 'yellow' : 'red'
                      }
                    >
                      {test.status}
                    </Badge>
                  </Td>
                  <Td>{test.createdAt ? new Date(test.createdAt.toDate()).toLocaleDateString() : 'N/A'}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton 
                        aria-label="View test" 
                        icon={<ViewIcon />} 
                        size="sm" 
                        colorScheme="teal"
                      />
                      <IconButton 
                        aria-label="Edit test" 
                        icon={<EditIcon />} 
                        size="sm" 
                        colorScheme="blue"
                      />
                      <IconButton 
                        aria-label="Delete test" 
                        icon={<DeleteIcon />} 
                        size="sm" 
                        colorScheme="red"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Create Test Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Test Title</FormLabel>
              <Input 
                name="title" 
                value={newTest.title} 
                onChange={handleInputChange} 
                placeholder="Enter test title"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                name="description" 
                value={newTest.description} 
                onChange={handleInputChange} 
                placeholder="Enter test description"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Category</FormLabel>
              <Select name="category" value={newTest.category} onChange={handleInputChange}>
                <option value="General">General</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
              </Select>
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Duration (minutes)</FormLabel>
                <Input 
                  name="duration" 
                  type="number" 
                  value={newTest.duration} 
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Total Questions</FormLabel>
                <Input 
                  name="totalQuestions" 
                  type="number" 
                  value={newTest.totalQuestions} 
                  onChange={handleInputChange}
                />
              </FormControl>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateTest}>
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}