
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function CourseCard({ id, title, description, image }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/tests/${id}`)}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
    >
      <div className="w-20 h-20 mb-3 rounded bg-gray-300 flex items-center justify-center">

        {image ? (
          <Image
            src={image}
            alt={`${title} logo`}
            width={80}
            height={80}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = '/images/placeholder.png';
            }}
          />
        ) : (
          <span className="text-gray-600 text-2xl font-bold">{title.charAt(0)}</span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
