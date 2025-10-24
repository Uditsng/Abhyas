//admin/sales-revenue

"use client";

import { useEffect, useState } from "react";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUsersByIds,
} from "@/lib/salesService";
import { useAuth } from "@/components/AuthContext";
import Pagination from '@/components/Pagination'
import { getPayoutsForAdmin } from "@/lib/superAdminRevenueService";
import { StarIcon } from '@chakra-ui/icons'; 

const BUNDLES_PER_PAGE = 5;
const BUYERS_PER_PAGE = 5;

// A small component to display stars
const DisplayRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} color="yellow.400" />
      ))}
      {halfStar && <StarIcon key="half" color="yellow.400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} color="gray.300" />
      ))}
      <span className="text-xs text-gray-500 ml-1">({count} ratings)</span>
    </div>
  );
};

export default function SalesRevenuePage() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundleTitle, setSelectedBundleTitle] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [buyerPages, setBuyerPages] = useState({});
  const [payoutHistory, setPayoutHistory] = useState([]);

    useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setLoading(true);

      const [bundles, payouts] = await Promise.all([
          getBundlesByAdmin(user.uid),
          getPayoutsForAdmin(user.uid)
      ]);

      setPayoutHistory(payouts);

      // const bundles = await getBundlesByAdmin(user.uid);
      const allOrders = [];
      const userIds = new Set();

      // First, get all orders for all bundles and collect user IDs
      for (const bundle of bundles) {
        const orders = await getOrdersForBundle(bundle.id);
        orders.forEach(order => {
          allOrders.push({ ...order, bundle });
          userIds.add(order.userId);
        });
      }

      // Now, fetch all user data in one batch
      const usersMap = await getUsersByIds(Array.from(userIds));
      const salesByBundle = {};

      // Process and group sales data by bundle
      allOrders.forEach(order => {
        const bundle = order.bundle;
        if (!salesByBundle[bundle.id]) {
          salesByBundle[bundle.id] = {
            bundleTitle: bundle.title,
            price: bundle.price,
            averageRating: bundle.averageRating || 0, 
            ratingCount: bundle.ratingCount || 0,
            sold: 0,
            totalRevenue: 0,
            totalTaxCollected: 0,
            platformCommission: 0,
            adminEarning: 0,
            buyers: [],
          };
        }

        const data = salesByBundle[bundle.id];
        const userData = usersMap[order.userId];

        const buyerAmount = order.amount;
        const platformFee = order.commissionAmount || 0;
        const taxAmount = order.taxAmount || 0;
        const netEarning = order.adminEarning || buyerAmount - taxAmount - platformFee;
        
        data.totalRevenue += buyerAmount;
        data.totalTaxCollected += taxAmount;
        data.platformCommission += platformFee;
        data.adminEarning += netEarning;
        data.sold++;

        if (userData) {
          data.buyers.push({
            name: userData.displayName,
            email: userData.email,
            date: order.date.toDate(),
            amount: buyerAmount,
        });
      }
    });

      // setSalesData(result);
      setSalesData(Object.values(salesByBundle));
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const filteredBundles =
    selectedBundleTitle === "All"
      ? salesData
      : salesData.filter((b) => b.bundleTitle === selectedBundleTitle);

  const totalPages = Math.ceil(filteredBundles.length / BUNDLES_PER_PAGE);
  const paginatedBundles = filteredBundles.slice(
    (currentPage - 1) * BUNDLES_PER_PAGE,
    currentPage * BUNDLES_PER_PAGE
  );

  const bundleTitles = ["All", ...new Set(salesData.map((b) => b.bundleTitle))];

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
        Sales Revenue
      </h1>

      <div className="mb-10 p-5 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">My Payout History</h2>
        {payoutHistory.length === 0 ? (
          <p className="text-gray-500">No payouts received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-2 border">Date</th>
                  <th className="text-left px-4 py-2 border">Amount</th>
                  <th className="text-left px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="even:bg-gray-50 dark:even:bg-gray-700/50">
                    <td className="px-4 py-2 border">{payout.date}</td>
                    <td className="px-4 py-2 border">₹{payout.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 border">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Received
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Bundle Sales Details</h2>
      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          Filter by Bundle Title
        </label>
        <select
          className="border rounded px-3 py-2 w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          value={selectedBundleTitle}
          onChange={(e) => {
            setSelectedBundleTitle(e.target.value);
            setCurrentPage(1);
          }}
        >
          {bundleTitles.map((title, i) => (
            <option key={i} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mb-2 italic">
        Note: 18% GST and 20% platform fee are deducted from each bundle sale.
      </p>

      {/* Revenue Sections */}
      {paginatedBundles.map((bundle, idx) => {
        const currentBuyerPage = buyerPages[idx] || 1;
        const totalBuyerPages = Math.ceil(bundle.buyers.length / BUYERS_PER_PAGE);
        const buyerSlice = bundle.buyers.slice((currentBuyerPage - 1) * BUYERS_PER_PAGE, currentBuyerPage * BUYERS_PER_PAGE);

        return (
          <div
            key={idx}
            className="mb-10 p-5 border border-gray-300 rounded-lg shadow-sm overflow-x-auto"
          >
            <h2 className="text-xl font-semibold mb-2">{bundle.bundleTitle}</h2>
            <div className="flex space-x-6 text-sm text-gray-500 mt-1 ">
              <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Price: ₹{bundle.price}
              </span>
              <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Units Sold: {bundle.sold}
              </span>
              {/* <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Total Paid by Users: ₹{bundle.totalRevenue.toFixed(2)}
              </span> */}
              <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Your Earning (after all deductions): ₹
                {bundle.adminEarning.toFixed(2)}
              </span>
              <DisplayRating rating={bundle.averageRating} count={bundle.ratingCount} />
            </div>

            {/* Buyers Table */}
            <div className=" mt-4">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2 border">User</th>
                    <th className="text-left px-4 py-2 border">Email</th>
                    <th className="text-left px-4 py-2 border">Purchase Date</th>
                    <th className="text-left px-4 py-2 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.buyers.map((buyer, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-4 py-2 border">{buyer.name}</td>
                      <td className="px-4 py-2 border">{buyer.email}</td>
                      <td className="px-4 py-2 border">{buyer.date.toLocaleDateString()}</td>
                      <td className="px-4 py-2 border">₹{bundle.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Buyer Pagination */}
              {totalBuyerPages > 1 && (
                <div className="flex justify-end gap-2 mt-3">
                  {Array.from({ length: totalBuyerPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded border ${
                        currentBuyerPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                      }`}
                      onClick={() =>
                        setBuyerPages((prev) => ({ ...prev, [idx]: i + 1 }))
                      }
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
