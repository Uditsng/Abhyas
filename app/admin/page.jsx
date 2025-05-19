'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Icon } from '@chakra-ui/react';
import { Card as TremorCard, Title, AreaChart, BarChart, DonutChart } from '@tremor/react';
import StatCard, { adminStats } from '@/components/admin/StatCard';

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

//DonutChart data
const earningChartData = [
  {
    'name': 'SSC-CGL',
    'amount earned': 200000 
  },
  {
    'name':'Banking',
    'amount earned': 150000
  },
  {
    'name':'Railways',
    'amount earned': 300000
  },
  {
    'name':'UPSC Prelims',
    'amount earned': 100000
  },
  {
    'name':'State PSC',
    'amount earned': 250000
  }
]


export default function AdminDashboard() {
  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      {/* stats cards with trends */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>

        {adminStats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title} 
            value={stat.value} 
            trend={stat.trend} 
            timeframe={stat.timeframe}
            inverted={stat.inverted}
            icon={<Icon as={stat.icon} boxSize={6} />}
          />
        ))}

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
        
        <TremorCard>
          <Title>Test Performance by Category</Title>
        {/* Bar chart */}
        <BarChart
          data={testPerformanceData}
          index="test"
          categories={['Avg Score', 'Pass Rate']}
          // colors={['purple','cyan']}
          showTooltip={false}
          className="h-72 mt-4"
        />
        </TremorCard>
      </SimpleGrid>

      {/* //{DonutChart} */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <TremorCard>
          <Title>Revenue by Exam Category</Title>
        <DonutChart
            data={earningChartData}
            category="name"
            value="amount earned"
            valueFormatter={(value) => `₹${value}`}
            colors={["blue", "cyan", "indigo", "violet", "purple"]}
            className="h-72 mt-4" 
          />
        </TremorCard>
      </SimpleGrid>
    </Box>
  );
}


