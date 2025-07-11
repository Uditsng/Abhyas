"use client";

import { useState, useEffect } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Select, useToast, Heading, Stack, Checkbox, Text, Flex,
  Table, Thead, Tbody, Tr, Th, Td, Card, CardBody, Spinner, Center,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebaseConfig";
import { getAllTests } from "@/lib/tests";
import { getAllBundles, createBundle, uploadBundleImage } from "@/lib/bundleService";
import { getAllExams } from "@/lib/superAdminExamsService";

export default function CreateBundlePage() {    
  const [user, loadingUser] = useAuthState(auth);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState("");
  const [subExamCategory, setSubExamCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [promoteBundle, setPromoteBundle] = useState(false);
  const [imageFile, setImageFile] = useState(null)
  const [createdBundleId, setCreatedBundleId] = useState(null);
  const [createdBundleTitle, setCreatedBundleTitle] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [exams, setExams] = useState([]);

  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch bundles, tests, and exams
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (!user) return;
        const [allBundles, allTests, allExams] = await Promise.all([
          getAllBundles(user.uid),
          getAllTests(user.uid),
          getAllExams()
        ]);
        setBundles(allBundles);
        setTests(allTests);
        setExams(allExams);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bundles, tests, or exams.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, user]);

  // Build category to subcategory mapping
  const examCategoryMap = exams.reduce((acc, exam) => {
    if (!acc[exam.category]) acc[exam.category] = [];
    if (!acc[exam.category].includes(exam.subCategory)) acc[exam.category].push(exam.subCategory);
    return acc;
  }, {});
  const examCategories = Object.keys(examCategoryMap);
  const subExamOptions = examCategoryMap[exam] || [];

  // Handle bundle creation
  const handleSubmit = async () => {
    if (!title || !exam || !subject || !price) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setFormLoading(true);
    try {
      let imageURL =" "
      if (imageFile){
        imageURL = await uploadBundleImage(imageFile);
      }
      const bundleData = {
        title,
        exam,
        subExamCategory,
        subject,
        price: parseFloat(price),
        status,
        testIds: selectedTestIds,
        promote: promoteBundle,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      };
      const newId = await createBundle(bundleData);
      setCreatedBundleId(newId);
      setCreatedBundleTitle(title);

      toast({
        title: "Bundle Created",
        description: "Your bundle was saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh bundles list
      setBundles(prev => [...prev, { id: newId, ...bundleData }]);

      // Reset form
      setTitle("");
      setExam("");
      setSubExamCategory("");
      setSubject("");
      setPrice("");
      setStatus("draft");
      setPromoteBundle(false);
      setSelectedTestIds([]);
      setImageFile(null);
      onClose();
    } catch (error) {
      console.error("Error creating bundle:", error);
      toast({
        title: "Error",
        description: "Could not create bundle. Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const toggleTestSelection = (testId) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  if (loading || loadingUser) {
    return <Center h="200px"><Spinner size="xl" /></Center>;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Manage Bundles</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Create Bundle
        </Button>
      </Flex>

      {bundles.length === 0 ? (
        <Card p={6} textAlign="center" variant="outline">
          <CardBody>
            <Heading size="md" mb={2}>No bundles found</Heading>
            <Text mb={4}>
              Start by adding your first bundle.
            </Text>
            <Button colorScheme="blue" onClick={onOpen}>Create Bundle</Button>
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
                    <Th>Sub-Exam</Th>
                    <Th>Subject</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Tests</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bundles.map((bundle) => (
                    <Tr key={bundle.id} _hover={{ bg: 'gray.50' }}>
                      <Td>{bundle.title}</Td>
                      <Td>{bundle.subExamCategory}</Td>
                      <Td>{bundle.subject}</Td>
                      <Td>₹{bundle.price}</Td>
                      <Td>
                        <Text fontWeight="bold" color={bundle.status === "live" ? "green.600" : "gray.600"}>
                          {bundle.status}
                        </Text>
                      </Td>
                      <Td>{bundle.testIds?.length || 0}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create Bundle */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Bundle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={8}>
              {/* Bundle Info Card */}
              <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="sm">
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Bundle Title</FormLabel>
                    <Input
                      variant="filled"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. SSC Reasoning Pack"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Exam</FormLabel>
                    <Select
                      placeholder="Select Main Exam Category"
                      value={exam}
                      onChange={e => {
                        setExam(e.target.value);
                        setSubExamCategory(""); // Reset sub exam when main exam changes
                      }}
                      variant="filled"
                    >
                      {examCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Sub Exam Category</FormLabel>
                    <Select
                      placeholder="Select Sub Exam Category"
                      value={subExamCategory}
                      onChange={e => setSubExamCategory(e.target.value)}
                      variant="filled"
                      isDisabled={!exam}
                    >
                      {subExamOptions.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Input
                      variant="filled"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Reasoning, Physics"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Price (INR)</FormLabel>
                    <Input
                      variant="filled"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 199"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Bundle Image</FormLabel>
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </FormControl>
                </Stack>
              </Box>

              {/* Test Selection Card */}
              <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="sm">
                <FormControl>
                  <FormLabel>Select Tests to Include (Minimum 15 Tests)</FormLabel>
                  {tests.length === 0 ? (
                    <Text color="gray.500">
                      No tests available yet. You can create them after saving the bundle.
                    </Text>
                  ) : (
                    <Flex
                      direction="column"
                      gap={2}
                      height="180px"
                      overflowY="auto"
                      border="1px solid #ccc"
                      p={3}
                      borderRadius="md"
                    >
                      {tests.map((test) => (
                        <Checkbox
                          key={test.id}
                          isChecked={selectedTestIds.includes(test.id)}
                          onChange={() => toggleTestSelection(test.id)}
                        >
                          <Box>
                            <Text fontWeight="medium">{test.testName}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {test.subject} • {test.duration} min
                            </Text>
                          </Box>
                        </Checkbox>
                      ))}
                    </Flex>
                  )}
                </FormControl>
              </Box>

              {/* Status and Promotion */}
              <Flex
                bg="gray.50"
                p={6}
                borderRadius="lg"
                boxShadow="sm"
                gap={6}
                direction={{ base: "column", md: "row" }}
                align="stretch"
              >
                <Box flex={1}>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </Select>
                  </FormControl>
                </Box>
                <Box
                  flex={1}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="flex-start"
                  px={{ md: 4 }}
                >
                  <Checkbox
                    isChecked={promoteBundle}
                    onChange={(e) => setPromoteBundle(e.target.checked)}
                    colorScheme="purple"
                    size="lg"
                    mb={1}
                  >
                    <Text fontWeight="semibold" as="span">
                      Promote this bundle
                    </Text>
                  </Checkbox>
                  <Text fontSize="sm" color="gray.500" pl={7}>
                    Promoted bundles are featured on the homepage and get more visibility.
                  </Text>
                </Box>
              </Flex>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" isLoading={formLoading} onClick={handleSubmit}>
              Create Bundle
            </Button>
            <Button onClick={onClose} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}