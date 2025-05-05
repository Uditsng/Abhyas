
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function CourseCard({ id, title, description, image }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/tests/${id}`)}
      className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition flex flex-col items-center text-center h-full"
    >
      <div className="w-20 h-20 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">

        {image ? (
          <Image
            src={image}
            alt={`${title} logo`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/placeholder.png';
            }}
          />
        ) : (
          <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{title.charAt(0)}</span>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}
