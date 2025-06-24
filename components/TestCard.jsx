'use client'

import { useRouter } from "next/navigation";
import Image from 'next/image';
import {useAuth} from '@/components/AuthContext';

export default function TestCard({ id, title, duration, category, isPaid, imageUrl }) {

  const router = useRouter();
  const {user} = useAuth()

  const handleClick = () => {   // on click it changes page to - /test/mock1
    if (user) {
      router.push(`/test/${id}?courseid=${category}`);
    } else {
      router.push('/auth/login');
    }
  }

  return (
    <div
    onClick={handleClick}
    className="cursor-pointer border dark:border-gray-700 p-5 rounded-xl shadow hover:shadow-lg transition-all bg-white dark:bg-gray-800 space-y-2">
      <Image
          src={imageUrl}
          alt={category + " logo"}
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYyMCIgaGVpZ2h0PSI1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YyZjJmMiIvPjwvc3ZnPg=="
      />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isPaid
              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
          }`}
        >
          {isPaid ? "Premium" : "Free"}
        </span>

      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Category: {category}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {duration} mins</p>
    </div>
  );
}
