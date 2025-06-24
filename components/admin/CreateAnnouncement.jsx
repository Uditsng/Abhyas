'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {storage, db} from '@/lib/firebaseConfig';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {collection, addDoc, getDoc, doc} from 'firebase/firestore';
import TipTapTextEditor from '@/components/text-editor/TipTapTextEditor'

export default function CreateAnnouncement() {
  const { register, handleSubmit } = useForm();
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState(new Date());


  const onSubmit = async (data) => {
    try {
      let attachmentUrl = null;

      // Upload file if attached
      if (data.attachment && data.attachment[0]) {
        const file = data.attachment[0];
        const storageRef = ref(storage, `attachments/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      // Fetch admin details from Firestore
      const userDoc = await getDoc(doc(db, 'users', 'currentUserId')); // Replace 'currentUserId' with actual user ID
      const adminName = userDoc.data()?.name || 'Unknown';
      const adminId = userDoc.id || 'Unknown';

      // Announcement data
      const announcementData = {
        title: data.title,
        content,
        startDate: startDate.toISOString(),
        attachmentUrl,
        adminName,
        adminId,
      };

      // Save announcement to Firestore
      const announcementsCollection = collection(db, 'announcements');
      const docRef = await addDoc(announcementsCollection, announcementData);
      alert('Announcement created!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert(`Failed to create announcement: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Create Announcement</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-2">Title</label>
          <input
            type="text"
            {...register('title', { required: true })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block font-medium mb-2">Content</label>
          <TipTapTextEditor value={content} onChange={setContent} />

        </div>

        {/* Date Picker */}
        <div>
          <label className="block font-medium mb-2">Available From</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Announcement
          </button>
        </div>
      </form>
    </div>
  );
}
