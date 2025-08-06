//superAdmin/communication/page.jsx
'use client';

import { useState } from 'react';
// import AnnouncementForm from '@/components/AnnouncementForm';
// import DirectMessageForm from '@/components/DirectMessageForm';
import dynamic from 'next/dynamic';
const AnnouncementForm = dynamic(() => import('@/components/AnnouncementForm'), { ssr: false });
const DirectMessageForm = dynamic(() => import('@/components/DirectMessageForm'), {
  ssr: false,
  loading: () => <p className="text-center">Loading form...</p>,
});

export default function CommunicationPage() {
  const [mode, setMode] = useState('announcement');

  return (
  <div className="min-h-screen flex items-center justify-center" >
  <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 transition-colors duration-300">
    <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Communication Center</h1>

      {/* Radio button selection */}
      <div className="flex items-center justify-center mb-6 space-x-6">
      <label className="flex items-center mr-6 cursor-pointer">
          <input
            type="radio"
            name="communicationMode"
            value="announcement"
            checked={mode === 'announcement'}
            onChange={() => setMode('announcement')}
            className="form-radio text-blue-600 dark:text-blue-400 mr-2"
          />
          <span className="font-medium text-gray-800 dark:text-gray-100">Announcement</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="communicationMode"
            value="direct"
            checked={mode === 'direct'}
            onChange={() => setMode('direct')}
            className="form-radio text-blue-600 dark:text-blue-400 mr-2"
          />
          <span className="fint-meium text-gray-800 dark:text-gray-100">Direct Mailing</span>
        </label>
      </div>

      {/* Conditional form rendering */}
      {mode === 'announcement' ? <AnnouncementForm /> : <DirectMessageForm />}
    </div>
    </div>
  );
}
