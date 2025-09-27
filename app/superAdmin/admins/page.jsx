//app/superAdmin/admins/page.jsx
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
import { FiDelete, FiDownload, FiLock, FiUnlock } from "react-icons/fi";
import Pagination from "../../../components/Pagination";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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

        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Admin Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAdmin && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
                  <div className="flex justify-center mb-4">
                    <Avatar
                      size="xl"
                      name={selectedAdmin.name}
                      src={selectedAdmin.photoURL}
                    />
                  </div>

                  <table className="w-full table-auto border-collapse">
                    <tbody>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Name:</td>
                        <td>
                          {selectedAdmin.displayName || selectedAdmin.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Email:</td>
                        <td>{selectedAdmin.email}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Validated:</td>
                        <td>{selectedAdmin.validated ? "Yes" : "No"}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Status:</td>
                        <td>{selectedAdmin.status || "active"}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Joined:</td>
                        <td>
                          {selectedAdmin.createdAt.toDate
                            ? selectedAdmin.createdAt.toDate().toLocaleString()
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Qualifications:
                        </td>
                        <td>{selectedAdmin.qualifications}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Subjects/Exams Taught:
                        </td>
                        <td>
                          {Array.isArray(selectedAdmin.subjects)
                            ? selectedAdmin.subjects.join(", ")
                            : selectedAdmin.subjects}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Teaching Experience:
                        </td>
                        <td>{selectedAdmin.experience}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Phone Number:
                        </td>
                        <td>{selectedAdmin.phone}</td>
                      </tr>

                      {adminStats ? (
                        <>
                          <tr>
                            <td className="font-semibold pr-4 py-2">
                              Bundles Created:
                            </td>
                            <td>{adminStats.bundlesCreated}</td>
                          </tr>
                          <tr>
                            <td className="font-semibold pr-4 py-2">
                              Revenue:
                            </td>
                            <td>₹{adminStats.revenue.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="font-semibold pr-4 py-2">
                              Engagement (Orders):
                            </td>
                            <td>{adminStats.engagement}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td className="py-2 font-semibold">Loading Stats:</td>
                          <td>
                            <Spinner size="sm" />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
