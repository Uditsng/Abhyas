'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'quill/dist/quill.snow.css';
import Quill from 'quill';

export default function CreateAnnouncement() {
  const { register, handleSubmit } = useForm();
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const quillRef = useRef(null);

    useEffect(() => {
    // Initialize Quill editor
    if (quillRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Write your announcement content here...',
         modules: {
          toolbar: [
      ['bold', 'italic', 'underline'], // Basic formatting
      [{ list: 'ordered' }, { list: 'bullet' }], // Lists
      ['link', 'image'], // Embeds
    ],
  },
      });

      // Listen for text changes
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML); // Get the HTML content
      });
    }
  }, []);

  const onSubmit = (data) => {
    const announcementData = {
      ...data,
      content,
      startDate,
    };
    console.log(announcementData);
    alert('Announcement created!');
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
          <div ref={quillRef} className="w-full h-80 border rounded"></div>

        </div>

        {/* Attachment */}
        <div>
          <label className="block font-medium mb-2">Attachment</label>
          <input
            type="file"
            {...register('attachment')}
            className="w-full border rounded px-3 py-2"
          />
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
