'use client';
import { useState, useEffect } from 'react';
import { getAllAdmins } from '@/lib/superAdminAdminService';
import { recordPayout, getAllPayouts } from '@/lib/superAdminRevenueService';

export default function PayoutsPage() {
  const [admins, setAdmins] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAdminsAndPayouts = async () => {
      try {
        const adminsData = await getAllAdmins();
        setAdmins(adminsData);
        const payoutsData = await getAllPayouts();
        setPayouts(payoutsData);
      } catch (err) {
        setError('Failed to fetch data.');
      }
    };
    fetchAdminsAndPayouts();
  }, []);

  const handleRecordPayout = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminId || !amount || !date) {
      setError('All fields are required.');
      return;
    }

    try {
      await recordPayout({
        adminId,
        adminName: admins.find(a => a.id === adminId)?.name,
        amount: parseFloat(amount),
        date,
      });
      setSuccess('Payout recorded successfully!');
      // Reset form
      setAdminId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      // Refresh payouts
      const payoutsData = await getAllPayouts();
      setPayouts(payoutsData);
    } catch (err) {
      setError('Failed to record payout.');
    }
  };

  return (
    <div className=" pt-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Record a Payout</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleRecordPayout}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Select Admin
              </label>
              <select
                id="adminId"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 dark:bg-gray-700"
              >
                <option value="">-- Select an Admin --</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 dark:bg-gray-700"
                placeholder="e.g., 500.00"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Record Payout
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">Payout History</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {payout.adminName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{payout.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {payout.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}