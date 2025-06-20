'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Icon, Text, Button, HStack } from '@chakra-ui/react';
import StatCard, { adminStats } from '@/components/admin/StatCard';
import AreaChart from '@/components/admin/AreaChart';
import BarChart from '@/components/admin/BarChart';
import DonutChart from '@/components/admin/DonutChart';
import { subscriptionPlans, SUBSCRIPTION_STATUS } from '@/lib/subscriptions';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser } from 'react-icons/fi';

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

// Sample data for user engagement metrics
const userEngagementData = [
  { date: 'Jan 22', 'Active Users': 1200, 'Tests Per User': 3.5 },
  { date: 'Feb 22', 'Active Users': 1100, 'Tests Per User': 3.2 },
  { date: 'Mar 22', 'Active Users': 1300, 'Tests Per User': 3.8 },
  { date: 'Apr 22', 'Active Users': 1250, 'Tests Per User': 3.6 },
  { date: 'May 22', 'Active Users': 1400, 'Tests Per User': 4.0 },
];

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
<br />
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
<br />
const donutChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Earnings by Test Category' },
  },
};
<br />
// Prepare data for User Engagement Chart
const userEngagementChartData = {
  labels: userEngagementData.map(item => item.date),
  datasets: [
    {
      label: 'Active Users',
      data: userEngagementData.map(item => item['Active Users']),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
    },
    {
      label: 'Tests Per User',
      data: userEngagementData.map(item => item['Tests Per User']),
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true,
    },
  ],
};
<br />
const userEngagementChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'User Engagement Metrics' },
  },
};

// Sample data for monthly earnings trends
const monthlyEarningsData = [
  { month: 'Jan 22', earnings: 50000 },
  { month: 'Feb 22', earnings: 45000 },
  { month: 'Mar 22', earnings: 60000 },
  { month: 'Apr 22', earnings: 55000 },
  { month: 'May 22', earnings: 70000 },
];
<br />
// Prepare data for Monthly Earnings Chart
const monthlyEarningsChartData = {
  labels: monthlyEarningsData.map(item => item.month),
  datasets: [
    {
      label: 'Monthly Earnings',
      data: monthlyEarningsData.map(item => item.earnings),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};
<br />
const monthlyEarningsChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Monthly Earnings Trends' },
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    revenue: 0,
    planDistribution: {}
  });

  useEffect(() => {
    const fetchSubscriptionStats = async () => {
      try {
        const subscriptionsRef = collection(db, 'subscriptions');
        const subscriptionsSnapshot = await getDocs(subscriptionsRef);
        
        const stats = {
          totalSubscribers: 0,
          activeSubscriptions: 0,
          trialUsers: 0,
          revenue: 0,
          planDistribution: {}
        };

        subscriptionsSnapshot.forEach((doc) => {
          const subscription = doc.data();
          stats.totalSubscribers++;
          
          if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
            stats.activeSubscriptions++;
            const plan = subscriptionPlans.find(p => p.id === subscription.planId);
            if (plan) {
              stats.revenue += plan.price;
              stats.planDistribution[plan.id] = (stats.planDistribution[plan.id] || 0) + 1;
            }
          } else if (subscription.status === SUBSCRIPTION_STATUS.TRIAL) {
            stats.trialUsers++;
          }
        });

        setSubscriptionStats(stats);
      } catch (error) {
        console.error('Error fetching subscription stats:', error);
      }
    };

    fetchSubscriptionStats();
  }, []);

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading>Admin Dashboard</Heading>
        <Button
          leftIcon={<FiUser />}
          colorScheme="blue"
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          View as User
        </Button>
      </HStack>

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
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={12} pb={4}>
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
      {/* <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={12} pb={4}>
        <Box height="400px" width="100%">
          <DonutChart data={donutChartData} options={{ ...donutChartOptions, maintainAspectRatio: false }} />
        </Box>
      </SimpleGrid> */}

      {/* charts for user engagement and monthly earnings */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} pb={4}>
        {/* User Engagement chart */}
        <Box height="400px" width="100%">
          <AreaChart data={userEngagementChartData} options={{ ...userEngagementChartOptions, maintainAspectRatio: false }} />
        </Box>

        {/* Monthly Earnings bar chart */}
        <Box height="400px" width="100%">
          <BarChart data={monthlyEarningsChartData} options={{ ...monthlyEarningsChartOptions, maintainAspectRatio: false }} />
        </Box>
      </SimpleGrid>

      {/* Subscription Overview */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Subscription Overview</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Box p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
            <Text fontSize="sm" color="gray.500">Total Subscribers</Text>
            <Text fontSize="2xl" fontWeight="bold">{subscriptionStats.totalSubscribers}</Text>
          </Box>
          <Box p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
            <Text fontSize="sm" color="gray.500">Active Subscriptions</Text>
            <Text fontSize="2xl" fontWeight="bold">{subscriptionStats.activeSubscriptions}</Text>
          </Box>
          {/* <Box p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
            <Text fontSize="sm" color="gray.500">Trial Users</Text>
            <Text fontSize="2xl" fontWeight="bold">{subscriptionStats.trialUsers}</Text>
          </Box> */}
          <Box p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
            <Text fontSize="sm" color="gray.500">Total Revenue</Text>
            <Text fontSize="2xl" fontWeight="bold">${subscriptionStats.revenue}</Text>
          </Box>
        </SimpleGrid>

        {/* Plan Distribution */}
        <Box mt={6} p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
          <Heading size="sm" mb={4}>Plan Distribution</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {subscriptionPlans.map((plan) => (
              <Box key={plan.id} p={3} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium">{plan.name}</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {subscriptionStats.planDistribution[plan.id] || 0}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  ${plan.price}/{plan.duration}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
}


