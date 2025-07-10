'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, Badge, Spinner, Center, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Select, Card, CardBody, Text, Flex, useToast} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { getAllTests } from '@/lib/tests';
import { collection, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newTest, setNewTest] = useState({
    subject:'',
    testName:'',
    duration: 0,
    totalQuestions: 0,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTest, setEditTest] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    const fetchAllTests = async () => {
      setLoading(true);
      try {
        const allTests = await getAllTests();
        setTests(allTests);
      } catch (error) {
        console.error("Error fetching tests", error);
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
console.log(tests)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest((prev)=> ({
      ...prev,
      [name]: name === 'duration' || name === 'totalQuestions' ? parseInt(value) : value,
    }));
  };

  const handleCreateTest = async () => {
    const { testName, subject, duration, totalQuestions } = newTest;
    if (!testName.trim() || !subject.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (totalQuestions <= 30) {
      toast({
        title: 'Error',
        description: 'A test must have at least 30 questions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const testsCollectionRef = collection(db, 'tests');
      const docRef = await addDoc(testsCollectionRef, {
        testName,
        subject,
        duration,
        totalQuestions,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      });
      setTests((prev) => [...prev, { id: docRef.id, ...newTest }]);
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

  // const handleDeleteTest = async (testId,) => {
  //   setLoading(true);
  //   try {
  //     const testDocRef = doc(db, 'tests', testId);
  //     await deleteDoc(testDocRef);

  //     setTests((prev) => prev.filter((t) => t.id !== testId));

  //     toast({
  //       title: 'Success',
  //       description: 'Test deleted successfully.',
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting test:", error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete test. Please try again.',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEditClick = (test) => {
    setEditTest({ ...test });
    setEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTest((prev) => ({ ...prev, [name]: name === 'duration' || name === 'totalQuestions' ? parseInt(value) : value }));
  };

  const handleUpdateTest = async () => {
    if (!editTest.testName.trim() || !editTest.subject.trim()) {
      toast({
        title: 'Error',
        description: 'TestName is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editTest.totalQuestions < 30) {
  toast({
    title: 'Error',
    description: 'A test must have at least 30 questions.',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
  return;
}

    setLoading(true);
    try {
      const ref = doc(db, 'tests', editTest.id);
      await updateDoc(ref, {
        testName: editTest.testName,
        subject: editTest.subject,
        duration: editTest.duration,
        totalQuestions: editTest.totalQuestions,
        updatedAt: new Date().toISOString(),
      });
      setTests(prevTests => prevTests.map(t => t.id === editTest.id ? { ...t, ...editTest, } : t));
      setEditModalOpen(false);
      setEditTest(null);
      toast({
        title: 'Success',
        description: 'Test updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to update test. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Center h="200px"><Spinner size="xl" /></Center>
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
                    <Th>Test Name</Th>
                    <Th>Subject</Th>
                    <Th>Duration</Th>
                    <Th>Questions</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tests.map((test) => (
                    <Tr key={test.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{test.testName}</Td>
                      <Td>{test.subject}</Td>
                      <Td>{test.duration}</Td>
                      <Td>{test.totalQuestions}</Td>

                    <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Manage Questions"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            colorScheme="teal"
                            onClick={() => router.push(`/admin/tests/${test.id}/questions`)}
                          />
                          <IconButton
                            aria-label="Edit Test"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditClick(test)}
                          />
                          {/* <IconButton
                            aria-label="Delete Test"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteTest(test.id, test.courseId)}
                          /> */}
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

{/* Modal: Add Test */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Subject</FormLabel>
              <Input name="subject" value={newTest.subject} onChange={handleInputChange} placeholder="e.g., Mathematics" />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Test Name</FormLabel>
              <Input name="testName" value={newTest.testName} onChange={handleInputChange} placeholder="e.g., Mathematics Test 1" />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Duration (minutes)</FormLabel>
              <Input name="duration" type="number" min={30} value={newTest.duration} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Total Questions</FormLabel>
              <Input name="totalQuestions" type="number" min={30} value={newTest.totalQuestions} onChange={handleInputChange} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCreateTest}>Create</Button>
            <Button onClick={onClose} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

{/* Modal: Edit Test */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Input name="subject" value={editTest?.subject || ''} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Name</FormLabel>
              <Input name="testName" value={editTest?.testName || ''} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Duration (minutes)</FormLabel>
              <Input name="duration" type="number" value={editTest?.duration || 30} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Total Questions</FormLabel>
              <Input name="totalQuestions" type="number" value={editTest?.totalQuestions || 30} onChange={handleEditInputChange} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdateTest}>Save</Button>
            <Button onClick={() => setEditModalOpen(false)} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>    
    </Box>
  );
}
