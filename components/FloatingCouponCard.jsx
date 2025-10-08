'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCoupons } from '@/lib/couponService';
import { getBundlesByIds } from '@/lib/bundleService';
import { getPackagesByIds } from '@/lib/packageService';
import { FiX, FiGift } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCouponCard = () => {
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [bundleNames, setBundleNames] = useState('');
  const [packageNames, setPackageNames] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const checkVisibility = useCallback(() => {
    const dismissedUntil = sessionStorage.getItem('couponDismissedUntil');
    if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
      if (activeCoupons.length > 0) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [activeCoupons.length]);

  useEffect(() => {
    const fetchCouponsAndSet = async () => {
      try {
        const allCoupons = await getCoupons();
        const now = new Date();
        const filteredActive = allCoupons
          .filter(c => c.isActive && c.expiryDate && c.expiryDate.toDate() > now)
          .sort((a, b) => (b.createdAt?.toDate() ? b.createdAt.toDate() : 0) - (a.createdAt?.toDate() ? a.createdAt.toDate() : 0));
        setActiveCoupons(filteredActive);
      } catch (error) {
        console.error("Failed to fetch coupon for display:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCouponsAndSet();
  }, []);

  useEffect(() => {
    if (!loading) {
      checkVisibility();
    }
  }, [loading, checkVisibility]);

  useEffect(() => {
    const visibilityInterval = setInterval(() => {
      checkVisibility();
    }, 5000);
    return () => clearInterval(visibilityInterval);
  }, [checkVisibility]);

  useEffect(() => {
    if (activeCoupons.length > 1) {
      const cycleInterval = setInterval(() => {
        setCurrentCouponIndex(prevIndex => (prevIndex + 1) % activeCoupons.length);
      }, 7000);
      return () => clearInterval(cycleInterval);
    }
  }, [activeCoupons]);

  // Combined and corrected effect to fetch applicable item names
  useEffect(() => {
    const fetchApplicableItemNames = async () => {
      // Reset names each time the coupon changes
      setBundleNames('');
      setPackageNames('');

      if (activeCoupons.length === 0) return;

      const currentCoupon = activeCoupons[currentCouponIndex];

      // Fetch bundle names if they exist
      if (currentCoupon.bundleIds && currentCoupon.bundleIds.length > 0) {
        try {
          const bundles = await getBundlesByIds(currentCoupon.bundleIds);
          const names = bundles.map(b => b.title).join(', ');
          setBundleNames(names);
        } catch (error) {
          console.error("Failed to fetch bundle names:", error);
          setBundleNames('applicable bundles');
        }
      }

    
      if (currentCoupon.applicablePackageIds && currentCoupon.applicablePackageIds.length > 0) {
        try {
          const packages = await getPackagesByIds(currentCoupon.applicablePackageIds);
          const names = packages.map(p => p.name).join(', ');
          setPackageNames(names);
        } catch (error) {
          console.error("Failed to fetch package names:", error);
          setPackageNames('applicable packages');
        }
      }
    };

    fetchApplicableItemNames();
  }, [currentCouponIndex, activeCoupons]);

  const handleDismiss = () => {
    setIsVisible(false);
    const twoMinutes = 2 * 60 * 1000;
    sessionStorage.setItem('couponDismissedUntil', (Date.now() + twoMinutes).toString());
  };

  const currentCoupon = activeCoupons[currentCouponIndex];

  if (loading || !currentCoupon || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={currentCoupon.id}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed bottom-5 right-5 z-50 w-full max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 p-5 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close coupon notification"
          >
            <FiX size={20} />
          </button>

          <div className="flex items-center gap-4 mb-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <FiGift className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Special Offer!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use code at checkout</p>
            </div>
          </div>

          <div className="text-center bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-2 mb-4">
            <p className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">{currentCoupon.code}</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-800 dark:text-gray-200">
              Get <span className="font-bold text-green-500">{currentCoupon.type === 'percentage' ? `${currentCoupon.value}% OFF` : `₹${currentCoupon.value} OFF`}</span>
            </p>

            {bundleNames && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">On:</span> {bundleNames}
              </p>
            )}
            {packageNames && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">On:</span> {packageNames}
              </p>
            )}
            <p className="text-xs text-red-500 dark:text-red-400 pt-1">
              Expires on: {currentCoupon.expiryDate.toDate().toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCouponCard;