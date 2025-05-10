'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { StarIcon, TimeIcon } from '@chakra-ui/icons';
import CourseCard from '@/components/CourseCard';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import SectionHeader from '@/components/SectionHeader';
import CardContainer from '@/components/CardContainer';
import { courses } from '@/lib/courses';
import './dashboard.css';
import ResourceCards from '@/components/ResourceCards';

export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentTests, setRecentTests] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);

  // Fetch user data
  useEffect(() => {
    // Fetch username from local storage
    const storedUser = JSON.parse(localStorage.getItem('mockUser'));
    if (storedUser && storedUser.name) {
      setUsername(storedUser.name);
    }

    // Load recent test results from localStorage
    const storedResults = localStorage.getItem('testResults');
    let results = [];

    if (storedResults) {
      try {
        results = JSON.parse(storedResults);
      } catch (error) {
        console.error('Error parsing test results:', error);
      }
    }

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Take only the 3 most recent tests
    setRecentTests(results.slice(0, 3));

    // Mock data for upcoming tests
    setUpcomingTests([
      {
        id: 'ssc-cgl-mock1',
        title: 'SSC CGL Full Mock Test',
        course: 'ssc-cgl',
        date: '2023-11-15',
        duration: 60
      },
      {
        id: 'jee-mock1',
        title: 'JEE Mathematics Quiz',
        course: 'jee',
        date: '2023-11-18',
        duration: 45
      }
    ]);

    // Mock data for course progress
    setCourseProgress([
      { id: 'course1', title: 'SSC CGL Complete Course', progress: 65, totalModules: 12, completedModules: 8 },
      { id: 'course2', title: 'Banking Exam Preparation', progress: 30, totalModules: 10, completedModules: 3 },
    ]);

    setLoading(false);
  }, []);

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className=" container mx-auto px-24 bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
      {/* Welcome banner */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {username || 'Student'}!</h1>
          <p className="font-light mt-2">Continue your preparation journey</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Trending course carousel */}
        <SectionHeader title="Trending Courses" />
        <div className="slick-container mb-16">
          <Slider {...sliderSettings}>
            {courses.map((course) => (
              <div key={course.id} className="px-2 h-full">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  image={course.image}
                />
              </div>
            ))}
          </Slider>
        </div>

        <ResourceCards/>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pt-8">
          <StatCard title="Tests Taken" value="12" />
          <StatCard title="Avg. Score" value="72%" borderColor="border-green-500" />
          <StatCard title="Study Hours" value="45h" borderColor="border-purple-500" />
          <StatCard title="Rank" value="#222" borderColor="border-yellow-500" />
        </div>

        {/* Recent Test Performance */}
        <div className="mb-8">
          <SectionHeader title="Recent Test Performance" viewAllLink="/results" />

          <CardContainer>
            {recentTests.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentTests.map((test, index) => {
                  const scorePercentage = Math.round((test.score / test.totalQuestions) * 100);

                  return (
                    <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                            <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">{scorePercentage}%</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">{test.title || `${test.courseId.toUpperCase()} Test`}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(test.date).toLocaleDateString()} • {test.score}/{test.totalQuestions} correct
                            </p>
                          </div>
                        </div>
                        <Link href={`/results/${test.testId}`}>
                          <button className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md">
                            Details
                          </button>
                        </Link>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <ProgressBar percentage={scorePercentage} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <TimeIcon boxSize={6} color="blue.500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Tests Completed Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Take your first test to see your performance here.</p>
                <Link href="/tests">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                    Browse Tests
                  </button>
                </Link>
              </div>
            )}
          </CardContainer>
        </div>

        {/* Side-by-side cards for Upcoming Tests and Bookmarked Questions */}
        <div className="mb-8">
          <SectionHeader title="Quick Access" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Tests Card */}
            <CardContainer>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Upcoming Tests</h3>
                <Link href="/tests" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="p-4">
                {upcomingTests.length > 0 ? (
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

                        <Link href={`/test/${test.id}`}>
                          <button className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                            Start
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tests scheduled.</p>
                )}
              </div>
            </CardContainer>

            {/* Bookmarked Questions Card */}
            <CardContainer>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Bookmarked Questions</h3>
                <Link href="/bookmarks" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {[
                    { id: 1, question: "What is the capital of France?", test: "Geography Quiz" },
                    { id: 2, question: "Solve for x: 2x + 5 = 15", test: "Math Test" },
                    { id: 3, question: "Who wrote Romeo and Juliet?", test: "Literature Quiz" }
                  ].map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-3">
                        <StarIcon color="yellow.500" boxSize={4} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{bookmark.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{bookmark.test}</p>
                      </div>

                      <Link href={`/bookmarks?id=${bookmark.id}`}>
                        <button className="text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                          Review
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </CardContainer>
          </div>
        </div>

        {/* Course Progress */}
        <div className="mb-8">
          <SectionHeader title="Course Progress" viewAllLink="/courses" />

          <CardContainer>
            {courseProgress.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {courseProgress.map((course) => (
                  <div key={course.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{course.title}</h3>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {course.completedModules}/{course.totalModules} modules
                      </span>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar percentage={course.progress} colorClass="bg-green-500" />

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{course.progress}% complete</span>
                      <Link href={`/courses/${course.id}`}>
                        <button className="text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-md">
                          Continue
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No Courses Enrolled</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Enroll in a course to track your progress here.</p>
                <Link href="/courses">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                    Browse Courses
                  </button>
                </Link>
              </div>
            )}
          </CardContainer>
        </div>

        {/* Study Planner */}
        <div className="mb-8">
          <SectionHeader title="Today's Study Plan" />

          <CardContainer>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  {title: 'JEE Mathematics', time: '10:00 AM', duration: '1 hour', completed: true},
                  {title: 'English Grammar', time: '2:00 PM', duration: '45 mins', completed: false},
                  {title: 'General Knowledge', time: '4:30 PM', duration: '30 mins', completed: false},
                ].map((task, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.time} • {task.duration}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.completed
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {task.completed ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}