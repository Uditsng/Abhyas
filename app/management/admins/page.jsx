//app/management/admins/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import {
  getAllAdmins,
  validateAdmin,
  setAdminStatus,
  deleteAdmin,
  getAdminStats,
} from "../../../lib/superAdminAdminService";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FiDelete, FiDownload, FiLock, FiUnlock, FiUser, FiBriefcase, FiBarChart2 } from "react-icons/fi";
import Pagination from "../../../components/Pagination";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Helper component for each detail item in the modal
const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    <p className="text-sm text-gray-800 dark:text-gray-200">{value || "N/A"}</p>
  </div>
);

// Helper for Section Titles in the modal
const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2 mt-4 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
    {icon}
    <h3 className="font-semibold text-md text-gray-700 dark:text-gray-300">{title}</h3>
  </div>
);

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [search, setSearch] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const adminsPerPage = 10;
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    async function fetchAdmins() {
      setLoading(true);
      const all = await getAllAdmins();
      setAdmins(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchAdmins();
  }, []);

    useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      const revenueData = {};
      for (const admin of admins) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthString = `${year}-${month.toString().padStart(2, "0")}`;

        const revenueRef = collection(
          db,
          "adminMonthlyRevenue",
          admin.id,
          "revenue"
        );
        const querySnapshot = await getDocs(revenueRef);
        let totalEarnings = 0;
        let earningMonth = "";
        querySnapshot.forEach((doc) => {
          if (doc.id === monthString) {
            totalEarnings = doc.data().totalEarnings;
            earningMonth = doc.data().month;
          }
        });
        revenueData[admin.id] = {
          earnings: totalEarnings,
          month: earningMonth,};
      }
      setMonthlyRevenue(revenueData);
    };

    if (admins.length > 0) {
      fetchMonthlyRevenue();
    }
  }, [admins]);


  useEffect(() => {
    let sortedAdmins = [...admins].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || 0;
        const dateB = b.createdAt?.toDate() || 0;
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    if (search) {
        sortedAdmins = sortedAdmins.filter(
        (a) =>
          (a.displayName || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (a.email || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFiltered(sortedAdmins);
    setCurrentPage(1);
  }, [search, admins, sortOrder]);

  const handleRowClick = async (admin) => {
    setSelectedAdmin(admin);
    setAdminStats(null);
    onOpen();

    try {
      const stats = await getAdminStats(admin.id);
      setAdminStats(stats);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }
  };

  const handleBlockToggle = async (admin) => {
    setActionLoading(true);
    await setAdminStatus(
      admin.id,
      admin.status === "blocked" ? "active" : "blocked"
    );
    setAdmins(
      admins.map((a) =>
        a.id === admin.id
          ? { ...a, status: a.status === "blocked" ? "active" : "blocked" }
          : a
      )
    );
    setActionLoading(false);
  };

  const handleValidate = async (admin) => {
    setActionLoading(true);
    await validateAdmin(admin.id);
    setAdmins(
      admins.map((a) => (a.id === admin.id ? { ...a, validated: true } : a))
    );
    setActionLoading(false);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setActionLoading(true);
    await deleteAdmin(admin.id);
    setAdmins(admins.filter((a) => a.id !== admin.id));
    setFiltered(filtered.filter((a) => a.id !== admin.id));
    setActionLoading(false);
  };
  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Email,UID"]
        .concat(
          admins.map((admin) => `${admin.name},${admin.email},${admin.id}`)
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admins.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filtered.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filtered.length / adminsPerPage);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
          All Admins
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name"
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
           <div className="flex items-center gap-2">
            <button onClick={() => setSortOrder("newest")} className={`px-3 py-1 rounded ${sortOrder === 'newest' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Newest</button>
            <button onClick={() => setSortOrder("oldest")} className={`px-3 py-1 rounded ${sortOrder === 'oldest' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Oldest</button>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FiDownload />
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner />
            </div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Monthly Revenue
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Earning Month
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleRowClick(admin)}
                  >
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.displayName || admin.name}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.email}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      ₹{monthlyRevenue[admin.id]?.earnings?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.status || "active"}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {monthlyRevenue[admin.id]?.month || 'N/A'}
                    </td>
                    <td
                      className="px-4 py-2 border dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleBlockToggle(admin)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded text-sm text-white flex items-center gap-1 transition ${
                            admin.status === "blocked"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } 
                          ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {admin.status === "blocked" ? (
                            <FiUnlock />
                          ) : (
                            <FiLock />
                          )}
                        </button>
                        {!admin.validated && (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleValidate(admin)}
                          >
                            Validate
                          </button>
                        )}
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          disabled={actionLoading}
                          onClick={() => handleDelete(admin)}
                        >
                          <FiDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />

        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
          <ModalOverlay />
          <ModalContent className="bg-white dark:bg-gray-800 rounded-lg">
            <ModalHeader className="border-b border-gray-200 dark:border-gray-700">Admin Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="p-6">
              {selectedAdmin && (
                <div >
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <Avatar
                      size="xl"
                      name={selectedAdmin.displayName || selectedAdmin.name}
                      src={selectedAdmin.photoURL}
                    />
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedAdmin.displayName || selectedAdmin.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAdmin.email}</p>
                    </div>                    
                  </div>

                  {/* Section 1*/}
                  <SectionTitle icon={<FiUser className="text-blue-500" />} title="Personal & Account Information" />
                  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <DetailItem label="Phone Number" value={selectedAdmin.phone} />
                    <DetailItem label="Joined On" value={selectedAdmin.createdAt?.toDate ? selectedAdmin.createdAt.toDate().toLocaleString() : "N/A"} />
                    <DetailItem label="Status" value={selectedAdmin.status || "active"} />
                    <DetailItem label="Validated" value={selectedAdmin.validated ? "Yes" : "No"} />
                  </div>
                  
                  {/* Section 2*/}
                  <SectionTitle icon={<FiBriefcase className="text-green-500" />} title="Professional Details" />
                  <div className="grid grid-cols-1 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <DetailItem label="Qualifications" value={selectedAdmin.qualifications} />
                    <DetailItem label="Subjects/Exams Taught" value={Array.isArray(selectedAdmin.subjects) ? selectedAdmin.subjects.join(", ") : selectedAdmin.subjects} />
                    <DetailItem label="Teaching Experience" value={selectedAdmin.experience} />
                  </div>

                  {/* Section 3*/}
                  <SectionTitle icon={<FiBarChart2 className="text-purple-500" />} title="Performance Metrics" />
                  <div className="grid grid-cols-3 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {adminStats ? (
                      <>
                        <DetailItem label="Bundles Created" value={adminStats.bundlesCreated} />
                        <DetailItem label="Total Revenue" value={`₹${adminStats.revenue.toFixed(2)}`} />
                        <DetailItem label="Engagement (Orders)" value={adminStats.engagement} />
                        <DetailItem 
                          label="Monthly Earnings" 
                          value={`₹${monthlyRevenue[selectedAdmin.id]?.earnings?.toFixed(2) || '0.00'}`} 
                        />
                      </>
                    ) : (
                      <div className="col-span-3 flex items-center justify-center p-4">
                        <Spinner size="md" />
                        <p className="ml-2 text-sm">Loading stats...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}            
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
