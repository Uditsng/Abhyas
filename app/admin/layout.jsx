'use client';

import { useEffect, useState } from 'react';
import { Box, Spinner, Center, useToast } from '@chakra-ui/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const toast = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        // Check if user has admin or superAdmin role
        if (data.role === "superAdmin") {
          setIsAdmin(true);
        } else if (data.role === "admin") {
          if(pathname.startsWith('/dashboard') || pathname.startsWith('/my-purchases')){
            router.replace('/admin')
          }

          if (data.validated === true) {
            setIsAdmin(true);
            // In-app notification for newly validated admins
            const notifiedKey = `admin_validated_notified_${user.uid}`;
            if (!localStorage.getItem(notifiedKey)) {
              toast({
                title: "Congratulations!",
                description: "Your admin account has been approved. You now have full admin access.",
                status: "success",
                duration: 7000,
                isClosable: true,
                position: "top",
              });
              localStorage.setItem(notifiedKey, "true");
            }
          } else {
            setIsPending(true);
            setIsAdmin(false);
          }
        } else {
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
  }, [user, authLoading, router, toast, pathname]);

  if (authLoading || loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isPending) {
    if (pathname === '/admin/pending-approval') {
      // Allow rendering of the Pending Approval page
      return (
        <Box position="relative" minH="100vh" pt="64px">
          {/* No sidebar for pending approval */}
          <Box flex={1} p={6}>
            {children}
          </Box>
        </Box>
      );
    } else {
      router.replace('/admin/pending-approval');
      return null;
    }
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box position="relative" minH="100vh" pt="64px" overflowX="hidden">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content */}
      <Box 
      minH='100vh'
      flex={1} 
      p={6} 
      className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'} `}
      >
        {children}
      </Box>
    </Box>
  );
}

