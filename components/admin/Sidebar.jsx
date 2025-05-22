'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, Flex, IconButton, Text, useColorModeValue, VStack, Icon
} from '@chakra-ui/react';
import { 
  FiHome, FiFileText, FiUsers, FiChevronLeft, FiChevronRight, FiAlertTriangle, FiDollarSign, FiList
} from 'react-icons/fi';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get current path to highlight active link
  const pathname = usePathname();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  // Simple nav items 
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: FiHome },
    { name: 'Tests', path: '/admin/tests', icon: FiFileText },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: FiList },
    { name: 'Announcements', path: '/admin/announcements', icon: FiAlertTriangle },
    { name: 'Sales Revenue', path: '/admin/sales-revenue', icon: FiDollarSign }
  ];

  return (
    <Box
      as='nav'
      h='calc(100vh - 64px)'
      bg={bgColor}
      borderRight='1px'
      borderColor={borderColor}
      color={textColor}
      w={isCollapsed ? '60px' : '240px'}
      transition='width 0.3s ease'
      position='fixed'
      left={0}
      top='64px'
      bottom="0"
      zIndex={10}
      pb='96px'
    >
      {/* Header with toggle button */}
      <Flex 
        p={4}
        justifyContent={isCollapsed ? 'center' : 'space-between'}
        alignItems='center'
      >
        {!isCollapsed && <Text fontWeight='bold'>Admin Panel</Text>}
        <IconButton
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          size='sm'
          variant='ghost'
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </Flex>

      {/* Nav links */}
      <VStack align="stretch" spacing={1} mt={4}>
        {navItems.map((item) => (
          <Link href={item.path} key={item.name} passHref>
            <Flex
              p={3}
              mx={2}
              borderRadius='md'
              bg={pathname === item.path ? 'blue.500' : 'transparent'}
              color={pathname === item.path ? 'white' : textColor}
              _hover={{ bg: pathname === item.path ? 'blue.600' : useColorModeValue('gray.100', 'gray.700') }}
              alignItems="center"
            >
              <Icon as={item.icon} boxSize={5} />
              {!isCollapsed && <Text ml={4}>{item.name}</Text>}
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}
