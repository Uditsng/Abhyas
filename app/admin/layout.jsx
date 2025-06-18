'use client';

import { useEffect, useState } from 'react';
import { Box, Spinner, Center, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdminSidebar from '@/components/admin/Sidebar';


export default function AdminLayout({ children }) {
  const router = useRouter();
  const toast = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    <Box position="relative" minH="100vh" pt="64px">
      <AdminSidebar />

      {/* Main content */}
      <Box 
      flex={1} 
      p={6} 
      ml={{ base: '60px', md: '240px' }}
      transition='margin-left 0.3s ease'
      >
        {children}
      </Box>
    </Box>
  );
}

