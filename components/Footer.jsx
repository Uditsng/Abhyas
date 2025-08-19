'use client';

import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { usePathname } from "next/navigation";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  // This might be unnecessary unless you’ve had hydration mismatch issues
  const { mounted } = useTheme();
  const pathname = usePathname();
  if (!mounted) return null;

  const currentYear = new Date().getFullYear();
if (/^\/test(\/[^\/]+){1,2}$/.test(pathname)) return null;
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">ABHYAS Platform</h2>
            <p className="text-sm">
              Ace your exams with curated mock tests designed by experts. Trusted by over 1L+ students.
            </p>
            <div className="flex gap-4 mt-4">
              {/* Replace emoji with actual icons or <Image />/SVG */}
              <a href="#" className="hover:text-blue-500 transition text-xl"><FaFacebook/></a>
              <a href="#" className="hover:text-pink-500 transition text-xl"><FaInstagram/></a>
              <a href="#" className="hover:text-blue-400 transition text-xl"><FaLinkedin/></a>
              <a href="#" className="hover:text-red-600 transition text-xl"><FaYoutube/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link></li>
              <li><Link href="/bookmarks" className="hover:text-blue-600 dark:hover:text-blue-400">Bookmarks</Link></li>
              <li><Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400">Profile</Link></li>
            </ul>
          </div>

          {/* Popular Exams */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Popular Exams</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses/ssc-cgl" className="hover:text-blue-600 dark:hover:text-blue-400">SSC CGL</Link></li>
              <li><Link href="/courses/upsc" className="hover:text-blue-600 dark:hover:text-blue-400">UPSC</Link></li>
              <li><Link href="/courses/banking" className="hover:text-blue-600 dark:hover:text-blue-400">Banking</Link></li>
              <li><Link href="/courses/railways" className="hover:text-blue-600 dark:hover:text-blue-400">Railways</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact Us</h3>
            <ul className="text-sm space-y-2">
              <li>Email: <a href="mailto:support@mocktestseries.com" className="hover:underline">support@mocktestseries.com</a></li>
              <li>Phone: <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a></li>
              <li>Hours: Mon–fri, 10AM–5PM</li>
              <li>Location: Gorakhpur, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© {currentYear} [WG] Abhyas Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
