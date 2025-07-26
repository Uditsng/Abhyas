import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';

export async function sendNotification({ to = 'all', role = 'all', message, type = 'announcement', emailSubject = '', sendEmail = false }) {
  const notificationsCol = collection(db, 'notifications');
  
  // Create notification record
  const notificationData = {
    to, // 'all' for broadcast, or user/admin id
    role, // 'user', 'admin', or 'all'
    message,
    type, // 'announcement' or 'direct'
    emailSent: sendEmail,
    emailStatus: sendEmail ? 'pending' : null,
    emailSubject: sendEmail ? emailSubject : null,
    createdAt: serverTimestamp()
  };

  // 1. Create notification document in Firestore
  const docRef = await addDoc(notificationsCol, notificationData);

  // 2. If sendEmail = true → call API route
  if (sendEmail) {
    try {
      const emailResult = await sendEmailViaAPI({ to, role, subject: emailSubject, message, type });
      
      // 3. Update Firestore with email status
      await updateDoc(doc(db, 'notifications', docRef.id), {
        emailStatus: emailResult.success ? 'sent' : 'failed',
        emailDetails: emailResult
      });
      
      return { success: true, notificationId: docRef.id, emailResult };
    } catch (error) {
      // Update notification with failed email status
      await updateDoc(doc(db, 'notifications', docRef.id), {
        emailStatus: 'failed',
        emailError: error.message
      });
      
      return { success: true, notificationId: docRef.id, emailError: error.message };
    }
  }

  return { success: true, notificationId: docRef.id };
}

// Send email via API route
export async function sendEmailViaAPI({ to, role, subject, message, type }) {
  console.log("⏩ Sending email to API route..."); 
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      role,
      subject,
      message,
      type
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to send email');
  }
  
  return result;
}

// Fetch all notifications/announcements (most recent first)
export async function getAllNotifications() {
  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}