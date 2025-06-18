//Entry Point: The app starts at page.jsx (HomePage). If a user is authenticated, they are redirected to /dashboard.

'use client';

import './home.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ExamCategories from '@/components/ExamCategories';
import LiveTestsSection from '@/components/LiveTestsSection';
import LottieSection from '@/components/LottieSection';
import ExploreSuperCoaching from '@/components/ExploreSuperCoaching';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { bannerCarouselSettings } from '@/app/config/carouselSettings';
import OptimizedImage from '@/components/OptimizedImage';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-24 w-full">
      {/* Navbar would be here or is included via layout */}

      {/* Banner Carousel */}
      <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 carousel-container">
        <Slider {...bannerCarouselSettings}>
          <div className="relative w-full aspect-[19/6] rounded-lg overflow-hidden">
            <OptimizedImage
              src="/images/textbook result banner.webp"
              alt="Textbook Result Banner"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1900px"
              className="object-cover"
              priority
            />
          </div>
          <div className="relative w-full aspect-[19/6] rounded-lg overflow-hidden">
            <OptimizedImage
              src="/images/textbook selection banner.webp"
              alt="Textbook Selection Banner"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 1900px"
              className="object-cover"
            />
          </div>
        </Slider>
      </div>

      {/* Exam Categories */}
      <ExamCategories />

      {/** Explore Super Coaching */}
      <ExploreSuperCoaching/>

       {/* Live Tests Section */}
       <LiveTestsSection />

       {/* Lottie Section */}
       <LottieSection />

    </div>
  );
}
