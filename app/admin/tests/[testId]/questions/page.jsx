'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, Badge, Spinner, Center, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Card, CardBody, Text, Flex, VStack, RadioGroup, Radio, useToast } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { getTestDetails } from '@/lib/tests';
import { collection, doc, setDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const testId = params.testId;
  const courseId = searchParams.get('courseId'); // Get courseId from query params
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '0',
    explanation: '',
    marks: 1
  });

  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchQuestions = async () => {
      if (!testId || !courseId) {
        setLoading(false);
        if (!courseId) {
          toast({
            title: "Missing Course ID",
            description: "Course ID is required to manage questions for this test.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push('/admin/tests'); // Redirect if courseId is missing
        }
        return;
      }

      try {
        const fetchedTestData = await getTestDetails(courseId, testId); // Use courseId here

        if (fetchedTestData) {
          setTestInfo({
            title: fetchedTestData.title,
            category: fetchedTestData.courseId.toUpperCase().replace(/-/g, ' ')
          });
          setQuestions(fetchedTestData.questions || []);
        } else {
          toast({
            title: "Test not found",
            description: `Could not find test with ID: ${testId} in course ${courseId}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push('/admin/tests');
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error loading questions",
          description: "Failed to load questions. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user, authLoading, router, testId, courseId, toast]); // Add courseId to dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option-')) {
      const optionIndex = parseInt(name.split('-')[1]);
      const newOptions = [...newQuestion.options];
      newOptions[optionIndex] = value;
      setNewQuestion({
        ...newQuestion,
        options: newOptions
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        [name]: name === 'marks' ? parseInt(value) : value
      });
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newQuestion.options.some(option => !option.trim())) {
      toast({
        title: 'Error',
        description: 'Please fill all options.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const questionsCollectionRef = collection(db, 'courses', courseId, 'tests', testId, 'questions'); // Use courseId here
      const docRef = await addDoc(questionsCollectionRef, {
        ...newQuestion,
        correctAnswer: parseInt(newQuestion.correctAnswer),
        createdAt: new Date().toISOString(),
      });

      setQuestions(prevQuestions => [
        ...prevQuestions,
        { id: docRef.id, ...newQuestion, correctAnswer: parseInt(newQuestion.correctAnswer) }
      ]);

      onClose();
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '0',
        explanation: '',
        marks: 1
      });

      toast({
        title: 'Success',
        description: 'Question added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: 'Error',
        description: 'Failed to add question. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    setLoading(true);
    try {
      const questionDocRef = doc(db, 'courses', courseId, 'tests', testId, 'questions', questionId); // Use courseId here
      await deleteDoc(questionDocRef);

      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));

      toast({
        title: 'Success',
        description: 'Question deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete question. Please try again.',
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
      {/* Header with back button */}
      <Card mb={6} variant="outline">
        <CardBody>
          <Flex align="center" mb={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => router.push('/admin/tests')}
              mr={4}
            >
              Back to Tests
            </Button>
            <Box>
              <Heading size="lg">Manage Questions</Heading>
              <Text color="gray.600">
                {testInfo?.title} - {testInfo?.category}
              </Text>
            </Box>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text color="gray.600">
              Total Questions: {questions.length}
            </Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Add Question
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {questions.length === 0 ? (
        <Card p={6} textAlign="center" variant="outline">
          <CardBody>
            <Heading size="md" mb={2}>No questions found</Heading>
            <Text mb={4}>
              Start building your test by adding questions.
            </Text>
            <Button colorScheme="blue" onClick={onOpen}>Add your first question</Button>
          </CardBody>
        </Card>
      ) : (
        <Card variant="outline">
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Question</Th>
                    <Th>Correct Answer</Th>
                    <Th>Marks</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((question, index) => (
                    <Tr key={question.id} _hover={{ bg: 'gray.50' }}>
                      <Td maxW="400px">
                        <Text fontWeight="medium" noOfLines={2}>
                          {index + 1}. {question.question}
                        </Text>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Options: {question.options.join(' | ')}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">
                          {question.options[question.correctAnswer]}
                        </Badge>
                      </Td>
                      <Td>{question.marks}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit question"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            // TODO: Implement edit functionality
                          />
                          <IconButton
                            aria-label="Delete question"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteQuestion(question.id)}
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

      {/* Add Question Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" className="ModelSizeForTest">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Question</FormLabel>
              <Textarea
                name="question"
                value={newQuestion.question}
                onChange={handleInputChange}
                placeholder="Enter your question here..."
                rows={3}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Options</FormLabel>
              <VStack spacing={3} align="stretch">
                {newQuestion.options.map((option, index) => (
                  <Input
                    key={index}
                    name={`option-${index}`}
                    value={option}
                    onChange={handleInputChange}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </VStack>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Correct Answer</FormLabel>
              <RadioGroup
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={(value) => setNewQuestion({...newQuestion, correctAnswer: value})}
              >
                <HStack direction="column">
                  {newQuestion.options.map((option, index) => (
                    <Radio key={index} value={index.toString()}>
                      Option {index + 1}
                    </Radio>
                  ))}
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Explanation (Optional)</FormLabel>
              <Textarea
                name="explanation"
                value={newQuestion.explanation}
                onChange={handleInputChange}
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Marks</FormLabel>
              <Input
                name="marks"
                type="number"
                value={newQuestion.marks}
                onChange={handleInputChange}
                min={1}
                max={10}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreateQuestion}
              isDisabled={!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())}
            >
              Add Question
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
