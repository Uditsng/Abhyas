// //app/management/layout.jsx

'use client';
import { useState, useEffect } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import ManagerSidebar from '../../components/management/Sidebar';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';

export default function ManagementLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (user.role !== 'management') {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  if (user.role !== 'management') {
    return null; // Prevents flash of unauthorized content
  }

  return (
    <Box position="relative" minH="100vh" pt="64px">
      <ManagerSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Box
        flex={1}
        p={6}
        minH="100vh"
        className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'}`}
      >
        {children}
      </Box>
    </Box>
  );
}
