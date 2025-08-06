'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';
import { getTestsForCourse } from '@/lib/adminTestsService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { liveTestsCarouselSettings } from '@/app/config/carouselSettings';
import OptimizedImage from '@/components/OptimizedImage';

export default function LiveTestsSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [coursesState, setCoursesState] = useState([])

  // Handle test click - redirect to login if not authenticated
  const handleTestClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  // Categories for the buttons - using our existing course data
  const categories = coursesState.map(course => ({
    id: course.id,
    title: course.title
  }));


  const [availableTests, setAvailableTests] = useState([])
  useEffect(()=>{
    async function fetchTests() {
      const tests = await getTestsForCourse('ssc-cgl')
      setAvailableTests(tests)          
    }
   fetchTests();
  },[]);

  return (
    <div className="py-8 px-4 mb-10">
      {/* Heading with FREE badge */}
      <div className="flex justify-center items-center gap-2 mb-6">
        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">FREE</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Live Mock Tests</h2>
      </div>

      {/* Category selection with dots instead of scrolling buttons */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full text-sm ${
                category.id === 'ssc-cgl'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Live tests carousel */}
      <div className="relative">
        <Slider {...liveTestsCarouselSettings} className="live-tests-slider">
          {availableTests.map((test, index) => (
            <div key={test.id} className="px-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition-colors duration-200">
                <div className="relative">
                  {/* Free badge */}
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">FREE</span>

                  {/* Test image */}
                  <div className="relative w-full h-48 overflow-hidden rounded-lg">
                    <OptimizedImage
                      src="/images/banner.jpg"
                      alt={test.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={index < 4}
                    />
                  </div>

                  {/* Status badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      STARTING SOON
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">{test.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                    {test.totalQuestions} Questions • {test.duration} mins
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/tests/ssc-cgl/${test.id}`}
                      onClick={handleTestClick}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-4 py-2 rounded-md flex-1 text-center"
                    >
                      Take Test
                    </Link>
                    <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs px-4 py-2 rounded-md transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
