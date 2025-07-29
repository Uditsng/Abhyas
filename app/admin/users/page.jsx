"use client";

import { useState, useEffect } from "react";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUserInfo,
} from "@/lib/salesService";
import { useAuth } from "@/components/AuthContext";
import { Spinner } from "@chakra-ui/react";
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
              amount: (order.amount || 0) / 100,
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Users Who Bought My Bundles</h2>

      {/* Filter + Download Row */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Filter by Bundle</label>
          <select
            className="border px-4 py-2 rounded w-64 bg-white text-black dark:bg-fray-800 dark:text-white dark:border-gray-600"
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
        </div>

        <button
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleCSVDownload}
        >
          Download CSV
        </button>
      </div>

      {/* Sales Table */}
      {filteredSales.length === 0 ? (
        <p>No purchases for the selected bundle.</p>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">User Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Bundle Name</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((entry, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="px-4 py-2 border">{entry.userName}</td>
                  <td className="px-4 py-2 border">{entry.userEmail}</td>
                  <td className="px-4 py-2 border">{entry.bundleName}</td>
                  <td className="px-4 py-2 border">₹{entry.amount}</td>
                  <td className="px-4 py-2 border">{entry.purchaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        <div className="flex justify-between items-center mt-4">
            <button
              className="bg-gray-300 px-3 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev)=> prev-1)}
              >
                Previous
            </button>

            <span className="text-sm">
                Page {currentPage} of {totalPages}
            </span>

            <button
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={()=> setCurrentPage((perv) => prev + 1)}>
                Next
            </button>
        </div>
        </>
      )}
    </div>
  );
}
