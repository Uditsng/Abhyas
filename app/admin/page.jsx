'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Icon, Text, HStack } from '@chakra-ui/react';
import StatCard, { adminStats } from '@/components/admin/StatCard';
import dynamic from 'next/dynamic';
const AreaChart = dynamic(() => import('@/components/admin/AreaChart'), { ssr: false });
const BarChart = dynamic(() => import('@/components/admin/BarChart'), { ssr: false });
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  // Add state for subscription plans
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    // Fetch subscription plans from Firestore
    const fetchPlans = async () => {
      try {
        const plans = await getSubscriptionPlan();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchSubscriptionStats = async () => {
      try {
        // Fetch users instead of subscriptions since user subscription data is stored in users collection
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const stats = {
          totalSubscribers: 0,
          activeSubscriptions: 0,
          trialUsers: 0,
          revenue: 0,
          planDistribution: {}
        };

        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.plan) { // User has a subscription plan
            stats.totalSubscribers++;
            // Check if subscription is active (you might need to add status field to users)
            // For now, assume all users with plans are active
            stats.activeSubscriptions++;
            // Find plan from fetched plans
            // We'll update this logic after plans are fetched
            // stats.revenue += plan.price; // Can't sum revenue here without plans
            stats.planDistribution[user.plan] = (stats.planDistribution[user.plan] || 0) + 1;
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
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        <HStack justify="space-between" mb={6}>
          <Heading>Admin Dashboard</Heading>
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
            <Box p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
              <Text fontSize="sm" color="gray.500">Total Revenue</Text>
              <Text fontSize="2xl" fontWeight="bold">${subscriptionStats.revenue}</Text>
            </Box>
          </SimpleGrid>

          {/* Plan Distribution */}
          <Box mt={6} p={4} bg="white" _dark={{ bg: "gray.800" }} rounded="lg" shadow="md">
            <Heading size="sm" mb={4}>Plan Distribution</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {subscriptionPlans.length === 0 ? (
                <Text>No plans found.</Text>
              ) : (
                subscriptionPlans.map((plan) => (
                  <Box key={plan.id} p={3} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="medium">{plan.name}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {subscriptionStats.planDistribution[plan.id] || 0}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      ${plan.price}/{plan.duration}
                    </Text>
                  </Box>
                ))
              )}
            </SimpleGrid>
          </Box>
        </Box>
      </div>
    </Box>
  );
}


