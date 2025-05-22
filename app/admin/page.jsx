'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Icon } from '@chakra-ui/react';
import StatCard, { adminStats } from '@/components/admin/StatCard';
import AreaChart from '@/components/admin/AreaChart';
import BarChart from '@/components/admin/BarChart';
import DonutChart from '@/components/admin/DonutChart';

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
    'amount-earned': 200000 
  },
  {
    'name':'Banking',
    'amount-earned': 150000
  },
  {
    'name':'Railways',
    'amount-earned': 300000
  },
  {
    'name':'UPSC Prelims',
    'amount-earned': 100000
  },
  {
    'name':'State PSC',
    'amount-earned': 250000
  }
]

// Prepare data in Chart.js format
const areaChartData = {
  labels: chartdata.map(item => item.date),
  datasets: [
    {
      label: 'Test Attempts',
      data: chartdata.map(item => item['Test Attempts']),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
    },
    {
      label: 'New Users',
      data: chartdata.map(item => item['New Users']),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      fill: true,
    },
  ],
};

const areaChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Test Attempts & New Users' },
  },
};

// Prepare data for BarChart
const barChartData = {
  labels: testPerformanceData.map(item => item.test),
  datasets: [
    {
      label: 'Avg Score',
      data: testPerformanceData.map(item => item['Avg Score']),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    },
    {
      label: 'Pass Rate',
      data: testPerformanceData.map(item => item['Pass Rate']),
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
    },
  ],
};

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Test Performance by Category' },
  },
};

// Prepare data for DonutChart
const donutChartData = {
  labels: earningChartData.map(item => item.name),
  datasets: [
    {
      label: 'Amount Earned',
      data: earningChartData.map(item => item['amount-earned']),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const donutChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Earnings by Test Category' },
  },
};

export default function AdminDashboard() {
  return (
    <Box>
      <Heading mb={8}>Admin Dashboard</Heading>
      
      {/* stats cards with trends */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={12}>

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
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={12}>
        {/* Area chart */}
        
        <Box height="400px" width="100%">
          <AreaChart data={areaChartData} options={{ ...areaChartOptions, maintainAspectRatio: false }} />
        </Box>

        {/* Bar chart */}
        <Box height="400px" width="100%">
          <BarChart data={barChartData} options={{ ...barChartOptions, maintainAspectRatio: false }} />
        </Box>
        
      </SimpleGrid>

      {/* //{DonutChart} */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={12}>
        <Box height="400px" width="100%">
          <DonutChart data={donutChartData} options={{ ...donutChartOptions, maintainAspectRatio: false }} />
        </Box>
      </SimpleGrid>
    </Box>
  );
}


