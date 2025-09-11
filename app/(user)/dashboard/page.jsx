"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Slider = dynamic(() => import("react-slick"), { ssr: false });
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";
import { getAllBundles } from "@/lib/bundleService";
import { getAllPackages } from "@/lib/packageService"; // Import package service
import ResourceCards from "@/components/ResourceCards";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Text, Spinner, useToast } from "@chakra-ui/react";
import ExamBrowser from "@/components/ExamBrowser";
import useUserTestResults from "@/hooks/useUserTestResults";
import TestResultsList from "@/components/TestResultsList";
import useUserDashboardStats from "@/hooks/useUserDashboardStats";
import PerformanceChart from "@/components/PerformanceChart";
import BundleProgressList from "@/components/BundleProgressList";
import SmartSuggestions from "@/components/SmartSuggestions";
import PackageCard from "@/components/PackageCard"; // Import PackageCard


// Define slider settings
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 200,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { isAuthenticated, isLoading: authLoading } = useAuthRedirect({allowedRoles:['user']});
  const uid = user?.uid;

  const {
    results: testResults,
    loading: testResultsLoading,
    error: testResultsError,
  } = useUserTestResults(uid);

  const stats = useUserDashboardStats(testResults);

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendingBundles, setTrendingBundles] = useState([]);0
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [error, setError] = useState(null);

  // Fetch user data and dynamic content
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        // Set username from authenticated user
        if (user?.displayName) {
          setUsername(user.displayName);
        } else if (user?.email) {
          setUsername(user.email.split("@")[0]);
        }
        // Fetch Trending Courses from Firestore
        const fetchedBundles = await getAllBundles();
        setTrendingBundles(fetchedBundles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
        toast({
          title: "Error loading dashboard",
          description: err.message || "Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading, toast]);

  if (authLoading || loading || testResultsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>Loading dashboard...</Text>
      </div>
    );
  }

  if (error || testResultsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">{error || testResultsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
      {/* Welcome banner */}
      <section className="bg-indigo-600 text-white rounded-xl p-8 mb-10 text-center">
        <h2 className="text-4xl font-bold mb-2">
          Welcome back,
          <span className="text-yellow-300"> {username || "Student"}!</span>
        </h2>
        <p className="text-indigo-200">Continue your preparation journey</p>
      </section>

      {/* Exams Carousel */}
      <ExamBrowser />

      {/* Featured Packages */}
      <div className="mt-4">
        <SectionHeader title="🏆 Featured Packages" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {featuredPackages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <SectionHeader title="🔥 Featured Bundles" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {trendingBundles.slice(0, 3).map((bundle) => (
            <div
              key={bundle.id || bundle.bundleId} 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition">
              <h4 className="text-lg font-semibold mb-2">{bundle.title}</h4>
              <p className="text-sm text-gray-500 mb-2">{bundle.subject}</p>
              <button className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                View Bundle
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Resource component  */}
      <ResourceCards />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pt-8">
        <StatCard title="Tests Taken" value={stats.testsTaken} />
        <StatCard
          title="Avg. Score"
          value={`${stats.avgScore}%`}
          borderColor="border-green-500"
        />
        <StatCard
          title="Test Hours"
          value={`${stats.totalStudyTime}h`}
          borderColor="border-purple-500"
        />
        <StatCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          borderColor="border-yellow-500"
        />
      </div>

      {/* Performance & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <PerformanceChart testResults={testResults} />
        </div>
        <div>
          <SmartSuggestions
            testResults={testResults}
            bundles={trendingBundles}
          />
        </div>
      </div>

      {/* Test Results & Bundle Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {testResults.length === 0 ? (
          <div className="col-span-1 md:col-span-2">
            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                No Tests Taken Yet
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                Start your first test today and track your progress here!
              </p>
              <button
                onClick={() => router.push("/tests")}
                className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Take a Test
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <SectionHeader title="Recent Test Performance" />
              <TestResultsList
                results={testResults}
                loading={testResultsLoading}
                error={testResultsError}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-xl transition-all border-l-4 border-blue-500">
              <SectionHeader title="Bundle Progress" />
              <BundleProgressList
                bundles={trendingBundles}
                testResults={testResults}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
