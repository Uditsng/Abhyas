//superAdmin/revenue/page.jsx

"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import {
  getEarningsAndCommission,
  getMonthlyRevenue,
  getAllPayouts,
  getPlatformCommissionRate,
} from "../../../lib/superAdminRevenueService";
import { getAllExpenses } from "../../../lib/superAdminExpensesService";
import Pagination from "../../../components/Pagination";

const ITEMS_PER_PAGE = 5;

export default function SuperAdminRevenuePage() {
  const [stats, setStats] = useState({
    totalAdminEarning: 0,
    platformCommission: 0,
  });
  const [monthly, setMonthly] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [platformCommission, setPlatformCommission] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1)
  const [payoutsCurrentPage, setPayoutsCurrentPage] = useState(1)

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
      setFilteredPayouts(allPayouts); 
      setExpenses(allExpenses);
      setPlatformCommission(commissionRate);
      setLoading(false);
    }
    fetchData();
  }, []);

    useEffect(() => {
    let filtered = payouts;
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
    }
    setFilteredPayouts(filtered);
  }, [startDate, endDate, payouts]);

  const monthlyTotalPages = Math.ceil(Object.keys(monthly).length / ITEMS_PER_PAGE)
  const payoutsTotalPages = Math.ceil(filteredPayouts.length / ITEMS_PER_PAGE);
  
  const monthlyItems = Object.entries(monthly).slice(
    (monthlyCurrentPage - 1) * ITEMS_PER_PAGE,
    monthlyCurrentPage * ITEMS_PER_PAGE
  )

  const payoutItems = filteredPayouts.slice(
    (payoutsCurrentPage - 1) * ITEMS_PER_PAGE,
      payoutsCurrentPage * ITEMS_PER_PAGE
  )

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
                  Platform Commission %
                </span>
              </h2>
              <div className="flex flex-col sm:flex-col gap-2">
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
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-2">
              Monthly Revenue
            </h3>
            <p className="text-xs text-yellow-500 dark:text-yellow-100">*Included the PACKAGES revenue</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-300 border">
                        {month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 border">
                        {value.sales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 border">
                        {value.commission.toFixed(2)}
                      </td>
                      {/**18% GST is calc on price on bundle Price, taken from user. 20% Platform commission is calc on bundle price, taken from Admin */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 border">
                        {value.gst.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={monthlyCurrentPage}
              totalPages={monthlyTotalPages}
              onPageChange={setMonthlyCurrentPage}
            />            
          </div>

          {/* Payout History --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-4">
              Monthly Payout History
            </h3>

            <div className="flex space-x-4 mb-4 overflow-x-auto scroller-none">
            <input
              type="text"
              placeholder="Start Date"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => (e.target.value ? null : (e.target.type = 'text'))}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md"
            />
            <input
              type="text"
              placeholder="End Date"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => (e.target.value ? null : (e.target.type = 'text'))}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Admin Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-4 text-gray-500">
                  No payouts have been recorded for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2 border">{p.adminName}</td>
                        <td className="p-2 border">{p.amount.toFixed(2)}</td>
                        <td className="p-2 border">
                          <span className="px-2 py-1 rounded text-white text-sm bg-green-500">
                            Paid
                          </span>
                        </td>
                        <td className="p-2 border">{p.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={payoutsCurrentPage}
              totalPages={payoutsTotalPages}
              onPageChange={setPayoutsCurrentPage}
            />
          </div>
          <div><h6 className=" mt-2 text-yellow-500 dark:text-yellow-100"> **18% GST is calculated on bundle Price, taken from user at time of purchase. 20% Platform commission is calculated on bundle price, taken from Admin*</h6></div>
        </>
      )}
    </div>
  );
}