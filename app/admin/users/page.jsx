"use client";

import { useState, useEffect } from "react";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUserInfo,
} from "@/lib/salesService";
import { useAuth } from "@/components/AuthContext";
import { Spinner } from "@chakra-ui/react";
import {FiDownload} from 'react-icons/fi'
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AdminUserPurchases() {
  const { user } = useAuth();
  const [bundles, setBundles] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        const fetchedBundles = await getBundlesByAdmin(user.uid);
        setBundles(fetchedBundles);

        const allSales = [];

        for (const bundle of fetchedBundles) {
          const orders = await getOrdersForBundle(bundle.id);

          for (const order of orders) {
            const userProfile = await getUserInfo(order.userId);
            if (!userProfile) continue;

            allSales.push({
              userName: userProfile.displayName || "No name",
              userEmail: userProfile.email || "No email",
              purchaseDate: format(order.date.toDate(), "yyyy-MM-dd"),
              bundleName: bundle.title || "Unknown bundle",
              bundleId: bundle.id,
              amount: (order.amount || 0) ,
            });
          }
        }

        setSalesList(allSales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

    useEffect(() => {
    setCurrentPage(1);
  }, [selectedBundle]);

  const filteredSales = selectedBundle === "all"
    ? salesList
    : salesList.filter((sale) => sale.bundleId === selectedBundle);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPageSales = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCSVDownload = () => {
    const csvHeader = ["User Name", "Email", "Bundle Name", "Amount", "Purchase Date"];
    const csvRows = filteredSales.map((s) => [
      s.userName,
      s.userEmail,
      s.bundleName,
      `₹${s.amount}`,
      s.purchaseDate,
    ]);

    const csvContent =
      [csvHeader, ...csvRows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bundle-purchases.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Spinner size="xl" />;

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Users Who Bought My Bundles</h1>

      {/* Filter + Download Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <select
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
            value={selectedBundle}
            onChange={(e) => setSelectedBundle(e.target.value)}
          >
            <option value="all">All Bundles</option>
            {bundles.map((bundle) => (
              <option key={bundle.id} value={bundle.id}>
                {bundle.title}
              </option>
            ))}
          </select>

        <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"          
            onClick={handleCSVDownload}
        >
          <FiDownload />
          Download CSV
        </button>
      </div>
      
      {/* Sales Table */}
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">      
      {filteredSales.length === 0 ? (
        <p>No purchases for the selected bundle.</p>
      ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2 border dark:border-gray-700">User Name</th>
                <th className="px-4 py-2 border dark:border-gray-700">Email</th>
                <th className="px-4 py-2 border dark:border-gray-700">Bundle Name</th>
                <th className="px-4 py-2 border dark:border-gray-700">Amount</th>
                <th className="px-4 py-2 border dark:border-gray-700">Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((entry, index) => (
                <tr key={index} className="bg-gray-50 dark:bg-gray-800">
                  <td className="px-4 py-2 border dark:border-gray-700">{entry.userName}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{entry.userEmail}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{entry.bundleName}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">₹{entry.amount}</td>
                  <td className="px-4 py-2 border dark:border-gray-700">{entry.purchaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
      )}
    </div>

        {/* Pagination Control */}
        <div className="flex justify-between items-center mt-6">
            <button
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev)=> prev-1)}
              >
                Previous
            </button>

            <span className="text-gray-700 dark:text-gray-200">
                Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={()=> setCurrentPage((perv) => prev + 1)}>
                Next
            </button>
        </div>
    </div>
    </div>
  );
}
