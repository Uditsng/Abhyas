'use client';

import Link from 'next/link';
import { useTheme } from './ThemeContext';

export default function Footer() {
  // Get mounted state from ThemeContext to prevent hydration mismatch
  const { mounted } = useTheme();

  // Don't render until client-side hydration is complete
  if (!mounted) return null;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Mock Test Series</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Prepare for competitive exams with our comprehensive mock tests.
            </p>

          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Exams</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses/ssc-cgl" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  SSC CGL
                </Link>
              </li>
              <li>
                <Link href="/courses/upsc" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  UPSC
                </Link>
              </li>
              <li>
                <Link href="/courses/banking" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Banking Exams
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Contact</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Email: support@mocktestseries.com
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Phone: +91 9876543210
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Mock Test Series. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
