//Entry Point: The app starts at page.jsx (HomePage). If a user is authenticated, they are redirected to /dashboard.

'use client';

import './home.css';

import dynamic from 'next/dynamic';
const Slider = dynamic(() => import('react-slick'), { ssr: false });
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
import Footer from '@/components/Footer'

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
    <>
    <div className="container mx-auto px-4 pt-20 md:px-8 lg:px-12 xl:px-24 w-full">

      {/* Banner Carousel */}
        <div className="w-full">
        <Slider {...bannerCarouselSettings}>
          
          <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-80 overflow-hidden bg-red-400">
            <OptimizedImage
              src="/images/textbook result banner.webp"
              alt="Textbook Result Banner"
              fill
              sizes="90vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-80 overflow-hidden bg-blue-300">
            <OptimizedImage
              src="/images/textbook selection banner.webp"
              alt="Textbook Selection Banner"
              fill
              sizes="90vw"
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

       <Footer/>

    </div>
    </>
  );
}
