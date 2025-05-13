'use client';

import { useState, useMemo } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';
import Link from 'next/link';
import { courses } from '@/lib/courses';
import { testSeries } from '@/lib/tests';

// Preload common images
const preloadedImages = {};
function preloadImage(src) {
  if (typeof window !== 'undefined' && !preloadedImages[src]) {
    preloadedImages[src] = new window.Image();
    preloadedImages[src].src = src;
  }
  return src;
}

// Preload the banner image only on client side
if (typeof window !== 'undefined') {
  preloadImage('/images/banner.jpg');
}

export default function LiveTestsSection() {
  // State for active category
  const [activeCategory, setActiveCategory] = useState('ssc-cgl');

  // Categories for the buttons - using our existing course data
  const categories = courses.map(course => ({
    id: course.id,
    title: course.title
  }));

  // Get tests for the active category - memoize to prevent recalculation
  const availableTests = useMemo(() => {
    return testSeries[activeCategory] || [];
  }, [activeCategory]);

  // Carousel settings for tests - memoize to prevent recreation on every render
  const sliderSettings = useMemo(() => ({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    lazyLoad: 'ondemand',
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }), []);

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
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeCategory === category.id
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
        <Slider {...sliderSettings} className="live-tests-slider">
          {availableTests.map((test) => (
            <div key={test.id} className="px-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition-colors duration-200">
                <div className="relative">
                  {/* Free badge */}
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">FREE</span>

                  {/* Test image */}
                  <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                    <Image
                      src={`/images/banner2.jpg`}
                      alt={test.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+"
                      onError={(e) => {
                        e.target.src = '/images/banner2.jpg';
                      }}
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
                    <Link href={`/tests/${activeCategory}/${test.id}`} className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-4 py-2 rounded-md flex-1 text-center">
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

        {/* Navigation arrows */}
        <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-md p-2 z-10 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-md p-2 z-10 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
