// app/admin/coupons/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast,
  Checkbox,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "@/components/AuthContext";
import {
  createCoupon,
  getCoupons,
  updateCouponStatus,
  deleteCoupon,
} from "@/lib/couponService";
import { getAllBundles } from "@/lib/bundleService";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const CouponManagementPage = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [coupons, setCoupons] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [couponsData, bundlesData] = await Promise.all([
        getCoupons(user.uid),
        getAllBundles(user.uid),
      ]);
      setCoupons(couponsData);
      setBundles(bundlesData);
    } catch (error) {
      toast({
        title: "Failed to fetch data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon((prev) => ({ ...prev, [name]: value }));
  };

  const handleBundleSelection = (bundleId) => {
    setSelectedBundles((prev) =>
      prev.includes(bundleId)
        ? prev.filter((id) => id !== bundleId)
        : [...prev, bundleId]
    );
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (
      !newCoupon.code ||
      !newCoupon.value ||
      !newCoupon.expiryDate ||
      selectedBundles.length === 0
    ) {
      toast({
        title:
          "Please fill all required fields and select at least one bundle.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Coupon created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewCoupon({ code: "", type: "percentage", value: "", expiryDate: "" });
      setSelectedBundles([]);
      fetchData();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to create coupon.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
      toast({
        title: "Coupon status updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to update coupon status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await deleteCoupon(couponId);
      toast({
        title: "Coupon deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to delete coupon.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "Invalid Date";
    return date.toDate
      ? date.toDate().toLocaleDateString()
      : new Date(date).toLocaleDateString();
  };

  return (
    <Box p={8}>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
        Coupon Management
      </h1>
      <div className='flex items-center justify-center'>
        <button
          onClick={onOpen}
          className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-2"
        >
          <FiPlus />
          Create Coupon
        </button>
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
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-3 font-mono font-bold">{coupon.code}</td>
                  <td className="p-3 capitalize">{coupon.type}</td>
                  <td className="p-3">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `₹${coupon.value}`}
                  </td>
                  <td className="p-3">{formatDate(coupon.expiryDate)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        handleToggleStatus(coupon.id, coupon.isActive)
                      }
                      className={`py-1 px-3 rounded text-white text-sm ${
                        coupon.isActive
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <IconButton
                      aria-label="Delete coupon"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      ml={2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Coupon</ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreateCoupon}>
              <FormControl isRequired mb={4}>
                <FormLabel>Coupon Code</FormLabel>
                <Input
                  name="code"
                  value={newCoupon.code}
                  onChange={handleInputChange}
                  placeholder="e.g., DIWALI25"
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Coupon Type</FormLabel>
                <Select
                  name="type"
                  value={newCoupon.type}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Discount Value</FormLabel>
                <Input
                  name="value"
                  type="number"
                  value={newCoupon.value}
                  onChange={handleInputChange}
                  placeholder="e.g., 25 or 250"
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Expiry Date</FormLabel>
                <Input
                  name="expiryDate"
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Applicable Bundles (Select at least one)</FormLabel>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  p={2}
                  borderRadius="md"
                  maxHeight="150px"
                  overflowY="auto"
                >
                  {bundles.map((bundle) => (
                    <Checkbox
                      key={bundle.id}
                      isChecked={selectedBundles.includes(bundle.id)}
                      onChange={() => handleBundleSelection(bundle.id)}
                    >
                      {bundle.title}
                    </Checkbox>
                  ))}
                </Box>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateCoupon}>
              Create
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CouponManagementPage;
