"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Flex, IconButton, Text, useColorModeValue, VStack, Icon, useBreakpointValue
} from '@chakra-ui/react';
import {
  FiHome, FiUsers, FiDollarSign, FiChevronLeft, FiChevronRight,
  FiMessageSquare, FiPackage, FiBookOpen, FiPieChart,FiUserPlus
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/superAdmin', icon: FiHome },
  { name: 'Users', path: '/superAdmin/users', icon: FiUsers },
  { name: 'Admins', path: '/superAdmin/admins', icon: FiUserPlus },
  { name: 'Revenue', path: '/superAdmin/revenue', icon: FiDollarSign },
  { name: 'Communication', path: '/superAdmin/communication', icon: FiMessageSquare },
  { name: 'Packages', path: '/superAdmin/packages', icon: FiPackage },
  { name: 'Exams', path: '/superAdmin/exams', icon: FiBookOpen },
  { name: 'Expenses', path: '/superAdmin/expenses', icon: FiPieChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Auto-collapse on mobile screens
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

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
        {!isCollapsed && <Text fontWeight='bold'>SuperAdmin</Text>}
        <IconButton
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          size='sm'
          variant='ghost'
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </Flex>

      {/* Nav Links */}
      <VStack align="stretch" spacing={1} mt={4}>
        {navItems.map((item) => (
          <Link href={item.path} key={item.name} passHref>
            <Flex
              p={3}
              mx={2}
              borderRadius='md'
              bg={pathname === item.path ? 'blue.500' : 'transparent'}
              color={pathname === item.path ? 'white' : textColor}
              _hover={{
                bg: pathname === item.path
                  ? 'blue.600'
                  : useColorModeValue('gray.100', 'gray.700'),
              }}
              alignItems="center"
              cursor="pointer"
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
