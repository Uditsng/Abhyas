"use client";

import { useState, useEffect } from "react";
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
  Card,
  CardBody,
  Text,
  Flex,
  VStack,
  RadioGroup,
  Radio,
  useToast,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  ArrowBackIcon,
  DownloadIcon,
} from "@chakra-ui/icons";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { getTestDetails } from "@/lib/adminTestsService";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import Papa from "papaparse";
import { downloadCSVTemplate } from "@/utils/downloadTemplate";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const testId = params.testId;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    explanation: "",
    marks: 1,
  });

  const [testInfo, setTestInfo] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    const fetchQuestions = async () => {
      if (!testId) {
        setLoading(false);
        toast({
          title: "Missing Test ID",
          description: "Test ID is required to manage questions.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push("/admin/tests");
        return;
      }

      try {
        const fetchedTestData = await getTestDetails(testId);
        if (fetchedTestData) {
          setTestInfo({
            title: fetchedTestData.title,
          });
          setQuestions(fetchedTestData.questions || []);
        } else {
          toast({
            title: "Test not found",
            description: `Could not find test with ID: ${testId}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push("/admin/tests");
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
  }, [user, authLoading, router, testId, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("option-")) {
      const optionIndex = parseInt(name.split("-")[1]);
      const newOptions = [...newQuestion.options];
      newOptions[optionIndex] = value;
      setNewQuestion({
        ...newQuestion,
        options: newOptions,
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        [name]: name === "marks" ? parseInt(value) : value,
      });
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newQuestion.options.some((option) => !option.trim())) {
      toast({
        title: "Error",
        description: "Please fill all options.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const questionsCollectionRef = collection(
        db,
        "tests",
        testId,
        "questions"
      );
      const docRef = await addDoc(questionsCollectionRef, {
        ...newQuestion,
        correctAnswer: parseInt(newQuestion.correctAnswer),
        questionImageUrl: questionImageUrl || "",
        createdAt: new Date().toISOString(),
      });

      setQuestions((prevQuestions) => [
        ...prevQuestions,
        {
          id: docRef.id,
          ...newQuestion,
          correctAnswer: parseInt(newQuestion.correctAnswer),
        },
      ]);

      onClose();
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
        explanation: "",
        marks: 1,
      });

      toast({
        title: "Success",
        description: "Question added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleDeleteQuestion = async (questionId) => {
  //   setLoading(true);
  //   try {
  //     const questionDocRef = doc(db, 'tests', testId, 'questions', questionId);
  //     await deleteDoc(questionDocRef);

  //     setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));

  //     toast({
  //       title: 'Success',
  //       description: 'Question deleted successfully.',
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting question:", error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete question. Please try again.',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEditClick = (question) => {
    setEditQuestion({
      ...question,
      correctAnswer: question.correctAnswer.toString(),
    });
    setEditModalOpen(true);
  };

  //Handle input changefor edit model
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("option-")) {
      const optionIndex = parseInt(name.split("-")[1]);
      const newOptions = [...editQuestion.options];
      newOptions = [...editQuestion.options];
      newOptions[optionIndex] = value;
      setEditQuestion({ ...editQuestion, options: newOptions });
    } else {
      setEditQuestion({
        ...editQuestion,
        [name]: name === "marks" ? parseInt(value) : value,
      });
    }
  };

  //Update question in firestore
  const handleUpdateQuestion = async () => {
    if (
      !editQuestion.question.trim() ||
      editQuestion.options.some((opt) => !opt.trim())
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const questionDocRef = doc(
        db,
        "tests",
        testId,
        "questions",
        editQuestion.id
      );
      await setDoc(questionDocRef, {
        ...editQuestion,
        correctAnswer: parseInt(editQuestion.correctAnswer),
        updatedAt: new Date().toISOString(),
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editQuestion.id
            ? {
                ...editQuestion,
                correctAnswer: parseInt(editQuestion.correctAnswer),
              }
            : q
        )
      );
      setEditModalOpen(false);
      setEditQuestion(null);
      toast({
        title: "Success",
        description: "Questionupdated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 1MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const url = await uploadToCloudinary(file); // your existing util
      setQuestionImageUrl(url);
      setPreviewUrl(URL.createObjectURL(file));
      toast({
        title: "Image Uploaded",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(questions.length / itemsPerPage);

  if (authLoading || loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
          Manage Questions
        </h1>
        {/* Header with back button */}
        <Card mb={6} variant="outline">
          <CardBody>
            <Flex align="center" mb={4}>
              <Box>
                <Text color="gray.600">{testInfo?.title}</Text>
              </Box>
            </Flex>

            <Flex 
              direction={{ base: "column", md: "row" }}
              justify="space-between" 
              align={{ base: "flex-start", md: "center" }}
              gap={4}
              >
      <Button
        onClick={() => router.push("/admin/tests")}
        leftIcon={<FaArrowAltCircleLeft />}
        colorScheme="red"
        variant="solid"
        size="sm"
      >
        Back
      </Button>
              <Text 
                color="gray.600"
                fontSize={{ base: "sm", md: "md" }}
                alignSelf={{ base: "flex-start", md: "center" }}              
              >Total Questions: {questions.length}
              </Text>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={onOpen}
                size="sm"
              >
                Add Question
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {questions.length === 0 ? (
          <Card p={6} textAlign="center" variant="outline">
            <CardBody>
              <Heading size="md" mb={2}>
                No questions found
              </Heading>
              <Text mb={4}>Start building your test by adding questions.</Text>
              <VStack>
                <Button colorScheme="blue" onClick={onOpen}>
                  Add your first question
                </Button>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={() => setCsvModalOpen(true)}
                >
                  Bulk Upload CSV
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card variant="outline">
            <CardBody p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray-200">
                    <Tr>
                      <Th>Question</Th>
                      <Th>Correct Answer</Th>
                      <Th>Marks</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedQuestions.map((question, index) => (
                      <Tr key={question.id}>
                        <Td maxW="400px">
                          <Text fontWeight="medium" noOfLines={2}>
                            {index + 1 + (currentPage - 1) * itemsPerPage}.{" "}
                            {question.question}
                          </Text>
                          {question.questionImageUrl && (
                            <img
                              src={question.questionImageUrl}
                              alt="Question visual"
                              style={{
                                marginTop: "8px",
                                width: "180px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                              }}
                            />
                          )}
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            Options: {question.options.join(" | ")}
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
                              onClick={() => handleEditClick(question)}
                            />
                            {/* <IconButton
                            aria-label="Delete question"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteQuestion(question.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
          className="ModelSizeForTest"
        >
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

              <FormControl mb={4}>
                <FormLabel>Upload Image (optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      marginTop: "10px",
                      maxHeight: "160px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />
                )}
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
                  onChange={(value) =>
                    setNewQuestion({ ...newQuestion, correctAnswer: value })
                  }
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
                isDisabled={
                  !newQuestion.question.trim() ||
                  newQuestion.options.some((opt) => !opt.trim())
                }
              >
                Add Question
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Question Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Question</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl mb={4} isRequired>
                <FormLabel>Question</FormLabel>
                <Textarea
                  name="question"
                  value={editQuestion?.question || ""}
                  onChange={handleEditInputChange}
                  placeholder="Enter your question here..."
                  rows={6}
                />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Options</FormLabel>
                <VStack spacing={3} align="stretch">
                  {editQuestion?.options.map((option, idx) => (
                    <Input
                      key={idx}
                      name={`option-${idx}`}
                      value={option}
                      onChange={handleEditInputChange}
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </VStack>
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Correct Answer</FormLabel>
                <RadioGroup
                  name="correctAnswer"
                  value={editQuestion?.correctAnswer}
                  onChange={(val) =>
                    setEditQuestion((q) => ({ ...q, correctAnswer: val }))
                  }
                >
                  <HStack>
                    {editQuestion?.options.map((option, idx) => (
                      <Radio key={idx} value={idx.toString()}>
                        Option {idx + 1}
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Explanation (Optional)</FormLabel>
                <Textarea
                  name="explanation"
                  value={editQuestion?.explanation || ""}
                  onChange={handleEditInputChange}
                  placeholder="Explain why this is the correct answer..."
                  rows={6}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Marks</FormLabel>
                <Input
                  name="marks"
                  type="number"
                  value={editQuestion?.marks || 1}
                  onChange={handleEditInputChange}
                  min={1}
                  max={10}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleUpdateQuestion}>
                Save
              </Button>
              <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* CSV Upload Modal */}
        <Modal
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Bulk Upload Questions (CSV)</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>CSV File</FormLabel>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
                <Text fontSize="sm" color="gray.600" mb={2} mt={2}>
                  Please use the exact format. You can download the template
                  below:
                </Text>

                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="teal"
                  size="sm"
                  mb={4}
                  onClick={downloadCSVTemplate}
                >
                  Download Sample Template
                </Button>

                <Text mt={2} fontSize="sm" color="gray.500">
                  Format: question, option1, option2, option3, option4,
                  correctAnswer (1-4), explanation, marks
                </Text>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={async () => {
                  if (!csvFile) return;
                  setLoading(true);

                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const csvText = e.target.result;
                    Papa.parse(csvText, {
                      header: false,
                      skipEmptyLines: true,
                      complete: async (results) => {
                        const rows = results.data;
                        let successCount = 0;
                        for (const row of rows) {
                          if (row.length < 8) continue; // skip invalid rows
                          const [
                            question,
                            option1,
                            option2,
                            option3,
                            option4,
                            correctAnswer,
                            explanation,
                            marks,
                          ] = row;

                          // Accept correctAnswer as 1-4 or a-d/A-D, map to 0-3
                          let correctAnswerIndex = -1;
                          if (typeof correctAnswer === "string") {
                            const trimmed = correctAnswer.trim().toLowerCase();
                            if (["a", "1"].includes(trimmed))
                              correctAnswerIndex = 0;
                            else if (["b", "2"].includes(trimmed))
                              correctAnswerIndex = 1;
                            else if (["c", "3"].includes(trimmed))
                              correctAnswerIndex = 2;
                            else if (["d", "4"].includes(trimmed))
                              correctAnswerIndex = 3;
                          } else if (typeof correctAnswer === "number") {
                            if (correctAnswer >= 1 && correctAnswer <= 4)
                              correctAnswerIndex = correctAnswer - 1;
                          }

                          if (
                            !question.trim() ||
                            [option1, option2, option3, option4].some(
                              (opt) => !opt.trim()
                            ) ||
                            isNaN(correctAnswerIndex) ||
                            correctAnswerIndex < 0 ||
                            correctAnswerIndex > 3 ||
                            isNaN(parseInt(marks))
                          )
                            continue;
                          try {
                            const questionsCollectionRef = collection(
                              db,
                              "tests",
                              testId,
                              "questions"
                            );
                            const docRef = await addDoc(
                              questionsCollectionRef,
                              {
                                question,
                                options: [option1, option2, option3, option4],
                                correctAnswer: correctAnswerIndex, // store as 0-3
                                explanation,
                                marks: parseInt(marks),
                                createdAt: new Date().toISOString(),
                              }
                            );
                            setQuestions((prev) => [
                              ...prev,
                              {
                                id: docRef.id,
                                question,
                                options: [option1, option2, option3, option4],
                                correctAnswer: correctAnswerIndex,
                                explanation,
                                marks: parseInt(marks),
                              },
                            ]);
                            successCount++;
                          } catch (err) {
                            // Optionally handle error per row
                          }
                        }
                        setLoading(false);
                        setCsvModalOpen(false);
                        setCsvFile(null);
                        toast({
                          title: "Bulk Upload Complete",
                          description: `${successCount} questions added.`,
                          status: "success",
                          duration: 4000,
                          isClosable: true,
                        });
                      },
                    });
                  };
                  reader.readAsText(csvFile);
                }}
                isDisabled={!csvFile}
              >
                Upload
              </Button>
              <Button onClick={() => setCsvModalOpen(false)}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
