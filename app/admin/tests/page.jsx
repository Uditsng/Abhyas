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
  Select,
  Card,
  CardBody,
  Text,
  Flex,
  useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { getCourses, getTestsForCourse } from '@/lib/tests'; // Import getCourses and getTestsForCourse
import { collection, doc, setDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newTest, setNewTest] = useState({
    title: '',
    duration: 60,
    totalQuestions: 0,
    courseId: '', // To select which course this test belongs to
  });
  const [courses, setCourses] = useState([]); // State to store available courses

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchAllTests = async () => {
      setLoading(true);
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses); // Store courses for the dropdown

        let allTests = [];
        for (const course of fetchedCourses) {
          const testsForCourse = await getTestsForCourse(course.id);
          allTests = [...allTests, ...testsForCourse.map(test => ({ ...test, courseTitle: course.title }))];
        }
        setTests(allTests);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast({
          title: "Error loading tests",
          description: "Failed to load tests. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllTests();
    }
  }, [user, authLoading, router, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest({
      ...newTest,
      [name]: name === 'duration' || name === 'totalQuestions' ? parseInt(value) : value,
    });
  };

  const handleCreateTest = async () => {
    if (!newTest.title.trim() || !newTest.courseId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Title and Course).',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const testsCollectionRef = collection(db, 'courses', newTest.courseId, 'tests');
      const docRef = await addDoc(testsCollectionRef, {
        ...newTest,
        createdAt: new Date().toISOString(),
      });

      // Add the new test to the local state, including its courseTitle
      const course = courses.find(c => c.id === newTest.courseId);
      setTests(prevTests => [
        ...prevTests,
        { id: docRef.id, ...newTest, courseTitle: course ? course.title : newTest.courseId.toUpperCase().replace(/-/g, ' ') }
      ]);

      onClose();
      setNewTest({
        title: '',
        duration: 60,
        totalQuestions: 0,
        courseId: '',
      });
      toast({
        title: 'Success',
        description: 'Test created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding test:", error);
      toast({
        title: 'Error',
        description: 'Failed to create test. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testIdToDelete, courseIdToDelete) => {
    setLoading(true);
    try {
      const testDocRef = doc(db, 'courses', courseIdToDelete, 'tests', testIdToDelete);
      await deleteDoc(testDocRef);

      setTests(prevTests => prevTests.filter(test => test.id !== testIdToDelete));

      toast({
        title: 'Success',
        description: 'Test deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting test:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete test. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Manage Tests</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Add New Test
        </Button>
      </Flex>

      {tests.length === 0 ? (
        <Card p={6} textAlign="center" variant="outline">
          <CardBody>
            <Heading size="md" mb={2}>No tests found</Heading>
            <Text mb={4}>
              Start by adding your first test.
            </Text>
            <Button colorScheme="blue" onClick={onOpen}>Add New Test</Button>
          </CardBody>
        </Card>
      ) : (
        <Card variant="outline">
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Title</Th>
                    <Th>Course</Th>
                    <Th>Duration (mins)</Th>
                    <Th>Questions</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tests.map((test) => (
                    <Tr key={test.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{test.title}</Td>
                      <Td>
                        <Badge colorScheme="purple">
                          {test.courseTitle || test.courseId.toUpperCase().replace(/-/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>{test.duration}</Td>
                      <Td>{test.totalQuestions}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Manage Questions"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            colorScheme="teal"
                            onClick={() => router.push(`/admin/tests/${test.id}/questions?courseId=${test.courseId}`)}
                          />
                          <IconButton
                            aria-label="Edit Test"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            // TODO: Implement edit functionality for test details
                          />
                          <IconButton
                            aria-label="Delete Test"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteTest(test.id, test.courseId)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Add New Test Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Test Title</FormLabel>
              <Input
                name="title"
                value={newTest.title}
                onChange={handleInputChange}
                placeholder="e.g., SSC CGL Tier I - Mock Test 1"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Course</FormLabel>
              <Select
                name="courseId"
                value={newTest.courseId}
                onChange={handleInputChange}
                placeholder="Select course"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Duration (minutes)</FormLabel>
              <Input
                name="duration"
                type="number"
                value={newTest.duration}
                onChange={handleInputChange}
                min={1}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Total Questions (initial)</FormLabel>
              <Input
                name="totalQuestions"
                type="number"
                value={newTest.totalQuestions}
                onChange={handleInputChange}
                min={0}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateTest}>
              Create Test
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
