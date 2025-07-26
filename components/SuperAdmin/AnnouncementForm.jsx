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
      <h2 className="text-2xl font-bold mb-6">Send Platform Notification</h2>
      <div>
        <label className="block font-medium">Send To Role</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border rounded w-full p-2"
        >
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="border rounded w-full p-2"
        />
      </div>
    </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Post Announcement'}
      </button>
    </form>
  );
}
