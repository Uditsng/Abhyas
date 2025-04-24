
'use client';

import { useRouter } from 'next/navigation';


export default function CourseCard({ id, title, description, image }) {
  const router = useRouter();
console.log("result",id)
  return (
    <div
      onClick={() => router.push(`/tests/${id}`)}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
    >
      <div className="w-20 h-20 mb-3 rounded bg-gray-300 flex items-center justify-center">
        {/* Fallback for missing images */}
        <span className="text-gray-600 text-xs">{title.charAt(0)}</span>
      </div>
      
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
