// //app/superAdmin/package-revenue/page.jsx

'use client';

import { useState, useEffect } from 'react';
import SectionHeader from '@/components/SectionHeader';
import { getPackageRevenueData } from '@/lib/superAdminRevenueService';
import { FiDollarSign, FiPackage,FiShield, FiPercent, FiTrendingUp } from 'react-icons/fi';
import { StarIcon } from '@chakra-ui/icons';

function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 bg-red-600 text-white py-2 px-4 rounded-lg shadow-md animate-pulse">
      <p><strong>Error:</strong> {message}</p>
    </div>
  );
}

function FinancialStatCard({ title, value, icon, color }) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <div className={`text-2xl ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      </div>
    );
}

// --- NEW COMPONENT ---
const DisplayRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1 mt-2">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} color="yellow.400" boxSize={4} />
      ))}
      {halfStar && <StarIcon key="half" color="yellow.400" style={{ clipPath: 'inset(0 50% 0 0)' }} boxSize={4} />}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} color="gray.300" boxSize={4} />
      ))}
      <span className="text-xs text-gray-500 ml-1">({count} ratings)</span>
    </div>
  );
};

export default function PackageRevenuePage() {
  // Initialize state with all the properties that will be fetched.
  const [revenueData, setRevenueData] = useState({ sales: [], totalRevenue: 0, totalSales: 0, totalGST: 0, totalNetRevenue: 0, totalCommission: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPackageRevenueData();
        setRevenueData(data);
      } catch (err) {
        setError("Could not fetch package revenue data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-4 text-gray-700 dark:text-gray-300">Loading Detailed Revenue...</span>
      </div>
    );
  }

  const { sales, totalRevenue, totalGST, realEarning, totalCommission, totalSales } = revenueData;

  return (
    <div className="p-4 md:p-6">
      <Toast message={error} show={!!error} />
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Package Revenue</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FinancialStatCard title="Total Revenue (incl. GST)" value={`₹${totalRevenue.toFixed(2)}`} icon={<FiTrendingUp />} color="text-blue-500" />
        <FinancialStatCard title="GST Collected (18%)" value={`₹${totalGST.toFixed(2)}`} icon={<FiPercent />} color="text-red-500" />
        <FinancialStatCard title="Admin's Commission (20%)" value={`₹${totalCommission.toFixed(2)}`} icon={<FiShield />} color="text-purple-500" />
        <FinancialStatCard title="Net Revenue for SuperAdmins" value={`₹${(realEarning - totalCommission).toFixed(2)}`} icon={<FiDollarSign />} color="text-green-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sales.length === 0 ? (
          <div className="text-center p-12 text-gray-500 dark:text-gray-400">
            <p>No package sales data found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Package & Buyer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Financials</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Admin Earnings Breakdown</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 align-top">
                        <p className="font-bold text-gray-900 dark:text-white">{sale.packageName}</p>
                        <DisplayRating rating={sale.averageRating} count={sale.ratingCount} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{sale.buyerName}</p>
                        <p className="text-xs text-gray-400">{new Date(sale.date.seconds * 1000).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 align-top text-sm">
                        <p>Total: <span className="font-semibold text-blue-600">₹{sale.amount.toFixed(2)}</span></p>
                        <p>GST: <span className="font-semibold text-red-600">-₹{sale.gstAmount.toFixed(2)}</span></p>
                        <p>Commission: <span className="font-semibold text-purple-600">-₹{sale.platformCommission.toFixed(2)}</span></p>
                        <p className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">Net for SuperAdmin: <span className="font-bold text-green-600">₹{sale.netEarningForAdmins.toFixed(2)}</span></p>
                    </td>
                    <td className="px-6 py-4 align-top text-sm">
                      {sale.adminEarningsBreakdown.map((breakdown, index) => (
                          <div key={index} className="flex justify-between items-center mb-1">
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{breakdown.adminName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">({breakdown.bundleTitle})</p>
                              </div>
                              <p className="font-semibold text-green-600">₹{breakdown.earning.toFixed(2)}</p>
                          </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}