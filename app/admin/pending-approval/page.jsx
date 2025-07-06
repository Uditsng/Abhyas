import { FaHourglassHalf } from 'react-icons/fa';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 w-full max-w-md flex flex-col items-center transition-colors duration-200">
        <FaHourglassHalf className="text-5xl text-yellow-400 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-cyan-100 text-center">Pending Approval</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          Your admin account is <span className="font-semibold text-yellow-500">pending approval</span> by a SuperAdmin.<br/>
          You will be notified in-app once your account is approved.
        </p>
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-4 text-center">
          Please check back later or contact support if you have questions.
        </div>
      </div>
    </div>
  );
} 