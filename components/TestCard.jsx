'use client'

import { useRouter } from "next/navigation";

export default function TestCard({ id, title, duration, category, isPaid, imageUrl }) {
    
  const router = useRouter();

  const handleClick = () => {
    router.push(`/test/${id}`)
  }
  
  return (
    <div 
    onClick={handleClick}
    className="cursor-pointer border p-5 rounded-xl shadow hover:shadow-lg transition-all bg-white space-y-2">
      <img
          src={imageUrl}
          alt={category + " logo"}
          className="h-12 w-12 object-contain"
      />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isPaid ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isPaid ? "Premium" : "Free"}
        </span>
      </div>
      <p className="text-sm text-gray-600">Category: {category}</p>
      <p className="text-sm text-gray-600">Duration: {duration} mins</p>
    </div>
  );
}