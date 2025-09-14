// pages/index.js

'use client';

import './home.css';
import dynamic from 'next/dynamic';
const Slider = dynamic(() => import('react-slick'), { ssr: false });
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bannerCarouselSettings } from '@/app/config/carouselSettings';
import OptimizedImage from '@/components/OptimizedImage';
import Footer from '@/components/Footer';
import ExamBrowser from '@/components/ExamBrowser';
import BundlePurchase from '@/components/BundlePurchase';
import PackageCard from '@/components/PackageCard'; 
import { getAllBundles } from '@/lib/bundleService'; 
import { getAllPackages } from '@/lib/packageService';
import { FiAward, FiBookOpen, FiDollarSign, FiSmartphone, FiBarChart2 } from 'react-icons/fi';
import TestimonialsSection from '@/components/(LandingPage)/TestimonialsSection';
import BlogPreviewSection from '@/components/(LandingPage)/BlogPreviewSection';
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
  const [topBundles, setTopBundles] = useState([]);
  const [topPackages, setTopPackages] = useState([]); // This line was missing

  const criticalImages = [
    '/images/ADVENTURE IS CALLING (1).png',
    '/images/ABHYAS.png'
  ];

  useEffect(() => {
    const links = [];
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch Bundles
      const bundles = await getAllBundles();
      const sortedBundles = bundles
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);
      setTopBundles(sortedBundles);

      // Use the service function to get enriched package data
      const packages = await getAllPackages();
      const sortedPackages = packages
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);
      setTopPackages(sortedPackages);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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

  const cardStyle = `backdrop-blur-lg border shadow-md rounded-2xl p-8 transition-colors bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20`;

  return (
    <div className="container mx-auto px-4 pt-20 md:px-8 lg:px-12 xl:px-24 w-full">
      {/* Banner Carousel */}
      <div className="w-full">
        <Slider {...bannerCarouselSettings}>
          {criticalImages.map((src, idx) => (
            <div key={idx} className="relative  w-full aspect-[21/5] overflow-hidden border rounded-lg ">
              <OptimizedImage
                src={src}
                alt={`Banner ${idx + 1}`}
                fill
                sizes="90vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Exam Browser */}
      <div className="my-8">
        <ExamBrowser />
      </div>

       
            {/* Top Packages */}
      <motion.section
        className={`mb-14 ${cardStyle}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">🏆 Top Packages</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Get complete exam preparation with our curated packages.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topPackages.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No packages found.</div>
          ) : (
            topPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))
          )}
        </div>
      </motion.section>

      {/* Top Bundles */}
      <motion.section
        className={`mb-14 ${cardStyle}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">🔥 Top Bundles</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Explore our most popular bundles and start your preparation today!</p>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topBundles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No bundles found.</div>
          ) : (
            topBundles.map(bundle => (
              <BundlePurchase key={bundle.id} bundle={bundle} />
            ))
          )}
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        className={`mb-14 ${cardStyle}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">✨ Why Choose Us?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">We offer the best features for your exam preparation journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {whyChooseUs.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className={`rounded-2xl shadow-md p-6 flex flex-col items-center justify-center backdrop-blur-lg border bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20 hover:scale-105 transition-transform`}
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

      {/* Other Sections */}
      <motion.div  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <TestimonialsSection />
      </motion.div>

      <motion.div className={`mb-14 ${cardStyle}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <BlogPreviewSection />
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <AppDownloadSection />
      </motion.div>

      <motion.div className="mt-14" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}> 
        <PartnerWithUsSection />
      </motion.div>
{/* className={`mb-14 ${cardStyle}`} */}
      <motion.div className="mt-14" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <FAQsSection />
      </motion.div>

      <Footer />
    </div>
  );
}

