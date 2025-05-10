
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

export default function HomePage() {
  // Carousel settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    pauseOnHover: false
  };

  return (
    <div className=" container mx-auto px-24 w-full">
      {/* Navbar would be here or is included via layout */}
      
      {/* Banner Carousel */}
      <div className="w-full carousel-container">
        <Slider {...sliderSettings}>
          <div className="relative w-full banner-slide">
            <Image
              src="/images/textbook result banner.webp"
              alt="Textbook Result Banner"
              width={1920}
              height={600}
              className="banner-image"
              priority
            />
          </div>
          <div className="relative w-full banner-slide">
            <Image
              src="/images/textbook selection banner.webp"
              alt="Textbook Selection Banner"
              width={1920}
              height={600}
              className="banner-image"
              priority
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
