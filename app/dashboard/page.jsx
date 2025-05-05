'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link'
import Slider from 'react-slick';
import CourseCard from '../../components/CourseCard';
import { courses } from '../../lib/courses';
import {testSeries} from '@/lib/tests'
import './dashboard.css';
import { StarIcon } from '@chakra-ui/icons';

export default function DashboardPage() {

  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  const [recentTests, setRecentTests] = useState([])
  const [upcomingTests, setUpcomingTests] = useState([])

  useEffect(()=>{

    //fetch username from local storage
    const storedUser = JSON.parse(localStorage.getItem('mockUser'))
    if (storedUser && storedUser.name){
      setUsername(storedUser.name)
    }
    setLoading(false);
  }, []);

  useEffect(()=>{
    //fetch username from local storage
    const storedUser = JSON.parse(localStorage.getItem('mockUser'))
    if (storedUser && storedUser.name){
      setUsername(storedUser.name)
    }
    setLoading(false);
  }, []);

  // New useEffect for loading test data
  useEffect(() => {
    // Load recent test results from localStorage
    // In a real app, this would come from an API call to your backend
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
    // In a real app, this would come from your backend
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
  }, []);

  //carousel settings
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
  }

  //Mock data for recent activity
  const recentActivity = [
    { id:1, type: 'test', title: 'SSC CGL Mock Test 1', score: '75%', date: '29-04-2025'},
    {id:2, type:'test', title: 'JEE', progress:'60%', date:'23-04-2025'}
  ]

if(loading){
  return <div className="min-h-screen flex items-center justify-center">
Loading...
  </div>
}
  return (
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200'>
      {/*welcome banner*/}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-8'>
        <div className='container mx-auto px-4 sm:px-6'>
          <h1 className='text-2xl sm:text-3xl font-bold'>Welcome back, {username || 'Student'}!</h1>
          <p className='mt-2'>Continue your preparation journey</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Stats cards*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stats cards with dark mode support */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-colors duration-200">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tests Taken</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">12</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-colors duration-200">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg. Score</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">72%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-colors duration-200">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Study Hours</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">45h</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-colors duration-200">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rank</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">#222</p>
          </div>
        </div>

      {/** Trending course carousel */}
      <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Trending Courses</h2>
          <div className="slick-container">
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
        </div>

      {/* New section: Recent Test Performance */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Recent Test Performance</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          {recentTests.length > 0 ? (
            <div className="space-y-4">
              {recentTests.map((test, index) => {
                // Calculate percentage score
                const scorePercentage = Math.round((test.score / test.totalQuestions) * 100);

                return (
                  <div key={index} className="flex items-center justify-between border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{test.title || `${test.courseId.toUpperCase()} Test`}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{scorePercentage}%</p>
                      <Link href={`/results/${test.testId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't taken any tests yet.</p>
              <Link href="/tests" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200">
                Take Your First Test
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* New section: Upcoming Tests */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Upcoming Tests</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          {upcomingTests.length > 0 ? (
            <div className="space-y-3">
              {upcomingTests.map((test) => (
                <div key={test.id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {test.duration} minutes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                    <Link href={`/test/${test.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Prepare
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tests scheduled.</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-400 transition-colors duration-200">
            <div className="flex items-center mb-4">
              <span className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full mr-3">
                <StarIcon color="yellow.500" boxSize={5} />
              </span>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bookmarked Questions</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Review questions you've bookmarked for later study.</p>
            <Link href="/bookmarks">
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition duration-200">
                View Bookmarks
              </button>
            </Link>
          </div>

          {/* You can add more quick access cards here */}
        </div>
      </div>

          {/*Main content Grid */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/**Recent acitivty - 2/3 width on large screens */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>Recent Activity</h2>
            <Link href="/activity" className='text-blue-600 dark:text-blue-400 hover:underline text-sm'>
            View All
            </Link>
          </div>

         {recentActivity.length > 0 ? (
          <div className='space-y-4'>
            {recentActivity.map((item) => (
          <div key={item.id} className='border-b dark:border-gray-700 pb-4 last:border-b-0 last:pd-0'>
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='font-medium text-gray-800 dark:text-gray-200'>{item.title}</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>{item.date}</p>
              </div>
              {item.type === 'test' ? (
                <span className='px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs'>
                  Score: {item.score}
                </span>
              ) : (
                <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs'>Progress: {item.progress}</span>
              )}
            </div>
            </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 dark:text-gray-400 text-center py-4' >No recent activity found.</p>
        )}
        </div>
        </div>

        {/**Sidebar - 1/3 width on large screens */}
        <div className='space-y-6'>
          {/** study Planner */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Today's Study Plan
            </h2>
            <div className="space-y-4">
              {[
                {title: 'JEE', time: '10AM', duration: ' 1 hour', completed: true},
                { title: 'English Grammar', time: '2:00 PM', duration: '45 mins', completed: false },
                { title: 'General Knowledge', time: '4:30 PM', duration: '30 mins', completed: false },
              ].map((task, index) => (
                <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-500"
                />
                <div className="flex-1">
                      <p className={`font-medium ${task.completed
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-800 dark:text-gray-200'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.time} • {task.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200">
                View Full Schedule
              </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { name: 'All Courses', href: '/courses' },
                  { name: 'My Bookmarks', href: '/bookmarks'},
                  { name: 'Performance Reports', href: '/reports'},
                  { name: 'Study Materials', href: '/materials'},
                ].map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
    </div>
    )}
