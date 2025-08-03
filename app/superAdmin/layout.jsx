'use client';

import React, { useState, useEffect } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import Sidebar from '../../components/SuperAdmin/Sidebar';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';

export default function SuperDashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false); 


  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (user.role !== 'superAdmin') {
        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
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
  if (user.role !== 'superAdmin') {
    return null; // Prevents flash of unauthorized content
  }

  return (
    <Box position="relative" minH="100vh" pt="64px" >
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
      {/* Main content */}
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