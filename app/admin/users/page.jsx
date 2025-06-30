'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Avatar,
  Stack,
  Badge,
  Spinner,
  Center,
  Button,
  useDisclosure,
  useToast,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import ManageRoleModal from './manage-role';
import { getUserProfile } from '@/lib/userService';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, authLoading] = useAuthState(auth);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  // Check if current user is a superAdmin
  useEffect(() => {
    async function checkSuperAdminStatus() {
      if (!currentUser) return;

      try {
        const userProfile = await getUserProfile(currentUser.uid);
        setIsSuperAdmin(userProfile?.role === 'superAdmin');
      } catch (error) {
        console.error('Error checking superAdmin status:', error);
      }
    }

    if (currentUser) {
      checkSuperAdminStatus();
    }
  }, [currentUser]);

  // Fetch users from Firebase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated and redirect if not
    if (!authLoading && !currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, authLoading, router]);

  const handleEditRole = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  if (authLoading || loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Check if there's at least one superAdmin
  const hasSuperAdmin = users.some(user => user.role === 'superAdmin');

  return (
    <Box>
      <Heading mb={6}>Users ({users.length})</Heading>

      {!hasSuperAdmin && (
        <Box mb={6} p={4} borderRadius="md" bg="yellow.100" color="yellow.800">
          <Text fontWeight="bold">Warning: No SuperAdmin Found</Text>
          <Text>
            There is no SuperAdmin in the system. The first user who registers will automatically become a SuperAdmin.
          </Text>
        </Box>
      )}

      {users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {users.map(user => (
            <Card key={user.id}>
              <CardBody>
                <Stack direction="row" spacing={4} align="center" mb={4}>
                  <Avatar name={user.name || user.displayName} src={user.photoURL} />
                  <Box flex="1">
                    <Text fontWeight="bold">{user.name || user.displayName}</Text>
                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                  </Box>
                  {isSuperAdmin && (
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="Edit role"
                      onClick={() => handleEditRole(user)}
                    />
                  )}
                </Stack>

                <Flex justify="space-between" align="center">
                  <Badge colorScheme={user.role === 'admin' ? 'green' : user.role === 'superAdmin' ? 'purple' : 'blue'}>
                    {user.role || 'User'}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Joined: {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </Text>
                </Flex>

                <Box mt={2}>
                  <Text fontSize="sm" color="gray.500">Subscription Plan: <b>{user.plan || 'No Plan'}</b></Text>
                </Box>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Role management modal */}
      <ManageRoleModal
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        onRoleUpdate={fetchUsers}
      />
    </Box>
  );
}