//Entry Point: The app starts at page.jsx (HomePage). If a user is authenticated, they are redirected to /dashboard.

'use client';

import './home.css';
import Slider from 'react-slick';
import Image from 'next/image';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ExamCategories from '@/components/ExamCategories';
import LiveTestsSection from '@/components/LiveTestsSection';
import LottieSection from '@/components/LottieSection';
import ExploreSuperCoaching from '@/components/ExploreSuperCoaching';
import {useAuth} from '@/components/AuthContext';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function HomePage() {

  const {user, loading} = useAuth();
  const router = useRouter();
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          dots: true,
          fade: false,
          speed: 300
        }
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-24 w-full">
      {/* Navbar would be here or is included via layout */}

      {/* Banner Carousel */}
      <div className="w-full carousel-container">
        <Slider {...sliderSettings}>
          <div className="relative w-full banner-slide bg-red-500">
            <Image
              src="/images/textbook result banner.webp"
              alt="Textbook Result Banner"
              width={1620}
              height={500}
              className=" banner-image"
              priority
              sizes="100vw"
              quality={85}
              placeholder="blur"
             blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyMCIgaGVpZ2h0PSI1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YyZjJmMiIvPjwvc3ZnPg=="
          />
             </div>
          <div className="relative w-full banner-slide bg-cyan-200">
            <Image
              src="/images/textbook selection banner.webp"
              alt="Textbook Selection Banner"
              width={1620}
              height={500}
              className="  banner-image"
              sizes="100vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyMCIgaGVpZ2h0PSI1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YyZjJmMiIvPjwvc3ZnPg=="
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
