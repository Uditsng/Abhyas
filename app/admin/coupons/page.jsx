// app/admin/coupons/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthContext";
import { createCoupon, getCoupons, updateCouponStatus } from '@/lib/couponService';
import { getAllBundles } from '@/lib/bundleService'; 


const CouponManagementPage = () => {
  const {user} = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [bundles, setBundles] = useState([]); 
  const [selectedBundles, setSelectedBundles] = useState([]); 
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '', 
    expiryDate: '',
  });

  // Fetch both coupons and the admin's bundles
  const fetchData = async () => {
    if (!user) return;
    try {
      const [couponsData, bundlesData] = await Promise.all([
        getCoupons(user.uid),
        getAllBundles(user.uid) 
      ]);
      setCoupons(couponsData);
      setBundles(bundlesData);
    } catch (error) {
            alert('Failed to fetch coupons.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({ ...prev, [name]: value }));
  };

  const handleBundleSelection = (bundleId) => {
    setSelectedBundles(prev => 
      prev.includes(bundleId) 
        ? prev.filter(id => id !== bundleId) 
        : [...prev, bundleId]
    );
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value || !newCoupon.expiryDate || selectedBundles.length === 0) {
            alert('Please fill all required fields.');
      return;
    }
    try {
      await createCoupon({
        ...newCoupon,
        value: Number(newCoupon.value),
        expiryDate: new Date(newCoupon.expiryDate),
        bundleIds: selectedBundles, 
        createdBy: user.uid,
        createdAt: new Date(),
      });
            alert('Coupon created successfully!');
      setNewCoupon({ code: '', type: 'percentage', value: '', expiryDate: '' });
      setSelectedBundles([]);
      fetchData(); 
    } catch (error) {
            alert('Failed to create coupon.');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
            alert('Coupon status updated successfully!');
      fetchData();
    } catch (error) {
            alert('Failed to update coupon status.');
    }
  };

    const formatDate = (date) => {
    if (!date) return 'Invalid Date';
    // Firestore Timestamps have a toDate() method, JS Dates do not.
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    // Handle JS Date object or a date string
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="container mx-auto p-4 md:p-8 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input type="text" name="code" value={newCoupon.code} onChange={handleInputChange} placeholder="e.g., DIWALI25" className="w-full input bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coupon Type</label>
              <select name="type" value={newCoupon.type} onChange={handleInputChange} className="w-full input bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input type="number" name="value" value={newCoupon.value} onChange={handleInputChange} placeholder="e.g., 25 or 250" className="w-full input bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input type="date" name="expiryDate" value={newCoupon.expiryDate} onChange={handleInputChange} className="w-full input bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Applicable Bundles (Select at least one)</label>
            <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto space-y-2">
              {bundles.length > 0 ? bundles.map(bundle => (
                <label key={bundle.id} className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedBundles.includes(bundle.id)}
                    onChange={() => handleBundleSelection(bundle.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{bundle.title}</span>
                </label>
              )) : (
                <p className="text-gray-500">You have not created any bundles yet.</p>
              )}
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Create Coupon
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Coupons</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Expires At</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-mono font-bold">{coupon.code}</td>
                  <td className="p-3 capitalize">{coupon.type}</td>
                  <td className="p-3">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                  <td className="p-3">{formatDate(coupon.expiryDate)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                      className={`py-1 px-3 rounded text-white text-sm ${coupon.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponManagementPage;