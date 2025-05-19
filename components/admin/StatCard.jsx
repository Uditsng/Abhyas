'use client';

import { Box, Flex, Text, Heading, useColorModeValue } from '@chakra-ui/react';
import TrendIndicator from './TrendIndicator';

/**
 * StatCard component for displaying a metric with optional trend indicator
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the stat
 * @param {string|number} props.value - The main value to display
 * @param {number} props.trend - The trend percentage (optional)
 * @param {string} props.timeframe - Timeframe for the trend (optional)
 * @param {boolean} props.inverted - Whether negative trends are good (optional)
 * @param {React.ReactNode} props.icon - Icon to display (optional)
 */
export default function StatCard({ 
  title, 
  value, 
  trend, 
  timeframe,
  inverted = false,
  icon
}) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="lg" 
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            {title}
          </Text>
          <Heading size="lg" mt={1} mb={2}>
            {value}
          </Heading>
          
          {/* Only show trend if provided */}
          {trend !== undefined && (
            <TrendIndicator 
              value={trend} 
              timeframe={timeframe} 
              inverted={inverted} 
            />
          )}
        </Box>
        
        {/* Only show icon if provided */}
        {icon && (
          <Box 
            p={2} 
            bg="blue.50" 
            color="blue.500" 
            borderRadius="md"
          >
            {icon}
          </Box>
        )}
      </Flex>
    </Box>
  );
}