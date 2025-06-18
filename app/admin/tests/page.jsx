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
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Text,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { subscriptionPlans } from '@/lib/subscriptions';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // New state variables for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: 'General',
    duration: 60,
    subscription: 'base',
    totalQuestions: 20,
    logo: '',
  });

  // Fetch tests from Firebase
  useEffect(() => {
    // Check if user is authenticated and redirect if not
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Load mock data for now
    const mockTests = [
      {
        id: '1',
        title: 'General Knowledge Test',
        description: 'Basic general knowledge questions',
        category: 'General',
        duration: 30,
        totalQuestions: 20,
        status: 'Published',
        createdAt: { toDate: () => new Date('2023-10-15') }
      },
      {
        id: '2',
        title: 'Mathematics Fundamentals',
        description: 'Basic math concepts and problem solving',
        category: 'Mathematics',
        duration: 45,
        totalQuestions: 25,
        status: 'Draft',
        createdAt: { toDate: () => new Date('2023-10-20') }
      },
      {
        id: '3',
        title: 'Science Quiz',
        description: 'Test your knowledge of basic science concepts',
        category: 'Science',
        duration: 60,
        totalQuestions: 30,
        status: 'Published',
        createdAt: { toDate: () => new Date('2023-10-25') }
      }
    ];

    setTests(mockTests);
    setLoading(false);
  }, [user, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest({
      ...newTest,
      [name]: name === 'duration' || name === 'totalQuestions' ? parseInt(value) : value
    });
  };

  const handleCreateTest = () => {
    // For now, just add to the local state
    const newId = (tests.length + 1).toString();
    const testData = {
      id: newId,
      ...newTest,
      status: 'Draft',
      createdAt: { toDate: () => new Date() }
    };

    setTests([...tests, testData]);
    onClose();

    // Reset form
    setNewTest({
      title: '',
      description: '',
      category: 'General',
      subscription: 'base',
      duration: 60,
      totalQuestions: 20,
      logo: '',
    });
  };

  // Filter tests based on search query and filters
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || test.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || test.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Placeholder functions for actions (we'll implement these later)
  const handleViewTest = (id) => {
    router.push(`/admin/tests/${id}`);
    // Navigates to test details page
  };

  const handleEditTest = (id) => {
    const testToEdit = tests.find(test => test.id === id);
    if (testToEdit) {
      setNewTest({
        title: testToEdit.title,
        description: testToEdit.description,
        category: testToEdit.category,
        duration: testToEdit.duration,
        totalQuestions: testToEdit.totalQuestions,
        logo: testToEdit.logo, // Include logo in the edit
      });
      onOpen();
    }
  };

  const handleDeleteTest = (id) => {
    const updatedTests = tests.filter(test => test.id !== id);
    setTests(updatedTests);
  };

const handleManageQuestions = (id) => {
  router.push(`/admin/tests/${id}/questions`);
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewTest({ ...newTest, logo: reader.result }); // Store the image as a base64 string
      };
      reader.readAsDataURL(file);
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
      <Card mb={6} variant="outline">
        <CardBody>
          <Heading size="lg" mb={4}>Test Management</Heading>
          <Text mb={4} color="gray.600">
            Create and manage your tests. You can add questions, set time limits, and publish tests for your users.
          </Text>

          {/* Filters and search */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Select
              maxW={{ base: '100%', md: '200px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
            </Select>

            <Select
              maxW={{ base: '100%', md: '200px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </Select>

            <Spacer />

            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
              minW={{ base: '100%', md: 'auto' }}
            >
              Create Test
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {filteredTests.length === 0 ? (
        <Card p={6} textAlign="center" variant="outline">
          <CardBody>
            <Heading size="md" mb={2}>No tests found</Heading>
            <Text mb={4}>
              {tests.length === 0
                ? "You haven't created any tests yet."
                : "No tests match your current filters."}
            </Text>
            {tests.length === 0 && (
              <Button colorScheme="blue" onClick={onOpen}>Create your first test</Button>
            )}
            {tests.length > 0 && (
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStatusFilter('All');
              }}>Clear filters</Button>
            )}
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
                    <Th>Category</Th>
                    <Th>Duration</Th>
                    <Th>Questions</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTests.map(test => (
                    <Tr key={test.id} _hover={{ bg: 'gray.50' }}>
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
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          {test.status}
                        </Badge>
                      </Td>
                      <Td>
                        {test.createdAt
                          ? (typeof test.createdAt.toDate === 'function'
                              ? new Date(test.createdAt.toDate()).toLocaleDateString()
                              : new Date(test.createdAt).toLocaleDateString())
                          : 'N/A'}
                      </Td>
                      <Td>
                        <HStack spacing={2}> 
                          <IconButton
                            aria-label="Edit test"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditTest(test.id)}
                          />
                          <IconButton
                            aria-label="Delete test"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteTest(test.id)}
                          />
                          <IconButton
                            aria-label="Manage questions"
                            icon={<AddIcon />}
                            size="sm"
                            colorScheme="purple"
                            onClick={() => handleManageQuestions(test.id)}
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

      {/* Create Test Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Test</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Test Title</FormLabel>
              <Input
                name="title"
                value={newTest.title}
                onChange={handleInputChange}
                placeholder="Enter test title"
              />
            </FormControl>

            

            <FormControl mb={4} isRequired>
              <FormLabel>Category</FormLabel>
              <Select name="category" value={newTest.category} onChange={handleInputChange}>
                <option value="General">General</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Required Subscription Plan</FormLabel>
              <Select 
                name="subscription" 
                value={newTest.subscription} 
                onChange={handleInputChange}
              >
                {subscriptionPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (${plan.price}/{plan.duration})
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Select the minimum subscription plan required to access this test
              </Text>
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Duration (min)</FormLabel>
                <Input
                  name="duration"
                  type="number"
                  value={newTest.duration}
                  onChange={handleInputChange}
                  min={1}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Total Questions</FormLabel>
                <Input
                  name="totalQuestions"
                  type="number"
                  value={newTest.totalQuestions}
                  onChange={handleInputChange}
                  min={1}
                />
              </FormControl>
            </HStack>
            {/* Image Upload Section */}
      <FormControl mt={4}>
        <FormLabel>Test Logo</FormLabel>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e)}
        />
        {newTest.logo && (
          <Box mt={2}>
            <Text>Preview:</Text>
            <Image src={newTest.logo} alt="Test Logo" boxSize="100px" objectFit="cover" />
          </Box>
        )}
      </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreateTest}
              isDisabled={!newTest.title || newTest.duration < 1 || newTest.totalQuestions < 1}
            >
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}