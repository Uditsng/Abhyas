"use client";

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import StatCard from "../../components/admin/StatCard";
import AreaChart from "../../components/admin/AreaChart";
import BarChart from "../../components/admin/BarChart";
import PieChart from "../../components/admin/PieChart1"
import MotivationalCarousel from "../../components/admin/MotivationalCarousel";

import { FiUsers, FiFileText, FiFilePlus } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

import { auth } from "@/lib/firebaseConfig";
import { getAllTests } from "@/lib/adminTestsService";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUserInfo,
} from "@/lib/salesService";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalBundles: 0,
    earnings: 0,
  });

  const [userGrowthData, setUserGrowthData] = useState({
    labels: [],
    datasets: [],
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [bundlePieData, setBundlePieData] = useState(null)

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "gray.50");

  useEffect(() => {
    async function fetchAdminDashboardStats() {
      setLoading(true);
      if (!user) return;

      const adminTests = await getAllTests(user.uid);
      const adminBundles = await getBundlesByAdmin(user.uid);

      let earnings = 0;
      const userSet = new Set();
      const growthMap = {};
      const monthlyEarningsMap = {};
      const bundleEarningsMap = {};

      for (const bundle of adminBundles) {
        const orders = await getOrdersForBundle(bundle.id);
        for (const order of orders) {
          earnings += order.amount || 0;

          const orderDate = order.date?.toDate?.() || new Date(order.date);
          const monthLabel = `${orderDate.getFullYear()}-${String(
            orderDate.getMonth() + 1
          ).padStart(2, "0")}`;
          monthlyEarningsMap[monthLabel] =
            (monthlyEarningsMap[monthLabel] || 0) + (order.amount || 0);

          // Bundle earnings  
          if (bundle.title) {
            bundleEarningsMap[bundle.title] = (bundleEarningsMap[bundle.title] || 0) + (order.amount || 0);
          }

          //User Growth
          if (order.userId && !userSet.has(order.userId)) {
            userSet.add(order.userId);
            const userDoc = await getUserInfo(order.userId);
            if (userDoc?.createdAt) {
              const date = userDoc.createdAt.toDate
                ? userDoc.createdAt.toDate()
                : new Date(userDoc.createdAt);
              const growthLabel = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              growthMap[growthLabel] = (growthMap[growthLabel] || 0) + 1;
            }
          }
        }
      }

      const sortedGrowthLabels = Object.keys(growthMap).sort();
      const growthData = sortedGrowthLabels.map((label) => growthMap[label]);

      //Month Revenue
      const currentYear = new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) =>
        new Date(currentYear, i).toLocaleString("default", { month: "short" })
      );

      const fullRevenueData = months.map((monthName, i) => {
        const key = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
        return monthlyEarningsMap[key] || 0;
      });

      setMonthlyRevenueData({
        labels: months,
        datasets: [
          {
            label: "Monthly Revenue",
            data: fullRevenueData,
            backgroundColor: "rgba(59,130,246,0.7)",
          },
        ],
      });

      // Bundle Pie Chart Data
      const bundleLabels = Object.keys(bundleEarningsMap);
      const bundleEarnings = bundleLabels.map(label => bundleEarningsMap[label]);

      setBundlePieData({
        labels: bundleLabels,
        datasets: [
          {
            label: "Bundle Earnings",
            data: bundleEarnings,
            backgroundColor: bundleLabels.map((_, i) =>
              `hsl(${(i * 360) / bundleLabels.length}, 70%, 60%)`
            ),
          },
        ],
      });



      setStats({
        totalUsers: userSet.size,
        totalTests: adminTests.length,
        totalBundles: adminBundles.length,
        earnings: earnings.toFixed(2),
      });

      setUserGrowthData({
        labels: sortedGrowthLabels,
        datasets: [
          {
            label: "New Users",
            data: growthData,
            borderColor: "rgba(16, 185, 129, 1)",
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });

      setLoading(false);
    }

    if (!authLoading && user) {
      fetchAdminDashboardStats();
    }
  }, [user, authLoading]);

  const cardConfig = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FiUsers size={28} />,
    },
    {
      title: "Total Tests",
      value: stats.totalTests,
      icon: <FiFileText size={28} />,
    },
    {
      title: "Total Bundles",
      value: stats.totalBundles,
      icon: <FiFilePlus size={28} />,
    },
    {
      title: "Earnings",
      value: `₹${stats.earnings}`,
      icon: <FaRupeeSign size={28} />,
    },
  ];

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return `₹${ctx.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        ticks: { autoSkip: false },
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize:2000,
          callback: (val) => `₹${val}`,
        },
        grid:{
          display: false,
        }
      },
    },
  };

  if (loading)
    return (
      <Box p={8} fontSize="lg">
        Loading dashboard...
      </Box>
    );

  return (
    <Box mt={8} color={textColor}>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cardConfig.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </Box>

      {/* Charts Section */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="lg">
          <h2 className="font-semibold mb-2">User Growth</h2>
          {userGrowthData ? (
            <AreaChart data={userGrowthData} />
          ) : (
            <div>No data</div>
          )}
        </Box>
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="lg">
          <h2 className="font-semibold mb-2">Revenue (Monthly)</h2>
          {monthlyRevenueData ? (
            <BarChart data={monthlyRevenueData} options={barChartOptions} />
          ) : (
            <div>No data</div>
          )}
        </Box>
      </Box>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="lg">
          <h2 className="font-semibold mb-4 text-center">
            Earnings by Bundle
          </h2>
          {bundlePieData ? (
            <div className="w-full max-w-[360px] mx-auto">
              <PieChart data={bundlePieData} />
            </div>
          ) : (
            <div>No data</div>
          )}
        </Box>
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="lg" className="flex flex-col">
          <h2 className="font-semibold mb-4 text-center">
            Motivational Quotes
          </h2>
          <div className="flex-grow flex items-center justify-center">
            <MotivationalCarousel />
          </div>
        </Box>
      </div>
    </Box>
    
  );
}
