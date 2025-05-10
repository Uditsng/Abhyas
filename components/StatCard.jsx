'use client';

export default function StatCard({ title, value, borderColor = "border-blue-500" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} transition-colors duration-200 text-center`}>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}