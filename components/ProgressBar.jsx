'use client';

export default function ProgressBar({ percentage, height = "h-2", colorClass = "" }) {
  // Determine color based on percentage if not provided
  let barColor = colorClass;
  if (!colorClass) {
    barColor = percentage >= 70 ? 'bg-green-500' : 
              percentage >= 40 ? 'bg-yellow-500' : 
              'bg-red-500';
  }

  return (
    <div className={`relative ${height} w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
      <div 
        className={`h-full ${barColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}