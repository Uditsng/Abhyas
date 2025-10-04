//app/management/users/page.jsx

"use client";
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  setUserStatus,
  deleteUser,
  getUserStats,
} from "../../../lib/superAdminUserService";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Avatar,
} from "@chakra-ui/react";
import { FiDelete, FiDownload, FiLock, FiUnlock, FiUser,FiActivity  } from "react-icons/fi";
import Pagination from '@/components/Pagination'

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

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const all = await getAllUsers();
      setUsers(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(users);
    else
      setFiltered(
        users.filter(
          (u) =>
            (u.displayName || "")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [search, users]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = filtered.map((user) => [
      user.displayName || user.name || "",
      user.email || "",
      user.role || "",
      user.status || "active",
      user.createdAt?.toDate?.().toLocaleDateString() || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBlockToggle = async (user) => {
    setActionLoading(true);
    await setUserStatus(
      user.id,
      user.status === "blocked" ? "active" : "blocked"
    );
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
          : u
      )
    );
    setActionLoading(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    await deleteUser(user.id);
    setUsers(users.filter((u) => u.id !== user.id));
    setFiltered(filtered.filter((u) => u.id !== user.id));
    setActionLoading(false);
  };

  const handleRowClick = async (user) => {
    setSelectedUser(user);
    setUserStats(null);
    onOpen();
    const stats = await getUserStats(user.id);
    setUserStats(stats);
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
          All Users
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-4 md:px-0 gap-3">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleDownloadCSV}
          >
            <FiDownload />
            Download CSV
          </button>
        </div>

        {/* Table Section */}
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
                  {/* <th className="px-4 py-2 border dark:border-gray-700">Role</th> */}
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Joined
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleRowClick(user)}
                  >
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {user.displayName || user.name}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {user.email}
                    </td>
                    {/* <td className="px-4 py-2 border dark:border-gray-700">
                      {user.role}
                    </td> */}
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {user.status || "active"}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {user.createdAt && user.createdAt.toDate
                        ? user.createdAt.toDate().toLocaleDateString()
                        : ""}
                    </td>
                    <td
                      className="px-4 py-3 border dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleBlockToggle(user)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded text-sm text-white flex items-center gap-1 transition ${
                            user.status === "blocked"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } 
                          ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {user.status === "blocked" ? (
                            <FiUnlock />
                          ) : (
                            <FiLock />
                          )}
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          disabled={actionLoading}
                          onClick={() => handleDelete(user)}
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

        {/* Pagination Controls */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
          <ModalOverlay />
          <ModalContent className="bg-white dark:bg-gray-800 rounded-lg">
            <ModalHeader className="border-b border-gray-200 dark:border-gray-700">User Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="p-6">
              {selectedUser && (
                <div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <Avatar
                      size="xl"
                      name={selectedUser.displayName || selectedUser.name}
                      src={selectedUser.photoURL}
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedUser.displayName || selectedUser.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Section 1*/}
                  <SectionTitle icon={<FiUser className="text-blue-500" />} title="Account Information" />
                  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <DetailItem label="Role" value={selectedUser.role} />
                    <DetailItem label="Status" value={selectedUser.status || "active"} />
                    <DetailItem label="Joined On" value={selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : "N/A"} />
                  </div>

                  {/* Section 2*/}
                  <SectionTitle icon={<FiActivity className="text-green-500" />} title="User Activity" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {userStats ? (
                      <>
                        <DetailItem label="Last Seen" value={userStats.lastSeen ? new Date(userStats.lastSeen).toLocaleString() : 'Never'} />
                        <DetailItem label="Bundles Purchased" value={userStats.bundlesPurchased} />
                        <DetailItem label="Tests Taken" value={userStats.testsTaken} />
                        <DetailItem label="Total Spent" value={`₹${userStats.totalSpent?.toFixed(2) || '0.00'}`} />
                      </>
                    ) : (
                      <div className="col-span-full flex items-center justify-center p-4">
                        <Spinner size="md" />
                        <p className="ml-2 text-sm">Loading stats...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
