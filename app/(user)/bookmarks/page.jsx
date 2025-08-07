// 'use client';

// // Bookmarks: page.jsx allows users to view saved questions or tests.

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '@/lib/firebaseConfig';
// import {
//   getUserBookmarks,
//   removeBookmark,
//   clearAllBookmarks
// } from '@/lib/bookmarkService';
// import {
//   Box,
//   Heading,
//   Text,
//   Button,
//   Flex,
//   Card,
//   CardBody,
//   Stack,
//   Badge,
//   IconButton,
//   Divider,
//   useToast,
//   SimpleGrid,
//   Select,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Spinner,
// } from '@chakra-ui/react';
// import {
//   StarIcon,
//   DeleteIcon,
//   SearchIcon,
//   ExternalLinkIcon,
//   RepeatIcon, // Using RepeatIcon instead of SyncIcon which doesn't exist
// } from '@chakra-ui/icons';

// export default function BookmarksPage() {
//   const router = useRouter();
//   const toast = useToast();
//   const [user, authLoading] = useAuthState(auth);

//   // State variables
//   const [bookmarks, setBookmarks] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSyncing, setIsSyncing] = useState(false);

//   // Load bookmarked questions
//   useEffect(() => {
//     async function loadBookmarks() {
//       setLoading(true);

//       try {
//         if (user) {
//           // Get bookmarks from Firebase
//           const userBookmarks = await getUserBookmarks(user.uid);
//           setBookmarks(userBookmarks);
//         } else if (!authLoading) {
//           // If not logged in, use local storage
//           const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
//           if (storedBookmarks) {
//             setBookmarks(JSON.parse(storedBookmarks));
//           }
//         }
//       } catch (error) {
//         console.error('Error loading bookmarks:', error);
//         toast({
//           title: "Error loading bookmarks",
//           description: "Please try again later",
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });

//         // Fallback to local storage
//         const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
//         if (storedBookmarks) {
//           setBookmarks(JSON.parse(storedBookmarks));
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (!authLoading) {
//       loadBookmarks();
//     }
//   }, [user, authLoading, toast]);

//   // Remove a bookmark
//   const handleRemoveBookmark = async (bookmarkKey) => {
//     try {
//       if (user) {
//         // Remove from Firebase
//         await removeBookmark(user.uid, bookmarkKey);
//       } else {
//         // Remove from local storage only
//         const newBookmarks = { ...bookmarks };
//         delete newBookmarks[bookmarkKey];
//         localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
//       }

//       // Update state
//       setBookmarks(prev => {
//         const newBookmarks = { ...prev };
//         delete newBookmarks[bookmarkKey];
//         return newBookmarks;
//       });

//       toast({
//         title: "Bookmark removed",
//         status: "info",
//         duration: 2000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Error removing bookmark:', error);
//       toast({
//         title: "Error removing bookmark",
//         description: "Please try again",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Clear all bookmarks
//   const handleClearAllBookmarks = async () => {
//     try {
//       if (user) {
//         // Clear from Firebase
//         await clearAllBookmarks(user.uid);
//       } else {
//         // Clear from local storage only
//         localStorage.setItem('bookmarkedQuestions', JSON.stringify({}));
//       }

//       // Update state
//       setBookmarks({});

//       toast({
//         title: "All bookmarks cleared",
//         status: "info",
//         duration: 2000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Error clearing bookmarks:', error);
//       toast({
//         title: "Error clearing bookmarks",
//         description: "Please try again",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Sync bookmarks manually
//   const handleSyncBookmarks = async () => {
//     if (!user) {
//       toast({
//         title: "Not logged in",
//         description: "Please log in to sync bookmarks",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       setIsSyncing(true);
//       const syncedBookmarks = await syncBookmarks(user.uid);

//       if (syncedBookmarks) {
//         setBookmarks(syncedBookmarks);
//         toast({
//           title: "Bookmarks synced",
//           description: "Your bookmarks are now synced across devices",
//           status: "success",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     } catch (error) {
//       console.error('Error syncing bookmarks:', error);
//       toast({
//         title: "Sync failed",
//         description: "Could not sync bookmarks",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   // Filter and search bookmarks
//   const filteredBookmarks = Object.entries(bookmarks)
//     .filter(([key, bookmark]) => {
//       // Apply course filter
//       if (filter !== 'all' && bookmark.courseId !== filter) {
//         return false;
//       }

//       // Apply search query
//       if (searchQuery && !bookmark.question.toLowerCase().includes(searchQuery.toLowerCase())) {
//         return false;
//       }

//       return true;
//     })
//     .sort((a, b) => {
//       // Sort by date (newest first)
//       const dateA = a[1].date ? new Date(a[1].date) : new Date(0);
//       const dateB = b[1].date ? new Date(b[1].date) : new Date(0);
//       return dateB - dateA;
//     });

//   // Get unique course IDs for filter dropdown
//   const courseIds = [...new Set(Object.values(bookmarks).map(bookmark => bookmark.courseId))];

//   // If still loading
//   if (loading || authLoading) {
//     return (
//       <Box p={8} maxW="1200px" mx="auto" textAlign="center">
//         <Spinner size="xl" />
//         <Text mt={4}>Loading bookmarks...</Text>
//       </Box>
//     );
//   }

//   return (
//     <Box p={4} maxW="1200px" mx="auto" className="min-h-screen">
//       <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
//         <Heading size="lg">Bookmarked Questions</Heading>

//         <Flex gap={2}>
//           {user && (
//             <Button
//               leftIcon={<RepeatIcon />}
//               colorScheme="green"
//               variant="outline"
//               onClick={handleSyncBookmarks}
//               isLoading={isSyncing}
//               loadingText="Syncing"
//             >
//               Sync
//             </Button>
//           )}

//           <Button
//             colorScheme="blue"
//             onClick={() => router.push('/dashboard')}
//           >
//             Back to Dashboard
//           </Button>
//         </Flex>
//       </Flex>

//       {!user && (
//         <Box mb={6} p={4} bg="blue.50" _dark={{ bg: "blue.900" }} borderRadius="md">
//           <Flex align="center">
//             <InfoIcon mr={2} color="blue.500" _dark={{ color: "blue.300" }} />
//             <Text>
//               <strong>Note:</strong> Log in to sync your bookmarks across devices.
//               {' '}
//               <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
//                 Log in now
//               </Link>
//             </Text>
//           </Flex>
//         </Box>
//       )}

//       {/* Filters and search */}
//       <Flex mb={6} gap={4} flexWrap="wrap">
//         <Box flex="1" minW="200px">
//           <Select
//             placeholder="Filter by course"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             <option value="all">All Courses</option>
//             {courseIds.map(courseId => (
//               <option key={courseId} value={courseId}>
//                 {courseId.toUpperCase()}
//               </option>
//             ))}
//           </Select>
//         </Box>

//         <Box flex="2" minW="300px">
//           <InputGroup>
//             <InputLeftElement pointerEvents="none">
//               <SearchIcon color="gray.300" />
//             </InputLeftElement>
//             <Input
//               placeholder="Search questions..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </InputGroup>
//         </Box>

//         <Button
//           colorScheme="red"
//           variant="outline"
//           onClick={handleClearAllBookmarks}
//           isDisabled={Object.keys(bookmarks).length === 0}
//         >
//           Clear All
//         </Button>
//       </Flex>

//       {/* Bookmarks list */}
//       {filteredBookmarks.length > 0 ? (
//         <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
//           {filteredBookmarks.map(([key, bookmark]) => (
//             <Card key={key} variant="outline" size="md">
//               <CardBody>
//                 <Flex justify="space-between" align="start" mb={2}>
//                   <Badge colorScheme="blue" mb={2}>
//                     {bookmark.courseId.toUpperCase()}
//                   </Badge>
//                   <IconButton
//                     icon={<DeleteIcon />}
//                     aria-label="Remove bookmark"
//                     size="sm"
//                     colorScheme="red"
//                     variant="ghost"
//                     onClick={() => handleRemoveBookmark(key)}
//                   />
//                 </Flex>

//                 <Text fontWeight="bold" mb={2} noOfLines={2}>
//                   {bookmark.question}
//                 </Text>

//                 <Text fontSize="sm" color="gray.500" mb={3}>
//                   From: {bookmark.testTitle}
//                 </Text>

//                 <Divider mb={3} />

//                 <Flex justify="space-between" align="center">
//                   <Text fontSize="xs" color="gray.500">
//                     {bookmark.date ? new Date(bookmark.date).toLocaleDateString() : 'Unknown date'}
//                   </Text>

//                   <Link href={`/review/${bookmark.testId}?q=${bookmark.questionId}`}>
//                     <Button
//                       size="sm"
//                       colorScheme="blue"
//                       variant="outline"
//                       rightIcon={<ExternalLinkIcon />}
//                     >
//                       Review
//                     </Button>
//                   </Link>
//                 </Flex>
//               </CardBody>
//             </Card>
//           ))}
//         </SimpleGrid>
//       ) : (
//         <Box textAlign="center" p={10} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="md">
//           <StarIcon boxSize={10} color="gray.300" _dark={{ color: "gray.500" }} mb={4} />
//           <Heading size="md" mb={2}>No bookmarks found</Heading>
//           <Text color="gray.500" _dark={{ color: "gray.400" }} mb={6}>
//             {Object.keys(bookmarks).length === 0
//               ? "You haven't bookmarked any questions yet."
//               : "No questions match your current filters."}
//           </Text>

//           {Object.keys(bookmarks).length === 0 ? (
//             <Link href="/dashboard">
//               <Button colorScheme="blue">
//                 Take a Test
//               </Button>
//             </Link>
//           ) : (
//             <Button
//               onClick={() => {
//                 setFilter('all');
//                 setSearchQuery('');
//               }}
//             >
//               Clear Filters
//             </Button>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }


// 'use client';

// // Bookmarks: page.jsx allows users to view saved questions or tests.

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '@/lib/firebaseConfig';
// import {
//   getUserBookmarks,
//   removeBookmark,
//   clearAllBookmarks
// } from '@/lib/bookmarkService';
// import {
//   Box,
//   Heading,
//   Text,
//   Button,
//   Flex,
//   Card,
//   CardBody,
//   Stack,
//   Badge,
//   IconButton,
//   Divider,
//   useToast,
//   SimpleGrid,
//   Select,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Spinner,
// } from '@chakra-ui/react';
// import {
//   StarIcon,
//   DeleteIcon,
//   SearchIcon,
//   ExternalLinkIcon,
//   RepeatIcon, // Using RepeatIcon instead of SyncIcon which doesn't exist
// } from '@chakra-ui/icons';

// export default function BookmarksPage() {
//   const router = useRouter();
//   const toast = useToast();
//   const [user, authLoading] = useAuthState(auth);

//   // State variables
//   const [bookmarks, setBookmarks] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSyncing, setIsSyncing] = useState(false);

//   // Load bookmarked questions
//   useEffect(() => {
//     async function loadBookmarks() {
//       setLoading(true);

//       try {
//         if (user) {
//           // Get bookmarks from Firebase
//           const userBookmarks = await getUserBookmarks(user.uid);
//           setBookmarks(userBookmarks);
//         } else if (!authLoading) {
//           // If not logged in, use local storage
//           const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
//           if (storedBookmarks) {
//             setBookmarks(JSON.parse(storedBookmarks));
//           }
//         }
//       } catch (error) {
//         console.error('Error loading bookmarks:', error);
//         toast({
//           title: "Error loading bookmarks",
//           description: "Please try again later",
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });

//         // Fallback to local storage
//         const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
//         if (storedBookmarks) {
//           setBookmarks(JSON.parse(storedBookmarks));
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (!authLoading) {
//       loadBookmarks();
//     }
//   }, [user, authLoading, toast]);

//   // Remove a bookmark
//   const handleRemoveBookmark = async (bookmarkKey) => {
//     try {
//       if (user) {
//         // Remove from Firebase
//         await removeBookmark(user.uid, bookmarkKey);
//       } else {
//         // Remove from local storage only
//         const newBookmarks = { ...bookmarks };
//         delete newBookmarks[bookmarkKey];
//         localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
//       }

//       // Update state
//       setBookmarks(prev => {
//         const newBookmarks = { ...prev };
//         delete newBookmarks[bookmarkKey];
//         return newBookmarks;
//       });

//       toast({
//         title: "Bookmark removed",
//         status: "info",
//         duration: 2000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Error removing bookmark:', error);
//       toast({
//         title: "Error removing bookmark",
//         description: "Please try again",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Clear all bookmarks
//   const handleClearAllBookmarks = async () => {
//     try {
//       if (user) {
//         // Clear from Firebase
//         await clearAllBookmarks(user.uid);
//       } else {
//         // Clear from local storage only
//         localStorage.setItem('bookmarkedQuestions', JSON.stringify({}));
//       }

//       // Update state
//       setBookmarks({});

//       toast({
//         title: "All bookmarks cleared",
//         status: "info",
//         duration: 2000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Error clearing bookmarks:', error);
//       toast({
//         title: "Error clearing bookmarks",
//         description: "Please try again",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Sync bookmarks manually
//   const handleSyncBookmarks = async () => {
//     if (!user) {
//       toast({
//         title: "Not logged in",
//         description: "Please log in to sync bookmarks",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     try {
//       setIsSyncing(true);
//       const syncedBookmarks = await syncBookmarks(user.uid);

//       if (syncedBookmarks) {
//         setBookmarks(syncedBookmarks);
//         toast({
//           title: "Bookmarks synced",
//           description: "Your bookmarks are now synced across devices",
//           status: "success",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     } catch (error) {
//       console.error('Error syncing bookmarks:', error);
//       toast({
//         title: "Sync failed",
//         description: "Could not sync bookmarks",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   // Filter and search bookmarks
//   const filteredBookmarks = Object.entries(bookmarks)
//     .filter(([key, bookmark]) => {
//       // Apply course filter
//       if (filter !== 'all' && bookmark.courseId !== filter) {
//         return false;
//       }

//       // Apply search query
//       if (searchQuery && !bookmark.question.toLowerCase().includes(searchQuery.toLowerCase())) {
//         return false;
//       }

//       return true;
//     })
//     .sort((a, b) => {
//       // Sort by date (newest first)
//       const dateA = a[1].date ? new Date(a[1].date) : new Date(0);
//       const dateB = b[1].date ? new Date(b[1].date) : new Date(0);
//       return dateB - dateA;
//     });

//   // Get unique course IDs for filter dropdown, filtering out any undefined values
//   const courseIds = [...new Set(Object.values(bookmarks).map(bookmark => bookmark.courseId))].filter(Boolean);

//   // If still loading
//   if (loading || authLoading) {
//     return (
//       <Box p={8} maxW="1200px" mx="auto" textAlign="center">
//         <Spinner size="xl" />
//         <Text mt={4}>Loading bookmarks...</Text>
//       </Box>
//     );
//   }

//   return (
//     <Box p={4} pt={24} maxW="1200px" mx="auto" className="min-h-screen">
//       <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
//         <Heading size="lg">Bookmarked Questions</Heading>

//         <Flex gap={2}>
//           {user && (
//             <Button
//               leftIcon={<RepeatIcon />}
//               colorScheme="green"
//               variant="outline"
//               onClick={handleSyncBookmarks}
//               isLoading={isSyncing}
//               loadingText="Syncing"
//             >
//               Sync
//             </Button>
//           )}

//           <Button
//             colorScheme="blue"
//             onClick={() => router.push('/dashboard')}
//           >
//             Back to Dashboard
//           </Button>
//         </Flex>
//       </Flex>

//       {!user && (
//         <Box mb={6} p={4} bg="blue.50" _dark={{ bg: "blue.900" }} borderRadius="md">
//           <Flex align="center">
//             <InfoIcon mr={2} color="blue.500" _dark={{ color: "blue.300" }} />
//             <Text>
//               <strong>Note:</strong> Log in to sync your bookmarks across devices.
//               {' '}
//               <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
//                 Log in now
//               </Link>
//             </Text>
//           </Flex>
//         </Box>
//       )}

//       {/* Filters and search */}
//       <Flex mb={6} gap={4} flexWrap="wrap">
//         <Box flex="1" minW="200px">
//           <Select
//             placeholder="Filter by course"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             <option value="all">All Courses</option>
//             {courseIds.map(courseId => (
//               <option key={courseId} value={courseId}>
//                 {courseId.toUpperCase()}
//               </option>
//             ))}
//           </Select>
//         </Box>

//         <Box flex="2" minW="300px">
//           <InputGroup>
//             <InputLeftElement pointerEvents="none">
//               <SearchIcon color="gray.300" />
//             </InputLeftElement>
//             <Input
//               placeholder="Search questions..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </InputGroup>
//         </Box>

//         <Button
//           colorScheme="red"
//           variant="outline"
//           onClick={handleClearAllBookmarks}
//           isDisabled={Object.keys(bookmarks).length === 0}
//         >
//           Clear All
//         </Button>
//       </Flex>

//       {/* Bookmarks list */}
//       {filteredBookmarks.length > 0 ? (
//         <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
//           {filteredBookmarks.map(([key, bookmark]) => (
//             <Card key={key} variant="outline" size="md">
//               <CardBody>
//                 <Flex justify="space-between" align="start" mb={2}>
//                   <Badge colorScheme="blue" mb={2}>
//                     {bookmark.courseId ? bookmark.courseId.toUpperCase() : 'General'}
//                   </Badge>
//                   <IconButton
//                     icon={<DeleteIcon />}
//                     aria-label="Remove bookmark"
//                     size="sm"
//                     colorScheme="red"
//                     variant="ghost"
//                     onClick={() => handleRemoveBookmark(key)}
//                   />
//                 </Flex>

//                 <Text fontWeight="bold" mb={2} noOfLines={2}>
//                   {bookmark.question}
//                 </Text>

//                 <Text fontSize="sm" color="gray.500" mb={3}>
//                   From: {bookmark.testTitle}
//                 </Text>

//                 <Divider mb={3} />

//                 <Flex justify="space-between" align="center">
//                   <Text fontSize="xs" color="gray.500">
//                     {bookmark.date ? new Date(bookmark.date).toLocaleDateString() : 'Unknown date'}
//                   </Text>

//                   <Link href={`/review/${bookmark.testId}?q=${bookmark.questionId}`}>
//                     <Button
//                       size="sm"
//                       colorScheme="blue"
//                       variant="outline"
//                       rightIcon={<ExternalLinkIcon />}
//                     >
//                       Review
//                     </Button>
//                   </Link>
//                 </Flex>
//               </CardBody>
//             </Card>
//           ))}
//         </SimpleGrid>
//       ) : (
//         <Box textAlign="center" p={10} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="md">
//           <StarIcon boxSize={10} color="gray.300" _dark={{ color: "gray.500" }} mb={4} />
//           <Heading size="md" mb={2}>No bookmarks found</Heading>
//           <Text color="gray.500" _dark={{ color: "gray.400" }} mb={6}>
//             {Object.keys(bookmarks).length === 0
//               ? "You haven't bookmarked any questions yet."
//               : "No questions match your current filters."}
//           </Text>

//           {Object.keys(bookmarks).length === 0 ? (
//             <Link href="/dashboard">
//               <Button colorScheme="blue">
//                 Take a Test
//               </Button>
//             </Link>
//           ) : (
//             <Button
//               onClick={() => {
//                 setFilter('all');
//                 setSearchQuery('');
//               }}
//             >
//               Clear Filters
//             </Button>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';
import {
  getUserBookmarks,
  removeBookmark,
  clearAllBookmarks,
  syncBookmarks,
} from '@/lib/bookmarkService';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Card,
  CardBody,
  Stack,
  Badge,
  IconButton,
  Divider,
  useToast,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Collapse,
  VStack,
} from '@chakra-ui/react';
import {
  StarIcon,
  DeleteIcon,
  SearchIcon,
  ExternalLinkIcon,
  RepeatIcon,
  InfoIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';

export default function BookmarksPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, authLoading] = useAuthState(auth);

  const [bookmarks, setBookmarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadBookmarks() {
      setLoading(true);
      try {
        if (user) {
          const userBookmarks = await getUserBookmarks(user.uid);
          setBookmarks(userBookmarks || {});
        } else if (!authLoading) {
          const storedBookmarks = localStorage.getItem('bookmarkedQuestions');
          setBookmarks(storedBookmarks ? JSON.parse(storedBookmarks) : {});
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        toast({
          title: "Error loading bookmarks",
          description: "Please try again later",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setBookmarks({});
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadBookmarks();
    }
  }, [user, authLoading]);

  const handleRemoveBookmark = async (bookmarkKey) => {
    try {
      if (user) {
        await removeBookmark(user.uid, bookmarkKey);
      } else {
        const newBookmarks = { ...bookmarks };
        delete newBookmarks[bookmarkKey];
        localStorage.setItem('bookmarkedQuestions', JSON.stringify(newBookmarks));
      }
      setBookmarks(prev => {
        const newBookmarks = { ...prev };
        delete newBookmarks[bookmarkKey];
        return newBookmarks;
      });
      toast({ title: "Bookmark removed", status: "info", duration: 2000, isClosable: true });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({ title: "Error removing bookmark", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleClearAllBookmarks = async () => {
    try {
      if (user) {
        await clearAllBookmarks(user.uid);
      } else {
        localStorage.setItem('bookmarkedQuestions', JSON.stringify({}));
      }
      setBookmarks({});
      toast({ title: "All bookmarks cleared", status: "info", duration: 2000, isClosable: true });
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      toast({ title: "Error clearing bookmarks", status: "error", duration: 3000, isClosable: true });
    }
  };
  
  const handleSyncBookmarks = async () => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to sync bookmarks", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    try {
      setIsSyncing(true);
      const syncedBookmarks = await syncBookmarks(user.uid);
      if (syncedBookmarks) {
        setBookmarks(syncedBookmarks);
        toast({ title: "Bookmarks synced", status: "success", duration: 3000, isClosable: true });
      }
    } catch (error) {
      console.error('Error syncing bookmarks:', error);
      toast({ title: "Sync failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredBookmarks = Object.entries(bookmarks)
    .filter(([key, bookmark]) => {
      if (!bookmark || !bookmark.question) return false;
      if (filter !== 'all' && bookmark.courseId !== filter) return false;
      if (searchQuery && !bookmark.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b[1].date) - new Date(a[1].date));

  const courseIds = [...new Set(Object.values(bookmarks).map(b => b.courseId))].filter(Boolean);

  if (loading || authLoading) {
    return (
      <Box p={8} maxW="1200px" mx="auto" textAlign="center" pt={24}>
        <Spinner size="xl" />
        <Text mt={4}>Loading bookmarks...</Text>
      </Box>
    );
  }

  return (
    <Box p={4} pt={24} maxW="1200px" mx="auto" className="min-h-screen">
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
        <Heading size="lg">Bookmarked Questions</Heading>
        <Flex gap={2}>
          {user && (
            <Button leftIcon={<RepeatIcon />} colorScheme="green" variant="outline" onClick={handleSyncBookmarks} isLoading={isSyncing} loadingText="Syncing">
              Sync
            </Button>
          )}
          <Button colorScheme="blue" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Flex>
      </Flex>
      
      <Flex mb={6} gap={4} flexWrap="wrap">
        <Box flex="1" minW="200px">
          <Select placeholder="Filter by course" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Courses</option>
            {courseIds.map(courseId => (
              <option key={courseId} value={courseId}>{courseId.toUpperCase()}</option>
            ))}
          </Select>
        </Box>
        <Box flex="2" minW="300px">
          <InputGroup>
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.300" /></InputLeftElement>
            <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>
        </Box>
        <Button colorScheme="red" variant="outline" onClick={handleClearAllBookmarks} isDisabled={Object.keys(bookmarks).length === 0}>
          Clear All
        </Button>
      </Flex>

      {filteredBookmarks.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {filteredBookmarks.map(([key, bookmark]) => (
            <Card key={key} variant="outline" size="md">
              <CardBody onClick={() => setExpandedId(expandedId === key ? null : key)} cursor="pointer">
                <Flex justify="space-between" align="start" mb={2}>
                  <Badge colorScheme="blue" mb={2}>
                    {bookmark.courseId ? bookmark.courseId.toUpperCase() : 'GENERAL'}
                  </Badge>
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Remove bookmark"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(key); }}
                  />
                </Flex>
                <Text fontWeight="bold" noOfLines={2}>
                  {bookmark.question}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  From: {bookmark.testTitle}
                </Text>
              </CardBody>
              <Collapse in={expandedId === key} animateOpacity>
                <Box px={6} pb={4}>
                  <Divider my={3} />
                  {bookmark.options && bookmark.options.length > 0 ? (
                    <>
                      <Heading size="xs" textTransform="uppercase" mb={2}>Options</Heading>
                      <VStack align="stretch" spacing={2} mb={4}>
                        {bookmark.options.map((option, index) => {
                          const isCorrect = option === bookmark.correctAnswer;
                          return (
                            <Flex key={index} p={2} borderRadius="md" bg={isCorrect ? "green.50" : "gray.50"} _dark={{bg: isCorrect ? "green.900" : "gray.700"}} align="center">
                              {isCorrect && <CheckCircleIcon color="green.500" mr={2} />}
                              <Text>{option}</Text>
                            </Flex>
                          );
                        })}
                      </VStack>
                      <Heading size="xs" textTransform="uppercase" mb={2}>Explanation</Heading>
                      <Text fontSize="sm">{bookmark.explanation}</Text>
                    </>
                  ) : (
                    <Text color="gray.500" fontSize="sm">Full details not saved. Please review in the test to see the answer and explanation.</Text>
                  )}
                  <Divider my={3} />
                   <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.500">
                      {bookmark.date ? new Date(bookmark.date).toLocaleDateString() : 'Unknown date'}
                    </Text>
                    <Link href={`/review/${bookmark.testId}?q=${bookmark.questionId}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" colorScheme="blue" variant="outline" rightIcon={<ExternalLinkIcon />}>
                        View in Test
                      </Button>
                    </Link>
                  </Flex>
                </Box>
              </Collapse>
            </Card>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" p={10} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="md">
            <StarIcon boxSize={10} color="gray.300" _dark={{ color: "gray.500" }} mb={4} />
            <Heading size="md" mb={2}>No bookmarks found</Heading>
            <Text color="gray.500" _dark={{ color: "gray.400" }} mb={6}>
            {Object.keys(bookmarks).length === 0
              ? "You haven't bookmarked any questions yet."
              : "No questions match your current filters."}
          </Text>
          {Object.keys(bookmarks).length === 0 ? (
            <Link href="/dashboard"><Button colorScheme="blue">Take a Test</Button></Link>
          ) : (
            <Button onClick={() => { setFilter('all'); setSearchQuery(''); }}>Clear Filters</Button>
          )}
        </Box>
      )}
    </Box>
  );
}