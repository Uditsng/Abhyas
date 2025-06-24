'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'announcements'));
        const fetchedAnnouncements = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        <ul className="space-y-4">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="border rounded p-4">
              <p><strong>Admin Name:</strong> {announcement.adminName || 'Unknown'}</p>
              <p><strong>Admin ID:</strong> {announcement.adminId || 'Unknown'}</p>
              <p><strong>Post Date:</strong> {new Date(announcement.startDate).toLocaleString()}</p>
              <p> <strong><span dangerouslySetInnerHTML={{ __html: announcement.title }}></span></strong></p>
              <p><strong>Message:</strong> <span dangerouslySetInnerHTML={{ __html: announcement.content }}></span></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
