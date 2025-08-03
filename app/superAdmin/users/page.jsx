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
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { FiDelete, FiDownload, FiLock, FiUnlock } from "react-icons/fi";

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700" // <<
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
                          className={`px-3 py-1 rounded text-sm text-white flex items-center gap-1 transition ${user.status === "blocked" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} 
                          ${actionLoading ? "opacity-50 cursor-not-allowed" : "" }`}
                        >
                          {user.status === "blocked" ? ( <FiUnlock /> ) : ( <FiLock />)}
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
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span className="text-gray-700 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>

        {/* Modal Section */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>User Details</ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                  <p>
                    <b>Name:</b> {selectedUser.displayName || selectedUser.name}
                  </p>
                  <p>
                    <b>Email:</b> {selectedUser.email}
                  </p>
                  <p>
                    <b>Role:</b> {selectedUser.role}
                  </p>
                  <p>
                    <b>Status:</b> {selectedUser.status || "active"}
                  </p>
                  <p>
                    <b>Joined:</b>{" "}
                    {selectedUser.createdAt?.toDate
                      ? selectedUser.createdAt.toDate().toLocaleString()
                      : ""}
                  </p>
                  {userStats ? (
                    <>
                      <p>
                        <b>Bundles Purchased:</b> {userStats.bundlesPurchased}
                      </p>
                      <p>
                        <b>Tests Taken:</b> {userStats.testsTaken}
                      </p>
                      <p>
                        <b>Active Time:</b>{" "}
                        {userStats.activeTime !== null
                          ? `${userStats.activeTime} days`
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <Spinner size="sm" />
                  )}
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
