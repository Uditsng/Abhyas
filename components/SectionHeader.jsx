'use client';

import Link from 'next/link';

export default function SectionHeader({ title, viewAllLink, viewAllText = "View All" }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      {viewAllLink && (
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          {viewAllText}
        </Link>
      )}
    </div>
  );
}