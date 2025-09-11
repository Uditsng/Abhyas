//admin/sales-revenue

"use client";

import { useEffect, useState } from "react";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUsersByIds,
} from "@/lib/salesService";
import { useAuth } from "@/components/AuthContext";
import { format } from "date-fns";
import Pagination from '@/components/Pagination'

const BUNDLES_PER_PAGE = 5;
const BUYERS_PER_PAGE = 5;

export default function SalesRevenuePage() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundleTitle, setSelectedBundleTitle] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [buyerPages, setBuyerPages] = useState({});

    useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      const bundles = await getBundlesByAdmin(user.uid);
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

      {/* Filter by Bundle Title */}
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
        const totalBuyerPages = Math.ceil(
          bundle.buyers.length / BUYERS_PER_PAGE
        );
        const buyerSlice = bundle.buyers.slice(
          (currentBuyerPage - 1) * BUYERS_PER_PAGE,
          currentBuyerPage * BUYERS_PER_PAGE
        );

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
              <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Total Paid by Users: ₹{bundle.totalRevenue.toFixed(2)}
              </span>
              <span className="border border-gray-200 rounded-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-red-200">
                Your Earning (after all deductions): ₹
                {bundle.adminEarning.toFixed(2)}
              </span>
            </div>

            {/* Buyers Table */}
            <div className=" mt-4">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2 border">User</th>
                    <th className="text-left px-4 py-2 border">Email</th>
                    <th className="text-left px-4 py-2 border">
                      Purchase Date
                    </th>
                    <th className="text-left px-4 py-2 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.buyers.map((buyer, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-4 py-2 border">{buyer.name}</td>
                      <td className="px-4 py-2 border">{buyer.email}</td>
                      <td className="px-4 py-2 border">
                        {buyer.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border">₹{buyer.amount}</td>
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

      {/* Page Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded border ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
