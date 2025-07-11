"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
const Slider = dynamic(() => import('react-slick'), { ssr: false });
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { TimeIcon } from "@chakra-ui/icons";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import SectionHeader from "@/components/SectionHeader";
import CardContainer from "@/components/CardContainer";
import { getAllBundles } from "@/lib/bundleService";
import ResourceCards from "@/components/ResourceCards";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Box, Text, Spinner, useToast } from "@chakra-ui/react"; 
import ExamBrowser from "@/components/ExamBrowser";
import useUserTestResults from "@/hooks/useUserTestResults";
import TestResultsList from "@/components/TestResultsList";

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
  const { isAuthenticated, isLoading: authLoading } = useAuthRedirect();
  const uid = user?.uid;

  const {
    results: testResults,
    loading: testResultsLoading,
    error: testResultsError
  } = useUserTestResults(uid);

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendingBundles, setTrendingBundles] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]); // Will try to use real data
  const [courseProgress, setCourseProgress] = useState([]); // Will try to use real data
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
        // TODO: Replace with real data if available
        setUpcomingTests([
          {
            id: "ssc-cgl-mock1",
            title: "SSC CGL Full Mock Test",
            course: "ssc-cgl",
            date: "2023-11-15",
            duration: 60,
          },
          {
            id: "jee-mock1",
            title: "JEE Mathematics Quiz",
            course: "jee",
            date: "2023-11-18",
            duration: 45,
          },
        ]);
        setCourseProgress([
          {
            id: "course1",
            title: "SSC CGL Complete Course",
            progress: 65,
            totalModules: 12,
            completedModules: 8,
          },
          {
            id: "course2",
            title: "Banking Exam Preparation",
            progress: 30,
            totalModules: 10,
            completedModules: 3,
          },
        ]);
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
    <Box p={6}>
      <div className="container mx-auto px-4 pt-20 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
        {/* Welcome banner */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {username || "Student"}!
            </h1>
            <p className="font-light mt-2">Continue your preparation journey</p>
          </div>
        </div>
        {/* Exams Carousel */}
        <Box my={8}>
          <ExamBrowser />
        </Box>
        {/* Resource component  */}
        <ResourceCards />
        {/* Stats cards - Still hardcoded */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pt-8">
          <StatCard title="Tests Taken" value="12" />
          <StatCard title="Avg. Score" value="72%" borderColor="border-green-500" />
          <StatCard title="Study Hours" value="45h" borderColor="border-purple-500" />
          <StatCard title="Rank" value="#222" borderColor="border-yellow-500" />
        </div>
        {/* Recent Test Performance - use TestResultsList */}
        <div className="mb-8">
          <SectionHeader title="Recent Test Performance" viewAllLink="/results" />
          <CardContainer>
            <TestResultsList results={testResults} loading={testResultsLoading} error={testResultsError} />
          </CardContainer>
        </div>
        {/* Quick Access: Upcoming Tests and Course Progress */}
        <div className="mb-8">
          <SectionHeader title="Quick Access" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Tests Card */}
            <CardContainer>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Upcoming Tests</h3>
                <Link href="/tests" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="p-4">
                {(Array.isArray(upcomingTests) && upcomingTests.length > 0) ? (
                  <div className="space-y-3">
                    {upcomingTests.slice(0, 3).map((test) => (
                      <div key={test.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                          <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">{test.duration}m</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{test.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(test.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No upcoming tests scheduled</p>
                  </div>
                )}
              </div>
            </CardContainer>
            {/* Course Progress Card */}
            <CardContainer>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Course Progress</h3>
                <Link href="/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="p-4">
                {(Array.isArray(courseProgress) && courseProgress.length > 0) ? (
                  <div className="space-y-4">
                    {courseProgress.map((course) => (
                      <div key={course.id}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{course.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{course.completedModules}/{course.totalModules} modules</p>
                        </div>
                        <ProgressBar percentage={course.progress} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No courses in progress</p>
                  </div>
                )}
              </div>
            </CardContainer>
          </div>
        </div>
      </div>
    </Box>
  );
}
