import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy } from 'firebase/firestore';

// Send a notification or announcement
export async function sendNotification({ to = 'all', role = 'all', message, type = 'announcement' }) {
  const notificationsCol = collection(db, 'notifications');
  await addDoc(notificationsCol, {
    to, // 'all' for broadcast, or user/admin id
    role, // 'user', 'admin', or 'all'
    message,
    type, // 'announcement' or 'direct'
    createdAt: serverTimestamp()
  });
}

// Fetch all notifications/announcements (most recent first)
export async function getAllNotifications() {
  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 