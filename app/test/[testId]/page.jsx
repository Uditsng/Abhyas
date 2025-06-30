// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
// import { Box, Heading, Text, Button, Flex, Progress, Radio, RadioGroup, Stack, useToast, Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, VStack, HStack, Badge, Tooltip, IconButton, } from '@chakra-ui/react';
// import { CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
// import { getTestDetails } from '@/lib/tests';
// import { saveTestResult } from '@/lib/testResultService';
// import { useAuth } from '@/components/AuthContext';
// import { saveBookmark, removeBookmark } from '@/lib/bookmarkService';
// import SubscriptionAccessGuard from '@/components/SubscriptionAccessGuard';

// export default function TestPage() {
//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   // Use params for testId and searchParams for courseId
//   const testId = params.testId;
//   const courseId = searchParams.get('courseid'); // Get courseId from query params
//   const toast = useToast();
//   const { user } = useAuth();

//   const [testData, setTestData] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});

//   const { isOpen, onOpen, onClose } = useDisclosure(); // For confirmation modal

//   // Fetch test data
//   useEffect(() => {
//     const fetchTestData = async () => {
//       if (!testId || !courseId) { // Ensure courseId is available
//         setLoading(false);
//         if (!courseId) {
//           toast({
//             title: "Missing Course ID",
//             description: "Course ID is required to load this test.",
//             status: "error",
//             duration: 5000,
//             isClosable: true,
//           });
//           router.push('/dashboard'); // Redirect if courseId is missing
//         }
//         return;
//       }

//       try {
//         const fetchedData = await getTestDetails(courseId, testId); // Use courseId here

//         if (fetchedData) {
//           setTestData(fetchedData);
//           setTimeLeft(fetchedData.duration * 60); // Convert minutes to seconds
//         } else {
//           toast({
//             title: "Test not found",
//             description: `Could not find test with ID: ${testId} in course ${courseId}`,
//             status: "error",
//             duration: 5000,
//             isClosable: true,
//           });
//           router.push('/dashboard'); // Redirect if test not found
//         }
//       } catch (error) {
//         console.error("Error fetching test data:", error);
//         toast({
//           title: "Error loading test",
//           description: "Failed to load test data. Please try again later.",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//         });
//         router.push('/dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTestData();
//   }, [testId, courseId, router, toast]); // Add courseId to dependency array

//   // Timer effect
//   useEffect(() => {
//     if (timeLeft <= 0 || !testData) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prevTime) => prevTime - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, testData]);

//   // Auto-submit when time runs out
//   useEffect(() => {
//     if (timeLeft <= 0 && testData && !submitting) {
//       handleSubmitTest();
//     }
//   }, [timeLeft, testData, submitting]);

//   // Load bookmarked questions from localStorage
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
//         if (storedBookmarks) {
//           setBookmarkedQuestions(JSON.parse(storedBookmarks));
//         }
//       } catch (error) {
//         console.error("Error loading bookmarks from local storage:", error);
//       }
//     }
//   }, []);

//   const handleAnswerChange = (questionId, selectedOption) => {
//     setUserAnswers((prevAnswers) => ({
//       ...prevAnswers,
//       [questionId]: selectedOption,
//     }));
//   };

//   const goToNextQuestion = () => {
//     if (currentQuestionIndex < testData.questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const goToPreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const goToQuestion = (index) => {
//     setCurrentQuestionIndex(index);
//   };

//   const calculateScore = useCallback(() => {
//     let correctCount = 0;
//     testData.questions.forEach((question) => {
//       if (userAnswers[question.id] === question.answer) {
//         correctCount++;
//       }
//     });
//     return correctCount;
//   }, [testData, userAnswers]);

//   const handleSubmitTest = async () => {
//     setSubmitting(true);
//     const score = calculateScore();
//     const totalQuestions = testData.questions.length;

//     const result = {
//       testId: testId, // Use from params
//       courseId: courseId, // Use from params
//       title: testData.title,
//       score: score,
//       totalQuestions: totalQuestions,
//       answers: userAnswers,
//       durationTaken: testData.duration * 60 - timeLeft, // Time taken in seconds
//       date: new Date().toISOString(),
//     };

//     console.log('Submitting result:', result);

//     try {
//       if (user) {
//         await saveTestResult(user.uid, result);
//       } else {
//         // Save to local storage for mock users or non-logged-in users
//         const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
//         localStorage.setItem('testResults', JSON.stringify([...existingResults, result]));
//       }

//       toast({
//         title: "Test Submitted",
//         description: `You scored ${score} out of ${totalQuestions}!`,
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//       // Always use params for redirect
//       router.push(`/results/${courseId}/${testId}`); // Redirect to results page with courseId and testId
//     } catch (error) {
//       console.error("Error submitting test:", error);
//       toast({
//         title: "Submission Failed",
//         description: "There was an error submitting your test. Please try again.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setSubmitting(false);
//       onClose(); // Close modal if open
//     }
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const toggleBookmark = async (questionId) => {
//     const bookmarkKey = `${testData.id}_${questionId}`;
//     const newBookmarks = { ...bookmarkedQuestions };

//     try {
//       if (newBookmarks[bookmarkKey]) {
//         // If already bookmarked, remove it
//         if (user) {
//           await removeBookmark(user.uid, bookmarkKey);
//         } else {
//           delete newBookmarks[bookmarkKey];
//           localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
//         }
//         delete newBookmarks[bookmarkKey];
//         setBookmarkedQuestions(newBookmarks);
//         toast({
//           title: "Bookmark removed",
//           status: "info",
//           duration: 2000,
//           isClosable: true,
//         });
//       } else {
//         // If not bookmarked, add it with test info
//         const bookmarkData = {
//           testId: testData.testId,
//           courseId: testData.courseId,
//           testTitle: testData.title,
//           questionId: questionId,
//           question: testData.questions[currentQuestionIndex].question,
//           date: new Date().toISOString(),
//         };
//         if (user) {
//           await saveBookmark(user.uid, bookmarkKey, bookmarkData);
//         } else {
//           newBookmarks[bookmarkKey] = bookmarkData;
//           localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
//         }
//         newBookmarks[bookmarkKey] = bookmarkData;
//         setBookmarkedQuestions(newBookmarks);
//         toast({
//           title: "Bookmarked!",
//           status: "success",
//           duration: 2000,
//           isClosable: true,
//         });
//       }
//     } catch (error) {
//       console.error('Error toggling bookmark:', error);
//       toast({
//         title: "Error",
//         description: "Could not update bookmark",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   if (loading || !testData) {
//     return (
//       <Center h="100vh">
//         <Spinner size="xl" />
//         <Text ml={4}>Loading test...</Text>
//       </Center>
//     );
//   }

//   const currentQuestion = testData.questions[currentQuestionIndex];
//   const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;
//   const isBookmarked = bookmarkedQuestions[`${testData.id}_${currentQuestion.id}`] !== undefined;

//   return (
//     <SubscriptionAccessGuard testId={testId} courseId={courseId}>
//       <Flex direction={{ base: 'column', md: 'row' }} p={4} maxW="1200px" mx="auto" minH="100vh">
//         {/* Main Test Area */}
//         <Box flex={1} mr={{ md: 4 }} mb={{ base: 4, md: 0 }}>
//           <Heading as="h1" size="lg" mb={4}>{testData.title}</Heading>

//           {/* Progress Bar */}
//           <Flex align="center" mb={4}>
//             <Text mr={2}>{currentQuestionIndex + 1} / {testData.questions.length}</Text>
//             <Progress value={progress} flex={1} size="sm" colorScheme="blue" />
//             <Text ml={4} fontWeight="bold">{formatTime(timeLeft)}</Text>
//           </Flex>

//           {/* Question Card */}
//           <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} bg="white" _dark={{ bg: "gray.800" }}>
//             <Flex justify="space-between" align="center" mb={4}>
//               <Heading as="h2" size="md">Question {currentQuestionIndex + 1}</Heading>
//               <IconButton
//                 icon={<StarIcon />}
//                 aria-label="Bookmark question"
//                 size="sm"
//                 colorScheme={isBookmarked ? "yellow" : "gray"}
//                 onClick={() => toggleBookmark(currentQuestion.id)}
//                 title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
//               />
//             </Flex>
//             <Text fontSize="lg" mb={4}>{currentQuestion.question}</Text>

//             <RadioGroup
//               onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
//               value={userAnswers[currentQuestion.id] || ''}
//             >
//               <Stack direction="column" spacing={3}>
//                 {currentQuestion.options.map((option, index) => (
//                   <Radio key={index} value={option} size="lg">
//                     {option}
//                   </Radio>
//                 ))}
//               </Stack>
//             </RadioGroup>
//           </Box>

//           {/* Navigation Buttons */}
//           <Flex justify="space-between">
//             <Button onClick={goToPreviousQuestion} isDisabled={currentQuestionIndex === 0}>
//               Previous
//             </Button>
//             {currentQuestionIndex === testData.questions.length - 1 ? (
//               <Button colorScheme="green" onClick={onOpen} isLoading={submitting}>
//                 Submit Test
//               </Button>
//             ) : (
//               <Button colorScheme="blue" onClick={goToNextQuestion}>
//                 Next
//               </Button>
//             )}
//           </Flex>
//         </Box>

//         {/* Question Palette / Sidebar */}
//         <Box
//           w={{ base: '100%', md: '250px' }}
//           borderWidth="1px"
//           borderRadius="lg"
//           p={4}
//           bg="white"
//           _dark={{ bg: "gray.800" }}
//           h="fit-content"
//           position={{ md: 'sticky' }}
//           top={{ md: '4' }}
//         >
//           <Heading size="md" mb={4}>Question Palette</Heading>
//           <SimpleGrid columns={5} spacing={2}>
//             {testData.questions.map((question, index) => (
//               <Button
//                 key={question.id}
//                 size="sm"
//                 onClick={() => goToQuestion(index)}
//                 colorScheme={userAnswers[question.id] ? 'green' : 'gray'}
//                 variant={currentQuestionIndex === index ? 'solid' : 'outline'}
//               >
//                 {index + 1}
//               </Button>
//             ))}
//           </SimpleGrid>

//           <VStack mt={6} spacing={3} align="stretch">
//             <Button colorScheme="green" onClick={onOpen} isLoading={submitting}>
//               Submit Test
//             </Button>
//             <Button onClick={() => router.push(`/results/${courseId}/${testId}`)} variant="outline">
//               Exit Test
//             </Button>
//           </VStack>
//         </Box>

//         {/* Submission Confirmation Modal */}
//         <Modal isOpen={isOpen} onClose={onClose}>
//           <ModalOverlay />
//           <ModalContent>
//             <ModalHeader>Confirm Submission</ModalHeader>
//             <ModalCloseButton />
//             <ModalBody>
//               Are you sure you want to submit the test? You will not be able to change your answers after submission.
//             </ModalBody>
//             <ModalFooter>
//               <Button variant="ghost" onClick={onClose}>Cancel</Button>
//               <Button colorScheme="green" ml={3} onClick={handleSubmitTest} isLoading={submitting}>
//                 Submit
//               </Button>
//             </ModalFooter>
//           </ModalContent>
//         </Modal>
//       </Flex>
//     </SubscriptionAccessGuard>
//   );
// }
