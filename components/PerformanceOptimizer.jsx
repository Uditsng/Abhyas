'use client';

import { useEffect } from 'react';

/**
 * PerformanceOptimizer component that implements various performance optimizations
 * - Preloads critical resources
 * - Implements resource hints
 * - Defers non-critical operations
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/images/banner.jpg',
      '/images/textbook result banner.webp',
      '/images/textbook selection banner.webp'
    ];
    
    // Preload images after a short delay to not block initial render
    const preloadTimeout = setTimeout(() => {
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }, 1000);
    
    // Implement connection preconnect for Firebase
    const preconnectHosts = [
      'https://firebaseinstallations.googleapis.com',
      'https://firebaseremoteconfig.googleapis.com',
      'https://firestore.googleapis.com'
    ];
    
    preconnectHosts.forEach(host => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = host;
      document.head.appendChild(link);
    });
    
    // Implement requestIdleCallback for non-critical operations
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Preload non-critical CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/styles/theme-integration.css';
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
        document.head.appendChild(link);
      });
    }
    
    return () => {
      clearTimeout(preloadTimeout);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}
