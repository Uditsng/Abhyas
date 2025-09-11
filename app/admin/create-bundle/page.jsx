"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Stack,
  Checkbox,
  Text,
  Flex,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebaseConfig";
import { getAllTests } from "@/lib/adminTestsService";
import {
  getAllBundles,
  createBundle,
  uploadBundleImage,
} from "@/lib/bundleService";
import { getAllExams } from "@/lib/superAdminExamsService";
import { FaPlus } from "react-icons/fa";
import ImageCropper from "@/components/ImageCropper";
import {getUserProfile} from '@/lib/userService';
import Pagination from '@/components/Pagination'

export default function CreateBundlePage() {
  const [user, loadingUser] = useAuthState(auth);
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState("");
  const [subExamCategory, setSubExamCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promoteBundle, setPromoteBundle] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [instructorImageFile, setInstructorImageFile] = useState(null);
  const [instructorImageUrl, setInstructorImageUrl] = useState('');

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  //Auto-fetch admin data
  useEffect(() =>{
    async function fetchAdminData(){
      if(user){
        const adminProfile = await getUserProfile(user.uid)
        if(adminProfile){
          setInstructorName(adminProfile.name || '');
          setInstructorBio(adminProfile.bio || '');
          if (adminProfile.photoURL) {
              setInstructorImageUrl(adminProfile.photoURL);
          }
        }
      }
    }
    fetchAdminData();
  },[user]);

  // Fetch bundles, tests, exams
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (!user) return;
        const [allBundles, allTests, allExams] = await Promise.all([
          getAllBundles(user.uid),
          getAllTests(user.uid),
          getAllExams(),
        ]);
        setBundles(allBundles);
        setTests(allTests);
        setExams(allExams);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data.",
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

  useEffect(() => {
    const filtered = bundles.filter((bundle) =>
      bundle.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBundles(filtered);
    setCurrentPage(1);
  }, [searchQuery, bundles]);

  const examCategoryMap = exams.reduce((acc, exam) => {
    if (!acc[exam.category]) acc[exam.category] = [];
    if (!acc[exam.category].includes(exam.subCategory))
      acc[exam.category].push(exam.subCategory);
    return acc;
  }, {});
  const examCategories = Object.keys(examCategoryMap);
  const subExamOptions = examCategoryMap[exam] || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedTestIds.length < 15) {
      toast({
        title: "Warning",
        description: "Please select at least 15 tests to create a bundle.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!title || !exam || !subject || !price || !description) {
      toast({
        title: "Validation Error",
        description: "All required fields must be filled.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (originalPrice && parseFloat(originalPrice) <= parseFloat(price)) {
      toast({
        title: "Invalid Pricing",
        description: "Original price must be higher than the actual price.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Validation Error",
        description: "Bundle image is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormLoading(true);
    try {
      const imageURL = await uploadBundleImage(imageFile);
      const instructorImageURL = instructorImageFile
        ? await uploadBundleImage(instructorImageFile)
        : "";

      const bundleData = {
        title,
        exam,
        subExamCategory,
        subject,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        testIds: selectedTestIds,
        promote: promoteBundle,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        imageUrl: imageURL,
        description,
        features: features
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        instructor: {
          name: instructorName,
          bio: instructorBio,
          imageUrl: instructorImageURL,
        },
      };

      const newId = await createBundle(bundleData);
      toast({
        title: "Bundle Created",
        description: "Bundle created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const newBundle = { id: newId, ...bundleData };
      setBundles((prev) => [...prev, newBundle]);

      // Reset fields
      setTitle("");
      setExam("");
      setSubExamCategory("");
      setSubject("");
      setPrice("");
      setPromoteBundle(false);
      setSelectedTestIds([]);
      setImageFile(null);
      setDescription("");
      setFeatures("");
      setInstructorName("");
      setInstructorBio("");
      setInstructorImageFile(null);
      onClose();
    } catch (error) {
      console.error("Create bundle failed:", error);
      toast({
        title: "Error",
        description: "Failed to create bundle. Try again.",
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

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const displayedBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading || loadingUser) {
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
          Manage Bundles
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-4 md:px-0 gap-3">
          <input
            type="text"
            placeholder="Search by bundle title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlus />
            Create Bundle
          </button>
        </div>

        {/* Empty State */}
        {filteredBundles === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md px-6 py-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No bundles found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start by adding your first bundle.
            </p>
            <button
              onClick={onOpen}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition"
            >
              <FaPlus />
              Create Bundle
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Sub-Exam</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Tests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {displayedBundles.map((bundle) => (
                  <tr
                    key={bundle.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bundle.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bundle.subExamCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bundle.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{bundle.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bundle.testIds?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}/>

        {/* Modal */}

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Bundle</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={8}>
                {/* Bundle Info Section */}
                <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Bundle Title</FormLabel>
                      <Input
                        variant="filled"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Exam</FormLabel>
                      <Select
                        variant="filled"
                        placeholder="Select Exam"
                        value={exam}
                        onChange={(e) => {
                          setExam(e.target.value);
                          setSubExamCategory("");
                        }}
                      >
                        {examCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Sub Exam Category</FormLabel>
                      <Select
                        variant="filled"
                        placeholder="Select Sub Exam"
                        value={subExamCategory}
                        onChange={(e) => setSubExamCategory(e.target.value)}
                        isDisabled={!exam}
                      >
                        {subExamOptions.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Subject</FormLabel>
                      <Input
                        variant="filled"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Price (INR)</FormLabel>
                      <Input
                        type="number"
                        variant="filled"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </FormControl>

                    {/**Discounted price > price */}
                    <FormControl>
                      <FormLabel>Original Price (for discount display)</FormLabel>
                      <Input
                        type="number"
                        variant="filled"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 999"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <ImageCropper
                        label="Bundle Poster Image"
                        aspect={16 / 9}
                        maxWidth={1000}
                        maxHeight={562}
                        maxSizeMB={1}
                        shape="rect"
                        onCropComplete={(file) => setImageFile(file)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Bundle Description</FormLabel>
                      <Input
                        as="textarea"
                        rows={3}
                        variant="filled"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Bundle Features (one per line)</FormLabel>
                      <Input
                        as="textarea"
                        rows={4}
                        variant="filled"
                        value={features}
                        onChange={(e) => setFeatures(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Instructor Name</FormLabel>
                      <Input
                        variant="filled"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Instructor Bio</FormLabel>
                      <Input
                        variant="filled"
                        value={instructorBio}
                        onChange={(e) => setInstructorBio(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Instructor Image</FormLabel>
            {instructorImageUrl && !instructorImageFile && (
                <div className="flex items-center gap-4 mb-4">
                    <img src={instructorImageUrl} alt="Instructor" className="w-24 h-24 rounded-full object-cover" />
                    <Button size="sm" onClick={() => setInstructorImageUrl('')}>Change Image</Button>
                </div>
            )}

            {(!instructorImageUrl || instructorImageFile) && (
                      <ImageCropper
                        label="Admin Image"
                        aspect={1}
                        maxWidth={300}
                        maxHeight={300}
                        maxSizeMB={1}
                        shape="circle"
                        onCropComplete={(file) => setInstructorImageFile(file)}
                      />
            )}
                    </FormControl>
                  </Stack>
                </Box>

                {/* Test Selector */}
                <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                  <FormControl>
                    <FormLabel>Select Tests (Min: 15)</FormLabel>
                    <Flex
                      direction="column"
                      gap={2}
                      height="180px"
                      overflowY="auto"
                      border="1px solid"
                      borderColor={borderColor}
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
                  </FormControl>
                </Box>

                {/* Status and Promote */}
                <Flex
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  boxShadow="sm"
                  gap={6}
                  direction={{ base: "column", md: "row" }}
                >
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
                      Promoted bundles get more visibility.
                    </Text>
                  </Box>
                </Flex>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                isLoading={formLoading}
                onClick={handleSubmit}
                disabled={selectedTestIds.length < 15}
              >
                Create Bundle
              </Button>
              <Button onClick={onClose} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
