//components/DirectmessageForm/page.jsx

"use client";

import { useState, useEffect } from "react";
import { sendNotification } from "@/lib/superAdminCommunicationService";
import { toast } from "react-hot-toast";
// import { getAllUsers } from '@/lib/superAdminUserService';
import { getAllAdmins } from "@/lib/superAdminAdminService";
import Select from "react-select";

export default function DirectMessageForm() {
  const [admins, setAdmins] = useState([]);
  const [mode, setMode] = useState("saved"); // 'saved' or 'manual'
  const [selectedAdmin, setSelectedAdmin] = useState([]);
  const [manualEmail, setManualEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      const fetchedAdmins = await getAllAdmins();
      setAdmins(fetchedAdmins || []);
    };
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const to = mode === "saved" ? selectedAdmin.map((admin) => admin.value) : [manualEmail];

    if (!to.length || !message || !subject) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await sendNotification({
        to,
        role: "admin",
        message,
        subject,
        type: "direct",
        emailSubject: subject,
        sendEmail: true,
      });

      toast.success("Message sent successfully!");
      setSelectedAdmin("");
      setManualEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message. Try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Send Direct Mail</h2>

      <div className="flex space-x-6 mb-4">
        <label className="flex items-center text-sm space-x-2">
          <input
            type="radio"
            name="mode"
            value="saved"
            checked={mode === "saved"}
            onChange={() => setMode("saved")}
          />
          <span>Select Saved Admins</span>
        </label>

        <label className="flex items-center text-sm space-x-2">
          <input
            type="radio"
            name="mode"
            value="manual"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          <span>Enter Email Manually</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "saved" ? (
          <div>
            <label className="block font-medium mb-1">Select Admins</label>
            <Select
              className="text-black"
              value={ selectedAdmin}
              onChange={(selected) => setSelectedAdmin(selected || [])}
              options={admins.map((admin) => ({
                value: admin.email,
                label: `${admin.displayName} (${admin.email})`,
              }))}
              placeholder="Search Admin by name or email..."
              isClearable
              isMulti={true}
            />
            {mode === "saved" && selectedAdmin.length > 0 && (
  <p className="text-sm text-gray-600 mt-1">
    Selected {selectedAdmin.length} admin{selectedAdmin.length > 1 ? "s" : ""}
  </p>
)}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Enter Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 dark:bg-gray-700"
              placeholder="someone@example.com"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 px-3 py-2 h-28 resize-none focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 rounded-md"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 sm:px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
