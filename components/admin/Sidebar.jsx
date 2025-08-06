

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiUsers, FiFilePlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: FiHome },
  { name: 'Tests', path: '/admin/tests', icon: FiFileText },
  { name: 'Create-Bundle', path: '/admin/create-bundle', icon: FiFilePlus },
  { name: 'Users', path: '/admin/users', icon: FiUsers },
  { name: 'Sales Revenue', path: '/admin/sales-revenue', icon: FaRupeeSign },
];

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  // Auto collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        setIsCollapsed(isMobile);
      }
    };
    handleResize(); // initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  return (
    <aside
      className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] z-10 transition-all duration-300 border-r
        dark:border-gray-700 ${isCollapsed ? 'w-[60px]' : 'w-[240px]'} 
        bg-white dark:bg-gray-900 border-gray-200 pb-24`}
    >
      {/* Sidebar header with toggle */}
      <div className={`flex items-center px-4 pt-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <span className="text-lg font-semibold text-gray-800 dark:text-white">Admin Panel</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <FiChevronRight className="text-xl" /> : <FiChevronLeft className="text-xl" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="mt-6 flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name}>
              <div
                className={`flex items-center mx-2 px-3 py-2 rounded-md cursor-pointer group transition
                ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
              >
                <item.icon className="text-xl shrink-0" />
                {!isCollapsed && (
                  <span className="ml-4 text-sm font-medium">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
