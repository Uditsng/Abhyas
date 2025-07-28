// 'use client';

// import { useState } from 'react';
// import { sendNotification } from '@/lib/superAdminCommunicationService';
// import { toast } from 'react-hot-toast';

// export default function DirectMessageForm() {
//   const [to, setTo] = useState('');
//   const [subject, setSubject] = useState('');
//   const [message, setMessage] = useState('');
//   const [cc, setCc] = useState('');
//   const [bcc, setBcc] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSend = async e => {
//     e.preventDefault();
//     if (!to || !subject || !message) return toast.error('All required fields must be filled');

//     setLoading(true);
//     const result = await sendNotification({
//       to,
//       role: 'all', // optional filtering can be added here
//       message,
//       type: 'direct',
//       sendEmail: true,
//       emailSubject: subject,
//       cc,
//       bcc,
//     });

//     setLoading(false);
//     if (result.success) {
//       toast.success('Email sent successfully');
//       setTo('');
//       setSubject('');
//       setMessage('');
//       setCc('');
//       setBcc('');
//     } else {
//       toast.error('Failed to send email');
//     }
//   };

//   return (
//     <form onSubmit={handleSend} className="space-y-4">
//       <div>
//         <label className="block font-medium">To *</label>
//         <input
//           type="email"
//           value={to}
//           onChange={e => setTo(e.target.value)}
//           required
//           className="border rounded w-full p-2"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">CC</label>
//         <input
//           type="email"
//           value={cc}
//           onChange={e => setCc(e.target.value)}
//           className="border rounded w-full p-2"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">BCC</label>
//         <input
//           type="email"
//           value={bcc}
//           onChange={e => setBcc(e.target.value)}
//           className="border rounded w-full p-2"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Subject *</label>
//         <input
//           type="text"
//           value={subject}
//           onChange={e => setSubject(e.target.value)}
//           required
//           className="border rounded w-full p-2"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Message *</label>
//         <textarea
//           rows={4}
//           value={message}
//           onChange={e => setMessage(e.target.value)}
//           required
//           className="border rounded w-full p-2"
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-green-600 text-white px-4 py-2 rounded"
//       >
//         {loading ? 'Sending...' : 'Send Email'}
//       </button>
//     </form>
//   );
// }

// version 2 

// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebaseConfig";

// export default function DirectMessageForm() {
//   const [message, setMessage] = useState("");
//   const [subject, setSubject] = useState("");
//   const [selectedUserId, setSelectedUserId] = useState("");
//   const [users, setUsers] = useState([]);

//   // Fetch users from Firestore
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "users"));
//         const userList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setUsers(userList);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!subject.trim() || !message.trim() || !selectedUserId) {
//       toast.error("All fields are required.");
//       return;
//     }

//     try {
//       const res = await fetch("/api/send-email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           to: selectedUserId, // Document ID of user
//           role: "none", // Not used in direct message
//           subject,
//           message,
//           type: "direct", // to distinguish from announcement
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to send direct message");
//       }

//       toast.success(`Message sent to ${data.recipientCount} user(s).`);
//       setSubject("");
//       setMessage("");
//       setSelectedUserId("");
//     } catch (error) {
//       console.error("Direct message error:", error);
//       toast.error(error.message || "Failed to send direct message.");
//     }
//   };

//   return (
//     <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 max-w-xl mx-auto mt-4">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
//         📩 Send Direct Message
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
//             Select User
//           </label>
//           <select
//             value={selectedUserId}
//             onChange={(e) => setSelectedUserId(e.target.value)}
//             className="w-full border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
//           >
//             <option value="">-- Choose User --</option>
//             {users.map((user) => (
//               <option key={user.id} value={user.id}>
//                 {user.displayName || user.email || user.id}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
//             Subject
//           </label>
//           <input
//             type="text"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             className="w-full border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
//             placeholder="Enter subject"
//           />
//         </div>

//         <div>
//           <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
//             Message
//           </label>
//           <textarea
//             rows={5}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             className="w-full border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
//             placeholder="Write your message..."
//           />
//         </div>

//         <button
//           type="submit"
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
//         >
//           Send Message
//         </button>
//       </form>
//     </div>
//   );
// }


// Version 3
'use client';

import { useState, useEffect } from 'react';
import { sendNotification } from '@/lib/superAdminCommunicationService';
import { toast } from 'react-hot-toast';
// import { getAllUsers } from '@/lib/superAdminUserService';
import {getAllAdmins} from "@/lib/superAdminAdminService";

export default function DirectMessageForm() {
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('saved'); // 'saved' or 'manual'
  const [selectedUser, setSelectedUser] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getAllAdmins();
      setUsers(fetchedUsers || []);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const to = mode === 'saved' ? selectedUser : manualEmail;

    if (!to || !message || !subject) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await sendNotification({
        to,
        role: 'admin',
        message,
        subject,
        type: 'direct',
        emailSubject: subject,
        sendEmail: true,
      });

      toast.success('Message sent successfully!');
      setSelectedUser('');
      setManualEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Try again.');
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
            checked={mode === 'saved'}
            onChange={() => setMode('saved')}
          />
          <span>Select Saved User</span>
        </label>

        <label className="flex items-center text-sm space-x-2">
          <input
            type="radio"
            name="mode"
            value="manual"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
          />
          <span>Enter Email Manually</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'saved' ? (
          <div>
            <label className="block font-medium mb-1">Select User</label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Choose User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.displayName} ({user.email})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Enter Email</label>
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
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Subject</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Message</label>
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
