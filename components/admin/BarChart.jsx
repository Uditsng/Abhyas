'use client';

import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { BarChart as TremorBarChart, Card, Title } from '@tremor/react';

/**
 * BarChart component for displaying bar charts
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {Array} props.data - Data for the chart
 * @param {string} props.index - The key to use as index
 * @param {Array} props.categories - Categories to display
 * @param {Array} props.colors - Colors for each category
 * @param {string} props.subtitle - Optional subtitle
 */
export default function BarChart({ 
  title, 
  data, 
  index, 
  categories, 
  colors,
  // colors = ['blue', 'cyan', 'indigo'],
  
  subtitle
}) {
  const bgColor = useColorModeValue('white', 'gray.800');
  // const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box bg={bgColor} borderRadius="lg" overflow="hidden" boxShadow="sm">
      <Card>
        <Box p={2}>
          <Title>{title}</Title>
          {subtitle && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        
        <TremorBarChart
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          className="h-72 mt-4"
        />
      </Card>
    </Box>
  );
}