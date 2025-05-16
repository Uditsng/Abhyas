'use client';

import { useEffect, useState } from 'react';
import { Box, Flex, VStack, Text, Link as ChakraLink, Spinner, Center, useToast } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple navigation items
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Tests', path: '/admin/tests' },
    { name: 'Users', path: '/admin/users' },
  ];

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        // Check if user has admin or superAdmin role
        if (userDoc.exists() && (userDoc.data().role === "admin" || userDoc.data().role === "superAdmin")) {
          setIsAdmin(true);
        } else {
          // Not an admin, redirect to dashboard
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin area.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        toast({
          title: "Error",
          description: "There was an error checking your permissions.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/auth/login');
      } else {
        checkAdminRole();
      }
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <Flex minH="100vh">
      {/* Simple sidebar */}
      <Box
        as="nav"
        w="240px"
        bg="blue.700"
        color="white"
        p={4}
        display={{ base: 'none', md: 'block' }}
      >
        <Text fontSize="xl" fontWeight="bold" mb={6}>
          Admin Panel
        </Text>

        <VStack align="stretch" spacing={1}>
          {navItems.map((item) => (
            <Link href={item.path} key={item.name} passHref>
              <ChakraLink
                p={2}
                borderRadius="md"
                bg={pathname === item.path ? 'blue.800' : 'transparent'}
                _hover={{ bg: 'blue.800' }}
                textDecoration="none"
              >
                {item.name}
              </ChakraLink>
            </Link>
          ))}
        </VStack>
      </Box>

      {/* Main content */}
      <Box flex={1} p={6} ml={{ base: 0, md: '240px' }}>
        {children}
      </Box>
    </Flex>
  );
}

