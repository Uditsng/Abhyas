'use client';

import Link from 'next/link';

export default function QuickAccessItem({
  icon,
  iconBgClass = "bg-blue-100 dark:bg-blue-900",
  title,
  subtitle,
  actionLink,
  actionText = "View",
  actionBgClass = "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
}) {
  return (
    <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
      <div className={`w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center mr-3`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <Link href={actionLink}>
        <button className={`text-xs ${actionBgClass} px-2 py-1 rounded`}>
          {actionText}
        </button>
      </Link>
    </div>
  );
}