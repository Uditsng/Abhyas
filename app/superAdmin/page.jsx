"use client";

import React, { useEffect, useState, useMemo } from 'react';
import StatCard from '../../components/admin/StatCard';
import AreaChart from '../../components/admin/AreaChart';
import BarChart from '../../components/admin/BarChart';
import {
  getTotalUsers,
  getTotalAdmins,
  getTotalEarnings,
  getPlatformCommission,
  getGrowthData,
  getRevenueData,
} from '../../lib/superAdminDashboardService';
import { FiUser, FiUserPlus,FiCheckCircle } from 'react-icons/fi';
import {FaRupeeSign} from 'react-icons/fa'
import { Box, useColorModeValue } from '@chakra-ui/react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
function formatMonthYear(key) {
  const [year, month] = key.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function buildRevenueArray(revenueData, year) {
  return MONTHS.map((month, idx) => {
    const key = `${year}-${String(idx + 1).padStart(2, "0")}`;
    return revenueData && revenueData[key] ? revenueData[key] : 0;
  });
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [growthData, setGrowthData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [totalUsers, totalAdmins, totalEarnings, commission, growth, revenue,] = await Promise.all([
          getTotalUsers(),
          getTotalAdmins(),
          getTotalEarnings(),
          getPlatformCommission(),
          getGrowthData(),
          getRevenueData(),
        ]);
        setStats({ totalUsers, totalAdmins, totalEarnings, commission });
        setGrowthData(growth);
        setRevenueData(revenue);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data.');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Prepare chart data
  const areaChartData = useMemo(() => {
    if (!growthData) return null;
    const keysSorted = Object.keys(growthData).sort(
      (a, b) => new Date(a + '-01') - new Date(b + '-01')
    )
   return {
    labels: keysSorted.map(formatMonthYear),
    datasets: [
      {
        label: 'Users',
        data: keysSorted.map(k => growthData[k].users),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
        tension:0.4
      },
      {
        label: 'Admins',
        data: keysSorted.map(k => growthData[k].admins),
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: false,
        tension:0.4
      }
    ],
  } }, [growthData]);

    const barChartData = useMemo(() => {
    if (!revenueData) return null;
    return {
    labels: MONTHS,
    datasets: [
      {
        label: 'Revenue',
        data: buildRevenueArray(revenueData, selectedYear),
        backgroundColor: 'rgba(59,130,246,0.7)',
      }
    ]
  }}, [revenueData, selectedYear]);

    // Chart.js options for BarChart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            // Show as '₹xx,xxx'
            let v = ctx.parsed.y || 0;
            return `₹${v.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: "category",
        ticks: {
          autoSkip: false, // always show all months
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10000,
          callback: function (value) {
            return value === 0 ? "0" : value / 1000 + "K";
          }
        },
        suggestedMax: 10000 * 12 // adjust as per your needs
      }
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'gray.100');

  if (loading) return <Box p={8} fontSize="lg">Loading dashboard...</Box>;
  if (error) return <Box p={8} color="red.500">{error}</Box>;

  return (
    <Box mt={8} color={textColor}>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">SuperAdmin Dashboard</h1>
      {/* Stats Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<FiUser size={28} />} />
        <StatCard title="Total Admins" value={stats.totalAdmins} icon={<FiUserPlus size={28} />} />
        <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toFixed(2)}`} icon={<FaRupeeSign size={28} />} />
        <StatCard title="PlatForm Commission" value={`₹${stats.commission}`} icon={<FiCheckCircle size={28} />} />
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
    </Box>
  );
} 