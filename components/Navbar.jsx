'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-600">
          Mock Test App
        </Link>
        
        <div className="flex gap-4">
          <Link href="/dashboard" className={`px-3 py-2 rounded hover:bg-gray-100 ${pathname === '/dashboard' ? 'font-semibold' : ''}`}>
            Dashboard
          </Link>
          <Link href="/auth/login" className={`px-3 py-2 rounded hover:bg-gray-100 ${pathname === '/auth/login' ? 'font-semibold' : ''}`}>
            Login
          </Link>
          <Link href="/auth/register" className={`px-3 py-2 rounded hover:bg-gray-100 ${pathname === '/auth/register' ? 'font-semibold' : ''}`}>
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}