'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function CourseCard({ id, title, description, image }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/tests/${id}`)}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
    >
      <Image
        src={image}
        alt={title}
        width={80}
        height={80}
        className="mb-3 rounded"
      />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
