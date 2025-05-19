'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Flex, Icon } from '@chakra-ui/react';
import { Card as TremorCard, Title, AreaChart } from '@tremor/react';
import { FiUsers, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import StatCard from '@/components/admin/StatCard';
import BarChart from '@/components/admin/BarChart';

// Sample data for our charts
const chartdata = [
  {
    date: 'Jan 22',
    'Test Attempts': 2890,
    'New Users': 2338,
  },
  {
    date: 'Feb 22',
    'Test Attempts': 2756,
    'New Users': 2103,
  },
  {
    date: 'Mar 22',
    'Test Attempts': 3322,
    'New Users': 2194,
  },
  {
    date: 'Apr 22',
    'Test Attempts': 3470,
    'New Users': 2108,
  },
  {
    date: 'May 22',
    'Test Attempts': 3475,
    'New Users': 1812,
  },
];

// Sample data for bar chart
const testPerformanceData = [
  {
    'test': 'SSC CGL',
    'Avg Score': 72,
    'Pass Rate': 68,
  },
  {
    'test': 'Banking',
    'Avg Score': 65,
    'Pass Rate': 58,
  },
  {
    'test': 'Railways',
    'Avg Score': 81,
    'Pass Rate': 76,
  },
  {
    'test': 'UPSC Prelims',
    'Avg Score': 59,
    'Pass Rate': 42,
  },
  {
    'test': 'State PSC',
    'Avg Score': 68,
    'Pass Rate': 61,
  },
];

export default function AdminDashboard() {
  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      {/* Enhanced stats cards with trends */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard 
          title="Total Users" 
          value="1,024" 
          trend={12} 
          timeframe="vs last month"
          icon={<Icon as={FiUsers} boxSize={6} />}
        />
        
        <StatCard 
          title="Active Tests" 
          value="42" 
          trend={8} 
          timeframe="vs last month"
          icon={<Icon as={FiFileText} boxSize={6} />}
        />
        
        <StatCard 
          title="Questions" 
          value="2,580" 
          trend={15} 
          timeframe="vs last month"
          icon={<Icon as={FiCheckCircle} boxSize={6} />}
        />
        
        <StatCard 
          title="Error Rate" 
          value="0.8%" 
          trend={-2} 
          timeframe="vs last month"
          inverted={true}
          icon={<Icon as={FiAlertCircle} boxSize={6} />}
        />
      </SimpleGrid>
      
      {/* Charts section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Area chart */}
        <TremorCard>
          <Title>User Growth & Test Attempts</Title>
          <AreaChart
            data={chartdata}
            index="date"
            categories={['Test Attempts', 'New Users']}
            colors={['purple', 'cyan']}
            className="h-72 mt-4"
            showTooltip={false} 
          />
        </TremorCard>
        
        {/* Bar chart */}
        <BarChart
          title="Test Performance by Category"
          subtitle="Average scores and pass rates"
          data={testPerformanceData}
          index="test"
          categories={['Avg Score', 'Pass Rate']}
          colors={['purple', 'cyan']}
          showTooltip={false} // Hides the hover tooltip
        />
      </SimpleGrid>
    </Box>
  );
}
