'use client'

import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function TestCard({ id, title, duration, category, isPaid, imageUrl }) {

  const router = useRouter();

  const handleClick = () => {   // on click it changes page to - /test/mock1
    router.push(`/test/${id}`)
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
          onError={(e) => {
            // Next/Image handles errors differently
            e.target.src = '/images/placeholder.png';
          }}
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
