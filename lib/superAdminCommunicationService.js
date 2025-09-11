import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export async function sendNotification({ to = 'all', role = 'all', message, type = 'announcement', emailSubject = '', sendEmail = false }) {
  const notificationsCol = collection(db, 'notifications');
  
  const notificationData = {
    to,
    role,
    message,
    type,
    emailSent: sendEmail,
    emailStatus: sendEmail ? 'pending' : null,
    emailSubject: sendEmail ? emailSubject : null,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(notificationsCol, notificationData);

  if (sendEmail) {
    try {
      const emailResult = await sendEmailViaAPI({ to, role, subject: emailSubject, message, type });
      
      await updateDoc(doc(db, 'notifications', docRef.id), {
        emailStatus: emailResult.success ? 'sent' : 'failed',
        emailDetails: emailResult
      });
      
      return { success: true, notificationId: docRef.id, emailResult };
    } catch (error) {
      await updateDoc(doc(db, 'notifications', docRef.id), {
        emailStatus: 'failed',
        emailError: error.message
      });
      
      return { success: true, notificationId: docRef.id, emailError: error.message };
    }
  }

  return { success: true, notificationId: docRef.id };
}

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

export async function getAllNotifications() {
  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// New function to delete a notification
export async function deleteNotification(notificationId) {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
}
