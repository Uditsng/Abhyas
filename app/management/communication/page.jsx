//management/communication/page.jsx

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiTrash2 } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import dynamic from "next/dynamic";

import {
  getAllNotifications,
  deleteNotification,
} from "@/lib/superAdminCommunicationService";
import Pagination from "../../../components/Pagination";

const AnnouncementForm = dynamic(
  () => import("@/components/AnnouncementForm"),
  { ssr: false }
);
const DirectMessageForm = dynamic(
  () => import("@/components/DirectMessageForm"),
  {
    ssr: false,
    loading: () => <p className="text-center">Loading form...</p>,
  }
);

export default function CommunicationPage() {
  const [view, setView] = useState("message");
  const [formMode, setFormMode] = useState("announcement");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      toast.error("Could not load communication history.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === "history") fetchNotifications();
  }, [view]);

  const handleDeleteClick = (id) => {
    setSelectedNotificationId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotificationId) return;
    try {
      await deleteNotification(selectedNotificationId);
      setNotifications(
        notifications.filter((n) => n.id !== selectedNotificationId)
      );
      toast.success("Message has been removed from the history.");
    } catch (error) {
      toast.error("Failed to delete the message.");
    }
    setIsModalOpen(false);
    setSelectedNotificationId(null);
  };

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const MessageView = () => (
    <div className="w-full bg-blue-50 dark:bg-gray-800 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-center mb-6 space-x-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="communicationMode"
            value="announcement"
            checked={formMode === "announcement"}
            onChange={() => setFormMode("announcement")}
            className="form-radio h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500"
          />
          <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
            Announcement
          </span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="communicationMode"
            value="direct"
            checked={formMode === "direct"}
            onChange={() => setFormMode("direct")}
            className="form-radio h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500"
          />
          <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
            Direct Mailing
          </span>
        </label>
      </div>
      {formMode === "announcement" ? (
        <AnnouncementForm />
      ) : (
        <DirectMessageForm />
      )}
    </div>
  );

  const HistoryView = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Sent Messages History
      </h2>
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Recipient/Role</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Email Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedNotifications.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        n.type === "announcement"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                      }`}
                    >
                      {n.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {n.to === "all" ? n.role : n.to}
                  </td>
                  <td className="px-4 py-2 text-xs max-w-xs">
                    <div className="overflow-x-auto whitespace-nowrap">
                      {n.message}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {n.createdAt ? format(n.createdAt.toDate(), "PPpp") : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {n.emailSent ? (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          n.emailStatus === "sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {n.emailStatus}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteClick(n.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
          Communication Center
        </h1>

        {/* Toggle between Message and History */}
        <div className="flex justify-center mb-8">
          <div className="relative flex p-1 bg-gray-200 dark:bg-gray-700 rounded-full w-full max-w-xs sm:max-w-md">
            <span
              className="absolute top-0 left-0 w-1/2 h-full rounded-full bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out"
              style={{
                transform:
                  view === "history" ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              onClick={() => setView("message")}
              className={`relative z-10 flex items-center justify-center w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                view === "message"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Message
            </button>
            <button
              onClick={() => setView("history")}
              className={`relative z-10 flex items-center justify-center w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                view === "history"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {view === "message" ? <MessageView /> : <HistoryView />}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Message
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Are you sure? You can't undo this action afterwards.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
