'use client';

import { useState } from 'react';
import { sendNotification } from '@/lib/superAdminCommunicationService';
import { toast } from 'react-hot-toast';

export default function AnnouncementForm() {
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Message cannot be empty');
    setLoading(true);

    const result = await sendNotification({
      message,
      role,
      to: 'all',
      type: 'announcement',
      sendEmail: false,
    });

    setLoading(false);
    if (result.success) {
      toast.success('Announcement posted successfully');
      setMessage('');
    } else {
      toast.error('Failed to post announcement');
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gyar-900 dark:text-gray-100">Send Platform Notification</h2>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Send To Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className=" w-full border border-gray-300 dark:boorder-gray-700 px-3 py-2 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 rounded-md "
        >
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 dark:border-gray-700 px-3 py-2 h-28 resize-none focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 rounded-md"
        />
      </div>
    </div >
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 sm:px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {loading ? 'Sending...' : 'Post Announcement'}
      </button>
    </div>
    </form>
  );
}
