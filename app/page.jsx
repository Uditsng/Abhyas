//Entry Point: The app starts at page.jsx (HomePage). If a user is authenticated, they are redirected to /dashboard.

'use client';

import './home.css';

import dynamic from 'next/dynamic';
const Slider = dynamic(() => import('react-slick'), { ssr: false });
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

//import ExamCategories from '@/components/ExamCategories';
import LiveTestsSection from '@/components/(LandingPage)/LiveTestsSection';
import LottieSection from '@/components/(LandingPage)/LottieSection';
import ExploreSuperCoaching from '@/components/(LandingPage)/ExploreSuperCoaching';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { bannerCarouselSettings } from '@/app/config/carouselSettings';
import OptimizedImage from '@/components/OptimizedImage';
import Footer from '@/components/Footer'
import {Box} from "@chakra-ui/react"
import ExamBrowser from "@/components/ExamBrowser"
import BundleCard from '@/components/BundleCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useState } from 'react';
import { FiAward, FiBookOpen, FiDollarSign, FiSmartphone, FiBarChart2 } from 'react-icons/fi';
import { useColorModeValue } from '@chakra-ui/react';
import TestimonialsSection from '@/components/(LandingPage)/TestimonialsSection';
import BlogPreviewSection from '@/components/(LandingPage)/BlogPreviewSection';
import PricingPlansSection from '@/components/(LandingPage)/PricingPlansSection';
import AppDownloadSection from '@/components/(LandingPage)/AppDownloadSection';
import PartnerWithUsSection from '@/components/(LandingPage)/PartnerWithUsSection';
import FAQsSection from '@/components/(LandingPage)/FAQsSection';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Top bundles state
  const [topBundles, setTopBundles] = useState([]);
  // Fetch top bundles on mount
  useEffect(() => {
    async function fetchBundles() {
      const snap = await getDocs(collection(db, 'bundles'));
      // Sort by price descending as a simple 'trending' metric, or use your own logic
      const bundles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.price - a.price)
        .slice(0, 6); // Top 6 bundles
      setTopBundles(bundles);
    }
    fetchBundles();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Why Choose Us features
  const whyChooseUs = [
    {
      icon: FiAward,
      title: 'All India Ranking',
      desc: 'Compete with students nationwide and see where you stand.'
    },
    {
      icon: FiBookOpen,
      title: 'Detailed Solutions',
      desc: 'Get step-by-step solutions for every question.'
    },
    {
      icon: FiDollarSign,
      title: 'Affordable Pricing',
      desc: 'Best value plans for every student.'
    },
    {
      icon: FiSmartphone,
      title: 'App Access',
      desc: 'Learn anytime, anywhere on our mobile app.'
    },
    {
      icon: FiBarChart2,
      title: 'Performance Analytics',
      desc: 'Track your progress with advanced analytics.'
    },
  ];
  const glassBg = useColorModeValue('bg-white/40', 'bg-white/10');
  const glassBorder = useColorModeValue('border-white/30', 'border-white/20');

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
      
      {/* Exams Carousel */}
        <Box my={8} mx={0}>
          <ExamBrowser />
        </Box>
      
      {/* Top Bundles / Popular Plans Section */}
      <motion.section
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🔥 Top Bundles</h2>
          <p className="text-gray-600 text-lg">Explore our most popular bundles and start your preparation today!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {topBundles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No bundles found.</div>
          ) : (
            topBundles.map(bundle => (
                <BundleCard bundle={bundle} />
            ))
          )}
        </div>
      </motion.section>
      
      {/* Why Choose Us Section */}
      <motion.section
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">✨ Why Choose Us?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">We offer the best features for your exam preparation journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {whyChooseUs.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className={`rounded-2xl shadow-md p-6 flex flex-col items-center justify-center ${glassBg} backdrop-blur-lg border ${glassBorder} transition-colors duration-200 hover:scale-105`}
              style={{ minHeight: '200px' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <span className="mb-4 text-blue-500 dark:text-blue-300">
                <feature.icon size={36} />
              </span>
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100 text-center">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <TestimonialsSection />
      </motion.div>

      {/* Blog/Articles Preview Section */}
      <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <BlogPreviewSection />
      </motion.div>
      
      {/* App Download / Mobile Promo Section */}
      <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <AppDownloadSection />
      </motion.div>

      {/* Partner With Us / Become a Teacher Section */}
      <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <PartnerWithUsSection />
      </motion.div>

      {/* FAQs Section */}
      <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <FAQsSection />
      </motion.div>

      {/* Explore Super Coaching */}
      {/* <motion.div
        className={`mb-14 ${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <ExploreSuperCoaching/>
      </motion.div> */}

      {/* Live Tests Section */}
      {/* <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-6`}>
        <LiveTestsSection />
      </Box> */}

      {/* Lottie Section */}
      {/* <Box mb={14} className={`${glassBg} backdrop-blur-lg border ${glassBorder} shadow-md rounded-2xl p-6`}>
        <LottieSection />
      </Box> */}

      <Footer/>
    </div>
    </>
  );
}
