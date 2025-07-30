'use client';

//Admin Panel: page.jsx and subfolders for managing users and tests.

import { Box, Heading, SimpleGrid, Text,useColorModeValue } from '@chakra-ui/react';
//import StatCard, { adminStats } from '@/components/admin/StatCard';
import dynamic from 'next/dynamic';
const AreaChart = dynamic(() => import('@/components/admin/AreaChart'), { ssr: false });
//const BarChart = dynamic(() => import('@/components/admin/BarChart'), { ssr: false });
import { FiUsers, FiFileText, FiPackage, FiDollarSign } from 'react-icons/fi';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PieChart from '@/components/admin/PieChart';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebaseConfig';
import { getAllTests } from '@/lib/tests';
import { getAllBundles } from '@/lib/bundleService';


const areaChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Test Attempts & New Users' },
  },
};



const userEngagementChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'User Engagement Metrics' },
  },
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
  const [user, authLoading] = useAuthState(auth);
  // Card stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalBundles: 0,
    earnings: 0, // mock
  });
  // Area chart state
  const [userGrowthData, setUserGrowthData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  // Plan distribution state
  const [planDistribution, setPlanDistribution] = useState({});
  // Recent users state
  const [recentUsers, setRecentUsers] = useState([]);
  const glassBg = useColorModeValue('bg-white/40', 'bg-white/10');
  const glassBorder = useColorModeValue('border-white/30', 'border-white/20');

  useEffect(() => {
    async function fetchStatsAndGrowth() {
      setLoading(true);
      // Fetch users (global)
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      // Fetch only this admin's tests and bundles
      let adminTests = [];
      let adminBundles = [];
      if (user) {
        adminTests = await getAllTests(user.uid);
        adminBundles = await getAllBundles(user.uid);
      }
      // Card stats
      setStats({
        totalUsers: users.length,
        totalTests: adminTests.length,
        totalBundles: adminBundles.length,
        earnings: 3500, // mock
      });
      // User growth by month (global)
      const growthMap = {};
      const planMap = {};
      users.forEach(u => {
        if (u.createdAt) {
          let date = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          growthMap[label] = (growthMap[label] || 0) + 1;
        }
        if (u.plan) {
          planMap[u.plan] = (planMap[u.plan] || 0) + 1;
        }
      });
      // Sort labels
      const labels = Object.keys(growthMap).sort();
      const data = labels.map(l => growthMap[l]);
      setUserGrowthData({
        labels,
        datasets: [
          {
            label: 'New Users',
            data,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
          },
        ],
      });
      setPlanDistribution(planMap);
      // Recent users (latest 5 by createdAt, global)
      const sortedUsers = users
        .filter(u => u.createdAt)
        .sort((a, b) => {
          const da = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const db = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return db - da;
        })
        .slice(0, 5);
      setRecentUsers(sortedUsers);
      setLoading(false);
    }
    if (!authLoading && user) {
      fetchStatsAndGrowth();
    }
  }, [user, authLoading]);

  // Card config
  const cardConfig = [
    { title: 'Total Users', value: stats.totalUsers, icon: <FiUsers size={28} /> },
    { title: 'Total Tests', value: stats.totalTests, icon: <FiFileText size={28} /> },
    { title: 'Total Bundles', value: stats.totalBundles, icon: <FiPackage size={28} /> },
    { title: 'Earnings', value: `$${stats.earnings}`, icon: <FiDollarSign size={28} /> },
  ];

  // Area chart options
  const areaChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'User Growth (New Users per Month)' },
    },
    maintainAspectRatio: false,
  };

  // Pie chart for plan distribution
  const planLabels = Object.keys(planDistribution);
  const planData = planLabels.map(label => planDistribution[label]);
  const pieChartData = {
    labels: planLabels,
    datasets: [
      {
        data: planData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Plan Distribution' },
    },
  };

  
  return (
    <Box p={0}>
      <div className="container mx-auto px-4 pt-12 md:px-8 lg:px-12 xl:px-24 w-full">
        {/* Welcome header */}
        <Box mb={12} textAlign="center">
          <Heading size="lg" mb={2}>Welcome to the Admin Dashboard</Heading>
          <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.300' }}>
            Quick stats, user growth, and recent activity at a glance.
          </Text>
        </Box>
        {/* Stat cards */}
        <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}> 
          <Heading size="md" mb={6} textAlign="left">Key Metrics</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {cardConfig.map((card, idx) => (
              <Box key={idx} p={7} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl transition-transform duration-200 hover:scale-105`} display="flex" alignItems="center" gap={4}>
                <Box>{card.icon}</Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">{card.title}</Text>
                  <Heading size="lg">{card.value}</Heading>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        {/* Area chart for user growth */}
        <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}> 
          <Heading size="md" mb={6} textAlign="left">User Growth</Heading>
          <Box height="400px" width="100%">
            {!loading && <AreaChart data={userGrowthData} options={areaChartOptions} />}
            {loading && <Text>Loading chart...</Text>}
          </Box>
        </Box>
        {/* Pie chart for plan distribution (if plans exist) */}
        {planLabels.length > 0 && (
          <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}>
            <Heading size="md" mb={6} textAlign="left">Plan Distribution</Heading>
            <Box maxW="lg" mx="auto">
              <PieChart data={pieChartData} options={pieChartOptions} />
            </Box>
          </Box>
        )}
        {/* Subscription Overview Section */}
        <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}>
          <Heading size="md" mb={6} textAlign="left">Subscription Overview</Heading>
          {/* ... Subscription Overview content ... */}
        </Box>
        {/* Divider */}
        <Box borderBottom="2px" borderColor="gray.200" mb={12} />
        {/* Keep all other existing sections below (e.g., Plan Distribution, etc.) */}
        {/* ... existing code ... */}
      </div>
    </Box>
  );
}


