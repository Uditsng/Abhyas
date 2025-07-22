"use client";

import React, { useEffect, useState } from 'react';
import StatCard from '../../components/admin/StatCard';
import AreaChart from '../../components/admin/AreaChart';
import BarChart from '../../components/admin/BarChart';
import {
  getTotalUsers,
  getActiveUsers,
  getTotalEarnings,
  getPlatformCommission,
  getGrowthData,
  getRevenueData,
  getTopBottomTeachers,
  getTopBottomBundles
} from '../../lib/superAdminDashboardService';
import { FiUsers, FiUserCheck, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { Box, useColorModeValue } from '@chakra-ui/react';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [growthData, setGrowthData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [topTeachers, setTopTeachers] = useState([]);
  const [bottomTeachers, setBottomTeachers] = useState([]);
  const [topBundles, setTopBundles] = useState([]);
  const [bottomBundles, setBottomBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [totalUsers, activeUsers, totalEarnings, platformCommission, growth, revenue, teachers, bundles] = await Promise.all([
          getTotalUsers(),
          getActiveUsers(),
          getTotalEarnings(),
          getPlatformCommission(),
          getGrowthData(),
          getRevenueData(),
          getTopBottomTeachers(),
          getTopBottomBundles()
        ]);
        setStats({ totalUsers, activeUsers, totalEarnings, platformCommission });
        setGrowthData(growth);
        setRevenueData(revenue);
        setTopTeachers(teachers.top);
        setBottomTeachers(teachers.bottom);
        setTopBundles(bundles.top);
        setBottomBundles(bundles.bottom);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data.');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Prepare chart data
  const areaChartData = growthData ? {
    labels: Object.keys(growthData),
    datasets: [
      {
        label: 'Users',
        data: Object.values(growthData).map(g => g.users),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
      },
      {
        label: 'Admins',
        data: Object.values(growthData).map(g => g.admins),
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: true,
      }
    ]
  } : null;

  const barChartData = revenueData ? {
    labels: Object.keys(revenueData),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(revenueData),
        backgroundColor: 'rgba(59,130,246,0.7)',
      }
    ]
  } : null;

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'gray.100');

  if (loading) return <Box p={8} fontSize="lg">Loading dashboard...</Box>;
  if (error) return <Box p={8} color="red.500">{error}</Box>;

  return (
    <Box mt={8} color={textColor}>
      <h1 className="text-3xl font-bold mb-6">SuperAdmin Dashboard</h1>
      {/* Stats Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<FiUsers size={28} />} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={<FiUserCheck size={28} />} />
        <StatCard title="Total Earnings" value={`₹${stats.totalEarnings}`} icon={<FiDollarSign size={28} />} />
        <StatCard title="Platform Commission" value={`₹${stats.platformCommission}`} icon={<FiPieChart size={28} />} />
      </Box>
      {/* Charts Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
          <h2 className="font-semibold mb-2">Growth (Users & Admins)</h2>
          {areaChartData ? <AreaChart data={areaChartData} /> : <div>No data</div>}
        </Box>
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
          <h2 className="font-semibold mb-2">Revenue (Monthly)</h2>
          {barChartData ? <BarChart data={barChartData} /> : <div>No data</div>}
        </Box>
      </Box>
      {/* Top/Bottom 5 Teachers and Bundles */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
          <h2 className="font-semibold mb-2">Top 5 Teachers</h2>
          <ul>
            {topTeachers.map(([adminId, revenue]) => (
              <li key={adminId}>{adminId}: ₹{revenue}</li>
            ))}
          </ul>
          <h2 className="font-semibold mt-4 mb-2">Least 5 Teachers</h2>
          <ul>
            {bottomTeachers.map(([adminId, revenue]) => (
              <li key={adminId}>{adminId}: ₹{revenue}</li>
            ))}
          </ul>
        </Box>
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
          <h2 className="font-semibold mb-2">Top 5 Bundles</h2>
          <ul>
            {topBundles.map(([bundleId, sales]) => (
              <li key={bundleId}>{bundleId}: ₹{sales}</li>
            ))}
          </ul>
          <h2 className="font-semibold mt-4 mb-2">Least 5 Bundles</h2>
          <ul>
            {bottomBundles.map(([bundleId, sales]) => (
              <li key={bundleId}>{bundleId}: ₹{sales}</li>
            ))}
          </ul>
        </Box>
      </Box>
    </Box>
  );
} 