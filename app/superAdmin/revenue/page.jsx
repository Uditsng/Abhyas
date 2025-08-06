//superAdmin/revenue/page.jsx

"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import {
  getEarningsAndCommission,
  getMonthlyRevenue,
  getAllPayouts,
  markPayoutAsPaid,
  getPlatformCommissionRate,
} from "../../../lib/superAdminRevenueService";
import { getAllExpenses } from "../../../lib/superAdminExpensesService";

export default function SuperAdminRevenuePage() {
  const [stats, setStats] = useState({
    totalAdminEarning: 0,
    platformCommission: 0,
  });
  const [monthly, setMonthly] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [platformCommission, setPlatformCommission] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [earnings, monthlyRev, allPayouts, allExpenses, commissionRate] =
        await Promise.all([
          getEarningsAndCommission(),
          getMonthlyRevenue(),
          getAllPayouts(),
          getAllExpenses(),
          getPlatformCommissionRate(),
        ]);
      setStats(earnings);
      setMonthly(monthlyRev);
      setPayouts(allPayouts);
      setExpenses(allExpenses);
      setPlatformCommission(commissionRate);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleMarkPaid = async (payoutId) => {
    setActionLoading(true);
    await markPayoutAsPaid(payoutId);
    setPayouts(
      payouts.map((p) =>
        p.id === payoutId ? { ...p, status: "paid", paidAt: new Date() } : p
      )
    );
    setActionLoading(false);
  };

  return (
    <div className="p-4 mt-2">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
        Revenue & Payouts
      </h1>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 mb-4">
                <span className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                  Earnings
                </span>
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Total Sales:</strong> ₹{stats.totalEarnings.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Platform Commission:</strong> ₹
                  {stats.platformCommission.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Admin Earnings:</strong> ₹
                  {stats.totalAdminEarning.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>GST Collected:</strong> ₹
                  {stats.totalTaxCollected?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 mb-4">
                <span className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                  Expenses
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Total Expenses: ₹</strong>
                {expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 mb-4">
                <span className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                  Platform Commission
                </span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(e.target.value)}
                  className="flex-grow p-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
                <button
                  className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  onClick={async () => {
                    await setDoc(doc(db, "platformSettings", "commission"), {
                      rate: Number(platformCommission),
                    });
                    alert("Commission updated.");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-6">
              Monthly Revenue
            </h3>
            <div className="overflow-x-auto">
              <table className="min- divide-y divide-gray-300 w-full text-left border">
                <thead className="bg-gray-50  dark:bg-gray-700">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      scope="col"
                    >
                      Month
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      scope="col"
                    >
                      Revenue (₹)
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      scope="col"
                    >
                      Platform Commission (₹)
                    </th>
                                        <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      scope="col"
                    >
                      GST Collected (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {Object.entries(monthly).map(([month, value]) => (
                    <tr key={month} className="border-t">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-300">
                        {month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {value.sales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {value.commission.toFixed(2)}
                      </td>
                      {/**18% GST is calc on price on bundle Price, taken from user. 20% Platform commission is calc on bundle price, taken from Admin */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {value.gst.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-4">
              Payout Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-50  dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Admin ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Paid At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-gray-500">
                        No payout requests found.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2 border">{p.adminId}</td>
                        <td className="p-2 border">{p.amount}</td>
                        <td className="p-2 border">
                          <span
                            className={`px-2 py-1 rounded text-white text-sm ${
                              p.status === "paid"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          >
                            {p.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="p-2 border">
                          {p.createdAt?.toDate?.().toLocaleString() || ""}
                        </td>
                        <td className="p-2 border">
                          {p.paidAt?.toDate?.().toLocaleString() || ""}
                        </td>
                        <td className="p-2 border">
                          {p.status !== "paid" && (
                            <button
                              className="bg-green-600 text-white px-3 py-1 text-sm rounded"
                              onClick={() => handleMarkPaid(p.id)}
                              disabled={actionLoading}
                            >
                              {actionLoading ? "Loading..." : "Mark as Paid"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
         <div>< h6 className="text-yellow-100"> **18% GST is calculated on bundle Price, taken from user at time of purchase. 20% Platform commission is calculated on bundle price, taken from Admin*</h6></div>
        </>
      )}
    </div>
  );
}
