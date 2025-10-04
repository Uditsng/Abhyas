//app/admin/coupons/page.jsx

"use client";
import { useState, useEffect } from 'react';
import { createCoupon, getCoupons, updateCouponStatus } from '@/lib/couponService';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const CouponManagementPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    discount: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const couponsData = await getCoupons();
      setCoupons(couponsData);
    } catch (error) {
      console.error('Failed to fetch coupons.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiresAt) {
      console.warn('Please fill all fields.');
      return;
    }
    try {
      await createCoupon({
          ...newCoupon,
          discount: Number(newCoupon.discount),
          expiresAt: new Date(newCoupon.expiresAt)
      });
      console.log('Coupon created successfully!');
      setNewCoupon({ code: '', type: 'percentage', discount: '', expiresAt: '' });
      fetchCoupons(); // Refresh the list
    } catch (error) {
      console.error('Failed to create coupon.');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
        await updateCouponStatus(couponId, !currentStatus);
        console.log(`Coupon status updated successfully!`);
        fetchCoupons(); // Refresh the list
    } catch (error) {
        console.error('Failed to update coupon status.');
    }
  };

  return (
    <div className="container mx-auto p-4 text-gray-800 dark:text-white">
      {/* <ToastContainer theme="colored" /> */}
      <h1 className="text-2xl font-bold mb-4">Coupon Management</h1>

      {/* Create Coupon Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text" name="code" value={newCoupon.code} onChange={handleInputChange}
            placeholder="Coupon Code (e.g., DIWALI25)"
            className="input bg-gray-100 dark:bg-gray-700 p-2 rounded"
          />
          <select
            name="type" value={newCoupon.type} onChange={handleInputChange}
            className="input bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input
            type="number" name="discount" value={newCoupon.discount} onChange={handleInputChange}
            placeholder="Discount Value"
            className="input bg-gray-100 dark:bg-gray-700 p-2 rounded"
          />
          <input
            type="date" name="expiresAt" value={newCoupon.expiresAt} onChange={handleInputChange}
            className="input bg-gray-100 dark:bg-gray-700 p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Create Coupon
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Coupons</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="p-2">Code</th>
                <th className="p-2">Type</th>
                <th className="p-2">Discount</th>
                <th className="p-2">Expires At</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b dark:border-gray-700">
                  <td className="p-2">{coupon.code}</td>
                  <td className="p-2">{coupon.type}</td>
                  <td className="p-2">{coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}</td>
                  <td className="p-2">{new Date(coupon.expiresAt.seconds * 1000).toLocaleDateString()}</td>
                  <td className="p-2">{coupon.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="p-2">
                    <button onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                      className={`py-1 px-3 rounded text-white ${coupon.isActive ? 'bg-red-500' : 'bg-green-500'}`}>
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